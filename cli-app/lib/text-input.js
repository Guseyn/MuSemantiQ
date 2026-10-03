/**
 * One-line text field with Tab completion for filesystem paths.
 *
 * The buffer is a list of grapheme clusters rather than a string, so Backspace
 * over an emoji or an accented character removes the whole character instead of
 * half of it.
 */
import { acquire, restore } from './session.js'
import { Frame, renderScheduler } from './frame.js'
import {
  onKey, isSubmit, isAbortKey, isTab, isBackspace, isDelete,
  isLeft, isRight, isLineStart, isLineEnd,
  isKillToStart, isKillToEnd, isKillWord, isPasteStart, isPasteEnd
} from './keys.js'
import { PromptAbortError } from './errors.js'
import { accent, muted, heading, success } from './colors.js'
import { graphemes, displayWidth, padToWidth } from './width.js'
import { completePath } from './path-complete.js'

/**
 * @param {Object} options
 * @param {string} options.message
 * @param {string} [options.initial]
 * @param {string} [options.hint]         shown under the field
 * @param {boolean} [options.completePaths]
 * @param {(value: string) => (string|undefined|Promise<string|undefined>)} [options.validate]
 *   returns an error message to reject, or nothing to accept
 * @param {string} [options.flag]
 * @returns {Promise<string>}
 */
