'use strict'

/**
 * Barlines slice the timeline into measures.
 *
 * Units go to the measure their x falls in: left of the first barline is the
 * first measure, right of the last one is the final measure. A page with no
 * barlines at all is one measure — the score still has to make sense.
 */

export function buildMeasuresFromBarLines (units, barLines) {
  const sortedUnits = [ ...units ].sort((first, second) => first.x - second.x)
  const sortedBarLines = [ ...barLines ].sort((first, second) => first - second)
  const measures = [ [] ]
  let barLineIndex = 0
  for (const unit of sortedUnits) {
    while (barLineIndex < sortedBarLines.length && unit.x > sortedBarLines[barLineIndex]) {
      measures.push([])
      barLineIndex++
    }
    measures[measures.length - 1].push(unit)
  }
  return measures
}

export default buildMeasuresFromBarLines
