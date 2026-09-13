import path from 'path'

import server from '#dev-nodes/server.js'
import app from '#dev-nodes/app.js'
import src from '#dev-nodes/src.js'
import runtime from '#dev-nodes/runtime.js'

import musicJsFont from './api/musicJsFont.js'
import tests from './api/tests.js'
import { REPOSITORY_ROOT, resolveInside } from './api/shared.js'

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
  return resolveInside(REPOSITORY_ROOT, tree, ...rest) ||
    path.join(REPOSITORY_ROOT, 'does-not-exist')
}

server(
  app({
    indexFile: './dev-tools/web-app/static/html/index.html',
    // Everything that reads or writes the working tree: the music-js fonts the
    // font viewer edits, and the test artifacts the test viewer adopts.
    api: [ ...musicJsFont, ...tests ],
    static: [
      src(/^\/tests\//, {
        mapper: testArtifactPath,
        cacheControl: 'no-store',
        fileNotFound: notFound
      }),
      src(/^\/((html\/static-templates\/)|css|js|images|font)/, {
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
