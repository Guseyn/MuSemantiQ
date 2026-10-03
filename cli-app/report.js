/**
 * Turning results into something readable in a terminal.
 */
import path from 'node:path'
import { muted, heading, success, failure, warning, accent } from './lib/colors.js'
import { padToWidth, displayWidth } from './lib/width.js'

/*
 * Parse errors come back as plain sentences with the line number written into
 * the prose, so the number has to be lifted back out to tabulate them. Same
 * expression the browser example uses, which is the only other place that
 * formats these.
 */
const LINE_CLAUSE = /\s+on the line (?:number )?(\d+)\s*$/

/**
 * A parser message can quote a command that itself spans lines, so the text is
 * flattened onto one line — otherwise it breaks out of the table it is printed
 * in.
 */
function singleLine(text) {
  return text.replace(/\s+/g, ' ').trim()
}

/** @returns {{line: number|null, message: string}} */
export function parsedError(error) {
  const message = typeof error === 'string' ? error : String(error)
  const match = message.match(LINE_CLAUSE)
  if (!match) {
    return { line: null, message: singleLine(message) }
  }
  return { line: Number(match[1]), message: singleLine(message.slice(0, match.index)) }
}

/** Total across every page. */
export function countErrors(errorsForEachPage) {
  return (errorsForEachPage || []).reduce((total, errors) => total + (errors?.length || 0), 0)
}

/**
 * A table of parse errors, grouped by page.
 *
 * Errors do not stop generation — the parser is fault tolerant and still
 * produces output — so this reports rather than aborts.
 */
export function formatErrors(errorsForEachPage, { multiPage }) {
  const total = countErrors(errorsForEachPage)
  if (total === 0) {
    return []
  }

  const lines = [ '', failure(`${total} ${total === 1 ? 'error' : 'errors'} while parsing:`) ]

  errorsForEachPage.forEach((errors, pageIndex) => {
    if (!errors || errors.length === 0) {
      return
    }
    if (multiPage) {
      lines.push(muted(`  page ${pageIndex + 1}`))
    }
    const parsed = errors.map(parsedError)
    const lineWidth = Math.max(...parsed.map((entry) => displayWidth(entry.line === null ? '—' : String(entry.line))))
    for (const entry of parsed) {
      const label = entry.line === null ? '—' : String(entry.line)
      lines.push(`    ${warning(padToWidth(label, lineWidth))}  ${entry.message}`)
    }
  })

  lines.push('', muted('Output was still written — the parser skips what it cannot read.'))
  return lines
}

/** What was produced, relative to the working directory when that is shorter. */
export function formatWrittenFiles(paths) {
  const lines = [ '', success(`Wrote ${paths.length} ${paths.length === 1 ? 'file' : 'files'}:`) ]
  for (const filePath of paths) {
    const relative = path.relative(process.cwd(), filePath)
    const shown = !relative.startsWith('..') && relative.length < filePath.length ? relative : filePath
    lines.push(`  ${shown}`)
  }
  return lines
}

/** The choices a run was made with, echoed before work starts. */
export function formatPlan({ formats, pageCount, inputLabel, fontLabel, destination }) {
  const requested = []
  if (formats.svg) {
    requested.push('SVG')
  }
  if (formats.midi) {
    requested.push('MIDI')
  }
  if (formats.pageSchema) {
    requested.push('page schema')
  }
  if (formats.highlights) {
    requested.push('highlights')
  }

  return [
    '',
    heading('Generating'),
    `  ${muted('output   ')} ${accent(requested.join(', '))}`,
    `  ${muted('input    ')} ${inputLabel} ${muted(`(${pageCount} ${pageCount === 1 ? 'page' : 'pages'})`)}`,
    `  ${muted('fonts    ')} ${fontLabel}`,
    `  ${muted('folder   ')} ${destination}`
  ]
}

export function write(lines, stream = process.stdout) {
  if (lines.length > 0) {
    stream.write(lines.join('\n') + '\n')
  }
}
