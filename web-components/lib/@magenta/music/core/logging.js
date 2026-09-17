/**
 * Logging with verbosity levels.
 *
 * Ported from magenta-js `music/src/core/logging.ts` (Apache-2.0),
 * https://github.com/magenta/magenta-js
 *
 * Changes: `const enum Level` became a frozen object, and the `compat/global`
 * indirection was dropped since `performance` is a browser global here.
 */

/**
 * The different verbosity levels.
 */
export const Level = Object.freeze({
  NONE: 0,   // No messages will be logged.
  WARN: 5,   // WARN messages will be logged.
  INFO: 10,  // INFO and WARN messages will be logged.
  DEBUG: 20  // DEBUG, INFO, and WARN messages will be logged.
})

/**
 * The global verbosity level for Magenta.js.
 */
export let verbosity = Level.INFO

/**
 * Sets the global verbosity level. Messages below it are ignored.
 *
 * Note: upstream's version assigned the parameter to itself, so it never
 * actually changed the module-level value. Fixed here.
 *
 * @param level The new verbosity level.
 */
export function setVerbosity(level) {
  verbosity = level
}

/**
 * Logs a message at the given verbosity level.
 *
 * If `level` is below the global `verbosity` level, the message is ignored.
 *
 * @param msg The message to log.
 * @param prefix The prefix of the message, should specify the model or library
 * that is doing the logging.
 * @param level The verbosity level of the message. The message will not be
 * logged if this level is greater than the `verbosity` setting.
 */
export function log(msg, prefix = 'Magenta.js', level = Level.INFO) {
  if (level === Level.NONE) {
    throw new Error('Logging level cannot be NONE.')
  }
  if (verbosity >= level) {
    const logMethod = level === Level.WARN ? console.warn : console.log
    logMethod(`%c ${prefix} `, 'background:magenta; color:white', msg)
  }
}

/**
 * Logs a message at the given verbosity level, with the duration.
 *
 * If `level` is below the global `verbosity` level, the message is ignored.
 *
 * @param msg The message to log.
 * @param startTime The start time to use for duration calculation, in ms.
 * @param prefix The prefix of the message, should specify the model or library
 * that is doing the logging.
 * @param level The verbosity level of the message. The message will not be
 * logged if this level is greater than the `verbosity` setting.
 */
export function logWithDuration(msg, startTime, prefix = 'Magenta.js', level = Level.INFO) {
  const durationSeconds = (performance.now() - startTime) / 1000
  log(`${msg} in ${durationSeconds.toPrecision(3)}s`, prefix, level)
}
