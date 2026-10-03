/*
<div is="landing-carousel" data-carousel>
  <div data-carousel-viewport> … [data-card] … </div>
  <div data-carousel-controls>
    <button data-carousel-prev> <span data-carousel-count> <button data-carousel-next>
  </div>
</div>

The row itself is an ordinary scroller: it works with a trackpad, a touch
screen and the keyboard without any of this. What is added is a pair of buttons
that move it by exactly one card, and a count so the reader knows how many
there are.
*/
class LandingCarousel extends HTMLDivElement {
  #viewport = null
  #cards = []
  #previous = null
  #next = null
  #count = null

  connectedCallback() {
    this.#viewport = this.querySelector('[data-carousel-viewport]')
    this.#cards = [ ...this.querySelectorAll('[data-card]') ]
    this.#previous = this.querySelector('[data-carousel-prev]')
    this.#next = this.querySelector('[data-carousel-next]')
    this.#count = this.querySelector('[data-carousel-count]')
    if (!this.#viewport || !this.#cards.length) {
      return
    }

    this.#previous.addEventListener('click', this.#goBack)
    this.#next.addEventListener('click', this.#goOn)
    this.#viewport.addEventListener('scroll', this.#sync, { passive: true })
    window.addEventListener('resize', this.#sync)
    this.#sync()
  }

  disconnectedCallback() {
    if (!this.#viewport) {
      return
    }
    this.#previous.removeEventListener('click', this.#goBack)
    this.#next.removeEventListener('click', this.#goOn)
    this.#viewport.removeEventListener('scroll', this.#sync)
    window.removeEventListener('resize', this.#sync)
  }

  /** Whichever card is nearest the middle of the viewport. */
  #currentIndex() {
    const middle = this.#viewport.scrollLeft + this.#viewport.clientWidth / 2
    let best = 0
    let bestGap = Infinity
    this.#cards.forEach((card, index) => {
      const gap = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle)
      if (gap < bestGap) {
        bestGap = gap
        best = index
      }
    })
    return best
  }

  #go(index) {
    const card = this.#cards[Math.max(0, Math.min(this.#cards.length - 1, index))]
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.#viewport.scrollTo({
      left: card.offsetLeft - (this.#viewport.clientWidth - card.offsetWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth'
    })
  }

  #goBack = () => {
    this.#go(this.#currentIndex() - 1)
  }

  #goOn = () => {
    this.#go(this.#currentIndex() + 1)
  }

  #sync = () => {
    const index = this.#currentIndex()
    this.#count.textContent = `${index + 1} / ${this.#cards.length}`
    this.#previous.disabled = index === 0
    this.#next.disabled = index === this.#cards.length - 1
  }
}

customElements.define('landing-carousel', LandingCarousel, { extends: 'div' })
