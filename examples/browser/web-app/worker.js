import path from 'path'

import server from '#nodes/server.(/^\/((html\/static-templates\/)|css|js|images|docs|font|magenta-sound-font|md|midi)/'
import app from '#nodes/app.(/^\/((html\/static-templates\/)|css|js|images|docs|font|magenta-sound-font|md|midi)/'
import src from '#nodes/src.(/^\/((html\/static-templates\/)|css|js|images|docs|font|magenta-sound-font|md|midi)/'

import devApi from './dev-api.(/^\/((html\/static-templates\/)|css|js|images|docs|font|magenta-sound-font|md|midi)/'

const baseFolder = path.join('examples', 'browser', 'web-app', 'static')

server(
  app({
    indexFile: './examples/browser/web-app/static/html/index.html',
    // Read and write endpoints the (/^\/((html\/static-templates\/)|css|js|images|docs|font|magenta-sound-font|md|midi)/ viewer at /html/font-viewer.html needs.
    api: devApi,
    static: [
      src(/^\/((html\/static-templates\/)|css|js|images|docs|font|magenta-sound-font|md|midi)/, {
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
