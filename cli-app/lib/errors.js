/**
 * Every failure the CLI can exit on, each carrying the exit code it should
 * produce. `msq.js` catches these in one place and maps them to the process
 * exit code, so no call site has to remember the numbers.
 *
 * Aborting throws rather than returning a sentinel: a sentinel would have to be
 * checked after every single prompt, and one forgotten check would let
 * `undefined` flow into the pipeline and surface much later as a nonsense error.
 */

export const EXIT_OK = 0
export const EXIT_PARSE_ERRORS = 1
export const EXIT_USAGE = 2
export const EXIT_IO = 3
export const EXIT_ABORTED = 130

/** The user pressed Ctrl-C at a prompt. */
export class PromptAbortError extends Error {
  constructor(message = 'Aborted.') {
    super(message)
    this.name = 'PromptAbortError'
    this.code = 'ERR_PROMPT_ABORTED'
    this.exitCode = EXIT_ABORTED
  }
}

/**
 * A prompt was needed but the terminal cannot support one. `flag` names the
 * command-line option that answers the same question, so the message tells the
 * user what to do instead of just refusing.
 */
export class NotInteractiveError extends Error {
  constructor(reason, flag) {
    super(flag ? `${reason} — pass ${flag} instead` : reason)
    this.name = 'NotInteractiveError'
    this.code = 'ERR_NOT_INTERACTIVE'
    this.exitCode = EXIT_USAGE
  }
}

/** Bad or contradictory command-line arguments. */
export class UsageError extends Error {
  constructor(message) {
    super(message)
    this.name = 'UsageError'
    this.code = 'ERR_USAGE'
    this.exitCode = EXIT_USAGE
  }
}

/** Reading input, writing output, or loading fonts failed. */
export class InputOutputError extends Error {
  constructor(message, cause) {
    super(message, { cause })
    this.name = 'InputOutputError'
    this.code = 'ERR_IO'
    this.exitCode = EXIT_IO
  }
}

export function isAbort(error) {
  return error != null && error.code === 'ERR_PROMPT_ABORTED'
}

/** Exit code for any error, defaulting to a generic failure. */
export function exitCodeFor(error) {
  return typeof error?.exitCode === 'number' ? error.exitCode : 1
}
