/**
 * Players for `NoteSequence`s.
 *
 * Ported from magenta-js `music/src/core/player.ts` (Apache-2.0),
 * https://github.com/magenta/magenta-js
 *
 * The public API is unchanged — `BasePlayer`, `Player`, `SoundFontPlayer`,
 * `PlayerWithClick`, `MIDIPlayer`, with the same methods and constructor
 * signatures — but the Tone.js internals are replaced:
 *
 *   Tone.Transport / Tone.Part  ->  the transport in `core/audio.js`
 *   Tone.Draw.schedule          ->  the transport's draw queue
 *   Tone.Frequency(p, 'midi')   ->  midiToFrequency(p)
 *   Tone.Master                 ->  audioContext.destination
 *   Tone.PolySynth / Synth      ->  OscillatorSynth (below)
 *   Tone.MembraneSynth /
 *     MetalSynth / NoiseSynth   ->  DrumKit's Web Audio recipes (below)
 *
 * `Tone.Transport.bpm` does not appear: by the time notes reach a player they
 * carry absolute times in seconds, so tempo can only act as a playback-rate
 * multiplier. `setTempo` maps onto the transport's `rate` accordingly.
 *
 * Two deliberate differences from upstream:
 *
 *   - The drum and oscillator voices are Web Audio approximations of Tone's
 *     synths, not sample-exact reproductions. They only matter when no
 *     SoundFont is configured; `SoundFontPlayer` is unaffected.
 *   - `stopSources()` is new. Tone.Part could cancel events it had already
 *     scheduled; an AudioBufferSourceNode cannot be un-started, so the
 *     transport asks the player to stop its live sources on seek/pause/stop.
 *
 * Also dropped: the `Player.tone` static, which existed only to re-export the
 * Tone module.
 */

import { NoteSequence } from '#msq/lib/@magenta/music/protobuf.js'

import { getAudioContext, midiToFrequency, transport } from '#msq/lib/@magenta/music/core/audio.js'
import * as constants from '#msq/lib/@magenta/music/core/constants.js'
import * as sequences from '#msq/lib/@magenta/music/core/sequences.js'
import * as soundfont from '#msq/lib/@magenta/music/core/soundfont.js'

function compareQuantizedNotes(a, b) {
  if (a.quantizedStartStep < b.quantizedStartStep) {
    return -1
  }
  if (a.quantizedStartStep > b.quantizedStartStep) {
    return 1
  }
  if (a.pitch < b.pitch) {
    return -1
  }
  return 1
}

/**
 * Converts a decibel value to a linear gain multiplier, as Tone's `volume` does.
 */
function decibelsToGain(decibels) {
  return Math.pow(10, decibels / 20)
}

/**
 * The shape of the object `BasePlayer` calls back into during playback.
 *
 * Upstream declares this as an abstract class; here it is a documented contract:
 *
 *   - `run(note, time)` — called for each note as it becomes audible.
 *   - `stop()` — called when the sequence finishes.
 */

/**
 * Abstract base class for a `NoteSequence` player.
 */
export class BasePlayer {
  /**
   *   `BasePlayer` constructor.
   *
   *   @param playClick A boolean, determines whether the click will be played.
   *   @param callbackObject An optional callback object with `run()` and
   *     `stop()` methods to invoke during playback.
   */
  constructor(playClick = false, callbackObject = undefined) {
    this.playClick = playClick
    this.callbackObject = callbackObject
    this.desiredQPM = undefined
    this.currentPart = null
    this.baseQPM = constants.DEFAULT_QUARTERS_PER_MINUTE
  }

  /**
   * Makes a single note sound at the given `AudioContext` time. Subclasses must
   * implement this.
   */
  playNote(_time, _note) {
    throw new Error('playNote() must be implemented by a BasePlayer subclass.')
  }

  /**
   * Stops anything this player currently has sounding or scheduled.
   *
   * Called by the transport on seek, pause and stop. Subclasses that produce
   * sound override this.
   */
  stopSources() {}

