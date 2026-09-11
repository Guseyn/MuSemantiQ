#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

// Read package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
)

// Get worker import map config
const workerImportMap = packageJson['worker.importmap']
if (!workerImportMap) {
  throw new Error('Missing "worker.importmap" in package.json')
}

// Source and output directories
const srcDir = path.join(projectRoot, 'src')
const outDir = path.join(
  projectRoot,
  'examples/browser/web-app/static/js/msq/worker'
)

// Create output directory
if (fs.existsSync(outDir)) {
  fs.rmSync(outDir, { recursive: true })
}
fs.mkdirSync(outDir, { recursive: true })

/**
 * Build import map for resolution
 * From: { "#msq": "/js/msq/worker" }
 * To: { "#msq/": "/js/msq/worker/" }
 */
function buildResolutionMap(importMapConfig) {
  const map = {}
  for (const [alias, resolved] of Object.entries(importMapConfig)) {
    // Add both with and without trailing slash
    if (!alias.endsWith('/')) {
      map[alias + '/'] = resolved + '/'
      map[alias] = resolved
    }
  }
  return map
}

const resolutionMap = buildResolutionMap(workerImportMap)

/**
 * Resolve a specifier using the import map
 */
function resolveSpecifier(specifier, map) {
  // Exact match
  if (map[specifier]) {
    return map[specifier]
  }

  // Prefix match (e.g., '#msq/' matches '#msq/api.js')
  for (const [alias, resolved] of Object.entries(map)) {
    if (alias.endsWith('/') && specifier.startsWith(alias)) {
      return specifier.replace(alias, resolved)
    }
  }

  return specifier
}

/**
 * Rewrite imports in code
 */
function rewriteImports(code, map) {
  const patterns = [
    /import\s+[\s\S]+?\s+from\s+['"]([^'"]+)['"]/g,    // import { x } from '...' (multiline)
    /import\s+['"]([^'"]+)['"]/g,                      // import '...' (side-effect)
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,            // import('...') (dynamic import)
    /export\s+[\s\S]+?\s+from\s+['"]([^'"]+)['"]/g,    // export { x } from '...'
  ]

  let rewritten = code

  for (const pattern of patterns) {
    rewritten = rewritten.replace(pattern, (match, specifier) => {
      const resolved = resolveSpecifier(specifier, map)

      if (resolved !== specifier) {
        return match.replace(specifier, resolved)
      }

      return match
    })
  }

  return rewritten
}

// Build-time tools that run on Node and are never imported by the worker.
const SKIPPED_DIRECTORIES = new Set([ 'tools' ])

/**
 * Process all files recursively
 */
function processDirectory(dir, outBaseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(dir, entry.name)
    const outPath = path.join(outBaseDir, entry.name)

    if (entry.isDirectory() && SKIPPED_DIRECTORIES.has(entry.name)) {
      continue
    }

    if (entry.isDirectory()) {
      // Create directory in output
      fs.mkdirSync(outPath, { recursive: true })
      // Recursively process directory
      processDirectory(srcPath, outPath)
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      // Read file
      let code = fs.readFileSync(srcPath, 'utf-8')

      // Rewrite imports
      code = rewriteImports(code, resolutionMap)

      // Write to output
      fs.writeFileSync(outPath, code, 'utf-8')
    }
  }
}

try {
  processDirectory(srcDir, outDir)
  console.log(`[create-msq-worker] Successfully processed ${srcDir}`)
  console.log(`[create-msq-worker] Output: ${outDir}`)
} catch (error) {
  console.error('[create-msq-worker] Error:', error.message)
  process.exit(1)
}
