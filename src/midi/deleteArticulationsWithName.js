'use strict'

export default function (note, articulationName) {
  if (!note.articulationParams) {
    return undefined
  }
  const articulationsParams = note.articulationParams.filter(
    articulationParam => articulationParam.name !== articulationName
  )
  note.articulationParam = articulationsParams
}
