/**
 * Normalized keypresses, built on `readline.emitKeypressEvents`.
 *
 * That function is part of the standard library, so relying on it keeps this
 * dependency-free while getting decoding no hand-rolled parser would match: the
 * six terminal dialects for Home/End, SS3 versus CSI arrows, modifier parsing,
 * UTF-8 characters split across chunks, and the ambiguity between a lone Escape
 * and the start of an escape sequence (resolved with its own timer).
 */
import readline from 'node:readline'

/*
 * How long to wait before deciding a trailing ESC byte was a lone Escape key
 * rather than the start of a sequence. No widget here binds Escape, so this is
 * shortened purely to cap the worst-case delay before the process can exit.
 */
const ESCAPE_CODE_TIMEOUT = 250

/**
 * Readline reports an unrecognized sequence with the *string* 'undefined' as
 * the name, so that value has to be filtered out rather than trusted.
 */
function keyName(key) {
  return typeof key.name === 'string' && key.name !== 'undefined' ? key.name : undefined
}

/**
 * True only for a character the user actually typed. `key.code` being set means
 * readline recognized an escape sequence, whose trailing bytes can otherwise
 * look like printable text.
 */
function printableChar(str, key) {
  if (!str || key.ctrl || key.meta || key.code !== undefined) {
    return undefined
  }
  const codePoint = str.codePointAt(0)
  if (codePoint < 0x20 || codePoint === 0x7f) {
    return undefined
  }
  return str
}

/**
 * @typedef {Object} Key
 * @property {string|undefined} name   'up', 'return', 'tab', 'backspace', 'paste-start', …
 * @property {boolean} ctrl
 * @property {boolean} meta
 * @property {boolean} shift
 * @property {string} seq             raw sequence, used to reassemble pasted text
 * @property {string|undefined} char  set only when a printable character was typed
 */

/**
 * Subscribe to keypresses on `input`.
 *
 * All subscriptions go through here so that exactly one listener exists at a
 * time; a listener left behind by a finished prompt would otherwise silently
 * receive the next prompt's keys.
 *
 * @param {import('node:stream').Readable} input
 * @param {(key: Key) => void} handler
 * @returns {() => void} unsubscribe
 */
export function onKey(input, handler) {
  readline.emitKeypressEvents(input, { escapeCodeTimeout: ESCAPE_CODE_TIMEOUT })
  const listener = (str, key = {}) => {
    handler({
      name: keyName(key),
      ctrl: !!key.ctrl,
      meta: !!key.meta,
      shift: !!key.shift,
      seq: key.sequence ?? str ?? '',
      char: printableChar(str, key)
    })
  }
  input.on('keypress', listener)
  return () => input.off('keypress', listener)
}

/* Predicates, so widgets never compare key names inline. */

export const isSubmit = (key) => key.name === 'return' || key.name === 'enter'
export const isAbortKey = (key) => key.ctrl && key.name === 'c'
export const isTab = (key) => key.name === 'tab' && !key.shift
export const isBackspace = (key) => key.name === 'backspace'
export const isDelete = (key) => key.name === 'delete'
export const isPasteStart = (key) => key.name === 'paste-start'
export const isPasteEnd = (key) => key.name === 'paste-end'

export const isUp = (key) => key.name === 'up' || (key.name === 'k' && !key.ctrl && !key.meta)
export const isDown = (key) => key.name === 'down' || (key.name === 'j' && !key.ctrl && !key.meta)
export const isLeft = (key) => key.name === 'left'
export const isRight = (key) => key.name === 'right'

export const isLineStart = (key) => key.name === 'home' || (key.ctrl && key.name === 'a')
export const isLineEnd = (key) => key.name === 'end' || (key.ctrl && key.name === 'e')
export const isKillToStart = (key) => key.ctrl && key.name === 'u'
export const isKillToEnd = (key) => key.ctrl && key.name === 'k'
export const isKillWord = (key) => key.ctrl && key.name === 'w'
