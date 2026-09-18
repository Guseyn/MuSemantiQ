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
import { spawn } from 'child_process'

import endpoint from '#dev-nodes/endpoint.js'
import body from '#dev-nodes/body.js'

import {
  REPOSITORY_ROOT, suites, suiteNamed, suiteDirectory, respondWith, resolveInside, isSafeTestName
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
  const answer = []
  for (const suite of suites()) {
    const failed = await readList(suite, 'list-of-failed-tests.json')
    answer.push({
      name: suite.name,
      label: suite.label,
      kind: suite.kind,
      artifacts: suite.artifacts,
      tests: await testNamesOf(suite),
      failed: failed.map((one) => one.name)
    })
  }
  respondWith(stream, 200, { suites: answer })
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
 * The suite is then run over that one test, so what it produces exists straight
 * away. Only the `actual` side is written — the baseline is what you adopt in
 * the viewer, once you have looked at it.
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

  const ofThatKind = suites().filter((suite) => suite.kind === kind)
  const written = []
  const already = []

  for (const suite of ofThatKind) {
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

  const ran = await runSuite(kind, test)

  respondWith(stream, 200, {
    test,
    kind,
    wrote: written,
    already,
    ran: ran.code === 0,
    output: ran.output.split('\n').slice(-12).join('\n')
  })
})

/**
 * Run a suite over one test, so what it produced is up to date.
 *
 * The runners are the only thing that knows how an artifact is made, and the
 * shape of every file they write. Narrowing one to a single test is far cheaper
 * than walking the corpus, and it means nothing here has to reimplement the
 * pipeline and quietly disagree with it.
 */
function runSuite(kind, test) {
  const script = kind === 'audio' ? 'scripts/audio-tests.js' : 'scripts/visual-tests.js'
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      [ path.join(REPOSITORY_ROOT, script), `--only=${test}` ],
      { cwd: REPOSITORY_ROOT }
    )
    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { output += chunk })
    child.on('error', (error) => resolve({ code: -1, output: output + error.message }))
    child.on('close', (code) => resolve({ code, output }))
  })
}

/**
 * The source of a test, as one of its suites holds it.
 */
const testSource = endpoint('/dev/tests/source?suite&test', 'GET', async ({ stream, queries }) => {
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

  const at = resolveInside(suiteDirectory(suite), 'msq', `${test}.txt`)
  let msq
  try {
    msq = await fs.readFile(at, 'utf-8')
  } catch {
    return respondWith(stream, 404, { error: `No ${test} in ${suite.name}` })
  }

  /*
  The font line is the suite's, not the test's — it is prepended when the test
  is written and would be written again on the way back, so it is taken off
  here rather than shown as something to edit.
  */
  const music = msq.match(/^music font is \S+\n\n/)
  respondWith(stream, 200, {
    suite: suite.name,
    test,
    msq: music ? msq.slice(music[0].length) : msq,
    font: music ? music[0].trim().replace('music font is ', '') : null
  })
})

/**
 * Rewrite a test, in every suite of its kind, and bring its artifacts up to
 * date.
 *
 * Editing one suite's copy and leaving the others is how a corpus stops
 * comparing anything, so the music is written to all of them — each with its
 * own font line — and then the runner is asked to produce what they make of it.
 */
const editTest = endpoint('/dev/tests/source', 'POST', async ({ stream }) => {
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
    return respondWith(stream, 400, { error: 'Not a test name' })
  }
  if (!msq.trim()) {
    return respondWith(stream, 400, { error: 'A test cannot be empty.' })
  }

  const ofThatKind = suites().filter((suite) => suite.kind === kind)
  const written = []
  for (const suite of ofThatKind) {
    const at = resolveInside(suiteDirectory(suite), 'msq', `${test}.txt`)
    if (!at) {
      return respondWith(stream, 400, { error: 'That name does not stay in the suite.' })
    }
    const font = suite.name.includes('/') ? suite.name.split('/').pop() : null
    const text = font && font !== 'bravura'
      ? `music font is ${font}\n\n${msq.trim()}\n`
      : `${msq.trim()}\n`
    await fs.mkdir(path.dirname(at), { recursive: true })
    await fs.writeFile(at, text, 'utf-8')
    written.push(suite.name)
  }

  const ran = await runSuite(kind, test)

  respondWith(stream, 200, {
    test,
    kind,
    wrote: written,
    ran: ran.code === 0,
    /*
    A failing run is not an error here. The artifacts are rewritten either way,
    and a test that now differs from its baseline is exactly what the viewer is
    for — it is read, not hidden.
    */
    output: ran.output.split('\n').slice(-12).join('\n')
  })
})

/**
 * Remove a test, in every suite of its kind: its source and everything either
 * side of the comparison ever wrote for it.
 *
 * Deleting the source alone would leave a baseline behind that nothing produces
 * any more, and the next run would neither rewrite it nor complain about it —
 * so the artifacts go with it. An artifact is named after the test and its
 * folder fixes the extension, so each one is addressed rather than searched
 * for; a side that was never written is simply not there to remove.
 */
const deleteTest = endpoint('/dev/tests/delete', 'POST', async ({ stream }) => {
  let request
  try {
    request = JSON.parse((await body(stream, { maxSize: 1 })).toString('utf-8'))
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }

  const test = (request.test || '').trim()
  const kind = request.kind === 'audio' ? 'audio' : 'visual'

  if (!isSafeTestName(test)) {
    return respondWith(stream, 400, { error: 'Not a test name' })
  }

  const removed = []
  for (const suite of suites().filter((one) => one.kind === kind)) {
    const root = suiteDirectory(suite)

    const source = resolveInside(root, 'msq', `${test}.txt`)
    if (!source) {
      return respondWith(stream, 400, { error: 'That name does not stay in the suite.' })
    }
    try {
      await fs.unlink(source)
      removed.push(path.relative(REPOSITORY_ROOT, source))
    } catch {
      // Not in this suite, which is not a reason to stop clearing the rest.
    }

    for (const artifact of suite.artifacts) {
      for (const side of [ 'actual', 'expected' ]) {
        const at = resolveInside(root, artifact.name, side, `${test}.${artifact.extension}`)
        if (!at) {
          continue
        }
        try {
          await fs.unlink(at)
          removed.push(path.relative(REPOSITORY_ROOT, at))
        } catch {
          // This side was never written, which is a normal half of a comparison.
        }
      }
    }
  }

  if (!removed.length) {
    return respondWith(stream, 404, { error: `No ${test} in any ${kind} suite.` })
  }

  respondWith(stream, 200, { test, kind, removed })
})

export default [
  testsIndex, testStatus, adopt, addTest, testSource, editTest, deleteTest
]
