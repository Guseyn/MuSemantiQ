'use strict'

export default function (elements) {
  let minTop = Number.NaN
  let maxRight = Number.NaN
  let maxBottom = Number.NaN
  let minLeft = Number.NaN
  elements.forEach(element => {
    if (element) {
      if (isNaN(minTop) || minTop > element.top) {
        minTop = element.top
      }
      if (isNaN(maxRight) || maxRight < element.right) {
        maxRight = element.right
      }
      if (isNaN(maxBottom) || maxBottom < element.bottom) {
        maxBottom = element.bottom
      }
      if (isNaN(minLeft) || minLeft > element.left) {
        minLeft = element.left
      }
    }
  })
  return {
    top: minTop,
    right: maxRight,
    bottom: maxBottom,
    left: minLeft
  }
}
