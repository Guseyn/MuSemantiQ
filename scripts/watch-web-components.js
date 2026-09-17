#!/usr/bin/env node

/**
 * Keep both apps' copies of web-components/ in step while you work on them.
 *
 * The sibling of watch-msq-src.js: that one rebuilds the engine out of src/,
 * this one re-copies the components. Run both to have either half of
 * static/js/msq follow its source.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const sourceDir = path.join(projectRoot, 'web-components')

let isCopying = false
let pendingCopy = false

function runCopy() {
  if (isCopying) {
    pendingCopy = true
    return
  }

  isCopying = true
  console.log(`[watch-web-components] ${new Date().toLocaleTimeString()} - Copying components...`)

  const child = spawn('node', [ path.join(__dirname, 'copy-web-components.js') ], {
    stdio: 'inherit',
    cwd: projectRoot
  })

  child.on('exit', (code) => {
    isCopying = false
    if (code === 0) {
      console.log(`[watch-web-components] ${new Date().toLocaleTimeString()} - Components copied`)
    } else {
      console.error(`[watch-web-components] Copy failed with code ${code}`)
    }
    if (pendingCopy) {
      pendingCopy = false
      runCopy()
    }
  })
}

runCopy()

const watcher = fs.watch(sourceDir, { recursive: true }, (eventType, filename) => {
  if (!filename || filename.includes('node_modules')) {
    return
  }
  runCopy()
})

console.log(`[watch-web-components] Watching ${sourceDir} for changes`)
console.log('[watch-web-components] Press Ctrl+C to stop')

process.on('SIGINT', () => {
  console.log('\n[watch-web-components] Stopping watcher...')
  watcher.close()
  process.exit(0)
})
