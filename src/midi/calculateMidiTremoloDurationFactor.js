'use strict'

export default function (tremoloParams) {
  const isTremolo = typeof tremoloParams === 'object' && tremoloParams !== null
  let isTremoloSingle = false
  if (isTremolo) {
    if (tremoloParams.type === 'single') {
      isTremoloSingle = true
    }
  }
  if (isTremolo) {
    if (isTremoloSingle) {
      return 1
    }
    return 1 / 2
  }
  return 1
}
