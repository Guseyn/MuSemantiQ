'use strict'

export default function (singleUnit, xDistanceToMove = 0, yDistanceToMove = 0) {
  singleUnit.bodyLeft += xDistanceToMove
  singleUnit.bodyRight += xDistanceToMove
  singleUnit.bodyTop += yDistanceToMove
  singleUnit.bodyBottom += yDistanceToMove

  singleUnit.stemLeft += xDistanceToMove
  singleUnit.stemRight += xDistanceToMove
  singleUnit.stemTop += yDistanceToMove
  singleUnit.stemBottom += yDistanceToMove

  if (singleUnit.flagsLeft && singleUnit.flagsRight && singleUnit.flagsTop && singleUnit.flagsBottom) {
    singleUnit.flagsLeft += xDistanceToMove
    singleUnit.flagsRight += xDistanceToMove
    singleUnit.flagsTop += yDistanceToMove
    singleUnit.flagsBottom += yDistanceToMove
  }

  if (singleUnit.dotsLeft && singleUnit.dotsRight && singleUnit.dotsTop && singleUnit.dotsBottom) {
    singleUnit.dotsLeft += xDistanceToMove
    singleUnit.dotsRight += xDistanceToMove
    singleUnit.dotsTop += yDistanceToMove
    singleUnit.dotsBottom += yDistanceToMove
  }

  if (singleUnit.parenthesesLeft && singleUnit.parenthesesRight) {
    singleUnit.parenthesesLeft += xDistanceToMove
    singleUnit.parenthesesRight += xDistanceToMove
  }
}
