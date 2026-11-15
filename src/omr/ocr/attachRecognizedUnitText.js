'use strict'

/**
 * Attach exact text to the unit named by its OCR target. A target is:
 * `{ targetType, measureIndex, staveIndex, voiceIndex, unitIndex }`, with an
 * optional `articulationIndex` for a dynamic mark. Missing units are left
 * alone; OCR does not invent musical structure.
 */
export function attachRecognizedUnitText (pageSchema, recognizedText) {
  const lines = Array.isArray(recognizedText) ? recognizedText : recognizedText.lines || []
  const attached = lines.filter((line) => line.status === 'exact' && typeof line.text === 'string' && line.text.length && line.target)
  if (!attached.length) {
    return pageSchema
  }
  const copy = clone(pageSchema)
  for (const line of attached) {
    const target = line.target
    if (![ target.measureIndex, target.staveIndex, target.voiceIndex, target.unitIndex ].every(isIndex)) {
      continue
    }
    const unit = copy.measuresParams?.[target.measureIndex]
      ?.stavesParams?.[target.staveIndex]
      ?.voicesParams?.[target.voiceIndex]
      ?.[target.unitIndex]
    if (!unit || typeof unit !== 'object') {
      continue
    }
    if (target.targetType === 'relatedChordLetter') {
      unit.relatedChordLetter = {
        ...(unit.relatedChordLetter || {}),
        direction: target.centerY < target.staveTopY ? 'up' : 'down',
        textValue: line.text
      }
    }
    if (target.targetType === 'dynamicMark') {
      attachDynamicMark(unit, line.text, target)
    }
    if (target.targetType === 'relatedLyrics') {
      unit.relatedLyrics = [ ...(unit.relatedLyrics || []), lyricFrom(line.text) ]
      if (copy.lyricsUnderStaveIndex === undefined) {
        copy.lyricsUnderStaveIndex = target.staveIndex
      }
    }
    if (target.targetType === 'tempoMark') {
      copy.measuresParams[target.measureIndex].tempoMark = {
        ...(copy.measuresParams[target.measureIndex].tempoMark || {}),
        textValueParts: [ line.text ]
      }
    }
    if (target.targetType === 'repetitionNote') {
      copy.measuresParams[target.measureIndex].repetitionNote = {
        value: line.text,
        measurePosition: target.unitIndex === 0 ? 'start' : 'end'
      }
    }
    if (target.targetType === 'noteLetter') {
      const articulations = Array.isArray(unit.articulationParams) ? unit.articulationParams : []
      unit.articulationParams = [ ...articulations, {
        name: 'noteLetter',
        direction: target.centerY < target.staveTopY ? 'up' : 'down',
        textValue: line.text
      } ]
    }
  }
  return copy
}

function attachDynamicMark (unit, text, target) {
  const articulations = Array.isArray(unit.articulationParams) ? unit.articulationParams : []
  let index = target.articulationIndex
  if (index === undefined) {
    index = articulations.findIndex((articulation) => articulation.name === 'dynamicMark')
    if (index < 0) {
      index = articulations.length
    }
  }
  if (!isIndex(index) || index > articulations.length) {
    return
  }
  articulations[index] = {
    ...(articulations[index] || {}),
    name: 'dynamicMark',
    direction: target.centerY < target.staveTopY ? 'up' : 'down',
    textValue: text
  }
  unit.articulationParams = articulations
}

function lyricFrom (text) {
  const dashAfter = text.endsWith('-')
  const underscoreStarts = text.startsWith('_')
  const underscoreFinishes = text.endsWith('_') && !dashAfter
  const textValue = text.replace(/^_+|[-_]+$/g, '')
  return {
    textValue,
    ...(dashAfter ? { dashAfter: true } : {}),
    ...(underscoreStarts ? { underscoreStarts: true } : {}),
    ...(underscoreFinishes ? { underscoreFinishes: true } : {})
  }
}

function isIndex (value) {
  return Number.isInteger(value) && value >= 0
}

function clone (value) {
  if (Array.isArray(value)) {
    return value.map(clone)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([ key, field ]) => [ key, clone(field) ]))
  }
  return value
}

export default attachRecognizedUnitText
