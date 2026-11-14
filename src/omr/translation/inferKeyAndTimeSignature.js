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
  const commonTime = leftOfNotes.find((blob) => blob.className === 'common-time' || blob.className === 'cut-time')
  if (commonTime) {
    return {
      numerator: commonTime.className === 'cut-time' ? '2' : '4',
      denominator: commonTime.className === 'cut-time' ? '2' : '4',
      cMode: true
    }
  }
  const digits = leftOfNotes.filter((blob) => blob.className.startsWith('digit-'))
  const rows = digitRows(digits, staffSpaceHeightPx)
  if (rows.length !== 2) {
    return null
  }
  const [ top, bottom ] = rows
  if (Math.abs(top.x - bottom.x) > 0.5 * staffSpaceHeightPx) {
    return null
  }
  return {
    numerator: top.value,
    denominator: bottom.value
  }
}

function digitRows (digits, staffSpaceHeightPx) {
  const centerY = (blob) => blob.box.y + (blob.box.h - 1) / 2
  const centerX = (blob) => blob.box.x + (blob.box.w - 1) / 2
  const rows = []
  for (const blob of [ ...digits ].sort((first, second) => centerY(first) - centerY(second))) {
    const current = rows[rows.length - 1]
    if (current && Math.abs(centerY(blob) - current.centerY) <= 0.75 * staffSpaceHeightPx) {
      current.blobs.push(blob)
      current.centerY = current.blobs.reduce((sum, item) => sum + centerY(item), 0) / current.blobs.length
    } else {
      rows.push({ centerY: centerY(blob), blobs: [ blob ] })
    }
  }
  return rows.map((row) => {
    const blobs = row.blobs.sort((first, second) => centerX(first) - centerX(second))
    return {
      x: centerX(blobs[0]),
      value: blobs.map((blob) => blob.className.slice('digit-'.length)).join('')
    }
  })
}

export default inferKeyAndTimeSignature
