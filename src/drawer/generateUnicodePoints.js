'use strict'

// font size(for font file) is 4.0 * intervalBetweenStaveLines
const MUSCIC_FONT_SOURCE_SIZE = 4.0 

import createText from '#msq/drawer/elements/basic/createText.js'
import parseSvgPath from '#msq/drawer/lib/svgpath/parseSvgPath.js'
import translateSvgPath from '#msq/drawer/lib/svgpath/translateSvgPath.js'

function generateUnicodePoints(unicode, musicFontSource, textFontSource, musicFontSourceSize, intervalBetweenStaveLines) {
  const fontOptions = {
    source: musicFontSource,
    size: musicFontSourceSize * intervalBetweenStaveLines,
    color: '#000', // does not matter what color is here
    anchor: 'center baseline'
  }
  const text = createText(
    JSON.parse(JSON.stringify(unicode).replace(/\\\\/g, '\\')),
    fontOptions
  )({ textFontSource }, 0, 0)
  const textHeight = text.bottom - text.top
  const textPath = parseSvgPath(text.properties.d)
  let textPathMovedToTopLeftCorner = textPath
  if (text.top < 0) {
    const delta = textHeight
    textPathMovedToTopLeftCorner = translateSvgPath(
      textPathMovedToTopLeftCorner, 0, delta
    )
  }
  if (text.left < 0) {
    const delta = -text.left
    textPathMovedToTopLeftCorner = translateSvgPath(
      textPathMovedToTopLeftCorner, delta, 0
    )
  }
  return textPathMovedToTopLeftCorner.flat()
}

export default generateUnicodePoints
