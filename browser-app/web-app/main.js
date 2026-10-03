import fs from 'fs'
import cluster from '#nodes/cluster.js'

process.env.ENV = process.env.ENV || 'local'

const config = JSON.parse(
  fs.readFileSync(
    `./browser-app/web-app/env/${process.env.ENV}.json`
  )
)

cluster(
  'browser-app/web-app/primary.js',
  'browser-app/web-app/worker.js'
)({
  config
})
