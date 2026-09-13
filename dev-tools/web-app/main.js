import fs from 'fs'
import cluster from '#dev-nodes/cluster.js'

process.env.ENV = process.env.ENV || 'local'

const config = JSON.parse(
  fs.readFileSync(
    `./dev-tools/web-app/env/${process.env.ENV}.json`
  )
)

/*
One worker is enough. These are tools for one person at a keyboard, and every
worker pays a five second start delay before it loads the route table.
*/
cluster(
  'dev-tools/web-app/primary.js',
  'dev-tools/web-app/worker.js'
)({
  config,
  numberOfWorkers: 1
})
