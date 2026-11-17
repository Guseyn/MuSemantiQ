'use strict'

import findBracketComponents from './findBracketComponents.js'
import findOctaveAndPedalSpanComponents from './findOctaveAndPedalSpanComponents.js'
import findGlissandoComponents from './findGlissandoComponents.js'
import findTremoloStrokeComponents from './findTremoloStrokeComponents.js'

export function findFeatureGeometry (bitmap, components, staves, stems, blobs) {
  const brackets = findBracketComponents(components, staves, blobs)
  const spans = findOctaveAndPedalSpanComponents(components, staves, blobs)
  const glissandoLines = findGlissandoComponents(bitmap, components, staves)
  const tremoloStrokes = findTremoloStrokeComponents(bitmap, components, staves, stems)
  const tupletBrackets = brackets.filter((bracket) => bracket.className === 'tuplet-bracket')
  const voltaBrackets = brackets.filter((bracket) => bracket.className === 'volta-bracket')
  const octaveSpans = spans.filter((span) => span.className === 'octave-span')
  const pedalBrackets = spans.filter((span) => span.className === 'pedal-bracket')
  const lines = [ ...brackets, ...spans, ...glissandoLines, ...tremoloStrokes ]
  return {
    tupletBrackets,
    voltaBrackets,
    octaveSpans,
    pedalBrackets,
    glissandoLines,
    tremoloStrokes,
    lines,
    geometryBoxes: new Set(lines.map((line) => line.box))
  }
}

export default findFeatureGeometry
