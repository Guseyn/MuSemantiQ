/**
 * The `<midi-player>` element.
 *
 * Ported from html-midi-player `src/player.ts` (BSD-2-Clause),
 * https://github.com/cifkao/html-midi-player
 *
 * Changes for this repo: types stripped, `#private` where upstream used
 * `private`, imports resolved to this repo's vendored magenta port, and the
 * build-time `./assets` / `./utils` imports replaced with plain modules.
 *
 * Everything the element needs — markup, icons and styles — is self-contained
 * in its shadow root, so no external stylesheet is required. Customization is
 * through the `::part()` selectors listed below.
 *
 * The shadow markup uses no classes: elements are found by data attribute
 * (`[data-control-panel]`, `[data-play-button]`, `[data-seek-bar]`, ...) and the
 * panel's visual state is a `data-state` attribute in {stopped, playing,
 * loading, error} plus a boolean `data-frozen`, replacing upstream's five
 * classes on `.controls`.
 */

import * as mm from '#msq/lib/@magenta/music/core.js'

import { controlsTemplate } from '#msq/lib/html-midi-player/assets/controls-template.js'
import { formatTime } from '#msq/lib/html-midi-player/utils.js'

const DEFAULT_SOUNDFONT = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus'

let playingPlayer = null

/**
 * MIDI player element.
 *
 * The element supports styling using the CSS [`::part` syntax](https://developer.mozilla.org/docs/Web/CSS/::part)
 * (see the list of shadow parts below). For example:
 * ```css
 * midi-player::part(control-panel) {
 *     background: aquamarine;
 *     border-radius: 0px;
 * }
 * ```
 *
 * @prop src - MIDI file URL
 * @prop soundFont - Magenta SoundFont URL, an empty string to use the default SoundFont, or `null` to use a simple oscillator synth
 * @prop noteSequence - Magenta note sequence object representing the currently loaded content
 * @prop loop - Indicates whether the player should loop
 * @prop currentTime - Current playback position in seconds
 * @prop duration - Content duration in seconds
 * @prop playing - Indicates whether the player is currently playing
 *
 * @fires load - The content is loaded and ready to play
 * @fires start - The player has started playing
 * @fires stop - The player has stopped playing
 * @fires loop - The player has automatically restarted playback after reaching the end
 * @fires note - A note starts. `event.detail.note` carries the note.
 *
 * @csspart control-panel - `<div>` containing all the controls
 * @csspart play-button - Play button
 * @csspart time - Numeric time indicator
 * @csspart current-time - Elapsed time
 * @csspart total-time - Total duration
 * @csspart seek-bar - `<input type="range">` showing playback position
 * @csspart loading-overlay - Overlay with shimmer animation
 */
export class PlayerElement extends HTMLElement {
  #domInitialized = false
  #initTimeout = null
  #needInitNs = false

  static get observedAttributes() { return ['data-sound-font', 'data-src'] }

  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(controlsTemplate.content.cloneNode(true))

    this.player = null
    this.controlPanel = this.shadowRoot.querySelector('[data-control-panel]')
    this.playButton = this.controlPanel.querySelector('[data-play-button]')
    this.currentTimeLabel = this.controlPanel.querySelector('[data-current-time]')
    this.totalTimeLabel = this.controlPanel.querySelector('[data-total-time]')
    this.seekBar = this.controlPanel.querySelector('[data-seek-bar]')

