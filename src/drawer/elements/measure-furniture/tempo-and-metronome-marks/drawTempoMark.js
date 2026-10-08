'use strict'

import createText from '#msq/drawer/elements/basic/createText.js'
import createPath from '#msq/drawer/elements/basic/createPath.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import scaleElementAroundPoint from '#msq/drawer/elements/basic/scaleElementAroundPoint.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

const drawTempoElementsByTheirTextValue = (tempoTextValueParts, measureIndex) => {
  return (styles, leftOffset, topOffset) => {
    const { tempoLetters, fontColor, tempoMarkFontOptions, tempoSpaceOfTextAfterText, tempoSpaceOfTextThatStartsWithClosingBracketAfterNote, tempoSpaceOfTextAfterNote, tempoSpaceOfNoteAfterOpeningBracket, tempoSpaceOfNoteAfterText, tempoSpaceOfNoteAfterNote, tempoMarkFontDefaultScale } = styles
    const tempoElementes = []
    let currentLeftOffset = leftOffset
    let lastTextChar
    let lastElementIsNote = false
    let tempoDurationTextIndex = 0
    const scaleNoteSizeToFontSize = tempoMarkFontOptions.size / tempoMarkFontDefaultScale
    for (let index = 0; index < tempoTextValueParts.length; index++) {
      if (tempoTextValueParts[index]) {
        if (tempoLetters[tempoTextValueParts[index]]) {
          const tempoNote = createPath(
            tempoLetters[tempoTextValueParts[index]].points,
            null,
            fontColor,
            currentLeftOffset,
            topOffset + tempoLetters[tempoTextValueParts[index]].yCorrection
          )
          scaleElementAroundPoint(tempoNote, scaleNoteSizeToFontSize, scaleNoteSizeToFontSize)
          addPropertiesToElement(
            tempoNote,
            {
              'ref-ids': `tempo-duration-part-${measureIndex + 1}-${++tempoDurationTextIndex}`
            }
          )
          if (tempoNote.noteDot) {
            addPropertiesToElement(
              tempoNote.noteDot,
              {
                'ref-ids': `tempo-duration-part-${measureIndex + 1}-${++tempoDurationTextIndex}`
              }
            )
          }
          moveElement(
            tempoNote,
            currentLeftOffset - tempoNote.left + (
              lastElementIsNote
                ? tempoSpaceOfNoteAfterNote * scaleNoteSizeToFontSize
                : (
                  lastTextChar === '('
                    ? tempoSpaceOfNoteAfterOpeningBracket * scaleNoteSizeToFontSize
                    : tempoSpaceOfNoteAfterText * scaleNoteSizeToFontSize
                )
            ),
            0
          )
          tempoElementes.push(tempoNote)
          currentLeftOffset = tempoNote.right
          lastElementIsNote = true
        } else {
          if (tempoTextValueParts[index].trim().length > 0) {
            let justText = createText(tempoTextValueParts[index], tempoMarkFontOptions)(styles, currentLeftOffset, topOffset)
            moveElement(
              justText,
              currentLeftOffset - justText.left + (
                lastElementIsNote
                  ? (
                    tempoTextValueParts[index].startsWith(')')
                      ? tempoSpaceOfTextThatStartsWithClosingBracketAfterNote * scaleNoteSizeToFontSize
                      : tempoSpaceOfTextAfterNote * scaleNoteSizeToFontSize
                  )
                  : tempoSpaceOfTextAfterText * scaleNoteSizeToFontSize
              )
            )
            lastTextChar = tempoTextValueParts[index][tempoTextValueParts[index].length - 1]
            tempoElementes.push(justText)
            currentLeftOffset = justText.right
            lastElementIsNote = false
          }
        }
      }
    }
    return tempoElementes
  }
}

export default function (measure, measureIndex, voicesBody, styles) {
  const { intervalBetweenStaveLines, tempoMarkYOffset } = styles
  const tempoMarkElements = drawTempoElementsByTheirTextValue(measure.tempoMark.textValueParts, measureIndex)(
    styles,
    (voicesBody && !voicesBody.isEmpty) ? voicesBody.left : (measure.stavesLeft || measure.left),
    0
  )
  let tempoMark = createGroup(
    'tempoMark',
    tempoMarkElements
  )
  moveElement(
    tempoMark,
    0,
    (measure.top - tempoMark.bottom) + tempoMarkYOffset + (measure.tempoMark.yCorrection || 0) * intervalBetweenStaveLines
  )
  measure.top = Math.min(measure.top, tempoMark.top)
  return tempoMark
}
