'use strict'

import opentype from '#msq/drawer/lib/opentype/opentype.js'
import d from '#msq/drawer/lib/opentype/d.js'
import calculateBboxForPath from '#msq/drawer/elements/basic/calculateBboxForPath.js'

export default function (text, fontOptions) {
  return (styles, leftOffset, topOffset) => {
    const fontSourceForErrorCase = styles.textFontSource
    const optionsForTextPathD = {
      x: leftOffset,
      y: topOffset,
      fontSize: fontOptions.size,
      fontWeight: fontOptions.weight,
      anchor: fontOptions.anchor || 'middle'
    }
    if (text.trim().length === 0) {
      text = '?'
    }
    let textPathD
    try {
      textPathD = d(fontOptions.source, text, optionsForTextPathD)
    } catch (err) {
      textPathD = d(fontSourceForErrorCase, '?', optionsForTextPathD)
    } finally {
      if (textPathD.length === 0) {
        textPathD = d(fontSourceForErrorCase, '?', optionsForTextPathD)
      }
    }
    const { minTop, maxRight, maxBottom, minLeft } = calculateBboxForPath(textPathD)
    const propertiesForTextItself = {
      'data-name': 'text',
      'fill': fontOptions.color,
      'd': textPathD,
      'text-value': text,
      'vector-effect': 'none'
    }
    if (fontOptions.strokeWidth) {
      propertiesForTextItself['stroke'] = fontOptions.strokeColor || fontOptions.outlineColor
      propertiesForTextItself['stroke-width'] = fontOptions.strokeWidth || fontOptions.outlinePadding
      propertiesForTextItself['stroke-linecap'] = fontOptions.strokeLinecap || ''
    }
    const textItself = {
      name: 'path',
      properties: propertiesForTextItself,
      transformations: [],
      top: minTop,
      right: maxRight,
      bottom: maxBottom,
      left: minLeft
    }
    if (fontOptions.outlinePadding) {
      const outline = {
        name: 'rect',
        properties: {
          'data-name': 'outline',
          'fill': fontOptions.outlineColor,
          'width': maxRight - minLeft + 2 * fontOptions.outlinePadding,
          'height': maxBottom - minTop + 2 * fontOptions.outlinePadding,
          'rx': fontOptions.outlineRadius || 0
        },
        transformations: [
          {
            type: 'translate',
            x: minLeft - fontOptions.outlinePadding,
            y: minTop - fontOptions.outlinePadding
          }
        ],
        top: minTop - fontOptions.outlinePadding,
        right: maxRight + fontOptions.outlinePadding,
        bottom: maxBottom + fontOptions.outlinePadding,
        left: minLeft - fontOptions.outlinePadding
      }
      return {
        name: 'g',
        properties: {
          'data-name': 'textWithOutline'
        },
        wrapWithBox: false,
        elements: [
          outline,
          textItself
        ],
        transformations: [],
        top: minTop - fontOptions.outlinePadding,
        right: maxRight + fontOptions.outlinePadding,
        bottom: maxBottom + fontOptions.outlinePadding,
        left: minLeft - fontOptions.outlinePadding,
        textTop: textItself.top,
        textRight: textItself.right,
        textLeft: textItself.left,
        textBottom: textItself.bottom
      }
    }
    return textItself
  }
}
