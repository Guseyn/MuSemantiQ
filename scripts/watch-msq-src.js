#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const srcDir = path.join(projectRoot, 'src')

let isBuilding = false
let pendingRebuild = false

/**
 * Run the build scripts: the worker environment, then the walkthrough docs
 */
function runBuild() {
  if (isBuilding) {
    pendingRebuild = true
    return
  }

  isBuilding = true
  const timestamp = new Date().toLocaleTimeString()
  console.log(`[watch-msq-src] ${timestamp} - Rebuilding worker environment and walkthrough docs...`)

  const steps = [
    { script: 'copy-msq-into-apps.js', done: 'Worker environment rebuilt successfully' },
    { script: 'build-walkthrough-docs.js', done: 'Walkthrough docs rebuilt successfully' }
  ]

  const runNext = () => {
    const step = steps.shift()
    const child = spawn('node', [
      path.join(__dirname, step.script)
    ], {
      stdio: 'inherit',
      cwd: projectRoot
    })

    child.on('exit', (code) => {
      const timestamp = new Date().toLocaleTimeString()
      if (code !== 0) {
        console.error(`[watch-msq-src] ${step.script} failed with code ${code}`)
      } else {
        console.log(`[watch-msq-src] ${timestamp} - ${step.done}`)
        if (steps.length > 0) return runNext()
      }

      isBuilding = false
      if (pendingRebuild) {
        pendingRebuild = false
        runBuild()
      }
    })
  }

  runNext()
}

/**
 * Watch for changes in src directory
 */
function watchDirectory(dir) {
  const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename) return

    // Only watch .js files
    if (!filename.endsWith('.js')) return

    // Ignore node_modules
    if (filename.includes('node_modules')) return

    runBuild()
  })

  return watcher
}

// Initial build
console.log('[watch-msq-src] Starting watcher...')
runBuild()

// Watch for changes
const watcher = watchDirectory(srcDir)

console.log(`[watch-msq-src] Watching ${srcDir} for changes`)
console.log('[watch-msq-src] Press Ctrl+C to stop')

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n[watch-msq-src] Stopping watcher...')
  watcher.close()
  process.exit(0)
})
