import path from 'path'

import server from '#nodes/server.js'
import app from '#nodes/app.js'
import src from '#nodes/src.js'

const baseFolder = path.join('browser-app', 'web-app', 'static')

server(
  app({
    indexFile: './browser-app/web-app/static/html/index.html',
    static: [
      src(/^\/((html\/static-templates\/)|css|js|images|docs|font|magenta-sound-font|md|midi)/, {
        baseFolder,
        useGzip: true,
        useCors: true,
        allowedOrigins: [ `${global.config.host}:${global.config.port}` ],
        allowedMethods: [ 'GET', 'OPTIONS' ],
        maxAge: 86400,
        cacheControl: 'no-cache',
        fileNotFound: './browser-app/web-app/static/html/404.html'
      }),
      src(/^\/html/, {
        baseFolder,
        useGzip: true,
        fileNotFound: './browser-app/web-app/static/html/404.html'
      })
    ]
  })
)()