export async function textInput({
  message,
  initial = '',
  hint,
  completePaths = false,
  validate,
  flag,
  input = process.stdin,
  output = process.stdout
}) {
  /*
   * Unlike a list, this is a field being typed into, so the terminal's own
   * caret is left visible — the frame parks it at the insertion point on every
   * repaint.
   */
  const session = acquire({ input, output, flag, hideCursor: false, blinkingCaret: true })
  const frame = new Frame(output)
  let unsubscribe = () => {}

  let buffer = graphemes(initial)
  let cursor = buffer.length
  let scrollLeft = 0
  let candidates = []
  let problem = null
  let pasteBuffer = null
  let submitted = null

  const promptText = `${message} `
  const promptWidth = displayWidth(promptText)

  const value = () => buffer.join('')
  const widthBefore = (index) => displayWidth(buffer.slice(0, index).join(''))

  const build = () => {
    const columns = frame.columns
    const available = Math.max(8, columns - 1 - promptWidth)
    const cursorCells = widthBefore(cursor)

    // Scroll horizontally rather than wrapping, so one logical line stays one
    // physical row and the repaint arithmetic holds.
    if (cursorCells < scrollLeft) {
      scrollLeft = cursorCells
    } else if (cursorCells > scrollLeft + available - 1) {
      scrollLeft = cursorCells - available + 1
    }
    scrollLeft = Math.max(0, scrollLeft)

    let shown = ''
    let cells = 0
    for (const grapheme of buffer) {
      const width = displayWidth(grapheme)
      if (cells + width > scrollLeft && cells < scrollLeft + available) {
        shown += grapheme
      }
      cells += width
    }

    const lines = [ `${heading(promptText)}${shown}` ]
    if (problem) {
      lines.push(`  ${accent('!')} ${problem}`)
    }
    if (candidates.length > 0) {
      lines.push(...candidateLines(candidates, columns, frame.rows))
    }
    if (hint && !problem && candidates.length === 0) {
      lines.push(muted(`  ${hint}`))
    }

    return {
      lines,
      cursor: { row: 0, column: promptWidth + cursorCells - scrollLeft }
    }
  }

  const paint = () => {
    const { lines, cursor: position } = build()
    frame.render(lines, position)
  }
  const schedule = renderScheduler(paint)

  const insert = (text) => {
    const inserted = graphemes(text)
    buffer = [ ...buffer.slice(0, cursor), ...inserted, ...buffer.slice(cursor) ]
    cursor += inserted.length
    candidates = []
    problem = null
  }

  const runCompletion = async () => {
    const current = value()
    const result = await completePath(current)
    if (result.completed !== current) {
      buffer = graphemes(result.completed)
      cursor = buffer.length
      candidates = []
    } else if (result.atPrefix && result.candidates.length > 1) {
      candidates = result.candidates
    }
    schedule()
  }

  const trySubmit = async (resolve, reject) => {
    const current = value()
    if (validate) {
      try {
        const message = await validate(current)
        if (message) {
          problem = message
          candidates = []
          schedule()
          return
        }
      } catch (error) {
        reject(error)
        return
      }
    }
    submitted = current
    resolve(current)
  }

  try {
    return await new Promise((resolve, reject) => {
      unsubscribe = onKey(session.input, (key) => {
        // A pasted path arrives one character at a time, newlines included;
        // collecting it and inserting once stops those newlines submitting.
        if (isPasteStart(key)) {
          pasteBuffer = ''
          return
        }
        if (isPasteEnd(key)) {
          const text = (pasteBuffer || '').replace(/\r\n?|\n/g, ' ').replace(/\t/g, ' ')
          pasteBuffer = null
          if (text) {
            insert(text)
            schedule()
          }
          return
        }
        if (pasteBuffer !== null) {
          pasteBuffer += key.seq
          return
        }

        if (isAbortKey(key)) {
          reject(new PromptAbortError())
          return
        }
        if (isSubmit(key)) {
          trySubmit(resolve, reject)
          return
        }
        if (isTab(key) && completePaths) {
          runCompletion()
          return
        }
        if (isBackspace(key)) {
          if (cursor > 0) {
            buffer.splice(cursor - 1, 1)
            cursor--
          }
        } else if (isDelete(key)) {
          if (cursor < buffer.length) {
            buffer.splice(cursor, 1)
          }
        } else if (isLeft(key)) {
          cursor = Math.max(0, cursor - 1)
        } else if (isRight(key)) {
          cursor = Math.min(buffer.length, cursor + 1)
        } else if (isLineStart(key)) {
          cursor = 0
        } else if (isLineEnd(key)) {
          cursor = buffer.length
        } else if (isKillToStart(key)) {
          buffer = buffer.slice(cursor)
          cursor = 0
        } else if (isKillToEnd(key)) {
          buffer = buffer.slice(0, cursor)
        } else if (isKillWord(key)) {
          // For a path field a separator is a word boundary, which is what
          // people expect when deleting back through a directory name.
          let end = cursor
          while (end > 0 && /[\s/\\]/.test(buffer[end - 1])) {
            end--
          }
          while (end > 0 && !/[\s/\\]/.test(buffer[end - 1])) {
            end--
          }
          buffer.splice(end, cursor - end)
          cursor = end
        } else if (key.char) {
          insert(key.char)
        } else {
          return
        }
        candidates = []
        problem = null
        schedule()
      })

      session.onResize(schedule)
      paint()
    })
  } finally {
    unsubscribe()
    schedule.cancel()
    if (submitted !== null) {
      const shown = submitted === '' ? muted('(default)') : success(submitted)
      frame.commit([ `${heading(promptText)}${shown}` ])
    } else {
      frame.erase()
    }
    restore()
  }
}

/** Candidate names in columns, clipped to what the viewport can show. */
function candidateLines(candidates, columns, rows) {
  const widest = Math.max(...candidates.map((name) => displayWidth(name)))
  const columnWidth = widest + 2
  const perRow = Math.max(1, Math.floor((columns - 3) / columnWidth))
  const maxRows = Math.max(1, rows - 4)

  const lines = []
  for (let i = 0; i < candidates.length; i += perRow) {
    if (lines.length >= maxRows) {
      lines.push(muted(`  … and ${candidates.length - i} more`))
      break
    }
    const row = candidates.slice(i, i + perRow).map((name) => padToWidth(name, columnWidth))
    lines.push('  ' + muted(row.join('').trimEnd()))
  }
  return lines
}
