'use strict'

import createText from '#msq/drawer/elements/basic/createText.js'
import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import calculateTopOffsetForCurrentStave from '#msq/drawer/elements/shared/calculateTopOffsetForCurrentStave.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

export default function (instrumentTitlesParams, numberOfStaveLines, isFirstMeasureOnPageLine, measureIndexInGeneral) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, intervalBetweenStaves } = styles
    const instrumentTitles = []
    let maxWidthOfTitle
    for (let instrumentTitleIndex = 0; instrumentTitleIndex < instrumentTitlesParams.length; instrumentTitleIndex++) {
      const instrumentTitleParams = instrumentTitlesParams[instrumentTitleIndex]
      if (instrumentTitleParams.value) {
        if (instrumentTitleParams.staveStartNumber !== undefined && instrumentTitleParams.staveEndNumber !== undefined) {
          const numberOfStaves = instrumentTitleParams.staveEndNumber - instrumentTitleParams.staveStartNumber + 1
          const topOffsetForStartStave = calculateTopOffsetForCurrentStave(topOffset, instrumentTitleParams.staveStartNumber, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines)
          const bottomOffsetForEndStave = topOffsetForStartStave + numberOfStaves * (numberOfStaveLines - 1) * intervalBetweenStaveLines + (numberOfStaves - 1) * intervalBetweenStaves
          const middle = (topOffsetForStartStave + bottomOffsetForEndStave) / 2
          instrumentTitleParams.value = instrumentTitleParams.value.trim()
          const title = createText(instrumentTitleParams.value, styles.instrumentTitleFontOptions)(styles, leftOffset, middle)
          const lastCharOfInstrumentTitleValue = instrumentTitleParams.value[instrumentTitleParams.value.length - 1]
          const titleAsJustLastCharOfOriginalInstrumentTitleSoItCanBeAlignedToCenterOfLetSayBraceConnection = createText(lastCharOfInstrumentTitleValue, styles.instrumentTitleFontOptions)(styles, leftOffset, middle)
          const titleAsJustLastCharOfOriginalInstrumentTitleSoItCanBeAlignedToCenterOfLetSayBraceConnectionMiddle = (titleAsJustLastCharOfOriginalInstrumentTitleSoItCanBeAlignedToCenterOfLetSayBraceConnection.bottom + titleAsJustLastCharOfOriginalInstrumentTitleSoItCanBeAlignedToCenterOfLetSayBraceConnection.top) / 2
          moveElement(
            title,
            0,
            (titleAsJustLastCharOfOriginalInstrumentTitleSoItCanBeAlignedToCenterOfLetSayBraceConnectionMiddle > middle) ? (middle - titleAsJustLastCharOfOriginalInstrumentTitleSoItCanBeAlignedToCenterOfLetSayBraceConnectionMiddle) : (titleAsJustLastCharOfOriginalInstrumentTitleSoItCanBeAlignedToCenterOfLetSayBraceConnectionMiddle - middle)
          )
          addPropertiesToElement(
            title,
            {
              'ref-ids': `instrument-title-${measureIndexInGeneral + 1}-${instrumentTitleIndex + 1}`
            }
          )
          if (isFirstMeasureOnPageLine && instrumentTitleParams.forEachLineId !== undefined) {
            addPropertiesToElement(
              title,
              {
                'ref-ids': `instrument-title-for-each-line-${instrumentTitleParams.forEachLineId}`
              }
            )
          }
          instrumentTitles.push(
            title
          )
          const currentTitleWidth = title.right - title.left
          if (maxWidthOfTitle === undefined || maxWidthOfTitle < currentTitleWidth) {
            maxWidthOfTitle = currentTitleWidth
          }
        } else if (instrumentTitleParams.staveNumber !== undefined) {
          const topOffsetForCurrentStave = calculateTopOffsetForCurrentStave(topOffset, instrumentTitleParams.staveNumber, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines)
          const bottomOffsetForCurrentStave = topOffsetForCurrentStave + (numberOfStaveLines - 1) * intervalBetweenStaveLines
          const middle = (topOffsetForCurrentStave + bottomOffsetForCurrentStave) / 2 - intervalBetweenStaveLines / 2
          const title = createText(instrumentTitleParams.value, styles.instrumentTitleFontOptions)(styles, leftOffset, middle)
          instrumentTitles.push(
            title
          )
          const currentTitleWidth = title.right - title.left
          if (maxWidthOfTitle === undefined || maxWidthOfTitle < currentTitleWidth) {
            maxWidthOfTitle = currentTitleWidth
          }
        }
      }
    }
    for (let instrumentTitleIndex = 0; instrumentTitleIndex < instrumentTitles.length; instrumentTitleIndex++) {
      moveElement(
        instrumentTitles[instrumentTitleIndex],
        maxWidthOfTitle - (instrumentTitles[instrumentTitleIndex].right - instrumentTitles[instrumentTitleIndex].left)
      )
    }
    return createGroup(
      'combinedInstrumentTitles',
      instrumentTitles
    )
  }
}
