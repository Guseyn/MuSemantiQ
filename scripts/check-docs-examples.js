#!/usr/bin/env node

/*
Checks every MSQ example in the documentation, three ways.

1. The wrapper.  Examples are written as ```msq-editor fences, whose music the
   extensions in showdown-extensions/ keep out of markdown altogether. A
   `<template is="msq-editor">` written as HTML is another matter: `<template>`
   is not one of showdown's block tags, so a bare one is not protected from the
   markdown pass — blank lines split it into paragraphs, and lines starting
   `-`, `#` or `1.` are eaten. `div` IS a block tag, and showdown re-emits a
   matched block byte for byte. So for those the wrapper is load-bearing, and
   the failure it prevents is silent — the example still renders, just wrong.
   That is why this is a build error and not a style note.

2. The music.  Every example is parsed. The parser is fault tolerant — it never
   throws, it accumulates — so an empty `errors` array is the only pass signal.

3. The order.  Every example is gradual: it may only use concepts that its own
   page or an earlier one introduces (a page marked `preview` is exempt). The
   parser reports which of its 578 named
   scenarios fired, docs/concepts.js says which page introduces each, and the
   sitemap's order says which pages count as earlier. Nothing here is a
   hand-kept list of keywords.

It also reports any scenario no page introduces, which is how a new language
feature says that the documentation has not caught up with it.

  node scripts/check-docs-examples.js [--only=<substring>]
*/

import fs from 'fs'
import path from 'path'
import url, { fileURLToPath } from 'url'

import { generateIntermediateStructuresForSinglePage } from '#msq/language/api.js'
import parserScenarios from '#msq/language/parser/scenarios/parserScenarios.js'

import { allPages } from '../docs/web-app/static/js/sitemap.js'
import { introducedBy } from '../docs/concepts.js'
import msqExtensions from '../showdown-extensions/msqExtensions.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const mdRoot = path.join(projectRoot, 'docs/web-app/static/md')

const only = (process.argv.find((arg) => arg.startsWith('--only=')) || '').slice('--only='.length)

/*
The same markdown converter the page will use, with the same options, so that
"the wrapper protects the music" is checked rather than believed. It lives in
the vendored EHTML tree, which only exists after `npm run docs:vendor` — when it
is absent the round trip is skipped and said to be skipped.
*/
const showdownPath = path.join(projectRoot, 'docs/web-app/static/js/ehtml/showdown/showdown.js')
let converter = null
if (fs.existsSync(showdownPath)) {
  const showdown = await import(url.pathToFileURL(showdownPath).href)
  showdown.setFlavor('github')
  converter = new showdown.Converter({
    tables: true,
    tasklists: true,
    simpleLineBreaks: true,
    emoji: true,
    moreStyling: true,
    github: true,
    // The same extensions the docs shell gives its e-markdown
    extensions: [ msqExtensions({ fontSources: 'msqFontSources' }) ]
  })
}

const pages = allPages()
const pageIndexByRef = new Map(pages.map((page, index) => [ page.ref, index ]))
const pageTitleByRef = new Map(pages.map((page) => [ page.ref, `${page.sectionTitle} → ${page.title}` ]))

const problems = []

function report(file, line, message) {
  problems.push({ file, line, message })
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length
}

/*
Every msq template in a document, paired by nesting rather than by the next
closing tag. A msq-font-loader wraps the elements it readies, so a lazy regex
pairs its opening tag with the *inner* element's close and silently swallows
the example between them. A stack is the only thing that gets this right.
*/
function templateBlocks(text) {
  const tags = /<template\b([^>]*)>|<\/template>/g
  const open = []
  const blocks = []

  let match
  while ((match = tags.exec(text)) !== null) {
    if (match[0].startsWith('</')) {
      const start = open.pop()
      if (!start) {
        continue
      }
      blocks.push({
        tag: start.tag,
        startIndex: start.startIndex,
        contentStart: start.contentStart,
        closeIndex: match.index,
        endIndex: match.index + match[0].length,
        source: text.slice(start.contentStart, match.index)
      })
    } else {
      const is = /\bis="(msq-[a-z-]+)"/.exec(match[1])
      open.push({
        tag: is ? is[1] : null,
        startIndex: match.index,
        contentStart: match.index + match[0].length
      })
    }
  }

  // The font loader holds other elements; it is never an example itself.
  return blocks
    .filter((block) => block.tag && block.tag !== 'msq-font-loader')
    .sort((left, right) => left.startIndex - right.startIndex)
}

