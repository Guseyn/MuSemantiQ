'use strict'

import moveElement from '#msq/drawer/elements/basic/moveElement.js'
import scaleElementAroundPoint from '#msq/drawer/elements/basic/scaleElementAroundPoint.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'
import sortKeysForSingleUnitConsideringStaves from '#msq/drawer/elements/notes-on-a-page/accidentals/sortKeysForSingleUnitConsideringStaves.js'
import drawDoubleFlatKeyShape from '#msq/drawer/elements/notes-on-a-page/accidentals/drawDoubleFlatKeyShape.js'
import drawDoubleSharpKeyShape from '#msq/drawer/elements/notes-on-a-page/accidentals/drawDoubleSharpKeyShape.js'
import drawFlatKeyShape from '#msq/drawer/elements/notes-on-a-page/accidentals/drawFlatKeyShape.js'
import drawNaturalKeyShape from '#msq/drawer/elements/notes-on-a-page/accidentals/drawNaturalKeyShape.js'
import drawSharpKeyShape from '#msq/drawer/elements/notes-on-a-page/accidentals/drawSharpKeyShape.js'
import drawDemiflatKeyShape from '#msq/drawer/elements/notes-on-a-page/accidentals/drawDemiflatKeyShape.js'
import drawSesquiflatKeyShape from '#msq/drawer/elements/notes-on-a-page/accidentals/drawSesquiflatKeyShape.js'
import drawDemisharpKeyShape from '#msq/drawer/elements/notes-on-a-page/accidentals/drawDemisharpKeyShape.js'
import drawSesquisharpKeyShape from '#msq/drawer/elements/notes-on-a-page/accidentals/drawSesquisharpKeyShape.js'
import drawNoteLetterShape from '#msq/drawer/elements/marks-on-units/text-labels/drawNoteLetterShape.js'
import drawParenthesesSpline from '#msq/drawer/elements/marks-on-units/parentheses/drawParenthesesSpline.js'
const keysTypes = {
  'doubleFlatKey': drawDoubleFlatKeyShape,
  'doubleSharpKey': drawDoubleSharpKeyShape,
  'flatKey': drawFlatKeyShape,
  'naturalKey': drawNaturalKeyShape,
  'sharpKey': drawSharpKeyShape,
  'demiflatKey': drawDemiflatKeyShape,
  'sesquiflatKey': drawSesquiflatKeyShape,
  'demisharpKey': drawDemisharpKeyShape,
  'sesquisharpKey': drawSesquisharpKeyShape,
  'noteLetter': drawNoteLetterShape
}

