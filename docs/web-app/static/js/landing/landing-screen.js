/*
<section is="landing-screen" data-screen id="…" data-label="…">

One screen of the landing page. Its opacity follows how much of it is on
screen (--vis), which is what makes two screens cross-fade instead of merely
abut, and its contents rise into place when it arrives (data-visible).

It says what happens to it with events, for whatever cares:

  landing:screen-connected   it is in the document (the rail lists it)
  landing:screen-current     it has come on screen (the rail marks it, the
                             engraved phrase inside it plays)
  landing:screen-gone        it has properly left, not merely begun to

All three bubble and carry { id }.

data-enhanced is set here, so the styles that hide anything only apply once
this is known to be running: with no JavaScript the page is simply a page.
*/

const REVEAL_THRESHOLD = 0.55

// Below this a screen counts as gone, rather than merely on its way out.
const AWAY = 0.08

/*
Enough thresholds that the opacity moves smoothly rather than in steps. One
observer for every screen, each reporting to its own element.
*/
const ratios = Array.from({ length: 41 }, (_, step) => step / 40)

const handover = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    entry.target.showShare(entry.intersectionRatio)
  }
}, { threshold: ratios })

class LandingScreen extends HTMLElement {
  #isCurrent = false
  #isGone = true

  connectedCallback() {
    this.setAttribute('data-enhanced', 'true')
    handover.observe(this)
    this.#announce('landing:screen-connected')
  }

  disconnectedCallback() {
    handover.unobserve(this)
  }

  /*
  Called many times a second while the screen is on its way past, because the
  observer watches forty-one thresholds. So the events go out only when a line
  is crossed, never on every report.
  */
  showShare(ratio) {
    this.style.setProperty('--vis', String(ratio))

    if (ratio >= REVEAL_THRESHOLD) {
      this.setAttribute('data-visible', 'true')
      this.#isGone = false
      if (!this.#isCurrent) {
        this.#isCurrent = true
        this.#announce('landing:screen-current')
      }
      return
    }

    this.#isCurrent = false

    /*
    Only ever set to false before a screen has arrived. Once its contents have
    risen into place they stay there: a screen that flickered every time it was
    half scrolled past would be unreadable.
    */
    if (this.getAttribute('data-visible') !== 'true') {
      this.setAttribute('data-visible', 'false')
    }

    if (ratio <= AWAY && !this.#isGone) {
      this.#isGone = true
      this.#announce('landing:screen-gone')
    }
  }

  #announce(name) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: { id: this.id } }))
  }
}

customElements.define('landing-screen', LandingScreen, { extends: 'section' })
