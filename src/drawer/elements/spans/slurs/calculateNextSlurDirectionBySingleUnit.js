'use strict'

export default function (currentSlurDirection, slurMarkKey, firstSingleUnitInSlurPart, lastSingleUnitInSlurPart) {
  if (lastSingleUnitInSlurPart && lastSingleUnitInSlurPart.slurMarks) {
    if (lastSingleUnitInSlurPart.slurMarks.some(slurMark => (slurMark.key === slurMarkKey) && (slurMark.direction === 'up'))) {
      return 'up'
    }
    if (lastSingleUnitInSlurPart.slurMarks.some(slurMark => (slurMark.key === slurMarkKey) && (slurMark.direction === 'down'))) {
      return 'down'
    }
  }
  if (firstSingleUnitInSlurPart.slurMarks) {
    if (firstSingleUnitInSlurPart.slurMarks.some(slurMark => (slurMark.key === slurMarkKey) && (slurMark.direction === 'up'))) {
      return 'up'
    }
    if (firstSingleUnitInSlurPart.slurMarks.some(slurMark => (slurMark.key === slurMarkKey) && (slurMark.direction === 'down'))) {
      return 'down'
    }
  }
  return currentSlurDirection === 'up' ? 'down' : 'up'
}
