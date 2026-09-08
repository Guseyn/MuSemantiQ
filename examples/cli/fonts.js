/**
 * Font configuration for the CLI.
 *
 * `setupFonts()` has its own defaults, but they are relative paths resolved
 * against the current working directory, so they only work when the process
 * happens to be started from the repository root. The CLI can be run from
 * anywhere, so it always passes an explicit config built from absolute paths.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { setupFonts } from '#msq/api.js'
import { InputOutputError } from './lib/errors.js'

/* examples/cli -> repository root */
const REPO_ROOT = path.resolve(import.meta.dirname, '..', '..')
const FONT_DIR = path.join(REPO_ROOT, 'src', 'drawer', 'font')

const fontPath = (...parts) => path.join(FONT_DIR, ...parts)

/**
 * The built-in configuration, mirroring `setupFonts()`'s defaults but with
 * absolute paths.
 *
 * Insertion order matters: when a source names no music font, the engine picks
 * whichever was registered first, so `bravura` stays first.
 *
 * The `js` values keep their package-relative specifier. They are imported from
 * inside `src/api.js`, so they resolve through the package's own import map and
 * are already independent of the working directory.
 */
export function defaultFontConfig() {
  return {
    'chord-letters': {
      'gentium plus': fontPath('chord-letters', 'GentiumPlus-Regular.ttf'),
      'gothic a1': fontPath('chord-letters', 'GothicA1-Regular.ttf')
    },
    'text': {
      'noto-serif': {
        'regular': fontPath('text', 'NotoSerif-Regular.ttf'),
        'bold': fontPath('text', 'NotoSerif-Bold.ttf')
      },
      'noto-sans': {
        'regular': fontPath('text', 'NotoSans-Regular.ttf'),
        'bold': fontPath('text', 'NotoSans-Bold.ttf')
      }
    },
    'music': {
      'bravura': {
        'font': fontPath('music', 'Bravura.otf'),
        'js': '#msq/drawer/font/music-js/bravura.js'
      },
      'leland': {
        'font': fontPath('music', 'Leland.otf'),
        'js': '#msq/drawer/font/music-js/leland.js'
      }
    }
  }
}

/**
 * Read a user-supplied font config.
 *
 * Relative paths inside it are resolved against the config file's own
 * directory, which is what someone writing the file expects; an absolute path
 * is left alone.
 */
export async function loadFontConfig(configPath) {
  let text
  try {
    text = await readFile(configPath, 'utf8')
  } catch (error) {
    throw new InputOutputError(`cannot read font config "${configPath}": ${error.message}`, error)
  }

  let config
  try {
    config = JSON.parse(text)
  } catch (error) {
    throw new InputOutputError(`font config "${configPath}" is not valid JSON: ${error.message}`, error)
  }

  return resolveConfigPaths(config, path.dirname(path.resolve(configPath)))
}

/** Package-internal specifiers must survive untouched. */
const isSpecifier = (value) => value.startsWith('#') || value.startsWith('file:') || /^https?:/.test(value)

function resolveRelative(value, baseDir) {
  if (typeof value !== 'string' || isSpecifier(value) || path.isAbsolute(value)) {
    return value
  }
  return path.resolve(baseDir, value)
}

function resolveConfigPaths(config, baseDir) {
  const resolved = {}
  if (config['chord-letters']) {
    resolved['chord-letters'] = {}
    for (const [ name, value ] of Object.entries(config['chord-letters'])) {
      resolved['chord-letters'][name] = resolveRelative(value, baseDir)
    }
  }
  if (config['text']) {
    resolved['text'] = {}
    for (const [ name, entry ] of Object.entries(config['text'])) {
      resolved['text'][name] = {
        regular: resolveRelative(entry?.regular, baseDir),
        bold: resolveRelative(entry?.bold, baseDir)
      }
    }
  }
  if (config['music']) {
    resolved['music'] = {}
    for (const [ name, entry ] of Object.entries(config['music'])) {
      resolved['music'][name] = {
        font: resolveRelative(entry?.font, baseDir),
        js: resolveRelative(entry?.js, baseDir)
      }
    }
  }
  return resolved
}

/**
 * Font *names* the parser should accept, taken from a config without loading a
 * single byte of font data. Used when only MIDI is being generated, where the
 * glyphs are never needed.
 */
export function fontNamesFromConfig(config) {
  const names = {
    'chord-letters': Object.keys(config['chord-letters'] || {}),
    'music': Object.keys(config['music'] || {}),
    'text': Object.keys(config['text'] || {})
  }
  return names
}

/**
 * Names taken from *loaded* font sources — the idiom used by the test scripts
 * and by the browser worker.
 */
export function fontNamesFromSources(sources) {
  return {
    'chord-letters': Object.keys(sources['chord-letters']),
    'music': Object.keys(sources['music']),
    'text': [ ...new Set([
      ...Object.keys(sources['text']['regular']),
      ...Object.keys(sources['text']['bold'])
    ]) ]
  }
}

/**
 * Load the fonts. A user config replaces a whole category rather than merging
 * into it, which is how `setupFonts()` behaves; supplying only `music` keeps
 * the default text and chord-letter fonts.
 */
export async function loadFontSources(userConfig) {
  const config = { ...defaultFontConfig(), ...(userConfig || {}) }
  try {
    return await setupFonts(config)
  } catch (error) {
    throw new InputOutputError(`could not load fonts: ${error.message}`, error)
  }
}
