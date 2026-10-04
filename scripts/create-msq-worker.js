#!/usr/bin/env node

/**
 * The engine as a module worker and nothing else, for a page that talks to the
 * worker itself, without the web components and without parsing on the main
 * thread:
 *
 *   npm run create:msq:worker -- -o static/js/msq/worker
 *   node scripts/create-msq-worker.js -o static/js/msq/worker
 *
 * and then, in the page:
 *
 *   const worker = new Worker('/js/msq/worker/worker.js', { type: 'module' })
 *
 * A module worker gets no import map, so every `#msq/…` specifier in src/ has to
 * become something the browser can load. copy-msq-into-apps.js turns them into
 * absolute URLs from "worker.importmap" in package.json, which fixes the URL
 * the copy is served at. This turns them into relative paths instead: the copy
 * mirrors src/, so a module's path to another module is the same in both, and
 * the folder works wherever it is mounted. That is why it needs no import map
 * and no configuration beyond where to write.
 *
 * src/language is part of the copy, because the worker parses. What is left
 * out is the main thread's half: the separate language copy for the page, and
 * the web components.
 *
 * Only .js files are written. The fonts are not in it: the font config posted
 * with 'fonts.setup' names their URLs, wherever the page serves them from. Its
 * music "js" entries name the glyph tables, which are in the copy, at
 * <that folder's URL>/drawer/font/music-js/<font>.js.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const srcDir = path.join(projectRoot, 'src')

const USAGE = 'Usage: node scripts/create-msq-worker.js -o <output directory>'

function outputDirFromArgs(args) {
  const index = args.findIndex((arg) => arg === '-o' || arg === '--out')
  if (index === -1 || !args[index + 1]) {
    console.error(USAGE)
    process.exit(1)
  }
  /*
  npm runs every script from the project root, so a relative -o given through
  `npm run` would land inside this repository. INIT_CWD is where npm was
  called from, which is what the person typing the path meant.
  */
  return path.resolve(process.env.INIT_CWD || process.cwd(), args[index + 1])
}

/*
The output folder is emptied first, so a module removed from src/ does not
linger in it. Since the path comes from the command line, only a folder that is
empty or was written by this script before (it has a worker.js) is emptied;
anything else is refused rather than deleted.
*/
function prepare(outDir) {
  if (path.resolve(outDir) === srcDir || srcDir.startsWith(path.resolve(outDir) + path.sep)) {
    throw new Error(`refusing to write over the source it copies: ${outDir}`)
  }
  if (fs.existsSync(outDir)) {
    const entries = fs.readdirSync(outDir)
    if (entries.length > 0 && !entries.includes('worker.js')) {
      throw new Error(`${outDir} is not empty and does not look like a worker copy; choose another folder or empty it`)
    }
    fs.rmSync(outDir, { recursive: true })
  }
  fs.mkdirSync(outDir, { recursive: true })
}

/*
`#msq/drawer/x.js`, seen from src/midi/y.js, becomes `../drawer/x.js`. A path
that does not start with a dot is a bare specifier to the browser, so a module
in the same folder gets `./`.
*/
function relativeSpecifier(specifier, fromFile) {
  const target = path.join(srcDir, specifier.slice('#msq/'.length))
  const relative = path.relative(path.dirname(fromFile), target).split(path.sep).join('/')
  return relative.startsWith('.') ? relative : `./${relative}`
}

// The same four forms copy-msq-into-apps.js rewrites.
const IMPORT_PATTERNS = [
  /import\s+[\s\S]+?\s+from\s+['"]([^'"]+)['"]/g,
  /import\s+['"]([^'"]+)['"]/g,
  /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /export\s+[\s\S]+?\s+from\s+['"]([^'"]+)['"]/g
]

function rewrittenImports(code, fromFile) {
  let rewritten = code
  for (const pattern of IMPORT_PATTERNS) {
    rewritten = rewritten.replace(pattern, (match, specifier) => {
      if (!specifier.startsWith('#msq/')) {
        return match
      }
      return match.replace(specifier, relativeSpecifier(specifier, fromFile))
    })
  }
  return rewritten
}

function copyDirectory(dir, outBaseDir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const srcPath = path.join(dir, entry.name)
    const outPath = path.join(outBaseDir, entry.name)
    if (entry.isDirectory()) {
      fs.mkdirSync(outPath, { recursive: true })
      copyDirectory(srcPath, outPath)
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      fs.writeFileSync(outPath, rewrittenImports(fs.readFileSync(srcPath, 'utf-8'), srcPath), 'utf-8')
    }
  }
}

try {
  const outDir = outputDirFromArgs(process.argv.slice(2))
  prepare(outDir)
  copyDirectory(srcDir, outDir)
  console.log(`[create-msq-worker] Output: ${outDir}`)
  console.log(`[create-msq-worker] Start it with new Worker('<url of that folder>/worker.js', { type: 'module' })`)
} catch (error) {
  console.error('[create-msq-worker] Error:', error.message)
  process.exit(1)
}