  /**
   * Changes the tempo of the playback.
   *
   * @param qpm The new qpm to use.
   */
  setTempo(qpm) {
    this.desiredQPM = qpm
    if (transport.state === 'started') {
      transport.rate = qpm / this.baseQPM
    }
  }

  /**
   * Adds a click track to an existing note sequence.
   * @param seq The `NoteSequence` to augment with a click track.
   */
  #makeClickSequence(seq) {
    const clickSeq = sequences.clone(seq)
    const sixteenthEnds = clickSeq.notes.map((n) => n.quantizedEndStep)
    const lastSixteenth = Math.max(...sixteenthEnds)
    for (let i = 0; i < lastSixteenth; i += 4) {
      const click = {
        pitch: i % 16 === 0 ? constants.LO_CLICK_PITCH : constants.HI_CLICK_PITCH,
        quantizedStartStep: i,
        isDrum: true,
        quantizedEndStep: i + 1
      }
      clickSeq.notes.push(click)
    }
    clickSeq.notes.sort(compareQuantizedNotes)
    return clickSeq
  }

  /**
   * Resumes the Audio context. Due to autoplay restrictions, you must call
   * this function in a click handler (i.e. as a result of a user action) before
   * you can start playing audio with a player. This is already done in start(),
   * but you might have to call it yourself if you have any deferred/async
   * calls.
   */
  resumeContext() {
    return getAudioContext().resume()
  }

  /**
   * Starts playing a `NoteSequence` (either quantized or unquantized), and
   * returns a Promise that resolves when it is done playing.
   * @param seq The `NoteSequence` to play.
   * @param qpm (Optional) If specified, will play back at this qpm. If not
   * specified, will use either the qpm specified in the sequence or the
   * default of 120. Only valid for quantized sequences.
   * @param offset (Optional) The time to start playing from.
   * @returns a Promise that resolves when playback is complete.
   * @throws {Error} If this or a different player is currently playing.
   */
  start(seq, qpm = undefined, offset = 0) {
    if (this.getPlayState() === 'started') {
      throw new Error('Cannot start playback; player is already playing.')
    } else if (this.getPlayState() === 'paused') {
      throw new Error('Cannot `start()` a paused player; use `resume()`.')
    }
    if (transport.state !== 'stopped') {
      throw new Error('Cannot start playback while the transport is in use.')
    }

    this.resumeContext()
    const isQuantized = sequences.isQuantizedSequence(seq)
    if (this.playClick && isQuantized) {
      seq = this.#makeClickSequence(seq)
    }

    if (qpm) {
      this.baseQPM = qpm
    } else if (seq.tempos && seq.tempos.length > 0 && seq.tempos[0].qpm > 0) {
      this.baseQPM = seq.tempos[0].qpm
    } else {
      this.baseQPM = constants.DEFAULT_QUARTERS_PER_MINUTE
    }

    if (isQuantized) {
      seq = sequences.unquantizeSequence(seq, qpm)
    } else if (qpm) {
      throw new Error('Cannot specify a `qpm` for a non-quantized sequence.')
    }

    const part = transport.schedule(seq.notes, seq.totalTime, offset, {
      playNote: (time, note) => {
        // Prevent playback after the part has been removed.
        if (this.currentPart !== part) {
          return
        }
        this.playNote(time, note)
      },
      drawNote: (note) => {
        if (this.currentPart !== part || !this.callbackObject) {
          return
        }
        this.callbackObject.run(note)
      },
      cancel: () => {
        this.stopSources()
      },
      end: () => {
        if (this.currentPart !== part) {
          return
        }
        // stop() runs the transport's stop, which resolves `part.promise`.
        this.stop()
        if (this.callbackObject) {
          this.callbackObject.stop()
        }
      }
    })
    this.currentPart = part

    transport.rate = this.desiredQPM ? this.desiredQPM / this.baseQPM : 1
    transport.start()
    return part.promise
  }

  /**
   * Stop playing the currently playing sequence right away.
   */
  stop() {
    if (this.isPlaying()) {
      transport.stop()
      this.currentPart = null
    } else {
      this.stopSources()
    }
    this.desiredQPM = undefined
  }

  /**
   * Pause playing the currently playing sequence right away. Call resume()
   * to resume.
   * @throws {Error} If the player is stopped.
   */
  pause() {
    if (!this.isPlaying()) {
      throw new Error('Cannot pause playback while the player is stopped.')
    }
    transport.pause()
  }

  /**
   * Resume playing the sequence after pause().
   * @throws {Error} If the player is not paused.
   */
  resume() {
    if (this.getPlayState() !== 'paused') {
      throw new Error(`Cannot resume playback while "${this.getPlayState()}".`)
    }
    transport.start()
  }

  /**
   * Seek to a number of seconds in the NoteSequence.
   * @throws {Error} If the player is stopped.
   */
  seekTo(seconds) {
    if (!this.isPlaying()) {
      throw new Error('Cannot seek while the player is stopped.')
    }
    transport.seconds = seconds
  }

  /**
   * Returns false iff the player is completely stopped. This will only be
   * false after creating the player or after calling stop(), and will be true
   * after calling start(), pause() or resume().
   */
  isPlaying() {
    return !!this.currentPart
  }

  /**
   * Returns the playback state of the player, either "started",
   * "stopped", or "paused".
   */
  getPlayState() {
    // Return "stopped" if some other player is playing.
    return this.isPlaying() ? transport.state : 'stopped'
  }
}

