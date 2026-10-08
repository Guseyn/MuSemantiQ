'use strict'

import createPolyline from '#msq/drawer/elements/basic/createPolyline.js'
import formatNumber from '#msq/drawer/elements/basic/formatNumber.js'

const debugMode = true

const escapeSVGPropertyValueChars = (value) => {
  if (typeof value === 'string') {
    return value.replaceAll('"', '&quot;')
      .replaceAll('\'', '&apos;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('&', '&amp;')
  }
  return value
}

const convertSvgToString = (element, boxesAsBuffers = [], isFirstCall = true) => {
  const buffer = []
  if (element) {
    if (element.wrapWithBox && debugMode) {
      boxesAsBuffers.push(
        convertSvgToString(
          createPolyline([element.left, element.top, element.right, element.top, element.right, element.bottom, element.left, element.bottom, element.left, element.top], { width: 1, color: (typeof element.wrapWithBox === 'string' ? element.wrapWithBox : 'red'), linecap: 'round', linejoin: 'miter' }, false),
          [],
          false
        )
      )
    }
    buffer.push(`<${element.name}`)
    for (const propertyName in element.properties) {
      let propertyValue = element.properties[propertyName]
      // Format numeric properties and viewBox values
      if (propertyName === 'viewBox' && typeof propertyValue === 'string') {
        const viewBoxParts = propertyValue.split(' ').map(p => {
          const num = parseFloat(p)
          return isNaN(num) ? p : formatNumber(num)
        })
        propertyValue = viewBoxParts.join(' ')
      } else if (typeof propertyValue === 'number') {
        propertyValue = formatNumber(propertyValue)
      }
      buffer.push(` ${propertyName}="${escapeSVGPropertyValueChars(propertyValue)}"`)
      if (propertyName === 'ref-ids') {
        buffer.push(' pointer-events="painted"')
      }
    }
    buffer.push(` data-left="${formatNumber(element.left)}"`)
    buffer.push(` data-right="${formatNumber(element.right)}"`)
    buffer.push(` data-top="${formatNumber(element.top)}"`)
    buffer.push(` data-bottom="${formatNumber(element.bottom)}"`)
    if (element.transformations && element.transformations.length > 0) {
      buffer.push(' transform="')
      for (let transformIndex = element.transformations.length - 1; transformIndex >= 0; transformIndex--) {
        const transformation = element.transformations[transformIndex]
        switch (transformation.type) {
          case 'translate': {
            buffer.push(`translate(${formatNumber(transformation.x)}, ${formatNumber(transformation.y)})`)
            break
          }
          case 'rotate': {
            buffer.push(`rotate(${formatNumber(transformation.angle)}, ${formatNumber(transformation.cx || 0)}, ${formatNumber(transformation.cy || 0)})`)
            break
          }
          case 'scale': {
            buffer.push(`scale(${formatNumber(transformation.x)}, ${formatNumber(transformation.y)})`)
            break
          }
        }
      }
      buffer.push('"')
    }
    buffer.push('>')
    if (element.elements) {
      for (let index = 0; index < element.elements.length; index++) {
        buffer.push(
          convertSvgToString(
            element.elements[index],
            boxesAsBuffers,
            false
          )
        )
      }
    }
  }
  if (isFirstCall) {
    boxesAsBuffers.forEach(
      boxAsBuffer => {
        buffer.push(boxAsBuffer)
      }
    )
  }
  buffer.push(`</${element.name}>`)
  return buffer.join('')
}

export default convertSvgToString
