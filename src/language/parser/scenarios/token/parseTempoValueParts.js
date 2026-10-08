'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import tempoDurationParts from '#msq/language/parser/scenarios/static-objects/tempoDurationParts.js'

const numericDurations = [ '1', '1/2', '1/4', '1/8', '1/16', '1/32', '1/64' ]

export default function (tempoValue) {
  const rowTempoValueParts = tempoValue.split(regexps.tempoDurationPart)
  const tempoValueParts = []
  for (let index = 0; index < rowTempoValueParts.length; index++) {
    const tempoValuePart = rowTempoValueParts[index]
    const tempoValuePartKey = (numericDurations.indexOf(tempoValuePart) !== -1)
      ? `${tempoValuePart}(?!\\d|/)`
      : tempoValuePart
    if (tempoDurationParts[tempoValuePartKey]) {
      if (
        rowTempoValueParts[index + 1] !== undefined &&
        /^\s{0,1}$/.test(rowTempoValueParts[index + 1]) &&
        rowTempoValueParts[index + 2] !== undefined &&
        (
          rowTempoValueParts[index + 2] === 'dotted' ||
          rowTempoValueParts[index + 2] === 'with dot'
        )
      ) {
        index += 2
        tempoValueParts.push(`${tempoDurationParts[tempoValuePartKey]}Dotted`)
      } else {
        tempoValueParts.push(tempoDurationParts[tempoValuePartKey])
      }
    } else {
      tempoValueParts.push(tempoValuePart)
    }
  }
  return tempoValueParts
}
