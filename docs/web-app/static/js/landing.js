/*
The landing page's movement.

Three things, all of them decoration over a page that already reads without
them — which is why the class that hides anything is only ever set from here,
once this file is known to be running.

  the rail      one notehead per screen, built from the screens themselves
  the handover  each screen's opacity follows how much of it is on screen
  the reveal    a screen's contents rise into place when it arrives

The screens do not all exist at load. Everything that engraves is inside the
font loader, which is a <template> until the fonts are registered and only then
puts its contents in the document — so this watches for them rather than
assuming they are there.
*/

const REVEAL_THRESHOLD = 0.55

// Below this a screen counts as gone, rather than merely on its way out.
const AWAY = 0.08

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

document.body.setAttribute('data-enhanced', 'true')

// ── How much of a screen is on screen ────────────────────────────────────

/*
Enough thresholds that the opacity moves smoothly rather than in steps. This
is what makes two screens cross-fade instead of merely abut.
*/
const ratios = []
for (let step = 0; step <= 40; step += 1) {
  ratios.push(step / 40)
}

const handover = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const screen = entry.target
    screen.style.setProperty('--vis', String(entry.intersectionRatio))

    if (entry.intersectionRatio >= REVEAL_THRESHOLD) {
      screen.setAttribute('data-visible', 'true')
      current(screen.id)

      /*
      Once per arrival — and this guard is load bearing.

      The observer is watching forty-one thresholds so that screens can
      cross-fade, which means it reports many times a second all the while a
      screen is on its way past. Calling this on each of those tears the
      drawing down and writes it again every frame, which is not an animation
      but a stutter. It runs on arrival, and is armed again below once the
      screen has properly gone.
      */
      for (const host of screen.querySelectorAll('[data-phrase]')) {
        if (host.dataset.playing !== 'true') {
          host.dataset.playing = 'true'
          drawPhrase(host)
        }
      }
    } else {
      /*
      Only ever set to false before a screen has arrived. Once its contents
      have risen into place they stay there — a screen that flickered every
      time it was half scrolled past would be unreadable.
      */
      if (screen.getAttribute('data-visible') !== 'true') {
        screen.setAttribute('data-visible', 'false')
      }

      // Gone, rather than merely on the way out: worth seeing again on return.
      if (entry.intersectionRatio <= AWAY) {
        for (const host of screen.querySelectorAll('[data-phrase]')) {
          delete host.dataset.playing
        }
      }
    }
  }
}, { threshold: ratios })

// ── The engraved phrase ──────────────────────────────────────────────────

/*
The artwork is inlined rather than given to an <img>, because the stave lines
have to be staged one after another and an image has no parts. One fetch,
shared by however many places show it.
*/
let phraseMarkup = null

async function drawPhrase(host) {
  if (!phraseMarkup) {
    phraseMarkup = fetch('/images/phrase.svg').then((response) => {
      if (!response.ok) {
        throw new Error(String(response.status))
      }
      return response.text()
    })
  }

  let markup
  try {
    markup = await phraseMarkup
  } catch (error) {
    /*
    Decoration. If it is not there the screen is a heading and a sentence,
    which is the thing worth reading anyway.
    */
    return
  }

  /*
  Put back to the start without animating there.

  The wipe lives on this wrapper, which survives having its contents replaced,
  so simply clearing the attribute would run the wipe backwards for its full
  0.9s before it could run forwards again. Switching the transition off,
  committing that, and switching it back on is what makes the reset instant:
  a transition that is not there cannot play in reverse.
  */
  host.style.transition = 'none'
  host.removeAttribute('data-drawn')
  host.innerHTML = markup
  void host.offsetWidth
  host.style.transition = ''

  /*
  The stave rules itself top line first while the wipe travels, so the two
  gestures run together rather than one waiting on the other. The lines are
  numbered from the top by the generator, and every piece of the stave shares
  a number with the line it continues — so one delay per number brings a whole
  line in across the full width at once, however many pieces it is drawn in.
  */
  const PER_LINE = 70

  for (const line of host.querySelectorAll('[data-stave-line]')) {
    line.style.setProperty('--d', `${Number(line.dataset.staveLine) * PER_LINE}ms`)
  }

  // The starting state is already committed by the reflow above, so one frame
  // is enough for the transition to have something to run from.
  requestAnimationFrame(() => {
    host.setAttribute('data-drawn', 'true')
  })
}

// ── The feature carousel ─────────────────────────────────────────────────

