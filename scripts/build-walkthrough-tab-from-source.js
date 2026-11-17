// One walkthrough tab, built from the source files a set of globs matches:
// every top-level function becomes a frame with its code, its doc line and
// its call stack. The same source always produces the same tab — ordering is
// deterministic everywhere, so a rebuilt page only changes when code changes.

import fs from 'node:fs'
import path from 'node:path'

const FUNCTION_START = /^(?:export default |export )?(?:async )?function\s*(\w*)\s*\(/
const ARROW_FUNCTION_START = /^const (\w+)\s*=\s*(?:async\s*)?\(/

// strings and comments hold braces and calls that are not code
function stripCode(line) {
  return line
    .replace(/'[^']*'|"[^"]*"|`[^`]*`/g, '""')
    .replace(/\/\/.*/, '')
}

// one pass, so substituted text is never re-scanned
function globToRegExp(pattern) {
  let source = ''
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i]
    if (c === '*' && pattern[i + 1] === '*') {
      i++
      if (pattern[i + 1] === '/') {
        i++
        source += '(?:.*/)?'
      } else source += '.*'
    } else if (c === '*') source += '[^/]*'
    else if (c === '?') source += '[^/]'
    else if ('.+^${}()|[]\\'.includes(c)) source += '\\' + c
    else source += c
  }
  return new RegExp('^' + source + '$')
}

function allFilesUnder(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...allFilesUnder(full))
    else out.push(full)
  }
  return out.sort()
}

// lib/ trees are vendored code; only an explicit glob brings them in
function isVendored(file) {
  return file.includes('/lib/') && !file.includes('language')
}

