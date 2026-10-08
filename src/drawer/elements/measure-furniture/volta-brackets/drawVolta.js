'use strict'

import createPolyline from '#msq/drawer/elements/basic/createPolyline.js'
import createText from '#msq/drawer/elements/basic/createText.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (voltaStructure, styles) {
  const { voltaColumnHeight, voltaStrokeOptions, voltaValueFontOptions, voltaValueLeftOffset, voltaValueTopOffset, intervalBetweenStaveLines } = styles
  const voltaComponents = []
  const voltaShapePoints = []
  if (voltaStructure.withLeftColumn) {
    voltaShapePoints.push(
      voltaStructure.left, voltaStructure.top,
      voltaStructure.left, voltaStructure.top - voltaColumnHeight
    )
  } else {
    voltaShapePoints.push(
      voltaStructure.left, voltaStructure.top - voltaColumnHeight
    )
  }
  voltaShapePoints.push(
    voltaStructure.right, voltaStructure.top - voltaColumnHeight
  )
  if (voltaStructure.withRightColumn) {
    voltaShapePoints.push(
      voltaStructure.right, voltaStructure.top
    )
  }
  const voltaBrackets = createPolyline(
    voltaShapePoints,
    voltaStrokeOptions,
    false
  )
  voltaComponents.push(
    voltaBrackets
  )
  if (voltaStructure.value) {
    let voltaValueText = createText(voltaStructure.value, voltaValueFontOptions)(
      styles,
      voltaStructure.left + voltaValueLeftOffset,
      voltaStructure.top
    )
    addPropertiesToElement(
      voltaValueText,
      {
        'ref-ids': voltaStructure.key.replace('volta-mark', 'volta-mark-text')
      }
    )
    moveElement(
      voltaValueText,
      0,
      voltaStructure.top - voltaColumnHeight - voltaValueText.top + voltaValueTopOffset
    )
    voltaComponents.push(
      voltaValueText
    )
  }
  const volta = createGroup(
    'volta',
    voltaComponents
  )
  moveElement(
    volta,
    0,
    (voltaStructure.yCorrection || 0) * intervalBetweenStaveLines
  )
  return volta
}