/*
The row itself is an ordinary scroller — it works with a trackpad, a touch
screen and the keyboard before any of this runs. What is added is a pair of
buttons that move it by exactly one card, and a count so the reader knows how
many there are.
*/
function wireCarousel(carousel) {
  if (carousel.dataset.wired) {
    return
  }
  carousel.dataset.wired = 'true'

  const viewport = carousel.querySelector('[data-carousel-viewport]')
  const cards = [ ...carousel.querySelectorAll('[data-card]') ]
  const previous = carousel.querySelector('[data-carousel-prev]')
  const next = carousel.querySelector('[data-carousel-next]')
  const count = carousel.querySelector('[data-carousel-count]')
  if (!viewport || !cards.length) {
    return
  }

  /** Whichever card is nearest the middle of the viewport. */
  function currentIndex() {
    const middle = viewport.scrollLeft + viewport.clientWidth / 2
    let best = 0
    let bestGap = Infinity
    cards.forEach((card, index) => {
      const gap = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle)
      if (gap < bestGap) {
        bestGap = gap
        best = index
      }
    })
    return best
  }

  function go(index) {
    const card = cards[Math.max(0, Math.min(cards.length - 1, index))]
    viewport.scrollTo({
      left: card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth'
    })
  }

  function sync() {
    const index = currentIndex()
    count.textContent = `${index + 1} / ${cards.length}`
    previous.disabled = index === 0
    next.disabled = index === cards.length - 1
  }

  previous.addEventListener('click', () => go(currentIndex() - 1))
  next.addEventListener('click', () => go(currentIndex() + 1))
  viewport.addEventListener('scroll', sync, { passive: true })
  window.addEventListener('resize', sync)
  sync()
}

// ── The pipeline diagram ─────────────────────────────────────────────────

/*
The diagram and the prose beside it are one thing: pointing at a stage shows
what that stage is. The notes are stacked in a single grid cell, so only the
current one is visible and the column never changes height.
*/
function wireFlow(layout) {
  if (layout.dataset.wired) {
    return
  }
  layout.dataset.wired = 'true'

  const buttons = [ ...layout.querySelectorAll('[data-stage-button]') ]
  const notes = [ ...layout.querySelectorAll('[data-note-for]') ]
  if (!buttons.length || !notes.length) {
    return
  }

  // A stage's own name, or the particular output the button stands for.
  const keyOf = (button) =>
    button.dataset.output || button.closest('[data-stage]').dataset.stage

  function show(key) {
    for (const button of buttons) {
      button.setAttribute('aria-current', String(keyOf(button) === key))
    }
    for (const note of notes) {
      note.setAttribute('data-current', String(note.dataset.noteFor === key))
    }
  }

  for (const button of buttons) {
    button.addEventListener('mouseenter', () => show(keyOf(button)))
    button.addEventListener('focus', () => show(keyOf(button)))
    button.addEventListener('click', () => show(keyOf(button)))
  }

  // The stages arrive one after the other, so the pipeline is read downwards.
  layout.querySelectorAll('[data-flow] li').forEach((stage, index) => {
    stage.style.setProperty('--d', `${index * 130}ms`)
  })

  show(keyOf(buttons[0]))
}

// ── The rail ─────────────────────────────────────────────────────────────

const rail = document.querySelector('[data-rail]')
const known = new Set()

/*
Kept rather than read back off the dots, because the dots do not last: the rail
is rebuilt when the font loader puts the rest of the screens in, and the first
screen has usually been marked current by then. Its ratio does not change, so
the observer never reports it again, and without this the rebuilt rail would
show no screen as current until the reader scrolled.
*/
let currentId = null

function current(id) {
  currentId = id
  for (const dot of rail.children) {
    if (dot.getAttribute('href') === `#${id}`) {
      dot.setAttribute('aria-current', 'true')
    } else {
      dot.removeAttribute('aria-current')
    }
  }
}

/*
Runs again whenever screens appear. Each screen is taken up once, and the rail
is rebuilt in document order so a screen that arrives late still lands in the
right place rather than on the end.
*/
function take() {
  const screens = document.querySelectorAll('[data-screen]')
  let added = false

  for (const screen of screens) {
    if (known.has(screen)) {
      continue
    }
    known.add(screen)
    handover.observe(screen)
    added = true

    for (const carousel of screen.querySelectorAll('[data-carousel]')) {
      wireCarousel(carousel)
    }
    for (const layout of screen.querySelectorAll('[data-flow-layout]')) {
      wireFlow(layout)
    }
  }

  if (!added) {
    return
  }

  const dots = document.createDocumentFragment()
  for (const screen of screens) {
    const dot = document.createElement('a')
    dot.href = `#${screen.id}`
    dot.setAttribute('data-label', screen.getAttribute('data-label') || screen.id)
    dot.setAttribute('aria-label', screen.getAttribute('data-label') || screen.id)
    dots.appendChild(dot)
  }
  rail.replaceChildren(dots)

  if (currentId) {
    current(currentId)
  }
}

take()

/*
The font loader replaces itself with its contents, so the screens inside it
turn up as one insertion some time after load. Watching the body is the only
signal there is — the component offers no event.
*/
const appearing = new MutationObserver(() => {
  take()
})
appearing.observe(document.body, { childList: true, subtree: true })

// ── Moving between screens ───────────────────────────────────────────────

rail.addEventListener('click', (event) => {
  const dot = event.target.closest('a[href^="#"]')
  if (!dot) {
    return
  }
  const screen = document.getElementById(dot.getAttribute('href').slice(1))
  if (!screen) {
    return
  }
  event.preventDefault()
  screen.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
})

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]')
  if (!link || link.closest('[data-rail]')) {
    return
  }
  const screen = document.getElementById(link.getAttribute('href').slice(1))
  if (!screen) {
    return
  }
  event.preventDefault()
  screen.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
})

// The scroll hint has said what it has to say as soon as the reader scrolls.
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    document.body.setAttribute('data-scrolled', 'true')
  }
}, { passive: true })
