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
 * Send one file to an endpoint as the request body, reporting progress.
 *
 * EHTML's form would do this on its own, but it reads a file with a FileReader
 * into a base64 data URL first — fine for a font of a few hundred kilobytes,
 * impossible for a General MIDI soundbank, which is commonly 310 MB and would
 * become a ~415 MB string in the tab before the request even started. So a file
 * that big is handed to fetch as it is and streamed straight through.
 */
window.uploadFile = function (url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('POST', `${url}${url.includes('?') ? '&' : '?'}name=${encodeURIComponent(file.name)}`)
    request.setRequestHeader('content-type', 'application/octet-stream')
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100))
      }
    })
    request.addEventListener('load', () => {
      try {
        resolve({ status: request.status, body: JSON.parse(request.responseText) })
      } catch {
        reject(new Error(`the server answered ${request.status}`))
      }
    })
    request.addEventListener('error', () => reject(new Error('the upload failed')))
    request.send(file)
  })
}

/**
 * Ask an <e-json> to fetch again, every so many seconds, for as long as the
 * page says to. Used to watch work that outlives the request that started it.
 */
window.keepRefreshing = function (selector, seconds) {
  const node = document.querySelector(selector)
  if (!node || node.refreshing) {
    return
  }
  node.refreshing = setInterval(() => node.trigger(), seconds * 1000)
}

window.stopRefreshing = function (selector) {
  const node = document.querySelector(selector)
  if (node && node.refreshing) {
    clearInterval(node.refreshing)
    node.refreshing = null
  }
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
