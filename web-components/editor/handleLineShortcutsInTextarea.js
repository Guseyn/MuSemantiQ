import theCommandKeyIsHeld from '#msq/editor/theCommandKeyIsHeld.js'

/**
 * Cut, copy and paste a whole line without selecting it first.
 *
 * Cmd/Ctrl+X and Cmd/Ctrl+C do nothing useful in a textarea when nothing is
 * selected, so that is the state these take over: they act on the line the
 * caret is in. A line taken this way pastes back as a line — on its own, below
 * the one you are in — rather than being spliced into the middle of it, which
 * is what makes moving a line around two keystrokes instead of four.
 *
 * Cut and copy are done by selecting the line and letting the browser do the
 * rest. That puts the line on the real clipboard, so it pastes into any other
 * program, and a native cut deletes it in a way that Cmd+Z can undo. Paste is
 * ours, because where the line goes is the whole point — but only when the line
 * in hand is one we put there. Anything copied from anywhere else pastes as it
 * always did.
 */
export default (textarea) => {
  /*
  The line we last took, and nothing more. The clipboard itself cannot be read
  back without a permission the page may not have — and asking would be worse
  than the feature — so what is remembered here is the claim "the clipboard
  currently holds this line, because we just put it there".

  It is dropped the moment anything else is copied or cut, including by another
  editor on the page, so a stale claim cannot outlive the truth.
  */
  let lineInHand = null

  const lineAround = (position) => {
    const value = textarea.value
    const start = value.lastIndexOf('\n', position - 1) + 1
    const ends = value.indexOf('\n', position)
    return { start, end: ends === -1 ? value.length : ends, value }
  }

  /*
  A line is taken with its newline, so pasting it back cannot weld two lines
  together. The last line of the file has none, and then the newline before it
  is taken instead — otherwise cutting it would leave a blank line behind.
  */
  const spanToTake = (position) => {
    const { start, end, value } = lineAround(position)
    if (end < value.length) {
      return { from: start, to: end + 1, text: value.slice(start, end + 1) }
    }
    return {
      from: start === 0 ? start : start - 1,
      to: end,
      text: `${value.slice(start, end)}\n`
    }
  }

  textarea.addEventListener('keydown', (event) => {
    if (!theCommandKeyIsHeld(event) || event.altKey || event.shiftKey) {
      return
    }
    const key = event.key.toLowerCase()
    const nothingIsSelected = textarea.selectionStart === textarea.selectionEnd

    if ((key === 'x' || key === 'c') && nothingIsSelected) {
      const taken = spanToTake(textarea.selectionStart)
      if (!taken.text.trim() && taken.from === taken.to) {
        return
      }
      /*
      Selected, then handed to the browser: not prevented, so the native cut or
      copy runs over this selection, and the caret is put back afterwards by the
      listeners below. Where it was is remembered rather than worked out again —
      the selection about to be made can start on the newline that ends the line
      before, which no longer says where we were.
      */
      textarea.wasTakenAsAWholeLine = { caret: textarea.selectionStart }
      textarea.setSelectionRange(taken.from, taken.to)
      lineInHand = taken.text
      return
    }

    if (key === 'v' && lineInHand !== null && nothingIsSelected) {
      event.preventDefault()
      pasteAsALine(lineInHand)
    }
  })

  /*
  What the browser did with the selection we made for it. A copy leaves the text
  where it was, so the caret has to be put back on the character it was on; a
  cut removes the line, and the caret lands at the start of what followed, which
  is where it should be.
  */
  const putTheCaretBack = () => {
    const taken = textarea.wasTakenAsAWholeLine
    textarea.wasTakenAsAWholeLine = null
    if (!taken) {
      return
    }
    // A copy changes nothing, so where the caret was is still where it goes.
    textarea.setSelectionRange(taken.caret, taken.caret)
  }

  textarea.addEventListener('copy', () => {
    if (textarea.wasTakenAsAWholeLine) {
      // After the browser has read the selection, not before.
      requestAnimationFrame(putTheCaretBack)
    }
  })

  textarea.addEventListener('cut', () => {
    // The cut removes the selection itself; only the marker has to go.
    textarea.wasTakenAsAWholeLine = null
  })

  /*
  Anything copied that is not a whole line takes the line out of our hands, so
  the next paste is the browser's again. `paste` is not listened for: a paste we
  did not handle is one the browser is already handling correctly.
  */
  const forgetTheLine = (event) => {
    if (!textarea.wasTakenAsAWholeLine) {
      lineInHand = null
    }
    return event
  }
  document.addEventListener('copy', forgetTheLine, true)
  document.addEventListener('cut', forgetTheLine, true)

  /**
   * Put the line below the one the caret is in, and keep the column.
   *
   * `execCommand` rather than assigning `value`: it fires a real `input` event,
   * which is what the highlight layer, the line-number gutter and the rest of
   * the editor listen to, and it leaves the change on the undo stack. Setting
   * `value` would do neither, and every one of those would have to be called by
   * hand and still not be undoable.
   */
  function pasteAsALine(line) {
    const { start, end, value } = lineAround(textarea.selectionStart)
    const column = textarea.selectionStart - start

    const text = line.endsWith('\n') ? line : `${line}\n`
    /*
    The last line has no newline after it, so one is written before the pasted
    line rather than after — the file gains a line either way, and this way it
    does not gain a trailing blank one.
    */
    const atTheEnd = end >= value.length
    const inserted = atTheEnd ? `\n${text.slice(0, -1)}` : text

    textarea.setSelectionRange(atTheEnd ? end : end + 1, atTheEnd ? end : end + 1)
    const wrote = document.execCommand('insertText', false, inserted)

    if (!wrote) {
      // Refused — leave the text alone rather than writing it somewhere wrong.
      textarea.setSelectionRange(start + column, start + column)
      return
    }

    const landed = lineAround(
      atTheEnd ? end + inserted.length : end + 1 + inserted.length - 1
    )
    const caret = landed.start + Math.min(column, landed.end - landed.start)
    textarea.setSelectionRange(caret, caret)
  }
}
