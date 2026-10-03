/**
 * Single-choice list: arrow keys move, Enter chooses.
 */
import { acquire, restore } from './session.js'
import { Frame, renderScheduler } from './frame.js'
import { onKey, isSubmit, isAbortKey, isUp, isDown, isPasteStart, isPasteEnd } from './keys.js'
import { PromptAbortError } from './errors.js'
import { accent, muted, heading, success } from './colors.js'

const POINTER = '❯'

/**
 * @param {Object} options
 * @param {string} options.message
 * @param {Array<{label: string, value: *, hint?: string}>} options.choices
 * @param {number} [options.initialIndex]
 * @param {string} [options.flag] the option that answers this without a prompt
 * @returns {Promise<*>} the chosen `value`
 */
export async function select({
  message,
  choices,
  initialIndex = 0,
  flag,
  input = process.stdin,
  output = process.stdout
}) {
  if (choices.length === 0) {
    throw new Error('select() needs at least one choice')
  }

  const session = acquire({ input, output, flag })
  const frame = new Frame(output)
  let unsubscribe = () => {}

  let index = Math.min(Math.max(initialIndex, 0), choices.length - 1)
  let offset = 0
  let pasting = false
  let chosen = null

  const visibleCount = () => {
    // Two rows are reserved: the message, and the hint line below the list.
    return Math.max(1, Math.min(choices.length, frame.rows - 3))
  }

  const clampOffset = () => {
    const visible = visibleCount()
    if (index < offset) {
      offset = index
    } else if (index >= offset + visible) {
      offset = index - visible + 1
    }
    offset = Math.max(0, Math.min(offset, Math.max(0, choices.length - visible)))
  }

  const build = () => {
    clampOffset()
    const visible = visibleCount()
    const lines = [ heading(message) ]
    const end = Math.min(choices.length, offset + visible)

    if (offset > 0) {
      lines.push(muted(`   ${offset} more above`))
    }
    for (let i = offset; i < end; i++) {
      const choice = choices[i]
      const selected = i === index
      const gutter = selected ? accent(` ${POINTER} `) : '   '
      const label = selected ? accent(choice.label) : choice.label
      const hint = choice.hint ? ' ' + muted(choice.hint) : ''
      lines.push(`${gutter}${label}${hint}`)
    }
    if (end < choices.length) {
      lines.push(muted(`   ${choices.length - end} more below`))
    }
    lines.push(muted('   ↑↓ to move, Enter to choose, Ctrl-C to cancel'))
    return lines
  }

  const paint = () => frame.render(build())
  const schedule = renderScheduler(paint)

  try {
    return await new Promise((resolve, reject) => {
      unsubscribe = onKey(session.input, (key) => {
        // A paste into a list must not be able to select an entry and then
        // spill the remaining lines into whatever prompt comes next.
        if (isPasteStart(key)) {
          pasting = true
          return
        }
        if (isPasteEnd(key)) {
          pasting = false
          return
        }
        if (pasting) {
          return
        }

        if (isAbortKey(key)) {
          reject(new PromptAbortError())
          return
        }
        if (isSubmit(key)) {
          chosen = choices[index]
          resolve(chosen.value)
          return
        }
        if (isUp(key)) {
          index = (index - 1 + choices.length) % choices.length
          schedule()
          return
        }
        if (isDown(key)) {
          index = (index + 1) % choices.length
          schedule()
          return
        }
        if (key.name === 'pageup') {
          index = Math.max(0, index - visibleCount())
          schedule()
          return
        }
        if (key.name === 'pagedown') {
          index = Math.min(choices.length - 1, index + visibleCount())
          schedule()
          return
        }
        if (key.name === 'home' || (key.char === 'g' && !key.shift)) {
          index = 0
          schedule()
          return
        }
        if (key.name === 'end' || key.char === 'G') {
          index = choices.length - 1
          schedule()
        }
      })

      session.onResize(schedule)
      paint()
    })
  } finally {
    unsubscribe()
    schedule.cancel()
    // Only record an answer that was actually given — on abort the frame is
    // simply erased, so the transcript never shows a choice the user declined.
    if (chosen) {
      frame.commit([ `${heading(message)} ${success(chosen.label)}` ])
    } else {
      frame.erase()
    }
    restore()
  }
}
