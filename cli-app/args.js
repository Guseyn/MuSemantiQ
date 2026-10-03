/**
 * Command-line parsing.
 */
import { UsageError } from './lib/errors.js'

const FLAGS_WITH_VALUES = new Set([
  '--input', '-i',
  '--text', '-t',
  '--out', '-o',
  '--fonts', '-f',
  '--name',
  '--page-delimiter'
])

const BOOLEAN_FLAGS = new Set([
  '--svg', '--midi', '--page-schema', '--highlights',
  '--no-color', '--quiet', '-q',
  '--help', '-h', '--version', '-v'
])

/**
 * @typedef {Object} Options
 * @property {'interactive'|'generate'|'help'|'version'} mode
 * @property {string} [input]
 * @property {string} [text]
 * @property {boolean} [readsStdin]
 * @property {string} [out]
 * @property {string} [fonts]
 * @property {string} [name]
 * @property {string} [pageDelimiter]
 * @property {{svg: boolean, midi: boolean, pageSchema: boolean, highlights: boolean}} formats
 * @property {boolean} quiet
 */

/**
 * @param {string[]} argv arguments after the script name
 * @returns {Options}
 */
export function parseArgs(argv) {
  const values = {}
  const seen = new Set()

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]

    if (!arg.startsWith('-')) {
      throw new UsageError(`unexpected argument "${arg}" — options must start with "-"`)
    }

    /* --flag=value as well as --flag value */
    let flag = arg
    let inlineValue = null
    const equals = arg.indexOf('=')
    if (equals !== -1) {
      flag = arg.slice(0, equals)
      inlineValue = arg.slice(equals + 1)
    }

    if (FLAGS_WITH_VALUES.has(flag)) {
      const value = inlineValue ?? argv[++index]
      if (value === undefined) {
        throw new UsageError(`${flag} needs a value`)
      }
      values[flag] = value
      seen.add(flag)
      continue
    }

    if (BOOLEAN_FLAGS.has(flag)) {
      if (inlineValue !== null) {
        throw new UsageError(`${flag} does not take a value`)
      }
      values[flag] = true
      seen.add(flag)
      continue
    }

    throw new UsageError(`unknown option "${flag}" — run with --help to see the options`)
  }

  if (values['--help'] || values['-h']) {
    return { mode: 'help', formats: noFormats(), quiet: false }
  }
  if (values['--version'] || values['-v']) {
    return { mode: 'version', formats: noFormats(), quiet: false }
  }

  /* No arguments at all: ask the questions, or explain how when we cannot. */
  if (seen.size === 0) {
    return {
      mode: process.stdin.isTTY && process.stdout.isTTY ? 'interactive' : 'help',
      formats: noFormats(),
      quiet: false
    }
  }

  const input = values['--input'] ?? values['-i']
  const text = values['--text'] ?? values['-t']

  if (input !== undefined && text !== undefined) {
    throw new UsageError('--input and --text cannot both be given')
  }
  /*
   * With neither given, text is read from standard input — but only when
   * something is actually piped in, since on a terminal that would just hang
   * with no indication of what it was waiting for.
   */
  const readsStdin = input === undefined && text === undefined
  if (readsStdin && process.stdin.isTTY) {
    throw new UsageError('nothing to read — give --input <file|folder>, --text <string>, or pipe text in')
  }

  const formats = {
    svg: !!values['--svg'],
    midi: !!values['--midi'],
    pageSchema: !!values['--page-schema'],
    highlights: !!values['--highlights']
  }
  /* Asking for nothing in particular means asking for a score. */
  if (!formats.svg && !formats.midi && !formats.pageSchema && !formats.highlights) {
    formats.svg = true
  }

  const delimiter = values['--page-delimiter']
  if (delimiter !== undefined && delimiter === '') {
    throw new UsageError('--page-delimiter cannot be empty')
  }

  return {
    mode: 'generate',
    input,
    text,
    readsStdin,
    out: values['--out'] ?? values['-o'],
    fonts: values['--fonts'] ?? values['-f'],
    name: values['--name'],
    pageDelimiter: delimiter,
    formats,
    quiet: !!(values['--quiet'] || values['-q'])
  }
}

function noFormats() {
  return { svg: false, midi: false, pageSchema: false, highlights: false }
}
