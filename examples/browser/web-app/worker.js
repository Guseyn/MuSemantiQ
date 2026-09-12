import path from 'path'

import server from '#nodes/server.js'
import app from '#nodes/app.js'
import src from '#nodes/src.js'

import devApi from './dev-api.js'

const baseFolder = path.join('examples', 'browser', 'web-app', 'static')

server(
  app({
    indexFile: './examples/browser/web-app/static/html/index.html',
    // Read and write endpoints the font viewer at /html/font-viewer.html needs.
    api: devApi,
    static: [
      src(/^\/((html\/static-templates\/)|css|js|images|docs|font|md|midi)/, {
        baseFolder,
        useGzip: true,
        useCors: true,
        allowedOrigins: [ `${global.config.host}:${global.config.port}` ],
        allowedMethods: [ 'GET', 'OPTIONS' ],
        maxAge: 86400,
        cacheControl: 'no-cache',
        fileNotFound: './examples/browser/web-app/static/html/404.html'
      }),
      src(/^\/html/, {
        baseFolder,
        useGzip: true,
        fileNotFound: './examples/browser/web-app/static/html/404.html'
      })
    ]
  })
)()
