import path from 'path'

import server from '#dev-nodes/server.js'
import app from '#dev-nodes/app.js'
import src from '#dev-nodes/src.js'
import runtime from '#dev-nodes/runtime.js'

import musicJsFont from './api/musicJsFont.js'
import fonts from './api/fonts.js'
import tests from './api/tests.js'
import musicxml from './api/musicxml.js'
import generators from './api/generators.js'
import { REPOSITORY_ROOT, TEST_ROOT, resolveInside } from './api/shared.js'

const baseFolder = path.join('dev-tools', 'web-app', 'static')
const notFound = './dev-tools/web-app/static/html/404.html'

/*
The test viewer shows files that live in the test trees rather than under the
app's own static folder, so those are served through a mapper instead of by
widening the document root — which would put `.git`, the environment files and
the TLS keys one crafted URL away.

`nodes` resolves static paths with a plain `path.join` and no traversal check,
so the guard has to be here.
*/
const TEST_TREES = [ 'visual-tests', 'audio-tests', 'serializer-tests' ]
const testsRoot = path.join(REPOSITORY_ROOT, TEST_ROOT)

/*
The font viewer reads the SMuFL scaffold — which entries a generated font has,
and every adjustment it starts from — and that now lives in tools/ at the root
rather than in src/, so it is no longer carried into the generated worker tree.
Serving it from where it is keeps the page reading the same file the generator
writes from, instead of a copy that can drift.
*/
function toolModulePath(requestUrl) {
  const parts = requestUrl
    .split('?')[0]
    .split('/')
    .filter((part) => part !== '')
    .map((part) => decodeURIComponent(part))

  // `/tools/<...>.js`
  const [ , ...rest ] = parts
  if (!rest.length || !rest[rest.length - 1].endsWith('.js')) {
    return path.join(REPOSITORY_ROOT, 'does-not-exist')
  }
  return resolveInside(path.join(REPOSITORY_ROOT, 'tools'), ...rest) ||
    path.join(REPOSITORY_ROOT, 'does-not-exist')
}

function testArtifactPath(requestUrl) {
  const parts = requestUrl
    .split('?')[0]
    .split('/')
    .filter((part) => part !== '')
    .map((part) => decodeURIComponent(part))

  // `/tests/<tree>/...`
  const [ , tree, ...rest ] = parts
  if (!TEST_TREES.includes(tree) || !rest.length) {
    return path.join(REPOSITORY_ROOT, 'does-not-exist')
  }
  return resolveInside(testsRoot, tree, ...rest) ||
    path.join(REPOSITORY_ROOT, 'does-not-exist')
}

/*
The glyph examples the font viewer engraves: one MSQ file per entry in the glyph
table, kept in dev-tools/glyph-examples so they can be edited as music rather
than as code. Served from where they live so an edit shows on the next reload.
*/
function glyphExamplePath(requestUrl) {
  const parts = requestUrl
    .split('?')[0]
    .split('/')
    .filter((part) => part !== '')
    .map((part) => decodeURIComponent(part))

  // `/glyph-examples/<entry>.txt`
  const [ , ...rest ] = parts
  if (rest.length !== 1 || !rest[0].endsWith('.txt')) {
    return path.join(REPOSITORY_ROOT, 'does-not-exist')
  }
  return resolveInside(path.join(REPOSITORY_ROOT, 'dev-tools/glyph-examples'), rest[0]) ||
    path.join(REPOSITORY_ROOT, 'does-not-exist')
}

server(
  app({
    indexFile: './dev-tools/web-app/static/html/index.html',
    // Everything that reads or writes the working tree: the music-js fonts the
    // font viewer edits, and the test artifacts the test viewer adopts.
    api: [ ...musicJsFont, ...fonts, ...tests, ...musicxml, ...generators ],
    static: [
      src(/^\/tests\//, {
        mapper: testArtifactPath,
        cacheControl: 'no-store',
        fileNotFound: notFound
      }),
      src(/^\/glyph-examples\//, {
        mapper: glyphExamplePath,
        cacheControl: 'no-store',
        fileNotFound: notFound
      }),
      src(/^\/tools\//, {
        mapper: toolModulePath,
        cacheControl: 'no-cache',
        fileNotFound: notFound
      }),
      /*
      `magenta-sound-font` is a folder of symlinks into src/midi, one per
      rendered set. The test bench plays through it, so the sample files have to
      be served from here as well as from the example app.
      */
      src(/^\/((html\/static-templates\/)|css|js|images|font|magenta-sound-font)/, {
        baseFolder,
        useGzip: true,
        cacheControl: 'no-cache',
        fileNotFound: notFound
      }),
      src(/^\/html/, {
        baseFolder,
        useGzip: true,
        cacheControl: 'no-cache',
        fileNotFound: notFound
      })
    ]
  })
)()

runtime.log(`${'→'} dev tools on https://${runtime.config.host}:${runtime.config.port}`)
