/**
 * Loading and playing SoundFont instrument samples.
 *
 * Ported from magenta-js `music/src/core/soundfont.ts` (Apache-2.0),
 * https://github.com/magenta/magenta-js
 *
 * The SoundFont layout, the `instrument.json` / `soundfont.json` fetching, the
 * `p{pitch}_v{velocity}.mp3` naming, `nearestVelocity`, and the
 * sustain-plus-release two-source split in `playNote` are all unchanged. What
 * was rewritten is the Tone.js buffer plumbing, which maps one-to-one onto Web
 * Audio:
 *
 *   Tone.ToneAudioBuffers  ->  SampleBuffers (Map + decodeAudioData)
 *   Tone.loaded()          ->  SampleBuffers#loaded()
 *   Tone.ToneBufferSource  ->  BufferSource (AudioBufferSourceNode + GainNode)
 *   Tone.now()             ->  audioContext.currentTime
 *
 * Added on top of upstream: every playing source is tracked so the transport can
 * cancel it on seek, pause or stop (see `stopAllSources`). Tone.Part used to
 * handle that by cancelling its own scheduled events.
 */

import { getAudioContext } from '#msq/lib/@magenta/music/core/audio.js'

import * as constants from '#msq/lib/@magenta/music/core/constants.js'
import * as logging from '#msq/lib/@magenta/music/core/logging.js'

/**
 * A sample playing through its own gain node, with fade-in/fade-out support.
 *
 * Stands in for `Tone.ToneBufferSource`, matching the slice of its API magenta
 * uses: `start(time, offset, duration, gain)` and `stop(time, fadeTime)`.
 */
class BufferSource {
  #context
  #source
  #gain
  #fadeIn
  #fadeOut
  #stopped = false

  constructor(buffer, { fadeIn = 0, fadeOut = 0 } = {}) {
    this.#context = getAudioContext()
    this.#fadeIn = fadeIn
    this.#fadeOut = fadeOut
    this.#source = this.#context.createBufferSource()
    this.#source.buffer = buffer
    this.#gain = this.#context.createGain()
    this.#source.connect(this.#gain)
  }

  /** Connects to an output `AudioNode` and returns itself, as Tone's does. */
  connect(output) {
    this.#gain.connect(output)
    return this
  }

  /**
   * @param time Context time to start at. `0` means "now".
   * @param offset Offset into the sample, in seconds.
   * @param duration Optional length to play, in seconds.
   * @param gain Target gain.
   */
  start(time = 0, offset = 0, duration = undefined, gain = 1) {
    const when = time === 0 ? this.#context.currentTime : time
    if (this.#fadeIn > 0) {
      this.#gain.gain.setValueAtTime(0, when)
      this.#gain.gain.linearRampToValueAtTime(gain, when + this.#fadeIn)
    } else {
      this.#gain.gain.setValueAtTime(gain, when)
    }
    if (duration === undefined) {
      this.#source.start(when, offset)
    } else {
      this.#source.start(when, offset, duration)
    }
    return this
  }

  /**
   * Fades out starting at `time` over `fadeTime`, then stops.
   *
   * @param time Context time at which the fade begins. `0` means "now".
   * @param fadeTime Fade length; defaults to this source's `fadeOut`.
   */
  stop(time = 0, fadeTime = this.#fadeOut) {
    if (this.#stopped) {
      return
    }
    this.#stopped = true
    const when = Math.max(time === 0 ? this.#context.currentTime : time, this.#context.currentTime)
    this.#gain.gain.cancelScheduledValues(when)
    if (fadeTime > 0) {
      this.#gain.gain.setValueAtTime(this.#gain.gain.value, when)
      this.#gain.gain.linearRampToValueAtTime(0, when + fadeTime)
    }
    try {
      this.#source.stop(when + fadeTime)
    } catch (error) {
      // Already stopped, or never started; nothing to do.
    }
  }

  /** Registers `listener` to run once the underlying node finishes. */
  onEnded(listener) {
    this.#source.addEventListener('ended', listener, { once: true })
  }
}

/**
 * Decoded samples, keyed by sample name.
 *
 * Stands in for `Tone.ToneAudioBuffers` plus the global `Tone.loaded()`. Scoping
 * `loaded()` per instrument rather than globally is slightly more precise and
 * behaves the same here, since `loadSamples` awaits it right after adding.
 */
class SampleBuffers {
  #buffers = new Map()
  #pending = new Map()

