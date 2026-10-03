import scrollToScreen from '/js/landing/scrollToScreen.js'

/*
<a is="landing-scroll-hint" data-scroll-hint href="#see">

Points at the next screen, and moves there smoothly when clicked. It has said
what it has to say as soon as the reader scrolls, so then it marks itself
data-scrolled and the stylesheet fades it out.
*/
class LandingScrollHint extends HTMLAnchorElement {
  connectedCallback() {
    this.addEventListener('click', this.#onClick)
    window.addEventListener('scroll', this.#onScroll, { passive: true })
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.#onClick)
    window.removeEventListener('scroll', this.#onScroll)
  }

  #onClick = (event) => {
    if (scrollToScreen(this.getAttribute('href').slice(1))) {
      event.preventDefault()
    }
  }

  #onScroll = () => {
    if (window.scrollY > 40) {
      this.setAttribute('data-scrolled', 'true')
      window.removeEventListener('scroll', this.#onScroll)
    }
  }
}

customElements.define('landing-scroll-hint', LandingScrollHint, { extends: 'a' })
