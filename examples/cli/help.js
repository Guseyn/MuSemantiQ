/**
 * The --help and --version output.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { heading, muted, accent, bold } from './lib/colors.js'

const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..')

export async function version() {
  const manifest = JSON.parse(await readFile(path.join(REPO_ROOT, 'package.json'), 'utf8'))
  return manifest.version
}

export function helpText() {
  const option = (flags, description) => `  ${accent(flags.padEnd(26))}${description}`

  return [
    '',
    heading('MuSemantiQ') + muted(' — turn music written as text into a score and a performance'),
    '',
    bold('USAGE'),
    '  msq                                  ' + muted('ask a few questions, then generate'),
    '  msq --input <file|folder> [options]  ' + muted('generate without asking'),
    '',
    bold('INPUT') + muted('  (one is required in non-interactive mode)'),
    option('-i, --input <path>', 'a file, or a folder holding one file per page'),
    option('-t, --text <string>', 'MuSemantiQ source given directly'),
    '',
    bold('OUTPUT'),
    option('--svg', 'engrave a score — one SVG per page (default)'),
    option('--midi', 'render a performance — one MIDI for the whole document'),
    option('--page-schema', 'write the parsed layout as JSON'),
    option('--highlights', 'write the syntax-highlighted source as HTML'),
    option('-o, --out <path>', 'folder to write into (default: current folder)'),
    option('--name <basename>', 'basename for generated files'),
    '',
    bold('OTHER'),
    option('-f, --fonts <file.json>', 'font configuration; omit to use the built-in fonts'),
    option('--page-delimiter <str>', `line that separates pages (default: ${muted('====next page====')})`),
    option('-q, --quiet', 'only report problems'),
    option('--no-color', 'no ANSI colour (also honours NO_COLOR)'),
    option('-h, --help', 'this message'),
    option('-v, --version', 'print the version'),
    '',
    bold('EXAMPLES'),
    muted('  # a score and a performance from one file'),
    '  msq --input score.txt --out build --svg --midi',
    '',
    muted('  # every page of a folder, engraved, plus one continuous performance'),
    '  msq --input pages/ --out build --svg --midi',
    '',
    muted('  # just the performance, from a pipe'),
    '  cat score.txt | msq --midi --out build',
    '',
    bold('EXIT CODES'),
    `  ${accent('0')}  done          ${accent('2')}  bad usage        ${accent('130')}  cancelled`,
    `  ${accent('1')}  parse errors  ${accent('3')}  file or font failure`,
    ''
  ].join('\n')
}