export default function (selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit, measureIndexInGeneral, countersForEachVoice, numberOfStaveLines, arpeggiatedWavesForCrossStaveUnits, breathMarksBeforeCrossStaveUnits, styles, leftOffset, topOffsetsForEachStave, relativePositionToArpeggiatedWave = 'after', containsDrawnCrossStaveElementsBesideCrossStaveUnits) {
  const { spaceAfterBreathMark, distanceBetweenKeysForSingleUnit, distanceBetweenKeysAsNoteLettersForSingleUnit, offsetForKeyParenthesesFromBothSides, keyParenthesesYPadding, spaceAfterArpeggiatedWaveAndBeforeKeysForCrossStaveUnit, graceElementsScaleFactor, graceKeyOnStaveLineCenterYCorrections, graceKeyBetweenStaveLinesCenterYCorrections } = styles
  const keysForCurrentCrossStaveUnit = []
  const allKeysParams = []
  let isThereArpeggiatedWavesInCurrentCrossStaveUnit = selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.findIndex(singleUnitParams => singleUnitParams.arpeggiated) !== -1
  let isCurrentCrossStaveUnitGrace = false
  for (let singleUnitParamIndex = 0; singleUnitParamIndex < selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit.length; singleUnitParamIndex++) {
    const currentSingleUnitParams = selectedSingleUnitsParamsToBeIncludedInNextCrossStaveUnit[singleUnitParamIndex]
    let currentKeysParams
    if (isThereArpeggiatedWavesInCurrentCrossStaveUnit) {
      if (relativePositionToArpeggiatedWave === 'after') {
        currentKeysParams = currentSingleUnitParams.keysParams.filter(keyParam => keyParam.keyType !== 'noteLetter')
      } else if (relativePositionToArpeggiatedWave === 'before') {
        currentKeysParams = currentSingleUnitParams.keysParams.filter(keyParam => keyParam.keyType === 'noteLetter')
      }
    } else if (relativePositionToArpeggiatedWave === 'after') {
      currentKeysParams = currentSingleUnitParams.keysParams
    }
    if (currentKeysParams) {
      allKeysParams.push(...currentKeysParams)
    }
    if (currentSingleUnitParams.isGrace) {
      isCurrentCrossStaveUnitGrace = true
    }
  }
  const sortedKeysParams = sortKeysForSingleUnitConsideringStaves(allKeysParams)

  const keysColumnsByStaves = {}
  let startXPositionOfKeys
  if (relativePositionToArpeggiatedWave === 'after') {
    startXPositionOfKeys = arpeggiatedWavesForCrossStaveUnits[arpeggiatedWavesForCrossStaveUnits.length - 1].right + (
      (
        arpeggiatedWavesForCrossStaveUnits[arpeggiatedWavesForCrossStaveUnits.length - 1].numberOfWaves > 0 &&
        sortedKeysParams.length > 0
      )
        ? spaceAfterArpeggiatedWaveAndBeforeKeysForCrossStaveUnit
        : 0
    )
  } else if (relativePositionToArpeggiatedWave === 'before') {
    startXPositionOfKeys = breathMarksBeforeCrossStaveUnits[breathMarksBeforeCrossStaveUnits.length - 1].right + (
      breathMarksBeforeCrossStaveUnits[breathMarksBeforeCrossStaveUnits.length - 1].isEmpty
        ? 0
        : spaceAfterBreathMark * (isCurrentCrossStaveUnitGrace ? graceElementsScaleFactor : 1)
    )
  }

  for (let keyIndex = 0; keyIndex < sortedKeysParams.length; keyIndex++) {
    const keyParams = sortedKeysParams[keyIndex]
    const isGrace = keyParams.isGrace
    let staveIndexThatActuallyRelatesToTheKeyPosition = keyParams.staveIndexConsideringStavePosition ?? keyParams.staveIndex
    const topOffsetOfStaveForTheKeyConsideringItsStave = topOffsetsForEachStave[keyParams.staveIndexConsideringStavePosition] ?? topOffsetsForEachStave[keyParams.staveIndex]
    const keyFunction = keyParams.keyType === 'noteLetter'
      ? keysTypes['noteLetter'](keyParams.positionNumber, keyParams.textValue)
      : (keysTypes[keyParams.keyType] || keysTypes['sharpKey'])(keyParams.positionNumber)
    const additionalInformation = {
      keyType: keyParams.keyType,
      measureIndexInGeneral,
      staveIndex: keyParams.staveIndex,
      voiceIndex: keyParams.voiceIndex,
      id: keyParams.id,
      singleUnitIndex: countersForEachVoice[keyParams.staveIndex][keyParams.voiceIndex],
      positionNumber: keyParams.positionNumber,
      isGrace: keyParams.isGrace
    }
    const keyElements = []
    const keyShape = keyFunction(
      styles,
      startXPositionOfKeys,
      topOffsetOfStaveForTheKeyConsideringItsStave
    )
    keyElements.push(keyShape)
    addPropertiesToElement(
      keyShape,
      {
        'ref-ids': `note-key-${additionalInformation.measureIndexInGeneral + 1}-${additionalInformation.staveIndex + 1}-${additionalInformation.voiceIndex + 1}-${additionalInformation.singleUnitIndex + 1}-${additionalInformation.id + 1}`
      }
    )
    if (keyParams.withParentheses) {
      const offsetForKeyParenthesesFromBothSidesForCertainType = offsetForKeyParenthesesFromBothSides[keyParams.keyType] || offsetForKeyParenthesesFromBothSides['default']
      const openBracket = drawParenthesesSpline(
        {
          x: keyShape.left,
          y: keyShape.top - keyParenthesesYPadding
        },
        {
          x: keyShape.left,
          y: keyShape.bottom + keyParenthesesYPadding
        },
        'left',
        styles
      )
      moveElement(
        keyShape,
        offsetForKeyParenthesesFromBothSidesForCertainType.left
      )
      addPropertiesToElement(
        openBracket,
        {
          'ref-ids': `note-key-parentheses-${additionalInformation.measureIndexInGeneral + 1}-${additionalInformation.staveIndex + 1}-${additionalInformation.voiceIndex + 1}-${additionalInformation.singleUnitIndex + 1}-${additionalInformation.id + 1}`
        }
      )
      const closedBracket = drawParenthesesSpline(
        {
          x: keyShape.right + offsetForKeyParenthesesFromBothSidesForCertainType.right,
          y: keyShape.top - keyParenthesesYPadding
        },
        {
          x: keyShape.right + offsetForKeyParenthesesFromBothSidesForCertainType.right,
          y: keyShape.bottom + keyParenthesesYPadding
        },
        'right',
        styles
      )
      addPropertiesToElement(
        closedBracket,
        {
          'ref-ids': `note-key-parentheses-${additionalInformation.measureIndexInGeneral + 1}-${additionalInformation.staveIndex + 1}-${additionalInformation.voiceIndex + 1}-${additionalInformation.singleUnitIndex + 1}-${additionalInformation.id + 1}`
        }
      )
      keyElements.push(
        openBracket,
        closedBracket
      )
    }
    const key = createElementWithAdditionalInformation(
      createGroup(
        'key',
        keyElements
      ),
      additionalInformation
    )
    if (isGrace) {
      const isKeyOnStave = Math.abs(keyParams.positionNumber * 10 % 2) === 0
      scaleElementAroundPoint(
        key,
        graceElementsScaleFactor,
        graceElementsScaleFactor,
        {
          x: key.right,
          y: (key.top + key.bottom) / 2 +
            (
              isKeyOnStave
                ? (graceKeyOnStaveLineCenterYCorrections[keyParams.keyType] || graceKeyOnStaveLineCenterYCorrections['sharpKey'])
                : (graceKeyBetweenStaveLinesCenterYCorrections[keyParams.keyType] || graceKeyBetweenStaveLinesCenterYCorrections['sharpKey'])
            )
        }
      )
    }
    let keysColumnsAreJustCreatedForNewStave = false
    if (!keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`]) {
      keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`] = [
        {
          shapes: [ key ],
          keysParams: [ keyParams ],
          minLeft: key.left,
          maxRight: key.right,
          minTop: key.top,
          maxBottom: key.bottom,
          columnIndex: 0
        }
      ]
      keysColumnsAreJustCreatedForNewStave = true
    }
    if (!keysColumnsAreJustCreatedForNewStave) {
      const keysColumnsLength = keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`].length
      for (let keyColumnIndex = 0; keyColumnIndex < keysColumnsLength; keyColumnIndex++) {
        const xDistanceForKeysToMove = (key.right - key.left) +
          (key.keyType === 'noteLetter' ? distanceBetweenKeysAsNoteLettersForSingleUnit : distanceBetweenKeysForSingleUnit) * (isGrace ? graceElementsScaleFactor : 1)
        const keyShouldBePutInNewColumn = (key.top <= keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].maxBottom)
        if (keyShouldBePutInNewColumn) {
          if (!keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex + 1]) {
            keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`].push({
              shapes: [ key ],
              keysParams: [ keyParams ],
              minLeft: key.left,
              maxRight: key.right,
              minTop: key.top,
              maxBottom: key.bottom,
              columnIndex: keyColumnIndex + 1
            })
            const keysColumnsLastIndex = keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`].length - 1
            moveElement(
              key,
              -(startXPositionOfKeys - keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].minLeft + xDistanceForKeysToMove),
              0
            )
            const minLeftBefore = keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keysColumnsLastIndex].minLeft
            keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keysColumnsLastIndex].minLeft = Math.min(keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keysColumnsLastIndex].minLeft, key.left)
            keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keysColumnsLastIndex].maxRight = keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keysColumnsLastIndex].maxRight - (minLeftBefore - keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keysColumnsLastIndex].minLeft)
          }
        } else {
          if (keyColumnIndex > 0) {
            moveElement(
              key,
              -(startXPositionOfKeys - keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex - 1].minLeft + xDistanceForKeysToMove),
              0
            )
          }
          const minLeftBefore = keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].minLeft
          keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].minLeft = Math.min(keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].minLeft, key.left)
          keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].maxRight = keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].maxRight - (minLeftBefore - keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].minLeft)
          keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].minTop = Math.min(keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].minTop, key.top)
          keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].maxBottom = Math.max(keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].maxBottom, key.bottom)
          keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].shapes.push(key)
          keysColumnsByStaves[`${staveIndexThatActuallyRelatesToTheKeyPosition}`][keyColumnIndex].keysParams.push(keyParams)
          break
        }
      }
    }
    keysForCurrentCrossStaveUnit.push(
      key
    )
  }

  const groupsOfKeysOnAllStaves = []
  let maxRightOfGroupsOfKeysOnEachStave
  const areasWithKeysInTheFirstColumn = []
  for (const [ staveIndexThatActuallyRelatesToTheKeyPosition, keysColumnsOnStave ] of Object.entries(keysColumnsByStaves)) {
    const allDrawnKeysOnStave = [...keysColumnsOnStave.flatMap(keyColumn => keyColumn.shapes)]
    for (let keyColumnIndex = 0; keyColumnIndex < keysColumnsOnStave.length; keyColumnIndex++) {
      for (let keyIndex = 0; keyIndex < keysColumnsOnStave[keyColumnIndex].shapes.length; keyIndex++) {
        if (keysColumnsOnStave[keyColumnIndex].shapes[keyIndex].right < keysColumnsOnStave[keyColumnIndex].maxRight) {
          const xDistanceToMove = keysColumnsOnStave[keyColumnIndex].maxRight - keysColumnsOnStave[keyColumnIndex].shapes[keyIndex].right
          moveElement(
            keysColumnsOnStave[keyColumnIndex].shapes[keyIndex],
            xDistanceToMove
          )
        }
        if (keyColumnIndex === 0) {
          areasWithKeysInTheFirstColumn.push({
            actualStaveIndex: staveIndexThatActuallyRelatesToTheKeyPosition * 1,
            minY: keysColumnsOnStave[keyColumnIndex].shapes[keyIndex].top,
            maxY: keysColumnsOnStave[keyColumnIndex].shapes[keyIndex].bottom
          })
        }
      }
    }
    const groupOfKeysOnStave = createElementWithAdditionalInformation(
      createGroup(
        'keysOnStave',
        allDrawnKeysOnStave
      ),
      {
        staveIndex: staveIndexThatActuallyRelatesToTheKeyPosition * 1
      }
    )
    groupsOfKeysOnAllStaves.push(groupOfKeysOnStave)
    if (maxRightOfGroupsOfKeysOnEachStave === undefined || maxRightOfGroupsOfKeysOnEachStave < groupOfKeysOnStave.right) {
      maxRightOfGroupsOfKeysOnEachStave = groupOfKeysOnStave.right
    }
  }
  groupsOfKeysOnAllStaves.forEach(groupOfKeysOnStave => {
    moveElement(
      groupOfKeysOnStave,
      maxRightOfGroupsOfKeysOnEachStave - groupOfKeysOnStave.right
    )
  })

  const groupName = relativePositionToArpeggiatedWave === 'after' ? 'keysForCrossStaveUnit' : 'onlyNoteLettersBeforeArpeggiatedWaves'
  if (groupsOfKeysOnAllStaves.length === 0) {
    return {
      isEmpty: true,
      name: 'g',
      properties: {
        'data-name': groupName
      },
      transformations: [],
      top: topOffsetsForEachStave[0],
      right: startXPositionOfKeys,
      bottom: topOffsetsForEachStave[topOffsetsForEachStave.length - 1],
      left: startXPositionOfKeys,
      numberOfKeys: 0,
      areasWithKeysInTheFirstColumn
    }
  }
  containsDrawnCrossStaveElementsBesideCrossStaveUnits.value = true
  const groupedDrawnKeysForCrossStaveUnit = createGroup(
    groupName,
    groupsOfKeysOnAllStaves
  )
  const currentLeftOffset = startXPositionOfKeys - groupedDrawnKeysForCrossStaveUnit.left
  moveElement(
    groupedDrawnKeysForCrossStaveUnit,
    currentLeftOffset
  )
  return createElementWithAdditionalInformation(
    groupedDrawnKeysForCrossStaveUnit,
    {
      numberOfKeys: keysForCurrentCrossStaveUnit.length,
      crossStaveUnitRightAfterTheseKeysIsGrace: isCurrentCrossStaveUnitGrace,
      groupsOfKeysOnAllStaves,
      areasWithKeysInTheFirstColumn
    }
  )
}
