'use strict'

// Vertical gaps are measured where they occur. A page average can describe a
// style, but it cannot stand in for a particular pair of staves or page lines.
export function measureLocalIntervals (staves, systems) {
  const intervalBetweenStaves = []
  const intervalBetweenPageLines = []
  const orderedSystems = [ ...systems ].sort((first, second) => first.topY - second.topY)
  for (const system of orderedSystems) {
    const orderedStaves = system.staveIndexes.map((index) => ({ ...staves[index], index }))
      .sort((first, second) => first.topY - second.topY)
    for (let index = 1; index < orderedStaves.length; index++) {
      const upper = orderedStaves[index - 1]
      const lower = orderedStaves[index]
      const pixels = lower.topY - upper.bottomY
      intervalBetweenStaves.push({
        pageLineNumber: system.index + 1,
        upperStaveIndex: upper.index,
        lowerStaveIndex: lower.index,
        pixels,
        value: pixels / mean([ upper.intervalBetweenStaveLines, lower.intervalBetweenStaveLines ])
      })
    }
  }
  for (let index = 1; index < orderedSystems.length; index++) {
    const upper = orderedSystems[index - 1]
    const lower = orderedSystems[index]
    const upperStaves = upper.staveIndexes.map((staveIndex) => staves[staveIndex])
    const lowerStaves = lower.staveIndexes.map((staveIndex) => staves[staveIndex])
    const pixels = lower.topY - upper.bottomY
    intervalBetweenPageLines.push({
      upperPageLineNumber: upper.index + 1,
      lowerPageLineNumber: lower.index + 1,
      pixels,
      value: pixels / mean([ ...upperStaves, ...lowerStaves ].map((stave) => stave.intervalBetweenStaveLines))
    })
  }
  return { intervalBetweenStaves, intervalBetweenPageLines }
}

function mean (values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export default measureLocalIntervals
