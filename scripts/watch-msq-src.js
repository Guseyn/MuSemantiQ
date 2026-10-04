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
 * Run the build script
 */
function runBuild() {
  if (isBuilding) {
    pendingRebuild = true
    return
  }

  isBuilding = true
  const timestamp = new Date().toLocaleTimeString()
  console.log(`[watch-msq-src] ${timestamp} - Rebuilding worker environment...`)

  const child = spawn('node', [
    path.join(__dirname, 'copy-msq-into-apps.js')
  ], {
    stdio: 'inherit',
    cwd: projectRoot
  })

  child.on('exit', (code) => {
    isBuilding = false
    if (code === 0) {
      const timestamp = new Date().toLocaleTimeString()
      console.log(`[watch-msq-src] ${timestamp} - Worker environment rebuilt successfully`)
    } else {
      console.error(`[watch-msq-src] Build failed with code ${code}`)
    }

    if (pendingRebuild) {
      pendingRebuild = false
      runBuild()
    }
  })
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
