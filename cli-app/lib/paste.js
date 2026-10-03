/**
 * Multi-line text captured verbatim, ending at end-of-input (Ctrl-D).
 *
 * Deliberately *not* in raw mode. Left cooked, the terminal driver echoes,
 * wraps and scrolls the text for free, Ctrl-D is its own end-of-file character,
 * and Ctrl-C is a real signal. Above all the bytes arrive unmodified, whereas
 * reassembling them from keypress events would mean reimplementing the line
 * discipline — and the input here is a whitespace-sensitive language where
 * blank lines and leading spaces matter.
 */
import { openSync, createReadStream } from 'node:fs'
import { restore, disableBracketedPaste } from './session.js'
import { muted, heading } from './colors.js'

/* Markers a terminal left in bracketed-paste mode would wrap the text in. */
const PASTE_MARKERS = /\x1b\[20[01]~/g

/**
 * @param {Object} options
 * @param {string} options.message
 * @returns {Promise<string>} the text exactly as pasted
 */
export async function pasteBlock({
  message,
  input = process.stdin,
  output = process.stdout
} = {}) {
  // A previous prompt may still hold raw mode, which would break echoing.
  restore()

  const interactive = !!input.isTTY

  let source = input
  let close = () => {}

  if (interactive) {
    /*
     * Read a fresh descriptor on the terminal rather than process.stdin.
     * Reading stdin to end-of-file would close it permanently, and any prompt
     * after this one would then get no input at all.
     */
    const device = process.platform === 'win32' ? 'CONIN$' : '/dev/tty'
    const fd = openSync(device, 'r')
    source = createReadStream(null, { fd, autoClose: true })
    close = () => source.destroy()
  }

  if (interactive && output.isTTY) {
    disableBracketedPaste(output)
    output.write(`${heading(message)}\n`)
    const finish = process.platform === 'win32' ? 'Ctrl-Z then Enter' : 'Ctrl-D'
    output.write(muted(`  Paste or type your text, then press ${finish} on an empty line.\n\n`))
  }

  const chunks = []
  try {
    for await (const chunk of source) {
      chunks.push(chunk)
    }
  } finally {
    close()
  }

  // Decode once, after joining: a multi-byte character can straddle a chunk
  // boundary, and decoding per chunk would corrupt it.
  return Buffer.concat(chunks).toString('utf8').replace(PASTE_MARKERS, '')
}
