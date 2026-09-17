/**
 * Reading the test suites, and adopting what a run produced.
 *
 * The runners write every artifact to `actual/` on every run, pass or fail, and
 * compare it against the committed `expected/`. Until now the only way to accept
 * a new baseline was `cp -r actual/* expected/` across twenty-odd folders with
 * nothing to look at first. These endpoints are what let the viewer show the two
 * sides and then adopt one test, or one artifact of it, at a time.
 */

import fs from 'fs/promises'
import path from 'path'

import endpoint from '#dev-nodes/endpoint.js'
import body from '#dev-nodes/body.js'

import {
  SUITES, suiteNamed, suiteDirectory, respondWith, resolveInside, isSafeTestName
} from './shared.js'

const testNamesOf = async (suite) => {
  try {
    return (await fs.readdir(path.join(suiteDirectory(suite), 'msq')))
      .filter((file) => file.endsWith('.txt'))
      .map((file) => path.basename(file, '.txt'))
      .sort()
  } catch {
    return []
  }
}

const readList = async (suite, file) => {
  try {
    return JSON.parse(await fs.readFile(path.join(suiteDirectory(suite), file), 'utf-8'))
  } catch {
    return []
  }
}

/**
 * Every suite, the artifacts it keeps, and the tests in it.
 *
 * Whether a test's artifacts match is deliberately not answered here — that
 * means reading both sides of every file in the repository, which is slow and
 * almost always uninteresting. The viewer asks for one test at a time.
 */
const testsIndex = endpoint('/dev/tests', 'GET', async ({ stream }) => {
  const suites = []
  for (const suite of SUITES) {
    const failed = await readList(suite, 'list-of-failed-tests.json')
    suites.push({
      name: suite.name,
      label: suite.label,
      kind: suite.kind,
      artifacts: suite.artifacts,
      tests: await testNamesOf(suite),
      failed: failed.map((one) => one.name)
    })
  }
  respondWith(stream, 200, { suites })
})

/**
 * How one test's artifacts stand: which sides exist, and whether they match.
 */
const testStatus = endpoint('/dev/tests/status?suite&test', 'GET', async ({ stream, queries }) => {
  /*
  A suite name carries a slash (`visual-tests/bravura`), so it travels as a query
  rather than as path segments — and `nodes` hands query values over exactly as
  they arrived, so an encoded slash has to be decoded here.
  */
  const decoded = (value) => {
    try {
      return decodeURIComponent(value || '')
    } catch {
      return ''
    }
  }
  const suite = suiteNamed(decoded(queries.suite))
  const test = decoded(queries.test)
  if (!suite || !isSafeTestName(test)) {
    return respondWith(stream, 404, { error: 'No such suite or test' })
  }

  const artifacts = []
  for (const artifact of suite.artifacts) {
    const file = `${test}.${artifact.extension}`
    const sides = {}
    for (const side of [ 'actual', 'expected' ]) {
      const at = resolveInside(suiteDirectory(suite), artifact.name, side, file)
      try {
        sides[side] = at ? await fs.readFile(at) : null
      } catch {
        sides[side] = null
      }
    }
    artifacts.push({
      name: artifact.name,
      extension: artifact.extension,
      url: `/tests/${suite.name}/${artifact.name}`,
      file,
      hasActual: sides.actual !== null,
      hasExpected: sides.expected !== null,
      equal: sides.actual !== null && sides.expected !== null &&
        Buffer.compare(sides.actual, sides.expected) === 0,
      bytes: {
        actual: sides.actual ? sides.actual.length : null,
        expected: sides.expected ? sides.expected.length : null
      }
    })
  }

  respondWith(stream, 200, {
    suite: suite.name,
    test,
    msq: `/tests/${suite.name}/msq/${test}.txt`,
    artifacts
  })
})

/**
 * Take what the last run produced as the new baseline, for one artifact of a
 * test or for all of them.
 */
