/**
 * Exclusive ownership of the terminal for the duration of one prompt.
 *
 * Everything that has to be undone lives here, because the ways out of a prompt
 * are many (normal return, Ctrl-C, a thrown error, SIGTERM) and a terminal left
 * in raw mode with a hidden cursor is a broken shell for the user.
 */
import readline from 'node:readline'
import { NotInteractiveError } from './errors.js'

const HIDE_CURSOR = '\x1b[?25l'
const SHOW_CURSOR = '\x1b[?25h'
const BRACKETED_PASTE_ON = '\x1b[?2004h'
const BRACKETED_PASTE_OFF = '\x1b[?2004l'

/*
 * Caret shape, via DECSCUSR — the space before the `q` is part of the sequence.
 * A blinking bar shows where typing will land, and letting the terminal do the
 * blinking costs nothing: no timer, no repainting. `0` hands the caret back to
 * whatever the user configured. Terminals that do not understand these ignore
 * them silently.
 */
const CARET_BLINKING_BAR = '\x1b[5 q'
const CARET_TERMINAL_DEFAULT = '\x1b[0 q'

/* Signals whose default action kills the process without running 'exit'. */
const SIGNAL_EXIT_CODES = {
  SIGINT: 130,
  SIGTERM: 143,
  SIGHUP: 129,
  SIGQUIT: 131
}

let activeSession = null
let netInstalled = false

/**
 * Throws unless a full-screen prompt can actually work here. Checked for stdout
 * as well as stdin: repainting in place is meaningless when output is a pipe.
 */
export function requireInteractive(input = process.stdin, output = process.stdout, flag) {
  if (!input.isTTY || typeof input.setRawMode !== 'function') {
    throw new NotInteractiveError('stdin is not a terminal', flag)
  }
  if (!output.isTTY) {
    throw new NotInteractiveError('stdout is not a terminal', flag)
  }
  if (process.env.TERM === 'dumb') {
    throw new NotInteractiveError('TERM=dumb cannot render prompts', flag)
  }
}

/**
 * Take the terminal. Only one session may be active at a time — a second
 * acquire throws, which surfaces the "two prompts racing because an await was
 * forgotten" bug immediately instead of as scrambled input.
 */
export function acquire({ input = process.stdin, output = process.stdout, raw = true, hideCursor = true, blinkingCaret = false, bracketedPaste = true, flag } = {}) {
  if (activeSession) {
    throw new Error('a prompt is already active on this terminal')
  }
  requireInteractive(input, output, flag)
  installProcessNet()

  const session = {
    input,
    output,
    raw: false,
    bracketedPaste: false,
    caretStyled: false,
    offResize: null
  }
  activeSession = session

  if (raw) {
    input.setRawMode(true)
    session.raw = true
    /*
     * A previous prompt's teardown unrefs stdin so the process can exit once
     * questioning is over. Resuming does not undo that, so without this an
     * event loop with nothing else pending would end the process mid-flow —
     * the second question would never resolve.
     */
    if (typeof input.ref === 'function') {
      input.ref()
    }
    input.resume()
  }

  let prologue = ''
  if (hideCursor) {
    prologue += HIDE_CURSOR
  }
  if (blinkingCaret) {
    prologue += CARET_BLINKING_BAR
    session.caretStyled = true
  }
  if (bracketedPaste && session.raw) {
    // Without this a multi-line paste arrives as a burst of Return keys, which
    // would submit this prompt and auto-answer the ones after it.
    prologue += BRACKETED_PASTE_ON
    session.bracketedPaste = true
  }
  if (prologue) {
    output.write(prologue)
  }

  session.onResize = (handler) => {
    const listener = () => handler()
    output.on('resize', listener)
    session.offResize = () => output.off('resize', listener)
  }

  return session
}

/**
 * Undo everything `acquire` did. Idempotent, and safe to call from an 'exit'
 * handler because writes to a TTY are synchronous on POSIX.
 */
export function restore() {
  const session = activeSession
  if (!session) {
    return
  }
  activeSession = null

  try {
    /*
     * Unconditional: a widget that keeps the caret visible still hides it while
     * repainting, so the process dying mid-frame must not leave it hidden.
     */
    let epilogue = SHOW_CURSOR
    if (session.caretStyled) {
      epilogue += CARET_TERMINAL_DEFAULT
    }
    if (session.bracketedPaste) {
      epilogue += BRACKETED_PASTE_OFF
    }
    if (epilogue) {
      session.output.write(epilogue)
    }
  } catch {
    // A closed stdout must not mask the original error.
  }

  try {
    if (session.offResize) {
      session.offResize()
    }
  } catch {}

  try {
    session.input.removeAllListeners('keypress')
    if (session.input.isTTY && session.input.isRaw) {
      session.input.setRawMode(false)
    }
    // This is what actually lets the process exit: readline's internal 'data'
    // listener only detaches on the next chunk, which may never arrive.
    session.input.pause()
    session.input.unref()
  } catch {}
}

/** Turn bracketed paste off without owning a session (used by the paste widget). */
export function disableBracketedPaste(output = process.stdout) {
  if (output.isTTY) {
    output.write(BRACKETED_PASTE_OFF)
  }
}

/**
 * Installed once per process, not per prompt — one listener per prompt would
 * trip the max-listeners warning in a multi-question flow.
 *
 * 'exit' covers normal completion, an uncaught exception and an unhandled
 * rejection. The signals are listed separately because their default action
 * bypasses 'exit' entirely.
 */
function installProcessNet() {
  if (netInstalled) {
    return
  }
  netInstalled = true
  process.once('exit', restore)
  for (const [ signal, code ] of Object.entries(SIGNAL_EXIT_CODES)) {
    process.on(signal, () => {
      restore()
      process.exit(code)
    })
  }
}
