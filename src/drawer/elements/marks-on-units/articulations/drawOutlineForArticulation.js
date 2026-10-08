'use strict'

export default function (articulation, styles) {
  const { backgroundColor, articulationOutlinePadding, articulationOutlineRadius } = styles
  const outline = {
    name: 'rect',
    properties: {
      'data-name': 'outline',
      'fill': backgroundColor,
      'width': articulation.right - articulation.left + 2 * articulationOutlinePadding,
      'height': articulation.bottom - articulation.top + 2 * articulationOutlinePadding,
      'rx': articulationOutlineRadius
    },
    transformations: [
      {
        type: 'translate',
        x: articulation.left - articulationOutlinePadding,
        y: articulation.top - articulationOutlinePadding
      }
    ],
    top: articulation.top - articulationOutlinePadding,
    right: articulation.right + articulationOutlinePadding,
    bottom: articulation.bottom + articulationOutlinePadding,
    left: articulation.left - articulationOutlinePadding
  }
  return outline
}
