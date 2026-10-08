'use strict'

export default function (point, slurSide, slurDirection, styles, epsilon = 0.0001) {
  const slurDirectionSign = slurDirection === 'up' ? -1 : +1
  const slurSideSign = slurSide === 'left' ? +1 : -1
  return {
    x: point.x + styles.slurJunctionPhantomPointXCoefficient * slurSideSign * epsilon,
    y: point.y + styles.slurJunctionPhantomPointYCoefficient * slurDirectionSign * epsilon
  }
}
