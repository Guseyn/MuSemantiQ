'use strict'

// Text geometry selects a possible owner before OCR. The recognized string is
// still required before any dynamic, chord, lyric or tempo field is written.
export function assignTextBlockTargets (textBlocks, musicModel, staves, systems) {
  const units = unitsWithLocations(musicModel)
  return textBlocks.map((block) => {
    if (block.role === 'instrument') {
      const target = instrumentTarget(block, musicModel, staves, systems)
      return target ? { ...block, target } : block
    }
    if (block.role !== 'text') {
      return block
    }
    const centerX = block.box.x + block.box.w / 2
    const centerY = block.box.y + block.box.h / 2
    const candidates = units.map((unit) => {
      const stave = staves[unit.staveIndex]
      const interval = stave.intervalBetweenStaveLines
      const horizontal = Math.abs(unit.x - centerX)
      const vertical = centerY < stave.topY
        ? stave.topY - centerY
        : centerY > stave.bottomY ? centerY - stave.bottomY : 0
      return { unit, stave, horizontal, vertical, interval }
    }).filter((candidate) => candidate.horizontal <= 5 * candidate.interval && candidate.vertical <= 4 * candidate.interval)
      .sort((first, second) => first.vertical - second.vertical || first.horizontal - second.horizontal)
    if (!candidates.length) {
      return block
    }
    const { unit, stave } = candidates[0]
    return {
      ...block,
      target: {
        targetType: 'unitTextCandidate',
        measureIndex: unit.measureIndex,
        staveIndex: unit.staveIndex,
        voiceIndex: unit.voiceIndex,
        unitIndex: unit.unitIndex,
        staveTopY: stave.topY,
        staveBottomY: stave.bottomY,
        centerY
      }
    }
  })
}

function instrumentTarget (block, musicModel, staves, systems) {
  const centerY = block.box.y + block.box.h / 2
  const system = [ ...systems ].sort((first, second) =>
    distanceOutside(centerY, first.topY, first.bottomY) - distanceOutside(centerY, second.topY, second.bottomY)
  )[0]
  if (!system) {
    return null
  }
  const measureIndex = musicModel.measures.findIndex((measure) => (measure.systemIndex ?? 0) === system.index)
  const staveIndex = [ ...system.staveIndexes ].sort((first, second) =>
    distanceOutside(centerY, staves[first].topY, staves[first].bottomY) -
    distanceOutside(centerY, staves[second].topY, staves[second].bottomY)
  )[0]
  return measureIndex < 0 || staveIndex === undefined
    ? null
    : { targetType: 'instrumentTitle', measureIndex, staveIndex }
}

function unitsWithLocations (musicModel) {
  return musicModel.measures.flatMap((measure, measureIndex) => measure.staves.flatMap((stave) =>
    stave.voices.flatMap((voice, voiceIndex) => voice.map((unit, unitIndex) => ({
      x: unit.x,
      measureIndex,
      staveIndex: stave.staveIndex,
      voiceIndex,
      unitIndex
    })))
  ))
}

function distanceOutside (value, start, end) {
  return value < start ? start - value : value > end ? value - end : 0
}

export default assignTextBlockTargets
