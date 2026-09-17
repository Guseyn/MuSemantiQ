export default (textarea) => {
  textarea.addEventListener('input', () => {
    if (textarea.selectionStart === textarea.value.length) {
      textarea.scrollTop = textarea.scrollHeight
    }
  })
}