/**
 * A pool of enveloped oscillator voices, standing in for `Tone.Synth` and
 * `Tone.PolySynth`. Each note gets its own oscillator and gain node, which is
 * how Tone's PolySynth allocates voices anyway.
 */
class OscillatorSynth {
  #type
  #gainScale
  #envelope
  #active = new Set()

  constructor({ type = 'triangle', volume = 0, envelope = {} } = {}) {
    this.#type = type
    this.#gainScale = decibelsToGain(volume)
    // Tone.Synth's default envelope.
    this.#envelope = {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 1,
      ...envelope
    }
  }

  /**
   * @param frequency Frequency in Hz.
   * @param duration How long the note is held, in seconds.
   * @param time `AudioContext` time to start at.
   * @param velocity Linear velocity in [0, 1].
   */
  triggerAttackRelease(frequency, duration, time, velocity = 1) {
    const context = getAudioContext()
    const { attack, decay, sustain, release } = this.#envelope
    const peak = Math.max(velocity, 0) * this.#gainScale

    const oscillator = context.createOscillator()
    oscillator.type = this.#type
    oscillator.frequency.setValueAtTime(frequency, time)

    const gain = context.createGain()
    oscillator.connect(gain)
    gain.connect(context.destination)

    const attackEnd = time + attack
    const decayEnd = attackEnd + decay
    const releaseStart = Math.max(time + duration, attackEnd)

    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(peak, attackEnd)
    if (releaseStart >= decayEnd) {
      gain.gain.linearRampToValueAtTime(peak * sustain, decayEnd)
      gain.gain.setValueAtTime(peak * sustain, releaseStart)
    } else {
      // The note is released mid-decay: ramp straight to wherever the decay
      // would have been at that point.
      const progress = (releaseStart - attackEnd) / decay
      gain.gain.linearRampToValueAtTime(peak + (peak * sustain - peak) * progress, releaseStart)
    }
    gain.gain.linearRampToValueAtTime(0, releaseStart + release)

    oscillator.start(time)
    oscillator.stop(releaseStart + release)

    const voice = { oscillator, gain }
    this.#active.add(voice)
    oscillator.addEventListener('ended', () => this.#active.delete(voice), { once: true })
  }

  /** Stops every sounding or scheduled voice. */
  stopAll() {
    const now = getAudioContext().currentTime
    for (const { oscillator, gain } of this.#active) {
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0, now + 0.02)
      try {
        oscillator.stop(now + 0.02)
      } catch (error) {
        // Already stopped.
      }
    }
    this.#active.clear()
  }
}

