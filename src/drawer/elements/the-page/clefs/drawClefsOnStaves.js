'use strict'

import calculateTopOffsetForCurrentStave from '#msq/drawer/elements/shared/calculateTopOffsetForCurrentStave.js'
import drawStavePiece from '#msq/drawer/elements/the-page/staves/drawStavePiece.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import addPropertiesToElement from '#msq/drawer/elements/basic/addPropertiesToElement.js'

import drawTrebleClef from '#msq/drawer/elements/the-page/clefs/drawTrebleClef.js'
import drawBassClef from '#msq/drawer/elements/the-page/clefs/drawBassClef.js'
import drawAltoClef from '#msq/drawer/elements/the-page/clefs/drawAltoClef.js'
import drawBaritoneClef from '#msq/drawer/elements/the-page/clefs/drawBaritoneClef.js'
import drawMezzoSopranoClef from '#msq/drawer/elements/the-page/clefs/drawMezzoSopranoClef.js'
import drawOctaveEightUpClef from '#msq/drawer/elements/the-page/clefs/drawOctaveEightUpClef.js'
import drawOctaveEightDownClef from '#msq/drawer/elements/the-page/clefs/drawOctaveEightDownClef.js'
import drawOctaveFifteenUpClef from '#msq/drawer/elements/the-page/clefs/drawOctaveFifteenUpClef.js'
import drawOctaveFifteenDownClef from '#msq/drawer/elements/the-page/clefs/drawOctaveFifteenDownClef.js'
import drawSopranoClef from '#msq/drawer/elements/the-page/clefs/drawSopranoClef.js'
import drawTenorClef from '#msq/drawer/elements/the-page/clefs/drawTenorClef.js'

const clefs = {
  treble: drawTrebleClef,
  bass: drawBassClef,
  alto: drawAltoClef,
  baritone: drawBaritoneClef,
  mezzoSoprano: drawMezzoSopranoClef,
  octaveEightUp: drawOctaveEightUpClef,
  octaveEightDown: drawOctaveEightDownClef,
  octaveFifteenUp: drawOctaveFifteenUpClef,
  octaveFifteenDown: drawOctaveFifteenDownClef,
  soprano: drawSopranoClef,
  tenor: drawTenorClef,
}

export default function (numberOfStaves, numberOfStaveLines, clefNames, measureIndexInGeneral) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaves, intervalBetweenStaveLines, stavePieceWidthForClef } = styles
    const clefsOnStaves = []
    const thereIsAtLeastOneClef = clefNames.some(clefName => clefs[clefName])
    for (let staveIndex = 0; staveIndex < numberOfStaves; staveIndex++) {
      const topOffsetForCurrentStave = calculateTopOffsetForCurrentStave(topOffset, staveIndex, intervalBetweenStaves, intervalBetweenStaveLines, numberOfStaveLines)
      const clefName = clefNames[staveIndex]
      if (clefs[clefName]) {
        const clef = clefs[clefName]()(styles, leftOffset, topOffsetForCurrentStave)
        addPropertiesToElement(
          clef,
          {
            'ref-ids': `clef-${measureIndexInGeneral + 1}-${staveIndex + 1}`
          }
        )
        clefsOnStaves.push(clef)
      } else {
        clefsOnStaves.push(
          drawStavePiece(numberOfStaveLines, thereIsAtLeastOneClef ? stavePieceWidthForClef : 0)(styles, leftOffset, topOffsetForCurrentStave)
        )
      }
    }
    return createGroup(
      'clefsOnStaves',
      clefsOnStaves
    )
  }
}
