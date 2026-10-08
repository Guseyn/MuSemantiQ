'use strict'

import isProgressionOfCurrentBeamedSingleUnitsSupposedToHaveHorizontalBeamLine from '#msq/drawer/elements/grouping-notes/beams/isProgressionOfCurrentBeamedSingleUnitsSupposedToHaveHorizontalBeamLine.js'

export default function (currentBeamedSingleUnits, anyStemDirectionChangesInBeamedSingleUnits, minTopInCurrentBeamedSingleUnits, maxBottomInCurrentBeamedSingleUnits, beamLineHeightNormal, allBeamsHeightNormalWhereAllStemsWithSameDirection, styles) {
  const { defaultStemHeightForBeamedLikeConnectedWithTremoloSingleUnitsWithDurationIsHalfOrQuarter, defaultStemHeightForBeamedSingleUnits, minDefaultStemHeightForBeamedSingleUnits, maxDefaultStemHeightForBeamedSingleUnits, graceElementsScaleFactor, maxDifferenceBetweenStemEndsOfFirstAndLastBeamedSingleUnitWithDifferentStemDirections } = styles

  const progressionOfCurrentBeamedSingleUnitsIsSupposedToHaveHorizontalBeamLine = isProgressionOfCurrentBeamedSingleUnitsSupposedToHaveHorizontalBeamLine(currentBeamedSingleUnits, anyStemDirectionChangesInBeamedSingleUnits)

  const firstDrawnBeamedSingleUnit = currentBeamedSingleUnits[0]
  const lastDrawnBeamedSingleUnit = currentBeamedSingleUnits[currentBeamedSingleUnits.length - 1]

  const firstDrawnBeamedSingleUnitDefaultStemTop = firstDrawnBeamedSingleUnit.stemTop - (firstDrawnBeamedSingleUnit.hasConnectedTremolo ? defaultStemHeightForBeamedLikeConnectedWithTremoloSingleUnitsWithDurationIsHalfOrQuarter * (firstDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1) : defaultStemHeightForBeamedSingleUnits * (firstDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1))
  const firstDrawnBeamedSingleUnitDefaultStemBottom = firstDrawnBeamedSingleUnit.stemBottom + (firstDrawnBeamedSingleUnit.hasConnectedTremolo ? defaultStemHeightForBeamedLikeConnectedWithTremoloSingleUnitsWithDurationIsHalfOrQuarter * (firstDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1) : defaultStemHeightForBeamedSingleUnits * (firstDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1))
  const lastDrawnBeamedSingleUnitDefaultStemTop = lastDrawnBeamedSingleUnit.stemTop - (lastDrawnBeamedSingleUnit.hasConnectedTremolo ? defaultStemHeightForBeamedLikeConnectedWithTremoloSingleUnitsWithDurationIsHalfOrQuarter * (lastDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1) : defaultStemHeightForBeamedSingleUnits * (lastDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1))
  const lastDrawnBeamedSingleUnitDefaultStemBottom = lastDrawnBeamedSingleUnit.stemBottom + (lastDrawnBeamedSingleUnit.hasConnectedTremolo ? defaultStemHeightForBeamedLikeConnectedWithTremoloSingleUnitsWithDurationIsHalfOrQuarter * (lastDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1) : defaultStemHeightForBeamedSingleUnits * (lastDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1))

  const firstDrawnBeamedSingleUnitMinDefaultStemTop = firstDrawnBeamedSingleUnit.stemTop - (progressionOfCurrentBeamedSingleUnitsIsSupposedToHaveHorizontalBeamLine ? defaultStemHeightForBeamedSingleUnits : minDefaultStemHeightForBeamedSingleUnits) * (firstDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1)
  const firstDrawnBeamedSingleUnitMinDefaultStemBottom = firstDrawnBeamedSingleUnit.stemBottom + (progressionOfCurrentBeamedSingleUnitsIsSupposedToHaveHorizontalBeamLine ? defaultStemHeightForBeamedSingleUnits : minDefaultStemHeightForBeamedSingleUnits) * (firstDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1)
  const lastDrawnBeamedSingleUnitMinDefaultStemTop = lastDrawnBeamedSingleUnit.stemTop - (progressionOfCurrentBeamedSingleUnitsIsSupposedToHaveHorizontalBeamLine ? defaultStemHeightForBeamedSingleUnits : minDefaultStemHeightForBeamedSingleUnits) * (lastDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1)
  const lastDrawnBeamedSingleUnitMinDefaultStemBottom = lastDrawnBeamedSingleUnit.stemBottom + (progressionOfCurrentBeamedSingleUnitsIsSupposedToHaveHorizontalBeamLine ? defaultStemHeightForBeamedSingleUnits : minDefaultStemHeightForBeamedSingleUnits) * (lastDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1)

  const firstDrawnBeamedSingleUnitMaxDefaultStemTop = firstDrawnBeamedSingleUnit.stemTop - maxDefaultStemHeightForBeamedSingleUnits * (firstDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1)
  const firstDrawnBeamedSingleUnitMaxDefaultStemBottom = firstDrawnBeamedSingleUnit.stemBottom + maxDefaultStemHeightForBeamedSingleUnits * (firstDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1)
  const lastDrawnBeamedSingleUnitMaxDefaultStemTop = lastDrawnBeamedSingleUnit.stemTop - maxDefaultStemHeightForBeamedSingleUnits * (lastDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1)
  const lastDrawnBeamedSingleUnitMaxDefaultStemBottom = lastDrawnBeamedSingleUnit.stemBottom + maxDefaultStemHeightForBeamedSingleUnits * (lastDrawnBeamedSingleUnit.isGrace ? graceElementsScaleFactor : 1)

  let firstDrawnBeamedSingleUnitStemEnd
  if (firstDrawnBeamedSingleUnit.stemDirection === 'up') {
    if (anyStemDirectionChangesInBeamedSingleUnits) {
      firstDrawnBeamedSingleUnitStemEnd = Math.min(
        firstDrawnBeamedSingleUnitMinDefaultStemTop,
        (maxBottomInCurrentBeamedSingleUnits + minTopInCurrentBeamedSingleUnits) / 2 +
        allBeamsHeightNormalWhereAllStemsWithSameDirection / 2
      )
      if (firstDrawnBeamedSingleUnitStemEnd < firstDrawnBeamedSingleUnitMaxDefaultStemTop) {
        firstDrawnBeamedSingleUnitStemEnd = firstDrawnBeamedSingleUnitMaxDefaultStemTop
      }
    } else {
      firstDrawnBeamedSingleUnitStemEnd = Math.min(firstDrawnBeamedSingleUnitDefaultStemTop, minTopInCurrentBeamedSingleUnits - (progressionOfCurrentBeamedSingleUnitsIsSupposedToHaveHorizontalBeamLine ? defaultStemHeightForBeamedSingleUnits : minDefaultStemHeightForBeamedSingleUnits))
    }
    if (firstDrawnBeamedSingleUnitStemEnd > firstDrawnBeamedSingleUnit.stemTop) {
      firstDrawnBeamedSingleUnitStemEnd = firstDrawnBeamedSingleUnit.stemTop
    }
  } else {
    if (anyStemDirectionChangesInBeamedSingleUnits) {
      firstDrawnBeamedSingleUnitStemEnd = Math.max(
        firstDrawnBeamedSingleUnitMinDefaultStemBottom,
        (maxBottomInCurrentBeamedSingleUnits + minTopInCurrentBeamedSingleUnits) / 2 -
        allBeamsHeightNormalWhereAllStemsWithSameDirection / 2
      )
      if (firstDrawnBeamedSingleUnitStemEnd > firstDrawnBeamedSingleUnitMaxDefaultStemBottom) {
        firstDrawnBeamedSingleUnitStemEnd = firstDrawnBeamedSingleUnitMaxDefaultStemBottom
      }
    } else {
      firstDrawnBeamedSingleUnitStemEnd = Math.max(firstDrawnBeamedSingleUnitDefaultStemBottom, maxBottomInCurrentBeamedSingleUnits + (progressionOfCurrentBeamedSingleUnitsIsSupposedToHaveHorizontalBeamLine ? defaultStemHeightForBeamedSingleUnits : minDefaultStemHeightForBeamedSingleUnits))
    }
    if (firstDrawnBeamedSingleUnitStemEnd < firstDrawnBeamedSingleUnit.stemBottom) {
      firstDrawnBeamedSingleUnitStemEnd = firstDrawnBeamedSingleUnit.stemBottom
    }
  }

  let lastDrawnBeamedSingleUnitStemEnd
  if (lastDrawnBeamedSingleUnit.stemDirection === 'up') {
    if (anyStemDirectionChangesInBeamedSingleUnits) {
      lastDrawnBeamedSingleUnitStemEnd = Math.min(
        firstDrawnBeamedSingleUnitStemEnd,
        lastDrawnBeamedSingleUnitMinDefaultStemTop,
        (maxBottomInCurrentBeamedSingleUnits + minTopInCurrentBeamedSingleUnits) / 2 +
        allBeamsHeightNormalWhereAllStemsWithSameDirection / 2
      )
      if (lastDrawnBeamedSingleUnitStemEnd + allBeamsHeightNormalWhereAllStemsWithSameDirection < lastDrawnBeamedSingleUnitMaxDefaultStemTop) {
        lastDrawnBeamedSingleUnitStemEnd = lastDrawnBeamedSingleUnitMaxDefaultStemTop
      }
      if (lastDrawnBeamedSingleUnitStemEnd - firstDrawnBeamedSingleUnitStemEnd > maxDifferenceBetweenStemEndsOfFirstAndLastBeamedSingleUnitWithDifferentStemDirections) {
        lastDrawnBeamedSingleUnitStemEnd = firstDrawnBeamedSingleUnitStemEnd + maxDifferenceBetweenStemEndsOfFirstAndLastBeamedSingleUnitWithDifferentStemDirections
      }
    } else {
      if (progressionOfCurrentBeamedSingleUnitsIsSupposedToHaveHorizontalBeamLine) {
        lastDrawnBeamedSingleUnitStemEnd = firstDrawnBeamedSingleUnitStemEnd
      } else {
        lastDrawnBeamedSingleUnitStemEnd = Math.min(lastDrawnBeamedSingleUnitDefaultStemTop, minTopInCurrentBeamedSingleUnits - (progressionOfCurrentBeamedSingleUnitsIsSupposedToHaveHorizontalBeamLine ? defaultStemHeightForBeamedSingleUnits : minDefaultStemHeightForBeamedSingleUnits))
      }
    }
    if (lastDrawnBeamedSingleUnitStemEnd > lastDrawnBeamedSingleUnit.stemTop) {
      lastDrawnBeamedSingleUnitStemEnd = lastDrawnBeamedSingleUnit.stemTop
    }
  } else {
    if (anyStemDirectionChangesInBeamedSingleUnits) {
      lastDrawnBeamedSingleUnitStemEnd = Math.max(
        firstDrawnBeamedSingleUnitStemEnd,
        lastDrawnBeamedSingleUnitMinDefaultStemBottom,
        (maxBottomInCurrentBeamedSingleUnits + minTopInCurrentBeamedSingleUnits) / 2 -
        allBeamsHeightNormalWhereAllStemsWithSameDirection / 2
      )
      if (lastDrawnBeamedSingleUnitStemEnd - allBeamsHeightNormalWhereAllStemsWithSameDirection > lastDrawnBeamedSingleUnitMaxDefaultStemBottom) {
        lastDrawnBeamedSingleUnitStemEnd = lastDrawnBeamedSingleUnitMaxDefaultStemBottom
      }
      if (firstDrawnBeamedSingleUnitStemEnd - lastDrawnBeamedSingleUnitStemEnd > maxDifferenceBetweenStemEndsOfFirstAndLastBeamedSingleUnitWithDifferentStemDirections) {
        lastDrawnBeamedSingleUnitStemEnd = firstDrawnBeamedSingleUnitStemEnd - maxDifferenceBetweenStemEndsOfFirstAndLastBeamedSingleUnitWithDifferentStemDirections
      }
    } else {
      if (progressionOfCurrentBeamedSingleUnitsIsSupposedToHaveHorizontalBeamLine) {
        lastDrawnBeamedSingleUnitStemEnd = firstDrawnBeamedSingleUnitStemEnd
      } else {
        lastDrawnBeamedSingleUnitStemEnd = Math.max(lastDrawnBeamedSingleUnitDefaultStemBottom, maxBottomInCurrentBeamedSingleUnits + (progressionOfCurrentBeamedSingleUnitsIsSupposedToHaveHorizontalBeamLine ? defaultStemHeightForBeamedSingleUnits : minDefaultStemHeightForBeamedSingleUnits))
      }
    }
    if (lastDrawnBeamedSingleUnitStemEnd < lastDrawnBeamedSingleUnit.stemBottom) {
      lastDrawnBeamedSingleUnitStemEnd = lastDrawnBeamedSingleUnit.stemBottom
    }
  }

  return {
    firstDrawnBeamedSingleUnitStemEnd,
    lastDrawnBeamedSingleUnitStemEnd
  }
}
