import fs from 'fs'
import cluster from '#docs-nodes/cluster.js'

process.env.ENV = process.env.ENV || 'local'

const config = JSON.parse(
  fs.readFileSync(
    `./docs/web-app/env/${process.env.ENV}.json`
  )
)

/*
One worker, for the same reason the dev tools take one: this serves a landing
page and a folder of markdown to whoever is reading it, and every extra worker
pays a five second start delay before it loads the route table.
*/
cluster(
  'docs/web-app/primary.js',
  'docs/web-app/worker.js'
)({
  config,
  numberOfWorkers: 1
})
