/*
<div is="landing-phrase" data-stave data-phrase aria-hidden="true">
  <e-svg data-src="/images/phrase.svg"></e-svg>
</div>

A real engraved phrase, drawn by the engine from eight words of MSQ (see
scripts/generate-landing-art.js) and animated into place each time its screen
comes on: the stave rules itself, then the notes arrive.

The artwork is put inline by EHTML's e-svg rather than given to an <img>,
because the stave lines have to be staged one after another and an image has
no parts. This element only animates whatever svg ends up inside it. If there
is none yet when its screen comes on, it waits for it, and if there never is
one the screen is a heading and a sentence, which is the thing worth reading
anyway.

It plays once per arrival, and this guard is load bearing. The screen comes on
once, but it is only armed again once the screen has properly gone, so that a
reader scrolling a little back and forth does not restart the drawing.
*/

// One delay per stave line, so a whole line comes in across the full width at once.
const PER_LINE = 70

class LandingPhrase extends HTMLDivElement {
  #screen = null
  #isPlaying = false
  #waitingForSvg = null

  connectedCallback() {
    this.#screen = this.closest('[data-screen]')
    if (!this.#screen) {
      return
    }
    this.#screen.addEventListener('landing:screen-current', this.#play)
    this.#screen.addEventListener('landing:screen-gone', this.#rearm)
  }

  disconnectedCallback() {
    this.#stopWaiting()
    if (this.#screen) {
      this.#screen.removeEventListener('landing:screen-current', this.#play)
      this.#screen.removeEventListener('landing:screen-gone', this.#rearm)
    }
  }

  #rearm = () => {
    this.#isPlaying = false
  }

  #play = () => {
    if (this.#isPlaying) {
      return
    }
    this.#isPlaying = true

    if (this.querySelector('svg')) {
      this.#draw()
      return
    }
    // e-svg has not put it in yet: draw as soon as it does
    this.#stopWaiting()
    this.#waitingForSvg = new MutationObserver(() => {
      if (this.querySelector('svg')) {
        this.#stopWaiting()
        this.#draw()
      }
    })
    this.#waitingForSvg.observe(this, { childList: true })
  }

  #stopWaiting() {
    if (this.#waitingForSvg) {
      this.#waitingForSvg.disconnect()
      this.#waitingForSvg = null
    }
  }

  #draw() {
    /*
    Put back to the start without animating there.

    The wipe lives on this element, so simply clearing the attribute would run
    the wipe and every stave line backwards for their full length before they
    could run forwards again. Switching transitions off, committing that, and
    switching them back on is what makes the reset instant: a transition that
    is not there cannot play in reverse.
    */
    const lines = this.querySelectorAll('[data-stave-line]')
    this.style.transition = 'none'
    for (const line of lines) {
      line.style.transition = 'none'
    }
    this.removeAttribute('data-drawn')
    void this.offsetWidth
    this.style.transition = ''

    /*
    The stave rules itself top line first while the wipe travels, so the two
    gestures run together rather than one waiting on the other. The generator
    numbers the lines from the top, and every piece of the stave shares a
    number with the line it continues.
    */
    for (const line of lines) {
      line.style.transition = ''
      line.style.setProperty('--d', `${Number(line.dataset.staveLine) * PER_LINE}ms`)
    }

    // The starting state is already committed by the reflow above, so one frame
    // is enough for the transition to have something to run from.
    requestAnimationFrame(() => {
      this.setAttribute('data-drawn', 'true')
    })
  }
}

customElements.define('landing-phrase', LandingPhrase, { extends: 'div' })
