export default (textarea) => {
  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      textarea.scrollLeft = 0
    }
  })
}
