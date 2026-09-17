/**
 * `NoteSequence` manipulation.
 *
 * Ported from magenta-js `music/src/core/sequences.ts` (Apache-2.0),
 * https://github.com/magenta/magenta-js
 *
 * This is the subset the player path reaches: `clone`, `isQuantizedSequence`,
 * `unquantizeSequence` and their helpers. Not ported (add from upstream if a
 * caller ever needs them): `quantizeNoteSequence`, `quantizeToStep`,
 * `createQuantizedNoteSequence`, `stepsPerQuarterToStepsPerSecond`,
 * `mergeInstruments`, `replaceInstruments`, `mergeConsecutiveNotes`,
 * `applySustainControlChanges`, `concatenate`, `trim`, `split`, and the
 * absolute-quantization assertions.
 */

import { NoteSequence } from '#msq/lib/@magenta/music/protobuf.js'
import * as constants from '#msq/lib/@magenta/music/core/constants.js'

/**
 * Exception for when a sequence has multiple tempos.
 */
export class MultipleTempoException extends Error {
  constructor(message) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Exception for when a sequence has multiple time signatures.
 */
export class MultipleTimeSignatureException extends Error {
  constructor(message) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Exception for when a sequence has an invalid time signature.
 */
export class BadTimeSignatureException extends Error {
  constructor(message) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Exception for when a sequence has notes or events at negative times.
 */
export class NegativeTimeException extends Error {
  constructor(message) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Exception for when a sequence is quantized when it should not be, or vice
 * versa.
 */
export class QuantizationStatusException extends Error {
  constructor(message) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Deep-copies a `NoteSequence`.
 *
 * Upstream does this with a protobuf `encode`/`decode` round-trip. Since this
 * port carries no wire format (see `protobuf.js`), a structured clone stands in.
 * The one visible difference: protobuf would drop fields whose value equals the
 * field default, and this keeps them.
 */
export function clone(ns) {
  return structuredClone(ns)
}

/**
 * Returns whether or not a NoteSequence proto has been quantized.
 */
export function isQuantizedSequence(ns) {
  return ns.quantizationInfo &&
    (ns.quantizationInfo.stepsPerQuarter > 0 ||
      ns.quantizationInfo.stepsPerSecond > 0)
}

/**
 * Confirms that the given NoteSequence has been quantized.
 */
export function assertIsQuantizedSequence(ns) {
  if (!isQuantizedSequence(ns)) {
    throw new QuantizationStatusException(
      `NoteSequence ${ns.id} is not quantized (missing quantizationInfo)`)
  }
}

/**
 * Returns whether the given NoteSequence has been quantized relative to tempo.
 */
export function isRelativeQuantizedSequence(ns) {
  return ns.quantizationInfo && ns.quantizationInfo.stepsPerQuarter > 0
}

/**
 * Confirms that the given NoteSequence has been quantized relative to tempo.
 */
export function assertIsRelativeQuantizedSequence(ns) {
  if (!isRelativeQuantizedSequence(ns)) {
    throw new QuantizationStatusException(
      `NoteSequence ${ns.id} is not quantized or is quantized based on absolute timing`)
  }
}

/**
 * Confirms that the given `NoteSequence` has a single tempo, throwing if an
 * implicit or explicit tempo change is present.
 */
function assertSingleTempo(ns) {
  if (!ns.tempos || ns.tempos.length === 0) {
    // There is a single (implicit) tempo.
    return
  }
  ns.tempos.sort((a, b) => a.time - b.time)
  // There is an implicit 120.0 qpm tempo at 0 time. So if the first tempo
  // is something other that 120.0 and it's at a time other than 0, that's
  // an implicit tempo change.
  if (ns.tempos[0].time !== 0 &&
    ns.tempos[0].qpm !== constants.DEFAULT_QUARTERS_PER_MINUTE) {
    throw new MultipleTempoException(
      'NoteSequence has an implicit tempo change from initial ' +
      `${constants.DEFAULT_QUARTERS_PER_MINUTE} qpm to ` +
      `${ns.tempos[0].qpm} qpm at ${ns.tempos[0].time} seconds.`)
  }

  for (let i = 1; i < ns.tempos.length; i++) {
    if (ns.tempos[i].qpm !== ns.tempos[0].qpm) {
      throw new MultipleTempoException(
        'NoteSequence has at least one tempo change from ' +
        `${ns.tempos[0].qpm} qpm to ${ns.tempos[i].qpm}` +
        `qpm at ${ns.tempos[i].time} seconds.`)
    }
  }
}

/**
 * Events that have a `time` expressed in quantized steps.
 */
function getQuantizedTimeEvents(ns) {
  return ns.controlChanges.concat(ns.textAnnotations)
}

/**
 * Create an unquantized version of a quantized `NoteSequence`.
 *
 * Any existing times will be replaced in the output `NoteSequence` and
 * quantization info and steps will be removed.
 *
 * @param qns The `NoteSequence` to unquantize.
 * @param qpm The tempo to use. If not provided, the tempo in `qns` is used,
 * or the default of 120 if it is not specified in the sequence either.
 * @returns a new non-quantized `NoteSequence` with time in seconds.
 */
export function unquantizeSequence(qns, qpm) {
  // TODO(adarob): Support absolute quantized times and multiple tempos.
  assertIsRelativeQuantizedSequence(qns)
  assertSingleTempo(qns)

  const ns = clone(qns)

  if (qpm) {
    if (ns.tempos && ns.tempos.length > 0) {
      ns.tempos[0].qpm = qpm
    } else {
      ns.tempos.push(NoteSequence.Tempo.create({ time: 0, qpm }))
    }
  } else {
    qpm = (qns.tempos && qns.tempos.length > 0)
      ? ns.tempos[0].qpm
      : constants.DEFAULT_QUARTERS_PER_MINUTE
  }

  const stepToSeconds = (step) =>
    step / ns.quantizationInfo.stepsPerQuarter * (60 / qpm)
  ns.totalTime = stepToSeconds(ns.totalQuantizedSteps)
  ns.notes.forEach((n) => {
    // Quantize the start and end times of the note.
    n.startTime = stepToSeconds(n.quantizedStartStep)
    n.endTime = stepToSeconds(n.quantizedEndStep)
    // Extend sequence if necessary.
    ns.totalTime = Math.max(ns.totalTime, n.endTime)

    // Delete the quantized step information.
    delete n.quantizedStartStep
    delete n.quantizedEndStep
  })

  // Also quantize control changes and text annotations.
  getQuantizedTimeEvents(ns).forEach((event) => {
    // Quantize the event time, disallowing negative time.
    event.time = stepToSeconds(event.time)
  })
  delete ns.totalQuantizedSteps
  delete ns.quantizationInfo
  return ns
}
