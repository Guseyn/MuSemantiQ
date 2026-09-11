'use strict'

// font size(for font file) is 4.0 * intervalBetweenStaveLines
const MUSCIC_FONT_SOURCE_SIZE = 4.0 

import text from '#msq/drawer/elements/basic/text.js'
import parseSvgPath from '#msq/drawer/lib/svgpath/parseSvgPath.js'
import translateSvgPath from '#msq/drawer/lib/svgpath/translateSvgPath.js'

function generateUnicodePoints(unicode, musicFontSource, textFontSource, musicFontSourceSize, intervalBetweenStaveLines) {
  const fontOptions = {
    source: musicFontSource,
    size: musicFontSourceSize * intervalBetweenStaveLines,
    color: '#000', // does not matter what color is here
    anchor: 'center baseline'
  }
  const drawnText = text(
    JSON.parse(JSON.stringify(unicode).replace(/\\\\/g, '\\')),
    fontOptions
  )({ textFontSource }, 0, 0)
  const drawnTextHeight = drawnText.bottom - drawnText.top
  const drawnTextPath = parseSvgPath(drawnText.properties.d)
  let drawnTextPathMovedToTopLeftCorner = drawnTextPath
  if (drawnText.top < 0) {
    const delta = drawnTextHeight
    drawnTextPathMovedToTopLeftCorner = translateSvgPath(
      drawnTextPathMovedToTopLeftCorner, 0, delta
    )
  }
  if (drawnText.left < 0) {
    const delta = -drawnText.left
    drawnTextPathMovedToTopLeftCorner = translateSvgPath(
      drawnTextPathMovedToTopLeftCorner, delta, 0
    )
  }
  return drawnTextPathMovedToTopLeftCorner.flat()
}

export default generateUnicodePoints
