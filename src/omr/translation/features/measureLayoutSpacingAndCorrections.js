'use strict'

export default function measureLayoutSpacingAndCorrections (musicModel, staves) {
  const systemDensities = []
  for (const measure of musicModel.measures) {
    for (const stave of measure.staves) {
      for (const voice of stave.voices) {
        const units = voice.filter((unit) => Number.isFinite(unit.x) && !unit.isRest && unit.unitDuration > 0)
          .sort((first, second) => first.x - second.x)
        if (units.length < 2) {
          continue
        }
        const points = []
        let cumulative = 0
        for (const unit of units) {
          points.push({ unit, x: unit.x, duration: cumulative })
          cumulative += unit.unitDuration
        }
        const density = slope(points)
        if (!density) {
          continue
        }
        systemDensities[measure.systemIndex ?? 0] = [ ...(systemDensities[measure.systemIndex ?? 0] || []), density ]
        const intercept = mean(points.map((point) => point.x)) - density * mean(points.map((point) => point.duration))
        const interval = staves[stave.staveIndex].intervalBetweenStaveLines
        for (const point of points) {
          const expectedX = intercept + density * point.duration
          const correction = (point.x - expectedX) / interval
          if (Math.abs(correction) >= 0.5 && point.unit.relatedXCorrection === undefined) {
            point.unit.relatedXCorrection = roundTo2(correction)
          }
        }
      }
    }
  }
  const baselines = systemDensities.map((densities, systemIndex) => ({
    systemIndex,
    density: median(densities || [])
  })).filter((entry) => entry.density > 0)
  const baseline = median(baselines.map((entry) => entry.density))
  if (!baseline) {
    return
  }
  baselines.forEach(({ density, systemIndex }) => {
    const ratio = density / baseline
    if (ratio >= 1.05) {
      musicModel.stretchUnitsByNTimesInLines = musicModel.stretchUnitsByNTimesInLines || []
      musicModel.stretchUnitsByNTimesInLines[systemIndex] = roundTo2(ratio)
    } else if (ratio <= 0.95) {
      musicModel.compressUnitsByNTimesInLines = musicModel.compressUnitsByNTimesInLines || []
      musicModel.compressUnitsByNTimesInLines[systemIndex] = roundTo2(1 / ratio)
    }
  })
}

function slope (points) {
  const meanDuration = mean(points.map((point) => point.duration))
  const meanX = mean(points.map((point) => point.x))
  const variance = points.reduce((sum, point) => sum + (point.duration - meanDuration) ** 2, 0)
  if (!variance) {
    return 0
  }
  const covariance = points.reduce((sum, point) => sum + (point.duration - meanDuration) * (point.x - meanX), 0)
  const value = covariance / variance
  return value > 0 ? value : 0
}

function mean (values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function median (values) {
  const sorted = [ ...values ].sort((first, second) => first - second)
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0
}

function roundTo2 (value) {
  return Math.round(value * 100) / 100
}
