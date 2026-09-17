/**
 * Web Audio plumbing that stands in for the parts of Tone.js magenta's player
 * used: `Tone.Transport`, `Tone.Part` and `Tone.Draw`.
 *
 * Upstream magenta schedules notes by handing a `Tone.Part` an array of
 * `[startTime, note]` pairs and letting `Tone.Transport` drive it. Tone is not
 * vendored here, so this module implements the same job directly on
 * `AudioContext`:
 *
 *   - a single shared `AudioContext` (Tone has one too, and it is what makes
 *     `Transport.state` a global "only one player at a time" flag);
 *   - a lookahead scheduler: every `TICK_MS` it schedules every note starting
 *     within `LOOKAHEAD_SECONDS`, which is the standard way to get
 *     sample-accurate Web Audio timing off an inaccurate JS timer;
 *   - a draw queue drained in `requestAnimationFrame`, replacing
 *     `Tone.Draw.schedule`. This matters: the player element's seek bar and its
 *     `note` events hang off that callback, so it has to fire when the note
 *     becomes *audible*, not when it was scheduled ~100 ms earlier.
 *
 * Difference from Tone: a `Tone.Part` could cancel events it had already
 * scheduled. An `AudioBufferSourceNode` that has started cannot be un-started,
 * so seeking and pausing call the part's `cancel()` handler and let the player
 * stop its own live sources. With a 100 ms lookahead the audible effect is at
 * most a clipped ~100 ms tail.
 */

/** How far ahead of the audio clock notes are scheduled, in seconds. */
export const LOOKAHEAD_SECONDS = 0.1

/** How often the scheduler wakes up, in milliseconds. */
export const TICK_MS = 25

let sharedContext = null

/**
 * The shared `AudioContext`, created on first use.
 *
 * Creating it before a user gesture is fine — it simply starts out `suspended`,
 * and `decodeAudioData` works regardless. `resumeContext()` on the player (which
 * runs inside the play-button click handler) is what actually starts it.
 */
export function getAudioContext() {
  if (sharedContext === null) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    sharedContext = new AudioContextClass()
  }
  return sharedContext
}

/**
 * Converts a MIDI pitch to a frequency in Hz.
 *
 * Replaces `Tone.Frequency(pitch, 'midi').toFrequency()`.
 */
export function midiToFrequency(pitch) {
  return 440 * Math.pow(2, (pitch - 69) / 12)
}

/**
 * Index of the first note whose `startTime` is at or after `seconds`.
 */
function firstNoteAtOrAfter(notes, seconds) {
  let low = 0
  let high = notes.length
  while (low < high) {
    const mid = (low + high) >> 1
    if (notes[mid].startTime < seconds) {
      low = mid + 1
    } else {
      high = mid
    }
  }
  return low
}

/**
 * A note list scheduled on the transport, standing in for `Tone.Part`.
 *
 * `handlers` carries the player's side of the contract:
 *   - `playNote(audioContextTime, note)` — make sound at that context time
 *   - `drawNote(note)` — the note just became audible (UI callback)
 *   - `cancel()` — drop any sound already scheduled but not yet finished
 *   - `end()` — the sequence reached `totalTime`
 */
class ScheduledPart {
  #resolve = null

  constructor(notes, totalTime, handlers) {
    this.notes = notes
    this.totalTime = totalTime
    this.handlers = handlers
    this.cursor = 0
    this.ended = false
    this.promise = new Promise((resolve) => {
      this.#resolve = resolve
    })
  }

  /** Moves the scheduling cursor to `seconds`. */
  seek(seconds) {
    this.cursor = firstNoteAtOrAfter(this.notes, seconds)
  }

  /** Resolves this part's `promise`. Safe to call more than once. */
  finish() {
    this.#resolve()
  }
}

/**
 * A clock and note scheduler, standing in for `Tone.Transport`.
 *
 * Like Tone's, this is a module-level singleton (see `transport` below), which
 * is what lets `BasePlayer.start()` refuse to start while another player holds
 * the transport.
 */
class Transport {
  #state = 'stopped'
  #offsetSeconds = 0
  #startContextTime = 0
  #rate = 1
  #part = null
  #tickTimer = null
  #drawQueue = []
  #drawFrame = null

  /** `'stopped'`, `'started'` or `'paused'`. */
  get state() {
    return this.#state
  }

  /**
   * Playback rate multiplier. `BasePlayer.setTempo` maps a target qpm onto this;
   * note times are already absolute seconds by the time they reach the
   * transport, so tempo can only act as a scale factor.
   */
  get rate() {
    return this.#rate
  }