let noiseBuffer = null

/**
 * A one-second mono buffer of white noise, shared by the noise-based drums.
 */
function getNoiseBuffer() {
  const context = getAudioContext()
  if (noiseBuffer === null || noiseBuffer.sampleRate !== context.sampleRate) {
    noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  }
  return noiseBuffer
}

/**
 * A singleton drum kit with the 9 pitch classes defined by
 * `constants.DEFAULT_DRUM_PITCH_CLASSES`, plus the two click classes.
 *
 * Upstream builds this from Tone's `MembraneSynth`, `MetalSynth` and
 * `NoiseSynth`. Here each is a small Web Audio recipe: membrane drums are a sine
 * with an exponential pitch drop, and the metal/noise drums are filtered
 * white-noise bursts. Close in character, not identical.
 */
class DrumKit {
  static #instance = null

  #drumPitchToClass = new Map()
  #active = new Set()
  #pitchPlayers = []

  constructor() {
    for (let c = 0; c < constants.DEFAULT_DRUM_PITCH_CLASSES.length; ++c) {
      constants.DEFAULT_DRUM_PITCH_CLASSES[c].forEach((p) => {
        this.#drumPitchToClass.set(p, c)
      })
    }
    this.#drumPitchToClass.set(constants.LO_CLICK_PITCH, constants.LO_CLICK_CLASS)
    this.#drumPitchToClass.set(constants.HI_CLICK_PITCH, constants.HI_CLICK_CLASS)

    // Indexed by drum class, mirroring upstream's `pitchPlayers`.
    this.#pitchPlayers = [
      // bass drum
      (time, velocity = 1) => this.#membrane(midiToFrequency(36), time, velocity, 0.25),
      // snare drum
      (time, velocity = 1) => this.#noise(time, velocity, {
        frequency: 1200, type: 'highpass', duration: 0.125, decay: 0.05
      }),
      // closed hi-hat
      (time, velocity = 1) => this.#noise(time, velocity * 0.3, {
        frequency: 8000, type: 'highpass', duration: 0.1, decay: 0.05
      }),
      // open hi-hat
      (time, velocity = 1) => this.#noise(time, velocity * 0.3, {
        frequency: 8000, type: 'highpass', duration: 0.5, decay: 0.4
      }),
      // low tom
      (time, velocity = 0.5) => this.#membrane(midiToFrequency(55), time, velocity, 0.5),
      // mid tom
      (time, velocity = 0.5) => this.#membrane(midiToFrequency(60), time, velocity, 0.5),
      // high tom
      (time, velocity = 0.5) => this.#membrane(midiToFrequency(65), time, velocity, 0.5),
      // crash cymbal
      (time, velocity = 1) => this.#noise(time, velocity, {
        frequency: 5000, type: 'highpass', duration: 1.5, decay: 1.4
      }),
      // ride cymbal
      (time, velocity = 1) => this.#noise(time, velocity * 0.5, {
        frequency: 6000, type: 'highpass', duration: 0.6, decay: 0.5
      }),
      // low click
      (time, velocity = 0.5) => this.#membrane(midiToFrequency(79), time, velocity, 0.3),
      // high click
      (time, velocity = 0.5) => this.#membrane(midiToFrequency(84), time, velocity, 0.3)
    ]
  }

  static getInstance() {
    if (DrumKit.#instance === null) {
      DrumKit.#instance = new DrumKit()
    }
    return DrumKit.#instance
  }

  #track(node, gain) {
    const voice = { node, gain }
    this.#active.add(voice)
    node.addEventListener('ended', () => this.#active.delete(voice), { once: true })
  }

  /** A sine whose pitch drops away sharply — kick, toms and clicks. */
  #membrane(frequency, time, velocity, duration) {
    const context = getAudioContext()
    const oscillator = context.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, time)
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(frequency * 0.01, 0.01), time + duration)

    const gain = context.createGain()
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(velocity, time + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(time)
    oscillator.stop(time + duration)
    this.#track(oscillator, gain)
  }

  /** A filtered white-noise burst — snare, hi-hats and cymbals. */
  #noise(time, velocity, { frequency, type, duration, decay }) {
    const context = getAudioContext()
    const source = context.createBufferSource()
    source.buffer = getNoiseBuffer()

    const filter = context.createBiquadFilter()
    filter.type = type
    filter.frequency.setValueAtTime(frequency, time)

    const gain = context.createGain()
    gain.gain.setValueAtTime(0, time)
    gain.gain.linearRampToValueAtTime(velocity, time + 0.001)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + Math.max(decay, 0.01))

    source.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)
    source.start(time, 0, duration)
    this.#track(source, gain)
  }

  playNote(pitch, time, velocity) {
    const drumClass = this.#drumPitchToClass.get(pitch)
    if (drumClass === undefined) {
      return
    }
    this.#pitchPlayers[drumClass](time, velocity)
  }

  stopAll() {
    const now = getAudioContext().currentTime
    for (const { node, gain } of this.#active) {
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(gain.gain.value, now)
      gain.gain.linearRampToValueAtTime(0, now + 0.02)
      try {
        node.stop(now + 0.02)
      } catch (error) {
        // Already stopped.
      }
    }
    this.#active.clear()
  }
}