    this.ns = null
    this._playing = false
    this.seeking = false
  }

  connectedCallback() {
    if (this.#domInitialized) {
      return
    }
    this.#domInitialized = true

    this.playButton.addEventListener('click', () => {
      if (this.player.isPlaying()) {
        this.stop()
      } else {
        this.start()
      }
    })
    this.seekBar.addEventListener('input', () => {
      // Pause playback while the user is manipulating the control
      this.seeking = true
      if (this.player && this.player.getPlayState() === 'started') {
        this.player.pause()
      }
    })
    this.seekBar.addEventListener('change', () => {
      const time = this.currentTime  // This returns the seek bar value as a number
      this.displayCurrentTime(time)
      if (this.player) {
        if (this.player.isPlaying()) {
          this.player.seekTo(time)
          if (this.player.getPlayState() === 'paused') {
            this.player.resume()
          }
        }
      }
      this.seeking = false
    })

    this.initPlayerNow()
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    if (!this.hasAttribute(name)) {
      newValue = null
    }

    if (name === 'data-sound-font' || name === 'data-src') {
      this.initPlayer()
    }
  }

  initPlayer(initNs = true) {
    this.#needInitNs = this.#needInitNs || initNs
    if (this.#initTimeout === null) {
      this.stop()
      this.setLoading()
      this.#initTimeout = window.setTimeout(() => this.initPlayerNow(this.#needInitNs))
    }
  }

  async initPlayerNow(initNs = true) {
    this.#initTimeout = null
    this.#needInitNs = false
    if (!this.#domInitialized) {
      return
    }

    try {
      let ns = null
      if (initNs) {
        if (this.src) {
          this.ns = null
          this.ns = await mm.urlToNoteSequence(this.src)
        }
        this.currentTime = 0
        if (!this.ns) {
          this.setError('No content loaded')
        }
      }
      ns = this.ns

      if (ns) {
        this.seekBar.max = String(ns.totalTime)
        this.totalTimeLabel.textContent = formatTime(ns.totalTime)
      } else {
        this.seekBar.max = '0'
        this.totalTimeLabel.textContent = formatTime(0)
        return
      }

      let soundFont = this.soundFont
      const callbackObject = {
        // Call callbacks only if we are still playing the same note sequence.
        run: (n) => (this.ns === ns) && this.noteCallback(n),
        stop: () => {}
      }
      if (soundFont === null) {
        this.player = new mm.Player(false, callbackObject)
      } else {
        if (soundFont === '') {
          soundFont = DEFAULT_SOUNDFONT
        }
        this.player = new mm.SoundFontPlayer(
          soundFont, undefined, undefined, undefined, callbackObject)
        await this.player.loadSamples(ns)
      }

      if (this.ns !== ns) {
        // If we started loading a different sequence in the meantime...
        return
      }

      this.setLoaded()
      this.dispatchEvent(new CustomEvent('load'))
    } catch (error) {
      this.setError(String(error))
      throw error
    }
  }

  reload() {
    this.initPlayerNow()
  }

  start() {
    this.#start()
  }

  #start(looped = false) {
    (async () => {
      if (this.player) {
        if (this.player.getPlayState() === 'stopped') {
          if (playingPlayer && playingPlayer.playing && !(playingPlayer === this && looped)) {
            playingPlayer.stop()
          }
          playingPlayer = this
          this._playing = true

          let offset = this.currentTime
          // Jump to the start if there are no notes left to play.
          if (this.ns.notes.filter((note) => note.startTime > offset).length === 0) {
            offset = 0
          }
          this.currentTime = offset

          this.controlPanel.dataset.state = 'playing'
          this.playButton.setAttribute('aria-label', 'Stop')
          try {
            const promise = this.player.start(this.ns, undefined, offset)
            if (!looped) {
              this.dispatchEvent(new CustomEvent('start'))
            } else {
              this.dispatchEvent(new CustomEvent('loop'))
            }
            await promise
            this.handleStop(true)
          } catch (error) {
            this.handleStop()
            throw error
          }
        } else if (this.player.getPlayState() === 'paused') {
          // This normally should not happen, since we pause playback only when seeking.
          this.player.resume()
        }
      }
    })()
  }

  stop() {
    if (this.player && this.player.isPlaying()) {
      this.player.stop()
    }
    this.handleStop(false)
  }

  noteCallback(note) {
    if (!this.playing) {
      return
    }
    this.dispatchEvent(new CustomEvent('note', { detail: { note } }))
    if (this.seeking) {
      return
    }
    this.seekBar.value = String(note.startTime)
    this.displayCurrentTime(note.startTime)
  }

  handleStop(finished = false) {
    if (finished) {
      if (this.loop) {
        this.currentTime = 0
        this.#start(true)
        return
      }
      this.currentTime = this.duration
    }
    // Only leave a 'playing' panel; an 'error' or 'loading' one keeps its state,
    // which upstream got for free from independent classes.
    if (this.controlPanel.dataset.state === 'playing') {
      this.controlPanel.dataset.state = 'stopped'
    }
    this.playButton.setAttribute('aria-label', 'Play')
    if (this._playing) {
      this._playing = false
      this.dispatchEvent(new CustomEvent('stop', { detail: { finished } }))
    }
  }

  setLoading() {
    this.playButton.disabled = true
    this.seekBar.disabled = true
    this.controlPanel.dataset.state = 'loading'
    this.controlPanel.dataset.frozen = ''
    this.controlPanel.removeAttribute('title')
  }

  setLoaded() {
    this.controlPanel.dataset.state = 'stopped'
    delete this.controlPanel.dataset.frozen
    this.playButton.disabled = false
    this.seekBar.disabled = false
  }

  setError(error) {
    this.playButton.disabled = true
    this.seekBar.disabled = true
    this.controlPanel.dataset.state = 'error'
    this.controlPanel.dataset.frozen = ''
    this.controlPanel.title = error
  }

  get noteSequence() {
    return this.ns
  }

  set noteSequence(value) {
    if (this.ns === value) {
      return
    }
    this.ns = value
    this.removeAttribute('data-src')  // Triggers initPlayer only if src was present.
    this.initPlayer()
  }

  get src() {
    return this.getAttribute('data-src')
  }

  set src(value) {
    this.ns = null
    this.setOrRemoveAttribute('data-src', value)  // Triggers initPlayer only if src was present.
    this.initPlayer()
  }

  /**
   * @attr data-sound-font
   */
  get soundFont() {
    return this.getAttribute('data-sound-font')
  }

  set soundFont(value) {
    this.setOrRemoveAttribute('data-sound-font', value)
  }

  /**
   * @attr loop
   */
  get loop() {
    return this.getAttribute('loop') !== null
  }

  set loop(value) {
    this.setOrRemoveAttribute('loop', value ? '' : null)
  }

  get currentTime() {
    return parseFloat(this.seekBar.value)
  }

  set currentTime(value) {
    this.seekBar.value = String(value)
    this.displayCurrentTime(value)
    if (this.player && this.player.isPlaying()) {
      this.player.seekTo(value)
    }
  }

  displayCurrentTime(value) {
    this.currentTimeLabel.textContent = formatTime(value)
    this.seekBar.setAttribute('aria-valuetext', `Elapsed time: ${formatTime(value)}`)
  }

  get duration() {
    return parseFloat(this.seekBar.max)
  }

  get playing() {
    return this._playing
  }

  setOrRemoveAttribute(name, value) {
    if (value === null) {
      this.removeAttribute(name)
    } else {
      this.setAttribute(name, value)
    }
  }
}

customElements.define('midi-player', PlayerElement)