  set rate(value) {
    if (!(value > 0)) {
      return
    }
    // Re-anchor first so the position stays continuous across the change.
    const position = this.seconds
    this.#rate = value
    this.#offsetSeconds = position
    this.#startContextTime = getAudioContext().currentTime
  }

  /** Current playback position in seconds. */
  get seconds() {
    if (this.#state === 'started') {
      const elapsed = getAudioContext().currentTime - this.#startContextTime
      return this.#offsetSeconds + elapsed * this.#rate
    }
    return this.#offsetSeconds
  }

  /** Seeks. Already-scheduled sound is cancelled and the cursor re-positioned. */
  set seconds(value) {
    this.#offsetSeconds = value
    this.#startContextTime = getAudioContext().currentTime
    this.#drawQueue.length = 0
    if (this.#part) {
      this.#part.handlers.cancel()
      this.#part.seek(value)
    }
  }

  /**
   * Schedules a note list, replacing whatever was scheduled before.
   *
   * @param notes Notes with absolute `startTime`/`endTime` in seconds. Sorted
   * here, so callers need not pre-sort.
   * @param totalTime Length of the sequence in seconds.
   * @param offset Position to start from.
   * @param handlers See `ScheduledPart`.
   * @returns the `ScheduledPart`, whose `promise` resolves when playback ends.
   */
  schedule(notes, totalTime, offset, handlers) {
    const sorted = notes.slice().sort((a, b) => a.startTime - b.startTime)
    const part = new ScheduledPart(sorted, totalTime, handlers)
    part.seek(offset)
    this.#part = part
    this.#offsetSeconds = offset
    this.#drawQueue.length = 0
    return part
  }

  /** Starts, or resumes after `pause()`. */
  start() {
    if (this.#state === 'started') {
      return
    }
    this.#startContextTime = getAudioContext().currentTime
    this.#state = 'started'
    if (this.#tickTimer === null) {
      this.#tickTimer = setInterval(() => this.#tick(), TICK_MS)
    }
    this.#tick()
    this.#startDrawLoop()
  }

  /** Pauses in place. `start()` resumes. */
  pause() {
    if (this.#state !== 'started') {
      return
    }
    const position = this.seconds
    this.#state = 'paused'
    this.#offsetSeconds = position
    this.#stopTicking()
    this.#drawQueue.length = 0
    if (this.#part) {
      this.#part.handlers.cancel()
      // Rewind the cursor to the clock so resuming re-schedules whatever was
      // inside the lookahead window and just got cancelled.
      this.#part.seek(position)
    }
  }

  /** Stops and rewinds, dropping the scheduled part. */
  stop() {
    const part = this.#part
    this.#state = 'stopped'
    this.#offsetSeconds = 0
    this.#part = null
    this.#stopTicking()
    this.#drawQueue.length = 0
    if (part) {
      part.handlers.cancel()
      part.finish()
    }
  }

  #stopTicking() {
    if (this.#tickTimer !== null) {
      clearInterval(this.#tickTimer)
      this.#tickTimer = null
    }
  }

  #contextTimeFor(seconds) {
    return this.#startContextTime + (seconds - this.#offsetSeconds) / this.#rate
  }

  #tick() {
    const part = this.#part
    if (!part || this.#state !== 'started') {
      return
    }

    const context = getAudioContext()
    const position = this.seconds
    const horizon = position + LOOKAHEAD_SECONDS

    while (part.cursor < part.notes.length &&
      part.notes[part.cursor].startTime < horizon) {
      const note = part.notes[part.cursor]
      part.cursor += 1
      // A seek can land in the middle of a note; clamp so it still sounds
      // rather than being scheduled in the past and dropped.
      const audioTime = Math.max(context.currentTime, this.#contextTimeFor(note.startTime))
      part.handlers.playNote(audioTime, note)
      this.#drawQueue.push({ audioTime, note })
    }

    if (!part.ended && position >= part.totalTime) {
      part.ended = true
      part.handlers.end()
    }
  }

  #startDrawLoop() {
    if (this.#drawFrame !== null) {
      return
    }
    const step = () => {
      this.#drawFrame = null
      const part = this.#part
      const now = getAudioContext().currentTime
      while (this.#drawQueue.length > 0 && this.#drawQueue[0].audioTime <= now) {
        const { note } = this.#drawQueue.shift()
        if (part) {
          part.handlers.drawNote(note)
        }
      }
      if (this.#state === 'started' || this.#drawQueue.length > 0) {
        this.#drawFrame = requestAnimationFrame(step)
      }
    }
    this.#drawFrame = requestAnimationFrame(step)
  }
}

/**
 * The shared transport. One player holds it at a time, mirroring `Tone.Transport`.
 */
export const transport = new Transport()