/**
 * A `NoteSequence` player using simple oscillator synths.
 */
export class Player extends BasePlayer {
  #drumKit = DrumKit.getInstance()
  #bassSynth = new OscillatorSynth({ volume: 5, type: 'triangle' })
  #polySynth = new OscillatorSynth({ type: 'triangle' })

  playNote(time, note) {
    // If there's a velocity, use it.
    const velocity = Object.prototype.hasOwnProperty.call(note, 'velocity')
      ? note.velocity / constants.MAX_MIDI_VELOCITY
      : undefined

    if (note.isDrum) {
      this.#drumKit.playNote(note.pitch, time, velocity)
    } else {
      const frequency = midiToFrequency(note.pitch)
      const duration = note.endTime - note.startTime
      this.#getSynth(note.instrument, note.program)
        .triggerAttackRelease(frequency, duration, time, velocity === undefined ? 1 : velocity)
    }
  }

  stopSources() {
    this.#polySynth.stopAll()
    this.#bassSynth.stopAll()
    this.#drumKit.stopAll()
  }

  #getSynth(instrument, program) {
    if (program !== undefined && program >= 32 && program <= 39) {
      return this.#bassSynth
    }
    return this.#polySynth
  }
}

/**
 * A `NoteSequence` player that uses SoundFont samples. The `loadSamples` method
 * may be called before `start` so that the samples necessary for playing the
 * sequence will be loaded and playing will begin immediately upon `start`.
 *
 * Example (explicitly loading samples):
 *
 *   `player.loadSamples(seq).then(() => {
 *      player.start(seq)
 *    })`
 *
 * Explicitly loads samples, so that playing starts immediately when `start` is
 * called.
 *
 * Example (implicitly loading samples):
 *
 *   `player.start(seq)`
 *
 * If the samples for `seq` have not already been loaded, playing will only
 * start after all necessary samples have been loaded.
 */
export class SoundFontPlayer extends BasePlayer {
  constructor(
    soundFontURL,
    output = undefined,
    programOutputs = undefined,
    drumOutputs = undefined,
    callbackObject = undefined) {
    super(false, callbackObject)
    this.soundFont = new soundfont.SoundFont(soundFontURL)
    this.output = output
    this.programOutputs = programOutputs
    this.drumOutputs = drumOutputs
  }

