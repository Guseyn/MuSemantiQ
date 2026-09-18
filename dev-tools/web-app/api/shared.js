/**
 * The pieces every dev-tools endpoint needs.
 *
 * These endpoints read and write files in the working tree, which is the whole
 * point of them and also the reason they live here rather than in MuSemantiQ:
 * nothing the library ships should be able to rewrite a font or a test baseline.
 */

import path from 'path'
import { readdirSync, existsSync } from 'fs'

export const REPOSITORY_ROOT = process.cwd()

export const MUSIC_JS_DIRECTORY = path.join(REPOSITORY_ROOT, 'src/drawer/font/music-js')

/**
 * Where the test trees live. A suite's `name` is its path under this.
 */
export const TEST_ROOT = 'test'

/**
 * The suites the test viewer knows about, and what each one keeps.
 *
 * `msq` is the input rather than a comparison, so it is listed apart from the
 * artifacts: there is only ever one of it and nothing to adopt.
 */
/*
What a suite of each kind keeps. The visual runner writes seven artifacts per
test and the audio runner eight — the same set whatever font the suite is for.
*/
const ARTIFACTS = {
  visual: [
    { name: 'svg', extension: 'svg' },
    { name: 'page-schema', extension: 'json' },
    { name: 'html-highlights', extension: 'html' },
    { name: 'errors', extension: 'json' },
    { name: 'custom-styles', extension: 'json' },
    { name: 'comments', extension: 'json' },
    { name: 'char-progressions', extension: 'json' }
  ],
  audio: [
    { name: 'svg', extension: 'svg' },
    { name: 'midi', extension: 'mid' },
    { name: 'page-schema', extension: 'json' },
    { name: 'html-highlights', extension: 'html' },
    { name: 'errors', extension: 'json' },
    { name: 'custom-styles', extension: 'json' },
    { name: 'midi-settings', extension: 'json' },
    { name: 'comments', extension: 'json' }
  ]
}

/**
 * A name for a suite, as a person would say it: `visual-tests/bravura` is
 * "Visual · Bravura".
 */
const labelFor = (name) => name
  .replace(/-tests/g, '')
  .split('/')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' · ')

/**
 * The suites there are, read off the test folders rather than written down.
 *
 * The visual runner walks `test/visual-tests/*` and runs the corpus once per
 * font it finds there, so adding a font is adding a directory — and this has to
 * find it the same way, or the viewer would show a suite the runner does not
 * run, or miss one it does.
 *
 * Read per request: it is one `readdir` on a dev server, and it means a new
 * font folder shows up without a restart.
 */
export function suites() {
  const found = []

  const visualRoot = path.join(REPOSITORY_ROOT, TEST_ROOT, 'visual-tests')
  let fonts = []
  try {
    fonts = readdirSync(visualRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
  } catch {
    // No visual tests at all.
  }
  for (const font of fonts) {
    const name = `visual-tests/${font}`
    found.push({ name, label: labelFor(name), kind: 'visual', artifacts: ARTIFACTS.visual })
  }

  if (existsSync(path.join(REPOSITORY_ROOT, TEST_ROOT, 'audio-tests', 'msq'))) {
    found.push({
      name: 'audio-tests', label: 'Audio', kind: 'audio', artifacts: ARTIFACTS.audio
    })
  }

  return found
}

export const suiteNamed = (name) => suites().find((suite) => suite.name === name) || null

/**
 * Where a suite's folders are on disk.
 */
export const suiteDirectory = (suite) =>
  path.join(REPOSITORY_ROOT, TEST_ROOT, suite.name)

/**
 * A JSON reply, never cached — everything here is the state of the working tree
 * a moment ago.
 */
export function respondWith(stream, status, payload) {
  const rendered = JSON.stringify(payload)
  stream.respond({
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(rendered),
    'cache-control': 'no-store',
    ':status': status
  })
  stream.end(rendered)
}

/**
 * Resolve a file inside a directory, refusing anything that climbs out of it.
 *
 * `nodes` does not do this for static files, so anything that widens the
 * document root has to do it here.
 */
export function resolveInside(directory, ...names) {
  const resolved = path.resolve(directory, ...names)
  return resolved.startsWith(path.resolve(directory) + path.sep) ? resolved : null
}

/**
 * A test name that cannot reach out of its folder.
 *
 * The runners take everything before the first dot as the test name, so a name
 * carrying one is refused rather than quietly truncated.
 */
export const isSafeTestName = (name) =>
  typeof name === 'string' && name.length > 0 && /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(name)
