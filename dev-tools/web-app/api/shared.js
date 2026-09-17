/**
 * The pieces every dev-tools endpoint needs.
 *
 * These endpoints read and write files in the working tree, which is the whole
 * point of them and also the reason they live here rather than in MuSemantiQ:
 * nothing the library ships should be able to rewrite a font or a test baseline.
 */

import path from 'path'

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
export const SUITES = [
  {
    name: 'visual-tests/bravura',
    label: 'Visual · Bravura',
    kind: 'visual',
    artifacts: [
      { name: 'svg', extension: 'svg' },
      { name: 'page-schema', extension: 'json' },
      { name: 'html-highlights', extension: 'html' },
      { name: 'errors', extension: 'json' },
      { name: 'custom-styles', extension: 'json' },
      { name: 'comments', extension: 'json' },
      { name: 'char-progressions', extension: 'json' }
    ]
  },
  {
    name: 'visual-tests/leland',
    label: 'Visual · Leland',
    kind: 'visual',
    artifacts: [
      { name: 'svg', extension: 'svg' },
      { name: 'page-schema', extension: 'json' },
      { name: 'html-highlights', extension: 'html' },
      { name: 'errors', extension: 'json' },
      { name: 'custom-styles', extension: 'json' },
      { name: 'comments', extension: 'json' },
      { name: 'char-progressions', extension: 'json' }
    ]
  },
  {
    name: 'audio-tests',
    label: 'Audio',
    kind: 'audio',
    artifacts: [
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
]

export const suiteNamed = (name) => SUITES.find((suite) => suite.name === name) || null

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