  /**
   * Loads the audio samples required to play a NoteSequence.
   * @param seq The NoteSequence to be played.
   */
  async loadSamples(seq) {
    await this.soundFont.loadSamples(seq.notes.map((note) => ({
      pitch: note.pitch,
      velocity: note.velocity,
      program: note.program || 0,
      isDrum: note.isDrum || false
    })))
  }

  /**
   * Loads the audio samples for all valid midi pitches, for a specific program.
   * **Note**: this method is rather slow; only use it if you're sure
   * that you need to load _all_ possible samples (for example, you're
   * playing a stream of live notes from the user) -- otherwise, if you already
   * have the NoteSequence you have to play, use `loadSamples` instead.
   *
   * If you do end up using `loadAllSamples`, make sure you're calling it
   * asynchronously, as to not block other main thread work (like UI
   * interactions) while waiting for it to finish.
   *
   * @param program (optional) Program number to use for instrument lookup.
   * Default is 0.
   * @param isDrum (optional) True if the drum status should be used for
   * instrument lookup. Default is false.
   */
  async loadAllSamples(program = 0, isDrum = false) {
    // Create a NoteSequence that has all the possible pitches and all the
    // possible velocities for the given program.
    const ns = NoteSequence.create()
    const min = isDrum ? constants.MIN_DRUM_PITCH : constants.MIN_PIANO_PITCH
    const max = isDrum ? constants.MAX_DRUM_PITCH : constants.MAX_PIANO_PITCH
    for (let i = min; i <= max; i++) {
      for (let j = constants.MIN_MIDI_VELOCITY; j < constants.MAX_MIDI_VELOCITY; j++) {
        ns.notes.push({ pitch: i, velocity: j, program, isDrum })
      }
    }
    return this.loadSamples(ns)
  }

  start(seq, qpm = undefined, offset = 0) {
    this.resumeContext()
    return this.loadSamples(seq).then(() => super.start(seq, qpm, offset))
  }

  playNote(time, note) {
    this.soundFont.playNote(
      note.pitch, note.velocity, time, note.endTime - note.startTime,
      note.program, note.isDrum, this.getAudioNodeOutput(note))
  }

  stopSources() {
    this.soundFont.stopAllSources()
  }

  /*
   * Plays the down stroke of a note (the attack and the sustain).
   * Note that this does not call `loadSamples`, and assumes that the
   * sample for this note is already loaded. If you call this
   * twice without calling playNoteUp() in between, it will implicitly release
   * the note before striking it the second time.
   */
  playNoteDown(note) {
    this.soundFont.playNoteDown(
      note.pitch, note.velocity, note.program, note.isDrum, this.getAudioNodeOutput(note))
  }

  /*
   * Plays the up stroke of a note (the release).
   * Note that this does not call `loadSamples`, and assumes that the
   * sample for this note is already loaded. If you call this
   * twice without calling playNoteDown() in between, it will *not* implicitly
   * call playNoteDown() for you, and the second call will have no noticeable
   * effect.
   */
  playNoteUp(note) {
    this.soundFont.playNoteUp(
      note.pitch, note.velocity, note.program, note.isDrum, this.getAudioNodeOutput(note))
  }

  getAudioNodeOutput(note) {
    // Determine which `AudioNode` to use for output. Non-drums are mapped to
    // outputs by program number, while drums are mapped to outputs by MIDI
    // pitch value. A single output (defaulting to the context destination) is
    // used as a fallback.
    let output = this.output
    if (this.programOutputs && !note.isDrum) {
      if (this.programOutputs.has(note.program)) {
        output = this.programOutputs.get(note.program)
      }
    } else if (this.drumOutputs && note.isDrum) {
      if (this.drumOutputs.has(note.pitch)) {
        output = this.drumOutputs.get(note.pitch)
      }
    }
    return output || getAudioContext().destination
  }
}

/**
 * A `NoteSequence` player that includes a click track and a callback object to
 * be called while playing notes.
 */
export class PlayerWithClick extends Player {
  /**
   *   `PlayerWithClick` constructor.
   *
   *   @param callbackObject An optional callback object with `run()` and
   *     `stop()` methods to invoke during playback.
   */
  constructor(callbackObject = undefined) {
    super(true, callbackObject)
  }
}

