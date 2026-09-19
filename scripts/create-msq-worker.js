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

/*
Both browser apps run MuSemantiQ inside a module worker, where import maps do
not apply, so each needs its own copy of src/ with the specifiers rewritten to
real URLs. They get the same tree, written twice, so the watcher keeps both in
step without knowing there is more than one.
*/
const outDirs = [
  'examples/browser/web-app/static/js/msq/worker',
  'dev-tools/web-app/static/js/msq/worker'
].map((relative) => path.join(projectRoot, relative))

/*
The page needs the language too — the editor colours what is typed by parsing
it, on the main thread, between a keystroke and the next paint. So src/language
is written out a second time, beside the worker rather than inside it:

  js/msq/language/   the parser, for the page
  js/msq/worker/     the whole engine, for the worker

Nothing in src/language imports outside itself, so this copy needs no rewriting
at all: its `#msq/language/…` specifiers are resolved by the page's import map.
That is also why it is a copy and not the worker's — a module worker gets no
import map, so the worker's tree has to have those specifiers rewritten, and a
rewritten module is no use to the page.
*/
const languageDir = path.join(srcDir, 'language')
const languageOutDirs = [
  'examples/browser/web-app/static/js/msq/language',
  'dev-tools/web-app/static/js/msq/language'
].map((relative) => path.join(projectRoot, relative))

// Create output directories
for (const outDir of [ ...outDirs, ...languageOutDirs ]) {
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true })
  }
  fs.mkdirSync(outDir, { recursive: true })
}

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

/**
 * Process all files recursively
 */
function processDirectory(dir, outBaseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(dir, entry.name)
    const outPath = path.join(outBaseDir, entry.name)

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

/**
 * Copy a directory of modules as they are, specifiers untouched.
 */
function copyDirectory(dir, outBaseDir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const srcPath = path.join(dir, entry.name)
    const outPath = path.join(outBaseDir, entry.name)

    if (entry.isDirectory()) {
      fs.mkdirSync(outPath, { recursive: true })
      copyDirectory(srcPath, outPath)
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      fs.copyFileSync(srcPath, outPath)
    }
  }
}

try {
  for (const outDir of outDirs) {
    processDirectory(srcDir, outDir)
    console.log(`[create-msq-worker] Output: ${outDir}`)
  }
  for (const languageOutDir of languageOutDirs) {
    copyDirectory(languageDir, languageOutDir)
    console.log(`[create-msq-worker] Output: ${languageOutDir}`)
  }
  console.log(`[create-msq-worker] Successfully processed ${srcDir}`)
} catch (error) {
  console.error('[create-msq-worker] Error:', error.message)
  process.exit(1)
}
