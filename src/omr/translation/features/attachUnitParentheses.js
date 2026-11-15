'use strict'

import { roleOf } from '#msq/omr/analysis/symbolClasses.js'
import { addSourceBlobs, centerX, centerY, rightX, unitEntries, unitX } from './featureGeometry.js'

const KEY_TYPES = {
  sharp: 'sharpKey',
  flat: 'flatKey',
  natural: 'naturalKey',
  'double-sharp': 'doubleSharpKey',
  'double-flat': 'doubleFlatKey',
  demiflat: 'demiflatKey',
  sesquiflat: 'sesquiflatKey',
  demisharp: 'demisharpKey',
  sesquisharp: 'sesquisharpKey'
}

// A pair is consumed only when it encloses one whole unit or one accidental.
// An unmatched bracket, or a pair around part of a chord, remains visible as
// unclassified evidence rather than becoming a guess about the affected notes.
export default function attachUnitParentheses (measures, blobs, staves) {
  const closes = new Set()
  const openings = blobs.filter((blob) => blob.className === 'parenthesis-open')
    .sort((first, second) => centerX(first) - centerX(second))
  for (const open of openings) {
    if (open.staveIndex === null || open.staveIndex === undefined) {
      continue
    }
    const interval = staves[open.staveIndex].intervalBetweenStaveLines
    const close = blobs.filter((blob) => blob.className === 'parenthesis-close' &&
      blob.staveIndex === open.staveIndex && !closes.has(blob) &&
      centerX(blob) > rightX(open) && centerX(blob) - rightX(open) <= 4 * interval &&
      Math.abs(centerY(blob) - centerY(open)) <= 2 * interval)
      .sort((first, second) => centerX(first) - centerX(second))[0]
    if (!close) {
      continue
    }
    const entries = unitEntries(measures, open.staveIndex)
    const whole = entries.filter((entry) => headsOf(entry.unit).length && headsOf(entry.unit).every((head) =>
      head.box.x >= rightX(open) - 0.25 * interval && rightX(head) <= close.box.x + 0.25 * interval))
    if (whole.length === 1 && Math.abs(unitX(whole[0].unit) - (centerX(open) + centerX(close)) / 2) <= 2 * interval) {
      const unit = whole[0].unit
      unit.parentheses = [ ...(unit.parentheses || []), { id: (unit.parentheses || []).length, appliedToWholeUnit: true } ]
      addSourceBlobs(unit, [ open, close ])
      closes.add(close)
      continue
    }
    const accidental = entries.flatMap((entry) => (entry.unit.sourceBlobs || [])
      .filter((blob) => KEY_TYPES[blob.className] && inside(blob, open, close))
      .map((blob) => ({ entry, blob })))
    if (accidental.length === 1 && addParenthesesToAccidental(accidental[0].entry.unit, accidental[0].blob)) {
      addSourceBlobs(accidental[0].entry.unit, [ open, close ])
      closes.add(close)
    }
  }
}

function headsOf (unit) {
  return (unit.sourceBlobs || []).filter((blob) => roleOf(blob.className) === 'head')
}

function inside (blob, open, close) {
  return blob.box.x > rightX(open) && rightX(blob) < close.box.x
}

// buildPageSchemaFromMusicModel derives keysParams from note.keys. Moving the
// complete set here preserves that derivation while adding the one observed
// withParentheses flag; unparenthesised accidentals keep their existing data.
function addParenthesesToAccidental (unit, parenthesisedBlob) {
  const keyBlobs = (unit.sourceBlobs || []).filter((blob) => KEY_TYPES[blob.className])
  const keysParams = []
  let found = false
  for (const note of unit.notes) {
    const matchingBlobs = keyBlobs.filter((blob) => Math.abs(blob.positionNumber - note.positionNumber) <= 1)
    const used = new Set()
    for (const keyType of note.keys || []) {
      const blob = matchingBlobs.find((candidate) => !used.has(candidate) && KEY_TYPES[candidate.className] === keyType)
      if (blob) {
        used.add(blob)
      }
      const withParentheses = blob === parenthesisedBlob
      found = found || withParentheses
      keysParams.push({
        noteName: note.noteName,
        octaveNumber: note.octaveNumber,
        positionNumber: note.positionNumber / 2,
        keyType,
        id: keysParams.length,
        ...(withParentheses ? { withParentheses: true } : {})
      })
    }
  }
  if (!found) {
    return false
  }
  unit.keysParams = keysParams
  for (const note of unit.notes) {
    note.keys = []
  }
  return true
}
