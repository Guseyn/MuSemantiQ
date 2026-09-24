import path from 'path'

import server from '#docs-nodes/server.js'
import app from '#docs-nodes/app.js'
import src from '#docs-nodes/src.js'
import runtime from '#docs-nodes/runtime.js'

const baseFolder = path.join('docs', 'web-app', 'static')
const notFound = './docs/web-app/static/html/404.html'

/*
Every /docs/... URL is the same file. The shell reads location.pathname and
renders the page the sitemap names, so the reader gets real URLs — one per
page, linkable and reloadable — without a build step generating a page each.

A mapper rather than a rewrite because `nodes` has no rewrite: what a static
mount serves is whatever path its mapper returns, so returning one constant
path is how a shell is served under many URLs.
*/
const docsShell = path.join(baseFolder, 'html', 'docs.html')

function docsShellPath() {
  return docsShell
}

server(
  app({
    indexFile: './docs/web-app/static/html/index.html',
    static: [
      src(/^\/docs/, {
        mapper: docsShellPath,
        useGzip: true,
        cacheControl: 'no-cache',
        fileNotFound: notFound
      }),
      /*
      `md` is the documentation itself, fetched by the shell one page at a time.
      It is served as text/plain — `nodes` has no mime entry for .md — which is
      what fetch() wants anyway.
      */
      src(/^\/(css|js|images|md|font|magenta-sound-font)/, {
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

runtime.log(`${'→'} docs on https://${runtime.config.host}:${runtime.config.port}`)
