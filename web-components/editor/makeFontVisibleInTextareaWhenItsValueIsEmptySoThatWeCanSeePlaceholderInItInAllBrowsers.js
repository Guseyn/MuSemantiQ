const makePlaceholderVisibleOrNotVisibleDependingOnTextareaValue = (textarea) => {
  if (textarea.value.length === 0) {
    textarea.classList.add('with-visible-text')
  } else {
    textarea.classList.remove('with-visible-text')
  }
}

export default (textarea) => {
  makePlaceholderVisibleOrNotVisibleDependingOnTextareaValue(textarea)
  textarea.addEventListener('input', () => {
    makePlaceholderVisibleOrNotVisibleDependingOnTextareaValue(textarea)
  })
}