  /** True once `add` has been called for `name`, loaded or still in flight. */
  has(name) {
    return this.#buffers.has(name) || this.#pending.has(name)
  }

  /** True once the sample is decoded and playable. */
  isLoaded(name) {
    return this.#buffers.has(name)
  }

  /**
   * Starts loading and decoding a sample.
   *
   * A single failed sample resolves rather than rejects, so one missing `.mp3`
   * cannot fail the whole batch; `get` then reports it as missing and the note
   * is skipped.
   */
  add(name, url) {
    if (this.has(name)) {
      return
    }
    const promise = fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`)
        }
        return response.arrayBuffer()
      })
      .then((data) => getAudioContext().decodeAudioData(data))
      .then((buffer) => {
        this.#buffers.set(name, buffer)
      })
      .catch((error) => {
        logging.log(
          `Could not load sample ${url}: ${error.message}`, 'SoundFont', logging.Level.WARN)
      })
      .finally(() => {
        this.#pending.delete(name)
      })
    this.#pending.set(name, promise)
  }

  /** Resolves once every sample added so far has settled. */
  loaded() {
    return Promise.all(Array.from(this.#pending.values()))
  }

  get(name) {
    return this.#buffers.get(name)
  }
}

/**
 * Sampled instrument. Must be initialized and samples must be pre-loaded using
 * the `loadSamples` method before any notes can be played.
 */
export class Instrument {
  #FADE_SECONDS = 0.1

  constructor(baseURL) {
    this.baseURL = baseURL
    this.buffers = new SampleBuffers()
    this.sourceMap = new Map()
    this.activeSources = new Set()
    this.initialized = false
  }

  /**
   * Loads instrument configuration from an `instrument.json` file in the base
   * URL directory. Does not load any of the samples.
   */
  async initialize() {
    await fetch(`${this.baseURL}/instrument.json`)
      .then((response) => response.json())
      .then((spec) => {
        this.name = spec.name
        this.minPitch = spec.minPitch
        this.maxPitch = spec.maxPitch
        this.durationSeconds = spec.durationSeconds
        this.releaseSeconds = spec.releaseSeconds
        this.percussive = spec.percussive
        this.velocities = spec.velocities
        this.initialized = true
      })
  }

  /**
   * Map pitch and velocity to sample name.
   */
  #sampleInfoToName(sampleInfo) {
    if (this.velocities) {
      return `p${sampleInfo.pitch}_v${sampleInfo.velocity}`
    }
    return `p${sampleInfo.pitch}`
  }

  /**
   * Map sample name to URL.
   */
  #sampleNameToURL(name) {
    return `${this.baseURL}/${name}.mp3`
  }

  /**
   * Find nearest sampled velocity to a target velocity.
   */
  #nearestVelocity(velocity) {
    if (!this.velocities) {
      return velocity
    }

    if (!velocity) {
      velocity = constants.DEFAULT_VELOCITY
    }

    let bestVelocity = undefined
    let bestDistance = constants.MIDI_VELOCITIES
    this.velocities.forEach((v) => {
      const d = Math.abs(v - velocity)
      if (d < bestDistance) {
        bestVelocity = v
        bestDistance = d
      }
    })
    return bestVelocity
  }

  /**
   * Load samples necessary to play a set of pitch/velocity pairs. This must be
   * called before any notes can be played.
   *
   * @param samples Array of pitch/velocity pairs.
   */
  async loadSamples(samples) {
    if (!this.initialized) {
      await this.initialize()
    }

    // Filter out invalid pitches and find the nearest velocity we have for each
    // sample.
    const nearestSampleNames = samples
      .filter((info) => {
        if (info.pitch < this.minPitch || info.pitch > this.maxPitch) {
          logging.log(
            `Pitch ${info.pitch} is outside the valid range for ${this.name}, ignoring.`,
            'SoundFont')
          return false
        }
        return true
      })
      .map((info) => this.#sampleInfoToName({
        pitch: info.pitch,
        velocity: this.#nearestVelocity(info.velocity)
      }))

    // Remove duplicates and samples that have already been loaded.
    const uniqueSampleNames = Array.from(new Set(nearestSampleNames))
      .filter((name) => !this.buffers.has(name))

    // Map each name to the corresponding URL.
    const sampleNamesAndURLs = uniqueSampleNames.map(
      (name) => ({ name, url: this.#sampleNameToURL(name) }))

    if (sampleNamesAndURLs.length > 0) {
      sampleNamesAndURLs.forEach(
        (nameAndURL) => this.buffers.add(nameAndURL.name, nameAndURL.url))
      await this.buffers.loaded()
      logging.log(`Loaded samples for ${this.name}.`, 'SoundFont')
    }
  }

  /**
   * Creates a source, connects it and registers it for cancellation.
   */
  #createSource(buffer, output, fades) {
    const source = new BufferSource(buffer, fades).connect(output)
    this.activeSources.add(source)
    source.onEnded(() => this.activeSources.delete(source))
    return source
  }

  /**
   * Stops every source this instrument currently has playing or scheduled.
   *
   * Used when the transport seeks, pauses or stops. Not part of upstream, where
   * `Tone.Part` cancelled its scheduled events instead.
   */
  stopAllSources() {
    for (const source of this.activeSources) {
      source.stop(0, this.#FADE_SECONDS)
    }
    this.activeSources.clear()
    this.sourceMap.clear()
  }

  /**
   * Play a note using one of the samples.
   *
   * @param pitch Pitch of the note.
   * @param velocity Velocity of the note.
   * @param startTime Time at which to start playing the note.
   * @param duration Length of the note in seconds.
   * @param output Output `AudioNode`.
   */
  playNote(pitch, velocity, startTime, duration, output) {
    const buffer = this.getBuffer(pitch, velocity)
    if (!buffer) {
      return
    }

    if (duration > this.durationSeconds) {
      logging.log(
        `Requested note duration longer than sample duration: ${duration} > ${this.durationSeconds}`,
        'SoundFont')
    }

    const source = this.#createSource(buffer, output, { fadeOut: this.#FADE_SECONDS })
    source.start(startTime, 0, undefined, 1)
    if (!this.percussive && duration < this.durationSeconds) {
      // Fade to the note release.
      const releaseSource = this.#createSource(buffer, output, {
        fadeIn: this.#FADE_SECONDS,
        fadeOut: this.#FADE_SECONDS
      })
      source.stop(startTime + duration + this.#FADE_SECONDS)
      releaseSource.start(startTime + duration, this.durationSeconds, undefined, 1)
    }
  }

  /**
   * Strike a note down using one of the samples. If you call this twice
   * without calling playNoteUp() in between, it will implicitly
   * release the note before striking it the second time.
   *
   * @param pitch Pitch of the note.
   * @param velocity Velocity of the note.
   * @param output Output `AudioNode`.
   */
  playNoteDown(pitch, velocity, output) {
    const buffer = this.getBuffer(pitch, velocity)
    if (!buffer) {
      return
    }
    const source = this.#createSource(buffer, output, { fadeOut: this.#FADE_SECONDS })
    source.start(0, 0, undefined, 1)
    if (this.sourceMap.has(pitch)) {
      this.sourceMap.get(pitch).stop(
        getAudioContext().currentTime + this.#FADE_SECONDS, this.#FADE_SECONDS)
    }
    this.sourceMap.set(pitch, source)
  }

  /**
   * Release a note using one of the samples. If you call this twice
   * without calling playNoteDown() in between, it will *not*
   * implicitly call playNoteDown() for you, and the second call will have
   * no noticeable effect.
   *
   * @param pitch Pitch of the note.
   * @param velocity Velocity of the note.
   * @param output Output `AudioNode`.
   */
  playNoteUp(pitch, velocity, output) {
    if (!this.sourceMap.has(pitch)) {
      return
    }
    const buffer = this.getBuffer(pitch, velocity)
    if (!buffer) {
      return
    }

    // Fade to the note release.
    const releaseSource = this.#createSource(buffer, output, { fadeOut: this.#FADE_SECONDS })
    releaseSource.start(0, this.durationSeconds, undefined, 1)
    this.sourceMap.get(pitch).stop(
      getAudioContext().currentTime + this.#FADE_SECONDS, this.#FADE_SECONDS)
    this.sourceMap.delete(pitch)
  }

  /**
   * Get the buffer for this pitch and velocity, if it exists.
   *
   * @param pitch Pitch of the note.
   * @param velocity Velocity of the note.
   * @throws Error if this instrument is not initialized, or if no load was ever
   * requested for this sample. A sample whose download failed is reported as
   * missing (returns undefined) rather than throwing, so one bad `.mp3` only
   * silences one note.
   */
  getBuffer(pitch, velocity) {
    if (!this.initialized) {
      throw new Error('Instrument is not initialized.')
    }
    if (pitch < this.minPitch || pitch > this.maxPitch) {
      logging.log(
        `Pitch ${pitch} is outside the valid range for ${this.name} (${this.minPitch}-${this.maxPitch})`,
        'SoundFont')
      return undefined
    }

    const name = this.#sampleInfoToName({ pitch, velocity: this.#nearestVelocity(velocity) })
    if (!this.buffers.has(name)) {
      throw new Error(`Buffer not found for ${this.name}: ${name}`)
    }
    if (!this.buffers.isLoaded(name)) {
      logging.log(
        `Buffer not loaded for ${this.name}: ${name}`, 'SoundFont', logging.Level.WARN)
      return undefined
    }
    return this.buffers.get(name)
  }
}

/**
 * Multi-instrument SoundFont. Must be initialized and samples must be
 * pre-loaded using the `loadSamples` method before any notes can be played.
 *
 * A "SoundFont" here is not a `.sf2` file but a set of sampled instruments, each
 * in its own subdirectory:
 *
 * └─your_local_soundfont
 *   |-- soundfont.json
 *   |-- instrument_name (for each of the instruments listed in soundfont.json)
 *       |-- instrument.json
 *       |-- p1_v1.mp3
 *       |-- p1_v2.mp3
 *       |-- p${PITCH}_v${VELOCITY}.mp3, for every pitch/velocity supported
 *
 * `soundfont.json` names the SoundFont and maps program numbers to instrument
 * directories, e.g.
 * https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus/soundfont.json:
 *    {
 *      "name": "sgm_plus",
 *      "instruments": {
 *        "0": "acoustic_grand_piano",
 *        "1": "bright_acoustic_piano",
 *        ...
 *      }
 *    }
 *
 * and each instrument's `instrument.json` carries its spec, e.g.
 *  {
 *    "name": "acoustic_grand_piano",
 *    "minPitch": 21,
 *    "maxPitch": 108,
 *    "durationSeconds": 3.0,
 *    "releaseSeconds": 1.0,
 *    "percussive": false,
 *    "velocities": [15, 31, 47, 63, 79, 95, 111, 127]
 *  }
 */
export class SoundFont {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.instruments = new Map()
    this.initialized = false
  }

  /**
   * Loads SoundFont configuration from a `soundfont.json` file in the base URL
   * directory. Does not load any of the samples.
   */
  async initialize() {
    await fetch(`${this.baseURL}/soundfont.json`)
      .then((response) => response.json())
      .then((spec) => {
        this.name = spec.name
        for (const program in spec.instruments) {
          const url = `${this.baseURL}/${spec.instruments[program]}`
          this.instruments.set(program === 'drums' ? 'drums' : +program, new Instrument(url))
        }
        this.initialized = true
      })
  }

  /**
   * Load samples necessary to play a set of notes. This must be called before
   * any notes can be played.
   *
   * @param samples Array of program/isDrum/pitch/velocity for notes that will
   * be loaded.
   */
  async loadSamples(samples) {
    if (!this.initialized) {
      await this.initialize()
    }

    const instrumentSamples = new Map()
    samples.forEach((info) => {
      info.isDrum = info.isDrum || false
      info.program = info.program || 0

      const instrument = info.isDrum ? 'drums' : info.program
      const sampleInfo = { pitch: info.pitch, velocity: info.velocity }
      if (!instrumentSamples.has(instrument)) {
        if (!this.instruments.has(instrument)) {
          logging.log(
            `No instrument in ${this.name} for: program=${info.program}, isDrum=${info.isDrum}`,
            'SoundFont')
        } else {
          instrumentSamples.set(instrument, [sampleInfo])
        }
      } else {
        instrumentSamples.get(instrument).push(sampleInfo)
      }
    })

    await Promise.all(Array.from(instrumentSamples.keys()).map(
      (info) => this.instruments.get(info).loadSamples(instrumentSamples.get(info))))
  }

  /**
   * Stops every source across every loaded instrument. Used by the player when
   * the transport seeks, pauses or stops.
   */
  stopAllSources() {
    for (const instrument of this.instruments.values()) {
      instrument.stopAllSources()
    }
  }

  /**
   * Play a note using one of the sampled instruments.
   *
   * @param pitch Pitch of the note.
   * @param velocity Velocity of the note.
   * @param startTime Time at which to start playing the note.
   * @param duration Length of the note in seconds.
   * @param program Program number to use for instrument lookup.
   * @param isDrum Drum status to use for instrument lookup.
   * @param output Output `AudioNode`.
   */
  playNote(pitch, velocity, startTime, duration, program = 0, isDrum = false, output) {
    const instrument = isDrum ? 'drums' : program
    if (!this.initialized) {
      throw new Error('SoundFont is not initialized.')
    }
    if (!this.instruments.has(instrument)) {
      logging.log(
        `No instrument in ${this.name} for: program=${program}, isDrum=${isDrum}`, 'SoundFont')
      return
    }

    this.instruments.get(instrument).playNote(pitch, velocity, startTime, duration, output)
  }

  /**
   * Strikes a note down using one of the sampled instruments. If you call this
   * twice without calling playNoteUp() in between, it will implicitly release
   * the note before striking it the second time.
   *
   * @param pitch Pitch of the note.
   * @param velocity Velocity of the note.
   * @param program Program number to use for instrument lookup.
   * @param isDrum Drum status to use for instrument lookup.
   * @param output Output `AudioNode`.
   */
  playNoteDown(pitch, velocity, program = 0, isDrum = false, output) {
    const instrument = isDrum ? 'drums' : program
    if (!this.initialized) {
      throw new Error('SoundFont is not initialized.')
    }
    if (!this.instruments.has(instrument)) {
      logging.log(
        `No instrument in ${this.name} for: program=${program}, isDrum=${isDrum}`, 'SoundFont')
      return
    }

    this.instruments.get(instrument).playNoteDown(pitch, velocity, output)
  }

  /**
   * Releases a note using one of the sampled instruments. If you call this
   * twice without calling playNoteDown() in between, it will *not* implicitly
   * call playNoteDown() for you, and the second call will have no noticeable
   * effect.
   *
   * @param pitch Pitch of the note.
   * @param velocity Velocity of the note.
   * @param program Program number to use for instrument lookup.
   * @param isDrum Drum status to use for instrument lookup.
   * @param output Output `AudioNode`.
   */
  playNoteUp(pitch, velocity, program = 0, isDrum = false, output) {
    const instrument = isDrum ? 'drums' : program
    if (!this.initialized) {
      throw new Error('SoundFont is not initialized.')
    }
    if (!this.instruments.has(instrument)) {
      logging.log(
        `No instrument in ${this.name} for: program=${program}, isDrum=${isDrum}`, 'SoundFont')
      return
    }

    this.instruments.get(instrument).playNoteUp(pitch, velocity, output)
  }
}
