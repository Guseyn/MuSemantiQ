export default (textarea) => {
  textarea.addEventListener('keydown', (event) => {
    /*
      A key someone has already handled is left alone: Enter taking an
      autocomplete suggestion is not the start of a new line, and scrolling to
      the start of one would take the view away from the word just completed.
    */
    if (event.key === 'Enter' && !event.defaultPrevented) {
      textarea.scrollLeft = 0
    }
  })
}
