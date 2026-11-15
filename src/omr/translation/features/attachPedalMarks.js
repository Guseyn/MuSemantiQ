'use strict'

import { addSourceBlobs, centerX, nearestUnit, rightX, spanEndpoints, unitEntries, unitX } from './featureGeometry.js'

// Explicit pedal glyphs form a sequence on each stave. Brackets carry their
// own start and closure evidence; a variable peak or release is not paired by
// proximity alone when no pedal is active.
export default function attachPedalMarks (measures, blobs, staves, pedalBrackets) {
  let pedalIndex = 0
  const consumedGlyphs = new Set()
  for (const bracket of pedalBrackets) {
    if (bracket.staveIndex === null || bracket.staveIndex === undefined) {
      continue
    }
    const interval = staves[bracket.staveIndex].intervalBetweenStaveLines
    const entries = unitEntries(measures, bracket.staveIndex, { notesOnly: true })
    const endpoints = spanEndpoints(entries, bracket.box.x, rightX(bracket), 2 * interval)
    if (!endpoints || endpoints.left === endpoints.right ||
      endpoints.left.unit.pedalMark || endpoints.right.unit.pedalMark) {
      continue
    }
    const key = `pedal-${++pedalIndex}`
    endpoints.left.unit.pedalMark = { key, start: true, withBrackets: true, finish: false }
    endpoints.right.unit.pedalMark = {
      key,
      release: true,
      withBrackets: true,
      withBracketClosure: true,
      finish: true
    }
    addSourceBlobs(endpoints.left.unit, [ bracket ])
    addSourceBlobs(endpoints.right.unit, [ bracket ])
    for (const glyph of blobs.filter((blob) => blob.staveIndex === bracket.staveIndex &&
      ((blob.className === 'pedal' && Math.abs(centerX(blob) - unitX(endpoints.left.unit)) <= 1.5 * interval) ||
        (blob.className === 'pedal-release' && Math.abs(centerX(blob) - unitX(endpoints.right.unit)) <= 1.5 * interval)))) {
      consumedGlyphs.add(glyph)
      addSourceBlobs(glyph.className === 'pedal' ? endpoints.left.unit : endpoints.right.unit, [ glyph ])
    }
    for (const peak of blobs.filter((blob) => blob.className === 'pedal-variable-peak' &&
      blob.staveIndex === bracket.staveIndex && centerX(blob) > unitX(endpoints.left.unit) &&
      centerX(blob) < unitX(endpoints.right.unit))) {
      const entry = nearestUnit(endpoints.spanned.filter((candidate) => !candidate.unit.pedalMark), centerX(peak), 1.5 * interval)
      if (entry) {
        entry.unit.pedalMark = { key, variablePeak: true }
        consumedGlyphs.add(peak)
        addSourceBlobs(entry.unit, [ peak ])
      }
    }
  }

  const activeByStave = new Map()
  const glyphs = blobs.filter((blob) => [ 'pedal', 'pedal-release', 'pedal-variable-peak' ].includes(blob.className) &&
    blob.staveIndex !== null && blob.staveIndex !== undefined && !consumedGlyphs.has(blob))
    .sort((first, second) => centerX(first) - centerX(second))
  for (const glyph of glyphs) {
    const interval = staves[glyph.staveIndex].intervalBetweenStaveLines
    const active = activeByStave.get(glyph.staveIndex)
    let entries = unitEntries(measures, glyph.staveIndex, { notesOnly: true })
      .filter((entry) => !entry.unit.pedalMark)
    if (active && glyph.className !== 'pedal') {
      const sameVoice = entries.filter((entry) => entry.voiceIndex === active.entry.voiceIndex)
      if (sameVoice.length) {
        entries = sameVoice
      }
    }
    const entry = nearestUnit(entries, centerX(glyph), 1.5 * interval)
    if (!entry) {
      continue
    }
    if (glyph.className === 'pedal') {
      const key = `pedal-${++pedalIndex}`
      entry.unit.pedalMark = { key, textValue: 'Ped.', start: true, finish: true }
      activeByStave.set(glyph.staveIndex, { key, entry })
      addSourceBlobs(entry.unit, [ glyph ])
      continue
    }
    if (!active) {
      continue
    }
    if (glyph.className === 'pedal-variable-peak') {
      active.entry.unit.pedalMark.finish = false
      entry.unit.pedalMark = { key: active.key, variablePeak: true }
      addSourceBlobs(entry.unit, [ glyph ])
      continue
    }
    active.entry.unit.pedalMark.finish = false
    entry.unit.pedalMark = { key: active.key, release: true, finish: true }
    addSourceBlobs(entry.unit, [ glyph ])
    activeByStave.delete(glyph.staveIndex)
  }
}
