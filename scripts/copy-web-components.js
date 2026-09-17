#!/usr/bin/env node

/**
 * Put the shared components into every app that shows a score.
 *
 * They are authored once in web-components/ and copied, rather than symlinked,
 * because each app serves a plain static folder and a symlinked directory would
 * make what is served depend on how the server follows links.
 *
 * They land in a folder of their own, so what an app serves under js/msq is the
 * two halves and nothing else:
 *
 *   js/msq/web-components/   from here
 *   js/msq/worker/           from src/, by create-msq-worker.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const sourceDir = path.join(projectRoot, 'web-components')

const outDirs = [
  'examples/browser/web-app/static/js/msq/web-components',
  'dev-tools/web-app/static/js/msq/web-components'
].map((relative) => path.join(projectRoot, relative))

// What documents the folder rather than being part of it.
const NOT_COPIED = new Set([ 'README.md', '.DS_Store' ])

function copyInto(from, to) {
  fs.mkdirSync(to, { recursive: true })

  const wanted = new Set()
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (NOT_COPIED.has(entry.name)) {
      continue
    }
    wanted.add(entry.name)
    const source = path.join(from, entry.name)
    const target = path.join(to, entry.name)
    if (entry.isDirectory()) {
      copyInto(source, target)
    } else if (entry.isFile()) {
      fs.copyFileSync(source, target)
    }
  }

  // A module deleted upstream has to go here too, or it stays importable and
  // the copy quietly stops being the same code.
  for (const entry of fs.readdirSync(to, { withFileTypes: true })) {
    if (NOT_COPIED.has(entry.name) || wanted.has(entry.name)) {
      continue
    }
    fs.rmSync(path.join(to, entry.name), { recursive: true, force: true })
  }
}

try {
  for (const outDir of outDirs) {
    copyInto(sourceDir, outDir)
    console.log(`[copy-web-components] Output: ${outDir}`)
  }
} catch (error) {
  console.error('[copy-web-components] Error:', error.message)
  process.exit(1)
}
