'use strict'

export default function (noteOrKey) {
  let staveIndex = noteOrKey.staveIndex
  if (noteOrKey.stave === 'prev') {
    staveIndex -= 1
  } else if (noteOrKey.stave === 'next') {
    staveIndex += 1
  }
  return staveIndex
}
