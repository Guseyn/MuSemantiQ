import createdElementWithStylesAndAttributes from '#msq/web-components/editor/createdElementWithStylesAndAttributes.js'

/*
Popover has been in Chromium and Firefox since 2023, and the components are
customized built-ins, which WebKit does not support at all — so this is close to
always true. Where it is not, the list falls back to being shown and hidden by
display, which is what it did before, and is wrong only inside a dialog.
*/
const POPOVER_IS_SUPPORTED = typeof HTMLElement !== 'undefined' &&
  typeof HTMLElement.prototype.showPopover === 'function'

/**
 * The popup is a listbox owned by the textarea, which acts as the combobox.
 * The textarea keeps focus the whole time and the selection moves with
 * aria-activedescendant, so opening the list never moves the caret.
 *
 * Open/close and the selected option go through the helpers below rather than
 * being poked directly, so the ARIA state cannot drift from what is on screen.
 */
export default (textarea) => {
  const autocompleteListView = createdElementWithStylesAndAttributes(
    'div',
    {
      /*
      Hidden to start with — but never inline when it is a popover. The rule that
      hides a closed popover is a UA one, `[popover]:not(:popover-open)`, and an
      inline `display` beats it: the list would stay hidden after showPopover().
      Closed popovers are hidden by the UA anyway, so there is nothing to say
      here.
      */
      ...(POPOVER_IS_SUPPORTED ? {} : { 'display': 'none' }),
      /*
      Positioned against the viewport, not against the editor.

      The text container and the wrapper around it both hide their overflow, so
      anything placed inside them is cropped at the edge of a 270px box — which
      is what cut the list off. Fixed is what takes it out of both.
      */
      'position': 'fixed'
    },
    {
      'data-autocomplete': '',
      'id': `msq-autocomplete-${crypto.randomUUID()}`,
      'role': 'listbox',
      'aria-label': 'Completions',
      /*
      A popover, which is what keeps `fixed` meaning the viewport.

      An element with a transform is the containing block for its fixed-position
      descendants, and e-ui centres a dialog with `translate(-50%, -50%)`. Inside
      one, the coordinates below — measured from the viewport — were being read
      against the dialog's own box, so the list appeared offset by the dialog's
      top-left and was then clipped by its `overflow: hidden`. A popover is
      promoted to the top layer, where the viewport is the containing block again
      whatever the ancestors do, and where nothing can clip it. It is also
      promoted after the dialog, so it draws above it.
      */
      ...(POPOVER_IS_SUPPORTED ? { 'popover': 'manual' } : {})
    }
  )
  textarea.setAttribute('role', 'combobox')
  textarea.setAttribute('aria-expanded', 'false')
  textarea.setAttribute('aria-autocomplete', 'list')
  textarea.setAttribute('aria-controls', autocompleteListView.id)
  /*
  At the top of the shadow root rather than inside the text container: the
  styles are adopted by the root, so the rules still reach it, and out here no
  ancestor of the editor's own making can clip it.
  */
  textarea.getRootNode().appendChild(autocompleteListView)

  /*
  Fixed coordinates are a snapshot of where the caret was. Anything that moves
  the editor under the list — the page scrolling, the window resizing — makes
  them a lie, and a list pointing at the wrong word is worse than no list.

  The textarea scrolling is not one of those things: it scrolls as you type, and
  the very next keystroke places the list again.
  */
  const closeIfStillOpen = (event) => {
    if (event && event.target === textarea) {
      return
    }
    if (isAutocompleteListViewOpened(autocompleteListView)) {
      closeAutocompleteListView(autocompleteListView, textarea)
    }
  }
  window.addEventListener('scroll', closeIfStillOpen, { capture: true, passive: true })
  window.addEventListener('resize', closeIfStillOpen, { passive: true })

  return autocompleteListView
}

export const isAutocompleteListViewOpened = (autocompleteListView) => {
  return POPOVER_IS_SUPPORTED
    ? autocompleteListView.matches(':popover-open')
    : autocompleteListView.style.display !== 'none'
}

export const openAutocompleteListView = (autocompleteListView, textarea) => {
  if (POPOVER_IS_SUPPORTED) {
    /*
    Showing an open popover throws, and the list is opened on every keystroke
    that finds completions — so the second one would be an error rather than a
    no-op.
    */
    if (!autocompleteListView.matches(':popover-open')) {
      autocompleteListView.showPopover()
    }
  } else {
    autocompleteListView.style.display = ''
  }
  textarea.setAttribute('aria-expanded', 'true')
}

export const closeAutocompleteListView = (autocompleteListView, textarea) => {
  if (POPOVER_IS_SUPPORTED) {
    if (autocompleteListView.matches(':popover-open')) {
      autocompleteListView.hidePopover()
    }
  } else {
    autocompleteListView.style.display = 'none'
  }
  textarea.setAttribute('aria-expanded', 'false')
  textarea.removeAttribute('aria-activedescendant')
}

/**
 * Moves the selection to `optionIndex`, which is also what the textarea points
 * aria-activedescendant at. Options carry an id only for that purpose.
 */
export const selectOptionInAutocompleteListView = (autocompleteListView, textarea, optionIndex) => {
  const previousOption = autocompleteListView.childNodes[autocompleteListView.optionIndex]
  if (previousOption) {
    previousOption.classList.remove('selected')
    previousOption.setAttribute('aria-selected', 'false')
  }
  autocompleteListView.optionIndex = optionIndex
  const option = autocompleteListView.childNodes[optionIndex]
  if (!option) {
    textarea.removeAttribute('aria-activedescendant')
    return
  }
  option.classList.add('selected')
  option.setAttribute('aria-selected', 'true')
  option.scrollIntoView({ block: 'nearest' })
  textarea.setAttribute('aria-activedescendant', option.id)
}
