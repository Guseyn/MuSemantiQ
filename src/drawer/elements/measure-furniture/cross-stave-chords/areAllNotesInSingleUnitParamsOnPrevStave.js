'use strict'

export default function (singleUnitParams) {
  return singleUnitParams.notes.every(note => note.stave === 'prev')
}
