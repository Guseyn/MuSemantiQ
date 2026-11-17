'use strict'

import { addSourceBlobs, bottomY, rightX, unitEntries } from './featureGeometry.js'

// Beams are duration evidence, not tremolo evidence. Only separately measured
// tremolo strokes (or an explicit stroke count on a stem) create tremoloParams.
export default function attachTremolos (measures, staves, tremoloStrokes) {
  for (let staveIndex = 0; staveIndex < staves.length; staveIndex++) {
    const entries = unitEntries(measures, staveIndex, { notesOnly: true })
      .filter((entry) => entry.unit.stem)
    for (const entry of entries) {
      const stem = entry.unit.stem
      const count = stem.tremoloStrokeCount ?? (Array.isArray(stem.tremoloStrokes) ? stem.tremoloStrokes.length : null)
      if (Number.isInteger(count) && count >= 1 && count <= 3 && !entry.unit.tremoloParams) {
        entry.unit.tremoloParams = {
          type: stem.tremoloType === 'withNext' ? 'withNext' : 'single',
          customNumberOfTremoloStrokes: count
        }
        addSourceBlobs(entry.unit, [ stem, ...(Array.isArray(stem.tremoloStrokes) ? stem.tremoloStrokes : []) ])
      }
    }

    const groups = new Map()
    for (const stroke of tremoloStrokes.filter((item) => item.staveIndex === staveIndex)) {
      const attachment = attachmentOf(stroke, entries, staves[staveIndex].intervalBetweenStaveLines)
      if (!attachment) {
        continue
      }
      const key = `${attachment.type}:${entries.indexOf(attachment.left)}:${entries.indexOf(attachment.right)}`
      if (!groups.has(key)) {
        groups.set(key, { ...attachment, strokes: [] })
      }
      groups.get(key).strokes.push(stroke)
    }
    for (const group of groups.values()) {
      const count = group.strokes.length
      if (count < 1 || count > 3 || group.left.unit.tremoloParams) {
        continue
      }
      group.left.unit.tremoloParams = { type: group.type, customNumberOfTremoloStrokes: count }
      addSourceBlobs(group.left.unit, group.strokes)
      if (group.right !== group.left) {
        addSourceBlobs(group.right.unit, group.strokes)
      }
    }
  }
}

function attachmentOf (stroke, entries, interval) {
  const touching = entries.filter((entry) => {
    const stem = entry.unit.stem
    return stem.x >= stroke.box.x - 0.5 * interval && stem.x <= rightX(stroke) + 0.5 * interval &&
      bottomY(stroke) >= stem.y1 - 0.5 * interval && stroke.box.y <= stem.y2 + 0.5 * interval
  }).sort((first, second) => first.unit.stem.x - second.unit.stem.x)
  if (touching.length === 1) {
    return { type: 'single', left: touching[0], right: touching[0] }
  }
  if (touching.length === 2 && consecutiveStemmedUnits(touching[0], touching[1], entries)) {
    return { type: 'withNext', left: touching[0], right: touching[1] }
  }
  if (touching.length) {
    return null
  }
  const left = entries.filter((entry) => entry.unit.stem.x < stroke.box.x)
    .sort((first, second) => second.unit.stem.x - first.unit.stem.x)[0]
  const right = entries.filter((entry) => entry.unit.stem.x > rightX(stroke))
    .sort((first, second) => first.unit.stem.x - second.unit.stem.x)[0]
  if (left && right && right.unit.stem.x - left.unit.stem.x <= 4 * interval &&
    consecutiveStemmedUnits(left, right, entries)) {
    return { type: 'withNext', left, right }
  }
  return null
}

function consecutiveStemmedUnits (left, right, entries) {
  if (left.voiceIndex !== right.voiceIndex) {
    return false
  }
  const voice = entries.filter((entry) => entry.voiceIndex === left.voiceIndex)
  const leftIndex = voice.indexOf(left)
  return leftIndex >= 0 && voice[leftIndex + 1] === right
}
