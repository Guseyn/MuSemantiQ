'use strict'

import moveSingleUnit from '#msq/drawer/elements/shared/moveSingleUnit.js'

export default function (singleUnit, slurMarkKey, fromStaveIndex, toStaveIndex, styles) {
  const singleUnitClone = JSON.parse(JSON.stringify(singleUnit))
  singleUnitClone.phantom = true
  const isSlurGoesStaveUp = toStaveIndex < fromStaveIndex
  singleUnitClone.slurMarks.find(slurMark => slurMark.key === slurMarkKey).finish = false
  moveSingleUnit(
    singleUnitClone,
    (singleUnitClone.right - singleUnitClone.left) + styles.xDistanceToMoveForPhantomSingleUnitThatIsInSlurThatFinishesInTheMomentItChangesItsStave,
    (isSlurGoesStaveUp ? +1 : -1) * styles.yDistanceToMoveForPhantomSingleUnitThatIsInSlurThatFinishesInTheMomentItChangesItsStave
  )
  return singleUnitClone
}
