'use strict'

import { parseSvgPrimitives } from '#msq/omr/training/raster/parseSvgPrimitives.js'

// Geometry stays in the clean SVG coordinate space; bitmap mutations do not alter these labels
export function extractSourceSvgSemanticGeometry (svgText, {
  scale = 1,
  bitmap = null
} = {}) {
  const document = parseSvgPrimitives(svgText)
  return {
    coordinateSpace: 'unmutated-svg-user-units',
    viewport: {
      width: document.width || document.viewBox.width,
      height: document.height || document.viewBox.height,
      viewBox: { ...document.viewBox },
      preserveAspectRatio: document.preserveAspectRatio
    },
    rasterization: {
      scale,
      width: bitmap ? bitmap.width : null,
      height: bitmap ? bitmap.height : null
    },
    groups: semanticElements(document.groups),
    primitives: semanticElements(document.primitives),
    unsupportedElements: document.unsupportedElements,
    unsupportedCommands: document.unsupportedCommands,
    unsupportedTransforms: document.unsupportedTransforms
  }
}

function semanticElements (elements) {
  return elements.flatMap((element, index) => {
    if (!element.name && !element.refIds.length && !element.bounds) {
      return []
    }
    return [ {
      index,
      type: element.type,
      name: element.name,
      refIds: [ ...element.refIds ],
      bounds: element.bounds ? { ...element.bounds } : null,
      attributes: { ...element.attributes },
      style: { ...element.style },
      transform: [ ...element.transform ],
      visible: element.visible
    } ]
  })
}

export default extractSourceSvgSemanticGeometry
