/**
 * ANSI styling, disabled automatically when the output cannot show it.
 *
 * Node's own `stream.hasColors()` covers most of the detection, but two gaps
 * need closing by hand: it does not treat an empty `NO_COLOR=` as disabling
 * (the convention is that *presence* is enough), and it does not exist at all
 * on a non-TTY stdout.
 */
import { stripVTControlCharacters } from 'node:util'

/** @returns {0|1|2|3} 0 = none, 1 = 16 colours, 2 = 256, 3 = truecolour */
export function detectLevel(stream = process.stdout, env = process.env) {
  // An explicit FORCE_COLOR wins over everything, including NO_COLOR.
  if ('FORCE_COLOR' in env) {
    const value = env.FORCE_COLOR
    if (value === '0' || value === 'false') {
      return 0
    }
    if (value === '2') {
      return 2
    }
    if (value === '3') {
      return 3
    }
    return 1
  }
  if ('NO_COLOR' in env) {
    return 0
  }
  if (env.TERM === 'dumb' || env.TERM === 'unknown') {
    return 0
  }
  if (!stream || !stream.isTTY) {
    return 0
  }
  // Only tty.WriteStream has these.
  if (typeof stream.hasColors === 'function') {
    if (stream.hasColors(2 ** 24)) {
      return 3
    }
    if (stream.hasColors(256)) {
      return 2
    }
    return stream.hasColors(16) ? 1 : 0
  }
  return 1
}

export const level = detectLevel()
export const enabled = level > 0

export const stripAnsi = stripVTControlCharacters

/**
 * Closers are attribute-specific (39 for colour, 22 for weight) rather than a
 * blanket 0m, so nested styles restore the outer style instead of wiping it.
 */
function sgr(open, close) {
  const openSequence = `\x1b[${open}m`
  const closeSequence = `\x1b[${close}m`
  return (value) => {
    if (!enabled) {
      return String(value)
    }
    const text = String(value)
    const reopened = text.includes(closeSequence)
      ? text.replaceAll(closeSequence, closeSequence + openSequence)
      : text
    return openSequence + reopened + closeSequence
  }
}

export const bold = sgr(1, 22)
export const dim = sgr(2, 22)
export const italic = sgr(3, 23)
export const underline = sgr(4, 24)
export const inverse = sgr(7, 27)

export const red = sgr(31, 39)
export const green = sgr(32, 39)
export const yellow = sgr(33, 39)
export const blue = sgr(34, 39)
export const magenta = sgr(35, 39)
export const cyan = sgr(36, 39)
export const gray = sgr(90, 39)

/* Semantic wrappers, so the widgets never name a raw colour. */
export const heading = (text) => bold(text)
export const accent = (text) => cyan(text)
export const muted = (text) => gray(text)
export const success = (text) => green(text)
export const warning = (text) => yellow(text)
export const failure = (text) => red(text)
