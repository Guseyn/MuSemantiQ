/**
 * In-place repainting of a block of lines.
 *
 * Two rules make the cursor arithmetic exact:
 *
 * 1. Every line is truncated to `columns - 1` cells, so one logical line is
 *    always one physical row. That removes wrapping from the maths entirely,
 *    and avoids the case where a line of exactly `columns` width leaves the
 *    cursor ambiguously at the end of one row or the start of the next.
 * 2. The painted width of each line is remembered, so the number of rows the
 *    frame occupies can be recomputed at the *current* width. This is what
 *    makes resizing correct: by the time the resize event arrives the terminal
 *    has already reflowed the screen, so a stored row count would be a lie.
 */
import { displayWidth, truncateToWidth } from './width.js'

const CSI = '\x1b['

export class Frame {
  constructor(output) {
    this.output = output
    this.widths = []
    this.cursorRow = 0
  }

  get columns() {
    // A pty can report 0, which would make the row division infinite.
    return this.output.columns || 80
  }

  get rows() {
    return this.output.rows || 24
  }

  /** Rows the painted frame occupies at the current width. */
  occupiedRows() {
    const columns = this.columns
    let rows = 0
    for (const width of this.widths) {
      rows += Math.max(1, Math.ceil(width / columns))
    }
    return rows
  }

  /**
   * Repaint. Never emit more than `rows - 1` lines: erase-down only clears
   * from the cursor onwards, so a frame taller than the viewport scrolls its
   * own top row off screen where cursor-up can no longer reach it, leaving
   * permanent debris.
   *
   * @param {string[]} lines
   * @param {{row: number, column: number}} [cursor] 0-based; column in cells
   */
  render(lines, cursor) {
    const columns = this.columns
    const limit = Math.max(1, this.rows - 1)
    const visible = lines.slice(0, limit)
    const painted = visible.map((line) => truncateToWidth(line, columns - 1))

    let out = ''
    if (this.widths.length > 0) {
      out += '\r'
      if (this.cursorRow > 0) {
        out += `${CSI}${this.cursorRow}A`
      }
      out += `${CSI}0J`
    }
    out += painted.join('\n')

    const lastRow = Math.max(0, painted.length - 1)
    const row = cursor ? Math.min(Math.max(cursor.row, 0), lastRow) : lastRow
    if (row < lastRow) {
      out += `${CSI}${lastRow - row}A`
    }
    out += '\r'
    if (cursor && cursor.column > 0) {
      out += `${CSI}${cursor.column + 1}G`
    }

    this.widths = painted.map(displayWidth)
    this.cursorRow = row
    // One write per frame: no tearing, no flicker.
    this.output.write(out)
  }

  /** Erase the frame, leaving the cursor where the frame began. */
  erase() {
    if (this.widths.length === 0) {
      return
    }
    let out = '\r'
    if (this.cursorRow > 0) {
      out += `${CSI}${this.cursorRow}A`
    }
    out += `${CSI}0J`
    this.output.write(out)
    this.widths = []
    this.cursorRow = 0
  }

  /**
   * Replace the frame with its final form and move below it, so the answer
   * stays in the scrollback instead of being erased.
   */
  commit(lines) {
    this.erase()
    const columns = this.columns
    const painted = lines.map((line) => truncateToWidth(line, columns - 1))
    this.output.write(painted.join('\n') + '\n')
    this.widths = []
    this.cursorRow = 0
  }
}

/**
 * Coalesces repaint requests into one per turn of the event loop. A large paste
 * arrives as thousands of keypresses; repainting on each one is unusable.
 *
 * `cancel` must be called when a prompt finishes: a repaint still queued at
 * that point would run after the final frame was committed and redraw the
 * question underneath the answer.
 */
export function renderScheduler(paint) {
  let handle = null
  const schedule = () => {
    if (handle) {
      return
    }
    handle = setImmediate(() => {
      handle = null
      paint()
    })
  }
  schedule.cancel = () => {
    if (handle) {
      clearImmediate(handle)
      handle = null
    }
  }
  return schedule
}
