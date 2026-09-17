/**
 * Copies text and briefly swaps the clicked button's icon for confirmation.
 *
 * Uses a throwaway textarea plus execCommand rather than the async clipboard
 * API, because that one needs a secure context and a permission the page may
 * not have.
 */
export default function copyText({ event, text, onCopyInnerHTML }) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.top = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  const target = event.currentTarget
  const initialText = target.innerHTML
  target.innerHTML = onCopyInnerHTML || 'Copied &#10003;'
  setTimeout(() => {
    target.innerHTML = initialText
  }, 1500)
}
