'use strict'

export default function (restPositionName) {
  if (restPositionName === 'top') {
    return 0.5
  }
  if (restPositionName === 'mid' || restPositionName === 'middle') {
    return 2.0
  }
  if (restPositionName === 'bottom') {
    return 3.5
  }
  return 2.0
}
