'use strict'

export default function (element, scaleX = 1, scaleY = scaleX, customPoint) {
  if (element) {
    const point = customPoint || {
      x: (element.right + element.left) / 2,
      y: (element.top + element.bottom) / 2
    }
    element.transformations.push(
      {
        type: 'scale',
        x: scaleX,
        y: scaleY
      }
    )
    const deltaX = point.x * (1 - scaleX)
    const deltaY = point.y * (1 - scaleY)
    element.transformations.push(
      {
        type: 'translate',
        x: deltaX,
        y: deltaY
      }
    )
    const originalWidth = element.right - element.left
    const originalHeight = element.bottom - element.top
    const width = originalWidth * scaleX
    const height = originalHeight * scaleY
    const boxDeltaXLeft = Math.abs(element.left - point.x)
      ? (width - originalWidth) / (originalWidth / Math.abs(element.left - point.x))
      : 0
    const boxDeltaXRight = Math.abs(element.right - point.x)
      ? (width - originalWidth) / (originalWidth / Math.abs(element.right - point.x))
      : 0
    const boxDeltaYTop = Math.abs(element.top - point.y)
      ? (height - originalHeight) / (originalHeight / Math.abs(element.top - point.y))
      : 0
    const boxDeltaYBottom = Math.abs(element.bottom - point.y)
      ? (height - originalHeight) / (originalHeight / Math.abs(element.bottom - point.y))
      : 0
    element.top = element.top - boxDeltaYTop
    element.right = element.right + boxDeltaXRight
    element.bottom = element.bottom + boxDeltaYBottom
    element.left = element.left - boxDeltaXLeft
  }
}