/*
Examples can also be written as fences named after the element, which the
extensions in showdown-extensions/ turn into the element:

  ```msq-editor opens-with=text
  c d e f
  ```

The music in them never goes through markdown, so they need no wrapper. They
are found with the same pattern the extensions use: the element's exact name,
so that msq-svg does not take msq-svg-midi's fences.
*/
const MSQ_FENCE = /^(`{3,}|~{3,})[ \t]*(msq-svg-midi|msq-svg|msq-midi|msq-editor)(?=[ \t]|$)[^\n]*\n([\s\S]*?)\n?\1[ \t]*$/gm

function msqFencesIn(text) {
  return [ ...text.matchAll(MSQ_FENCE) ].map((match) => ({
    tag: match[2],
    music: match[3],
    startIndex: match.index
  }))
}

// What a browser reads back out of the escaped music an extension wrote
function unescapedHtml(text) {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&')
}

// Every fenced block with each character but newlines replaced by a space, so indexes and lines still match
function withCodeBlocksBlanked(text) {
  return text.replace(/^```[\s\S]*?^```/gm, (fence) => fence.replace(/[^\n]/g, ' '))
}

/*
The page that documents error reporting has to show input that does not
parse. It says so, just above the example, and is then held to the opposite
rule.
*/
function allowsErrors(lines, startLine) {
  return /<!--\s*check-docs-examples:\s*allow-errors\s*-->/.test(
    lines.slice(Math.max(0, startLine - 4), startLine - 1).join('\n')
  )
}

/**
 * Every msq example in one markdown file, with the wrapper checked.
 */
function examplesIn(text, relativePath) {
  const found = []
  const lines = text.split('\n')

  for (const fence of msqFencesIn(text)) {
    const startLine = lineOf(text, fence.startIndex)
    found.push({ source: fence.music, line: startLine, tag: fence.tag, allowErrors: allowsErrors(lines, startLine) })
  }

  /*
  A page that documents the components shows this markup as markup, inside a
  fenced block. That is text, not an example, so the fences are blanked out
  first — every character replaced by a space, so that every index and line
  number still refers to the real place in the file.
  */
  const scanned = withCodeBlocksBlanked(text)

  for (const block of templateBlocks(scanned)) {
    const startLine = lineOf(scanned, block.startIndex)
    const endLine = lineOf(scanned, block.endIndex)

    // The line before the template, and the line after it, must be the wrapper.
    const before = (lines[startLine - 2] || '')
    const after = (lines[endLine] || '')

    if (!/^<div(\s[^>]*)?>$/.test(before)) {
      report(
        relativePath, startLine,
        `<template is="${block.tag}"> is not wrapped: the line above it must be a <div> at column 0, ` +
        `found ${JSON.stringify(before)}. Without it showdown rewrites the music.`
      )
    } else if (/\bmarkdown\b/.test(before)) {
      report(
        relativePath, startLine - 1,
        'the wrapping <div> must not contain the word "markdown" in its attributes: ' +
        'showdown re-parses the contents of an element that does.'
      )
    }

    if (!/^<\/div>$/.test(after)) {
      report(
        relativePath, endLine,
        `<template is="${block.tag}"> is not closed off: the line after </template> must be </div> ` +
        `at column 0, found ${JSON.stringify(after)}.`
      )
    }

    found.push({ source: block.source, line: startLine, tag: block.tag, allowErrors: allowsErrors(lines, startLine) })
  }
  return found.sort((left, right) => left.line - right.line)
}

/** The named scenarios that fired for one MSQ source. */
function scenariosUsedBy(source) {
  const result = generateIntermediateStructuresForSinglePage({ pageText: source })
  const used = new Set()
  const map = result.mapOfCharIndexesWithProgressionOfCommandsFromScenarios || {}
  for (const progression of Object.values(map)) {
    if (Array.isArray(progression)) {
      for (const name of progression) {
        used.add(name)
      }
    }
  }
  return { used, errors: result.errors || [] }
}

function checkFile(absolutePath, relativePath, ref) {
  const text = fs.readFileSync(absolutePath, 'utf-8')
  const pageIndex = pageIndexByRef.get(ref)

  /*
  The getting-started pages come before the language is taught, yet they have to
  show a score — a tour that only describes music is no tour. A page that is a
  preview of what follows says so, anywhere in it, and is then exempt from the
  order and nothing else: its examples must still be wrapped and still parse.
  */
  const isPreview = /<!--\s*check-docs-examples:\s*preview\s*-->/.test(text)

  /*
  Render the page the way the browser will, and check every example came
  through unchanged. This is what the <div> wrapper is for, and it is the one
  failure that is otherwise silent: the score still draws, just not the score
  that was written.
  */
  if (converter) {
    const rendered = converter.makeHtml(text)
    // A fenced example comes out as its element with the music between two newlines, escaped
    // Markup shown in a code block is text, and comes out escaped, so it is not counted (see examplesIn)
    const before = [
      ...templateBlocks(withCodeBlocksBlanked(text)).map((block) => ({ startIndex: block.startIndex, source: text.slice(block.contentStart, block.closeIndex), fenced: false })),
      ...msqFencesIn(text).map((fence) => ({ startIndex: fence.startIndex, source: `\n${fence.music}\n`, fenced: true }))
    ].sort((left, right) => left.startIndex - right.startIndex)
    const after = templateBlocks(rendered)
    if (before.length !== after.length) {
      report(
        relativePath, 0,
        `${before.length} example(s) written but ${after.length} survived the markdown pass.`
      )
    } else {
      before.forEach((block, index) => {
        const came = block.fenced ? unescapedHtml(after[index].source) : after[index].source
        if (came !== block.source) {
          report(
            relativePath, lineOf(text, block.startIndex),
            'the markdown pass rewrote this example. Compare what was written with what came out:\n' +
            `      written:  ${JSON.stringify(block.source.slice(0, 70))}\n` +
            `      rendered: ${JSON.stringify(came.slice(0, 70))}`
          )
        }
      })
    }
  }

  for (const example of examplesIn(text, relativePath)) {
    let used, errors
    try {
      ({ used, errors } = scenariosUsedBy(example.source))
    } catch (error) {
      report(relativePath, example.line, `the parser threw on this example: ${error.message}`)
      continue
    }

    if (!example.allowErrors) {
      for (const message of errors) {
        report(relativePath, example.line, `the music does not parse — ${message}`)
      }
    } else if (!errors.length) {
      report(
        relativePath, example.line,
        'marked allow-errors but the music parses cleanly — the marker is for the page ' +
        'that demonstrates error reporting, and a clean example there proves nothing.'
      )
    }

    for (const name of isPreview ? [] : used) {
      const introducer = introducedBy(name)
      if (!introducer) {
        continue
      }
      const introducerIndex = pageIndexByRef.get(introducer)
      if (introducerIndex === undefined || introducerIndex <= pageIndex) {
        continue
      }
      report(
        relativePath, example.line,
        `uses "${name}", which is not introduced until ${pageTitleByRef.get(introducer)}. ` +
        'Either use something already introduced, or move that page earlier.'
      )
    }
  }
}

// ── Walk the markdown ────────────────────────────────────────────────────
let checked = 0
if (fs.existsSync(mdRoot)) {
  for (const page of pages) {
    if (only && !page.ref.includes(only)) {
      continue
    }
    const absolutePath = path.join(mdRoot, page.section, `${page.slug}.md`)
    if (!fs.existsSync(absolutePath)) {
      report(`md/${page.ref}.md`, 0, 'the sitemap lists this page but there is no markdown file for it.')
      continue
    }
    checked += 1
    checkFile(absolutePath, `md/${page.ref}.md`, page.ref)
  }
}

/*
The landing page and the shell carry examples too. They are HTML, so the div
wrapper does not apply and neither does the reading order — but they still have
to be music that parses, and a broken example on the front page is the most
visible failure there is.
*/
const htmlRoot = path.join(projectRoot, 'docs/web-app/static/html')
if (!only && fs.existsSync(htmlRoot)) {
  for (const name of fs.readdirSync(htmlRoot)) {
    if (!name.endsWith('.html')) {
      continue
    }
    const relativePath = `html/${name}`
    const text = fs.readFileSync(path.join(htmlRoot, name), 'utf-8')
    for (const block of templateBlocks(text)) {
      const line = lineOf(text, block.startIndex)
      try {
        const { errors } = scenariosUsedBy(block.source)
        for (const message of errors) {
          report(relativePath, line, `the music does not parse — ${message}`)
        }
      } catch (error) {
        report(relativePath, line, `the parser threw on this example: ${error.message}`)
      }
    }
  }
}

/*
The font config, and every file it names.

Nothing engraves until msq-font-loader has registered these, and the loader
holds the page's content inside itself until it has — so a renamed font file
does not degrade the landing page, it empties it. That failure is a missing
file, which is exactly the kind a check can see.
*/
const staticRoot = path.join(projectRoot, 'docs/web-app/static')
const fontConfigPath = path.join(staticRoot, 'js/font-config.json')

if (!fs.existsSync(fontConfigPath)) {
  report('js/font-config.json', 0, 'the font config is missing, so nothing on the site can engrave.')
} else {
  let fontConfig = null
  try {
    fontConfig = JSON.parse(fs.readFileSync(fontConfigPath, 'utf-8'))
  } catch (error) {
    report('js/font-config.json', 0, `the font config is not valid JSON: ${error.message}`)
  }

  const named = []
  for (const [ family, entries ] of Object.entries(fontConfig || {})) {
    for (const [ name, value ] of Object.entries(entries)) {
      if (typeof value === 'string') {
        named.push([ `${family}.${name}`, value ])
      } else {
        for (const [ part, url ] of Object.entries(value)) {
          named.push([ `${family}.${name}.${part}`, url ])
        }
      }
    }
  }

  for (const [ where, url ] of named) {
    if (!url.startsWith('/')) {
      report('js/font-config.json', 0, `${where} is "${url}"; it has to be a path from the site root.`)
      continue
    }
    if (!fs.existsSync(path.join(staticRoot, url.slice(1)))) {
      report('js/font-config.json', 0, `${where} names ${url}, which is not there.`)
    }
  }
}

// ── Coverage: a concept no page introduces ───────────────────────────────
const everyScenario = Object.keys(parserScenarios())
const orphans = everyScenario.filter((name) => !introducedBy(name))

// ── Verdict ──────────────────────────────────────────────────────────────
console.log(`[check-docs-examples] ${checked} pages checked`)

if (orphans.length) {
  console.log(
    `[check-docs-examples] ${orphans.length} language concepts no page introduces ` +
    '(add a rule to docs/concepts.js):'
  )
  for (const name of orphans.slice(0, 20)) {
    console.log(`    ${name}`)
  }
  if (orphans.length > 20) {
    console.log(`    … and ${orphans.length - 20} more`)
  }
}

if (problems.length) {
  console.error(`\n[check-docs-examples] ${problems.length} problem(s):\n`)
  for (const problem of problems) {
    console.error(`  ${problem.file}:${problem.line}`)
    console.error(`    ${problem.message}\n`)
  }
  process.exit(1)
}

console.log('[check-docs-examples] every example is wrapped, parses, and is gradual')
