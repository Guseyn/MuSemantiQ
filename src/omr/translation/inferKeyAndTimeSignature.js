'use strict'

/**
 * Key and time signatures, from the left edge of the first measure.
 *
 * A key signature is a row of sharps or flats right of the clef — counted,
 * and the count names the key (three flats is e flat major). A time signature
 * is two digits stacked: the meter. Both are read only where the engraving
 * always puts them: left of the first note.
 */

const KEY_SIGNATURE_NAMES = [
  'c major|a minor',
  'g major|e minor',
  'd major|b minor',
  'a major|f sharp minor',
  'e major|c sharp minor',
  'b major|g sharp minor',
  'f sharp major|d sharp minor',
  'c sharp major|a sharp minor',
  'f major|d minor',
  'b flat major|g minor',
  'e flat major|c minor',
  'a flat major|f minor',
  'd flat major|b flat minor',
  'g flat major|e flat minor',
  'c flat major|a flat minor'
]

export function inferKeyAndTimeSignature (blobs, headBlobs, staffSpaceHeightPx) {
  const firstHeadX = headBlobs.length
    ? Math.min(...headBlobs.map((blob) => blob.box.x))
    : Infinity
  const leftOfNotes = blobs.filter((blob) => blob.box.x < firstHeadX - 0.3 * staffSpaceHeightPx)
  return {
    keySignatureName: keySignatureOf(leftOfNotes, firstHeadX, staffSpaceHeightPx),
    timeSignatureParams: timeSignatureOf(leftOfNotes, firstHeadX, staffSpaceHeightPx)
  }
}

// Accidentals that are not hugging a head belong to the key.
function keySignatureOf (leftOfNotes, firstHeadX, staffSpaceHeightPx) {
  const keyAccidentals = leftOfNotes.filter((blob) =>
    (blob.className === 'sharp' || blob.className === 'flat') &&
    blob.box.x < firstHeadX - 0.7 * staffSpaceHeightPx
  )
  const sharps = keyAccidentals.filter((blob) => blob.className === 'sharp').length
  const flats = keyAccidentals.filter((blob) => blob.className === 'flat').length
  if (sharps && !flats) {
    return KEY_SIGNATURE_NAMES[Math.min(sharps, 7)]
  }
  if (flats && !sharps) {
    return KEY_SIGNATURE_NAMES[7 + Math.min(flats, 7)]
  }
  return null
}

function timeSignatureOf (leftOfNotes, firstHeadX, staffSpaceHeightPx) {
  const digits = leftOfNotes.filter((blob) => blob.className.startsWith('digit-'))
  const stacked = digits.filter((blob) => blob.box.x < firstHeadX - 0.3 * staffSpaceHeightPx)
  if (stacked.length !== 2) {
    return null
  }
  const [ top, bottom ] = stacked.sort((first, second) => first.box.y - second.box.y)
  const aligned = Math.abs(top.box.x - bottom.box.x) <= 0.4 * staffSpaceHeightPx
  if (!aligned) {
    return null
  }
  return {
    numerator: top.className.slice('digit-'.length),
    denominator: bottom.className.slice('digit-'.length)
  }
}

export default inferKeyAndTimeSignature