function functionsIn(file, relativeFile) {
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  const functions = []
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(FUNCTION_START) || lines[i].match(ARROW_FUNCTION_START)
    if (!match) continue
    let depth = 0
    let seenBrace = false
    let end = null
    for (let j = i; j < lines.length; j++) {
      const code = stripCode(lines[j])
      depth += (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length
      if (code.includes('{') || code.includes('}')) seenBrace = true
      if (seenBrace && depth === 0) { end = j; break }
    }
    if (end === null) end = i
    // the doc line is the comment line closest above the function
    let doc = ''
    for (let k = i - 1; k > Math.max(-1, i - 16); k--) {
      const s = lines[k].trim()
      if (s.startsWith('*') || s.startsWith('/**')) {
        const t = s.replace(/^[*/]+/, '').trim()
        if (t && !t.startsWith('----') && !t.startsWith('===')) doc = t
      } else if (s) break
    }
    const text = lines.slice(i, end + 1).join('\n')
    const calls = new Set()
    for (const call of text.matchAll(/([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)) calls.add(call[1])
    functions.push({
      name: match[1] || path.basename(relativeFile, path.extname(relativeFile)),
      file: relativeFile,
      start: i + 1,
      end: end + 1,
      text,
      sig: lines[i].trim().replace(/\{+$/, '').trim(),
      doc,
      calls
    })
  }
  return functions
}

function collect(globs, srcRoot, repoRoot) {
  const functions = []
  const sourceFiles = []
  const seen = new Set()
  const files = allFilesUnder(srcRoot).filter(file => file.endsWith('.js'))
  for (const pattern of globs) {
    const regexp = globToRegExp(pattern)
    for (const file of files) {
      const relativeFile = path.relative(srcRoot, file)
      if (!regexp.test(relativeFile)) continue
      if (isVendored(file)) continue
      if (!sourceFiles.includes(relativeFile)) sourceFiles.push(relativeFile)
      for (const fn of functionsIn(file, path.relative(repoRoot, file))) {
        const key = fn.file + '#' + fn.start
        if (seen.has(key)) continue
        seen.add(key)
        functions.push(fn)
      }
    }
  }
  return { functions, sourceFiles: sourceFiles.sort() }
}

export default function buildWalkthroughTabFromSource(name, globs, entry, srcRoot, repoRoot) {
  const { functions, sourceFiles } = collect(globs, srcRoot, repoRoot)

  const byName = new Map()
  const byStem = new Map()
  for (const fn of functions) {
    if (!byName.has(fn.name)) byName.set(fn.name, fn)
    byStem.set(path.basename(fn.file, path.extname(fn.file)), fn)
  }
  const resolve = call => byName.get(call) || byStem.get(call)

  // edges: caller → callee, for calls that resolve inside this tab
  const edgePairs = []
  const seenEdges = new Set()
  for (const fn of functions) {
    for (const call of [...fn.calls].sort()) {
      if (!byName.has(call) && !byStem.has(call)) continue
      const callee = resolve(call)
      if (!callee || callee === fn) continue
      const key = fn.name + '\u0000' + callee.name
      if (seenEdges.has(key)) continue
      seenEdges.add(key)
      edgePairs.push([fn.name, callee.name])
    }
  }

  const roots = functions.filter(fn => !edgePairs.some(([, b]) => b === fn.name)).map(fn => fn.name)
  if (roots.length === 0 && functions.length) roots.push(functions[0].name)

  const depth = new Map(roots.map(r => [r, 0]))
  let frontier = [...roots]
  while (frontier.length) {
    const next = []
    for (const a of frontier) {
      for (const [x, b] of edgePairs) {
        if (x === a && (!depth.has(b) || depth.get(b) > depth.get(a) + 1)) {
          depth.set(b, depth.get(a) + 1)
          next.push(b)
        }
      }
    }
    frontier = next
  }
  const depthOf = name => depth.get(name) ?? 99

  // shown blocks: four per depth row; deeper functions light their nearest one
  const shownNames = new Set()
  const rows = new Map()
  for (const fn of functions) {
    const d = depthOf(fn.name)
    if (!rows.has(d)) rows.set(d, [])
    rows.get(d).push(fn.name)
  }
  for (const d of [...rows.keys()].sort((a, b) => a - b)) {
    for (const n of [...rows.get(d)].sort().slice(0, 4)) shownNames.add(n)
  }
  const shown = name => {
    if (shownNames.has(name)) return name
    let best = null
    let bestDepth = 99
    for (const [a, b] of edgePairs) {
      if (b === name && shownNames.has(a) && depthOf(a) < bestDepth) {
        best = a
        bestDepth = depthOf(a)
      }
    }
    return best || roots[0] || null
  }

  const frames = [...functions].sort((a, b) =>
    depthOf(a.name) - depthOf(b.name) ||
    (a.file < b.file ? -1 : a.file > b.file ? 1 : 0) ||
    a.start - b.start)

  const nameToFile = new Map()
  for (const fn of functions) {
    if (!nameToFile.has(fn.name)) nameToFile.set(fn.name, fn.file)
  }

  return {
    name,
    entry,
    sourceFiles,
    blocks: Object.fromEntries(functions.map(fn => [fn.file + '#' + fn.start, fn])),
    frames: frames.map(fn => {
      // the call stack walks up the first caller found; it is the same walk
      // every time because the edges are built in source order
      const chain = []
      let current = fn.name
      let guard = 0
      while (current !== undefined && current !== null && guard < 12) {
        chain.push(current)
        const parent = edgePairs.find(([a, b]) => b === current && a !== current)
        current = parent ? parent[0] : null
        guard++
      }
      const stack = chain.reverse()
      const callers = [...new Set(edgePairs.filter(([, b]) => b === fn.name).map(([a]) => a))].sort().slice(0, 4)
      const files = []
      for (const n of stack) {
        const file = nameToFile.get(n)
        if (file && !files.includes(file)) files.push(file)
      }
      return {
        t: fn.name,
        x: (fn.doc || fn.sig).slice(0, 170),
        f: fn.file + '#' + fn.start,
        l: [fn.start, fn.end],
        on: shown(fn.name) ? [shown(fn.name)] : [],
        w: { stack, 'called by': callers.join(', ') || '\u2014', file: fn.file },
        fs: files
      }
    })
  }
}