const adopt = endpoint('/dev/tests/adopt', 'POST', async ({ stream }) => {
  let request
  try {
    request = JSON.parse((await body(stream, { maxSize: 1 })).toString('utf-8'))
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }

  const suite = suiteNamed(request.suite)
  if (!suite || !isSafeTestName(request.test)) {
    return respondWith(stream, 400, { error: 'Expected { suite, test, artifact? }' })
  }

  const wanted = request.artifact
    ? suite.artifacts.filter((one) => one.name === request.artifact)
    : suite.artifacts
  if (!wanted.length) {
    return respondWith(stream, 400, { error: `No artifact '${request.artifact}' in ${suite.name}` })
  }

  const adopted = []
  for (const artifact of wanted) {
    const file = `${request.test}.${artifact.extension}`
    const from = resolveInside(suiteDirectory(suite), artifact.name, 'actual', file)
    const to = resolveInside(suiteDirectory(suite), artifact.name, 'expected', file)
    if (!from || !to) {
      return respondWith(stream, 400, { error: 'Path escapes the suite' })
    }
    try {
      await fs.copyFile(from, to)
      adopted.push(artifact.name)
    } catch (error) {
      if (request.artifact) {
        return respondWith(stream, 404, { error: `Nothing to adopt: ${error.message}` })
      }
    }
  }

  respondWith(stream, 200, { suite: suite.name, test: request.test, adopted })
})

/**
 * Write a new test into every suite of a kind.
 *
 * A visual test is not one file: the same music is run against each font, and
 * the corpus keeps a copy per suite — identical but for the `music font is …`
 * line the font's own suite carries. Adding one by hand means remembering that,
 * and a corpus where bravura has a test leland does not is a corpus that no
 * longer compares anything. So the name and the music are given once here, and
 * they land in each suite of that kind.
 *
 * Only the input is written. The artifacts appear when the suite is next run,
 * and the expected side when you adopt them in the viewer.
 */
const addTest = endpoint('/dev/tests/new', 'POST', async ({ stream }) => {
  let request
  try {
    request = JSON.parse((await body(stream, { maxSize: 4 })).toString('utf-8'))
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }

  const test = (request.test || '').trim()
  const kind = request.kind === 'audio' ? 'audio' : 'visual'
  const msq = typeof request.msq === 'string' ? request.msq : ''

  if (!isSafeTestName(test)) {
    return respondWith(stream, 400, {
      error: 'A test name is letters, digits, dashes and underscores — and no dots,' +
        ' since the runners read everything before the first one as the name.'
    })
  }
  if (!msq.trim()) {
    return respondWith(stream, 400, { error: 'Write some MSQ for it first.' })
  }

  const suites = SUITES.filter((suite) => suite.kind === kind)
  const written = []
  const already = []

  for (const suite of suites) {
    const at = resolveInside(suiteDirectory(suite), 'msq', `${test}.txt`)
    if (!at) {
      return respondWith(stream, 400, { error: 'That name does not stay in the suite.' })
    }
    try {
      await fs.access(at)
      already.push(suite.name)
      continue
    } catch {
      // Not there yet, which is what we want.
    }

    /*
    Which font a suite is for is written into the test itself, as its first
    line. The corpus does it that way rather than passing the font in, so a test
    file says on its face what it engraves with.
    */
    const font = suite.name.includes('/') ? suite.name.split('/').pop() : null
    const text = font && font !== 'bravura'
      ? `music font is ${font}\n\n${msq.trim()}\n`
      : `${msq.trim()}\n`

    await fs.mkdir(path.dirname(at), { recursive: true })
    await fs.writeFile(at, text, 'utf-8')
    written.push(suite.name)
  }

  if (!written.length) {
    return respondWith(stream, 409, {
      error: `There is already a test called ${test} in ${already.join(' and ')}.`
    })
  }

  respondWith(stream, 200, { test, kind, wrote: written, already })
})

export default [ testsIndex, testStatus, adopt, addTest ]
