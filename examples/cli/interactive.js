/**
 * The question flow.
 *
 * Five questions, each with one answer, each read as a plain `await`. Cancelling
 * throws, so the flow never has to check for a sentinel between steps.
 */
import path from 'node:path'
import { stat } from 'node:fs/promises'
import { select } from './lib/select.js'
import { textInput } from './lib/text-input.js'
import { pasteBlock } from './lib/paste.js'
import { requireInteractive } from './lib/session.js'
import { resolveTypedPath } from './lib/path-complete.js'
import { muted, heading } from './lib/colors.js'
import { sourceFromPath, sourceFromText, DEFAULT_PAGE_DELIMITER } from './input.js'
import { loadFontConfig } from './fonts.js'

/**
 * @returns {Promise<Object>} arguments for `generate()`
 */
export async function askForPlan() {
  requireInteractive()

  process.stdout.write(
    '\n' + heading('MuSemantiQ') +
    muted(' — music written as text, engraved and performed') + '\n\n'
  )

  const formats = await select({
    message: 'What do you want to generate?',
    choices: [
      { label: 'SVG', value: { svg: true, midi: false }, hint: 'an engraved score' },
      { label: 'MIDI', value: { svg: false, midi: true }, hint: 'a performance to listen to' },
      { label: 'SVG and MIDI', value: { svg: true, midi: true }, hint: 'both' }
    ],
    initialIndex: 2
  })

  const inputKind = await select({
    message: 'Where is the input text?',
    choices: [
      { label: 'In a file or folder', value: 'path', hint: 'a folder holds one file per page' },
      { label: 'I will paste it here', value: 'paste' }
    ]
  })

  const source = inputKind === 'path'
    ? await askForInputPath()
    : sourceFromText(await pasteBlock({ message: 'Paste your MuSemantiQ text (press ^D on new line to finish)' }))

  /*
   * Fonts are only asked about when something will be engraved; a performance
   * never consults them.
   */
  let fontConfig
  let fontLabel = 'built-in'
  if (formats.svg) {
    const fontsPath = await askForFontConfig()
    if (fontsPath) {
      fontConfig = await loadFontConfig(fontsPath)
      fontLabel = path.relative(process.cwd(), fontsPath) || fontsPath
    }
  }

  const outPath = await textInput({
    message: 'Where should the output go?',
    /*
     * Left empty rather than prefilled: a prefilled value sits before the
     * cursor, so typing a path would append to it instead of replacing it.
     */
    hint: 'a folder — Tab completes, Enter alone uses the current folder',
    completePaths: true
  })

  return {
    pages: source.pages,
    name: source.name,
    pageNames: source.pageNames,
    formats: {
      svg: formats.svg,
      midi: formats.midi,
      pageSchema: false,
      highlights: false
    },
    fontConfig,
    fontLabel,
    outPath: resolveTypedPath(outPath) || '.',
    pageDelimiter: DEFAULT_PAGE_DELIMITER,
    inputLabel: inputKind === 'path' ? source.label : 'pasted text'
  }
}

async function askForInputPath() {
  const answer = await textInput({
    message: 'Path to the file or folder',
    hint: 'Tab completes',
    completePaths: true,
    validate: async (value) => {
      if (value.trim() === '') {
        return 'a path is needed'
      }
      try {
        await stat(resolveTypedPath(value))
        return undefined
      } catch {
        return 'no such file or folder'
      }
    }
  })

  const resolved = resolveTypedPath(answer)
  const source = await sourceFromPath(resolved)
  return { ...source, label: path.relative(process.cwd(), resolved) || resolved }
}

async function askForFontConfig() {
  const answer = await textInput({
    message: 'Font config (press Enter to use default config)',
    hint: 'path to a JSON file, or Enter to use the built-in fonts',
    completePaths: true,
    validate: async (value) => {
      if (value.trim() === '') {
        return undefined
      }
      try {
        await stat(resolveTypedPath(value))
        return undefined
      } catch {
        return 'no such file'
      }
    }
  })

  return answer.trim() === '' ? null : resolveTypedPath(answer)
}
