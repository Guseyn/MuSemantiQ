'use sttrict'

export default function (unitDuration, isGrace, allNotesInNonDisplacedUnitNoteHeadsAreGhosts, styles) {
  const { additionalOffsetForDisplacedPartOfUnitWithWholeDuration, additionalOffsetForDisplacedPartOfUnitWithQuadrupleDuration, additionalOffsetForDisplacedPartOfUnitWithDoubleDuration, additionalOffsetForDisplacedPartOfUnitWithAllGhostNotes, noteStemStrokeOptions, graceElementsScaleFactor } = styles
  const graceFactor = isGrace ? graceElementsScaleFactor : 1
  if (unitDuration === 1) {
    return additionalOffsetForDisplacedPartOfUnitWithWholeDuration * graceFactor
  }
  if (unitDuration === 2) {
    return additionalOffsetForDisplacedPartOfUnitWithDoubleDuration * graceFactor
  }
  if (unitDuration === 4) {
    return additionalOffsetForDisplacedPartOfUnitWithQuadrupleDuration * graceFactor
  }
  if (allNotesInNonDisplacedUnitNoteHeadsAreGhosts) {
    return additionalOffsetForDisplacedPartOfUnitWithAllGhostNotes * graceFactor
  }
  return -noteStemStrokeOptions.width / 2 * graceFactor
}
