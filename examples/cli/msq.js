#!/usr/bin/env node
/**
 * MuSemantiQ command line.
 *
 * Two ways in — a few questions, or flags — both ending in the same call to
 * `generate()`.
 */
import path from 'node:path'
import { parseArgs } from './args.js'
import { helpText, version } from './help.js'
import { askForPlan } from './interactive.js'
import generate from './generate.js'
import { sourceFromPath, sourceFromText, DEFAULT_PAGE_DELIMITER } from './input.js'
import { loadFontConfig } from './fonts.js'
import { pasteBlock } from './lib/paste.js'
import { formatErrors, formatPlan, formatWrittenFiles, write } from './report.js'
import {
  isAbort, exitCodeFor, EXIT_PARSE_ERRORS, NotInteractiveError
} from './lib/errors.js'

/*
 * The paste guard depends on readline reporting bracketed-paste markers as
 * named keys, which older releases do not do — without it a multi-line paste
 * would answer several questions at once.
 */
const MINIMUM_MAJOR = 22

/*
 * Piping into something that stops reading early — `msq --help | head` — closes
 * our stdout mid-write. That is normal shell usage, not an error worth a stack
 * trace, so it ends the process quietly instead.
 */
function ignoreBrokenPipe() {
  for (const stream of [ process.stdout, process.stderr ]) {
    stream.on('error', (error) => {
      if (error.code === 'EPIPE') {
        process.exit(0)
      }
      throw error
    })
  }
}

function checkNodeVersion() {
  const major = Number(process.versions.node.split('.')[0])
  if (major < MINIMUM_MAJOR) {
    process.stderr.write(
      `MuSemantiQ's CLI needs Node ${MINIMUM_MAJOR} or newer (running ${process.versions.node}).\n`
    )
    process.exitCode = 2
    return false
  }
  return true
}

async function main() {
  ignoreBrokenPipe()
  if (!checkNodeVersion()) {
    return
  }

  const options = parseArgs(process.argv.slice(2))

  if (options.mode === 'help') {
    process.stdout.write(helpText() + '\n')
    return
  }
  if (options.mode === 'version') {
    process.stdout.write(`${await version()}\n`)
    return
  }

  const plan = options.mode === 'interactive'
    ? await askForPlan()
    : await planFromOptions(options)

  if (!plan.quiet) {
    write(formatPlan({
      formats: plan.formats,
      pageCount: plan.pages.length,
      inputLabel: plan.inputLabel,
      fontLabel: plan.fontLabel,
      destination: path.resolve(plan.outPath || '.')
    }))
  }

  const result = await generate(plan)

  if (!plan.quiet) {
    write(formatWrittenFiles(result.writtenPaths))
  }
  write(formatErrors(result.errorsForEachPage, { multiPage: plan.pages.length > 1 }), process.stderr)

  /*
   * Parse errors do not stop generation, but they should not look like success
   * either — a script needs to be able to tell.
   */
  if (result.errorCount > 0) {
    process.exitCode = EXIT_PARSE_ERRORS
  }
}

/** Build the same shape `askForPlan()` returns, from flags instead. */
async function planFromOptions(options) {
  const pageDelimiter = options.pageDelimiter || DEFAULT_PAGE_DELIMITER

  let source
  let inputLabel
  if (options.readsStdin) {
    /* pasteBlock reads a non-terminal stdin straight through to end-of-input. */
    source = sourceFromText(await pasteBlock(), {
      delimiter: pageDelimiter,
      name: options.name || 'score'
    })
    inputLabel = 'standard input'
  } else if (options.input !== undefined) {
    source = await sourceFromPath(options.input, { delimiter: pageDelimiter })
    inputLabel = options.input
  } else {
    source = sourceFromText(options.text, { delimiter: pageDelimiter, name: options.name || 'score' })
    inputLabel = 'text given on the command line'
  }

  let fontConfig
  let fontLabel = 'built-in'
  if (options.fonts) {
    fontConfig = await loadFontConfig(options.fonts)
    fontLabel = options.fonts
  }

  return {
    pages: source.pages,
    name: options.name || source.name,
    /* An explicit --name replaces per-file naming, so it is honoured for every page. */
    pageNames: options.name ? undefined : source.pageNames,
    formats: options.formats,
    fontConfig,
    fontLabel,
    outPath: options.out,
    pageDelimiter,
    inputLabel,
    quiet: options.quiet
  }
}

try {
  await main()
} catch (error) {
  if (isAbort(error)) {
    process.stderr.write('\nCancelled.\n')
  } else if (error instanceof NotInteractiveError) {
    process.stderr.write(`${error.message}\n\nRun with --help to see the options.\n`)
  } else if (error?.code === 'ERR_USAGE') {
    process.stderr.write(`${error.message}\n\nRun with --help to see the options.\n`)
  } else if (error?.code === 'ERR_IO') {
    process.stderr.write(`${error.message}\n`)
  } else {
    throw error
  }
  process.exitCode = exitCodeFor(error)
}