/**
 * A `NoteSequence` player that uses a MIDI output for playing. Note that
 * WebMIDI is not supported in all browsers.
 *
 * If you want to use a particular MIDI output port, you must update the
 * `outputs` property before calling `start`, otherwise a message will be sent to
 * all connected MIDI outputs:
 *
 *   ```
 *    const player = new mm.MIDIPlayer();
 *    player.requestMIDIAccess().then(() => {
 *      // For example, use only the first port. If you omit this,
 *      // a message will be sent to all ports.
 *      player.outputs = [player.availableOutputs[0]];
 *      player.start(seq);
 *    })
 *   ```
 *
 * If you want to specify which MIDI channel the messages should be sent on,
 * you can set the `outputChannel` property before calling `start`. By
 * default, the `outputChannel` is 0.
 */
export class MIDIPlayer extends BasePlayer {
  #NOTE_ON = 0x90
  #NOTE_OFF = 0x80

  /**
   *   `MIDIPlayer` constructor.
   *
   *   @param callbackObject An optional callback object with `run()` and
   *     `stop()` methods to invoke during playback.
   */
  constructor(callbackObject = undefined) {
    super(false, callbackObject)
    this.outputs = []
    this.outputChannel = 0
    this.availableOutputs = []
  }

  /**
   * Requests MIDI access from the user, and stores all available MIDI outputs.
   */
  async requestMIDIAccess() {
    if (navigator.requestMIDIAccess) {
      return new Promise((resolve, reject) => {
        navigator.requestMIDIAccess().then((midi) => {
          // Also react to device changes.
          midi.addEventListener('statechange', () => this.#initOutputs(midi))
          resolve(this.#initOutputs(midi))
        }, (err) => {
          console.log('Something went wrong', err)
          reject(err)
        })
      })
    }
    return null
  }

  #initOutputs(midi) {
    const outputs = midi.outputs.values()
    for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
      this.availableOutputs.push(output.value)
    }
    return this.availableOutputs
  }

  playNote(time, note) {
    // Some good defaults.
    const velocity = note.velocity || 100
    const length = (note.endTime - note.startTime) * 1000  // in ms.

    const msgOn = [this.#NOTE_ON + this.outputChannel, note.pitch, velocity]
    const msgOff = [this.#NOTE_OFF + this.outputChannel, note.pitch, velocity]

    const outputs = this.outputs ? this.outputs : this.availableOutputs
    for (let i = 0; i < outputs.length; i++) {
      this.#sendMessageToOutput(outputs[i], msgOn)
      this.#sendMessageToOutput(outputs[i], msgOff, performance.now() + length)
    }
  }

  #sendMessageToOutput(output, message, time = undefined) {
    if (output) {
      output.send(message, time)
    }
  }

  /*
   * Plays the down stroke of a note (the attack and the sustain). If you call
   * this twice without calling playNoteUp() in between, it will implicitly
   * release the note before striking it the second time.
   */
  playNoteDown(note) {
    const msgOn = [this.#NOTE_ON, note.pitch, note.velocity]
    const outputs = this.outputs ? this.outputs : this.availableOutputs
    for (let i = 0; i < outputs.length; i++) {
      this.#sendMessageToOutput(outputs[i], msgOn)
    }
  }

  /*
   * Plays the up stroke of a note (the release). If you call this
   * twice without calling playNoteDown() in between, it will *not*
   * implicitly call playNoteDown() for you, and the second call will have no
   * noticeable effect.
   */
  playNoteUp(note) {
    const msgOff = [this.#NOTE_OFF, note.pitch, note.velocity]
    const outputs = this.outputs ? this.outputs : this.availableOutputs
    for (let i = 0; i < outputs.length; i++) {
      this.#sendMessageToOutput(outputs[i], msgOff, note.endTime - note.startTime)
    }
  }
}
