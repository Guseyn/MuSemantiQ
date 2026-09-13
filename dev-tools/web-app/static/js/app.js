/*
Plain globals for the dev tool pages.

Not a module on purpose: HTML attributes and `onclick` strings are evaluated in
global scope, so anything they call has to live there. This is the same shape the
other apps on this stack use.
*/

/**
 * The two toasts the layout carries, told apart by the type they were given.
 */
function toastOfType(type) {
  return document.querySelector(`e-toast[data-type="${type}"]`)
}

window.showToast = function (message) {
  const toast = toastOfType('success')
  if (toast) {
    toast.open(message)
  } else {
    console.log(message)
  }
}

window.showError = function (message) {
  const toast = toastOfType('error')
  if (toast) {
    toast.open(message)
  } else {
    console.error(message)
  }
}

window.confirmAction = function (message, confirmText, cancelText) {
  const confirm = document.querySelector('e-confirm')
  return confirm
    ? confirm.call(message, confirmText || 'Yes', cancelText || 'Cancel')
    : Promise.resolve(window.confirm(message))
}

/**
 * Wait for a node the page's layout has not inserted yet.
 *
 * The pages put their content inside an `e-wrapper`, which fetches the shared
 * layout before placing anything, so a module running at load time cannot assume
 * its own markup is in the document.
 */
window.whenPresent = function (selector) {
  const existing = document.querySelector(selector)
  if (existing) {
    return Promise.resolve(existing)
  }
  return new Promise((resolve) => {
    new MutationObserver((records, observer) => {
      const found = document.querySelector(selector)
      if (found) {
        observer.disconnect()
        resolve(found)
      }
    }).observe(document.body, { childList: true, subtree: true })
  })
}

/**
 * Bytes, said the way a person reads them.
 */
window.readableBytes = function (bytes) {
  if (bytes === null || bytes === undefined) {
    return '—'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
