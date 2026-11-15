'use strict'

export function attachRecognizedInstrumentTitles (pageSchema, recognizedText) {
  const attached = recognizedText.lines.filter((line) =>
    line.status === 'exact' && line.target?.targetType === 'instrumentTitle' && line.text.length
  )
  if (!attached.length) {
    return pageSchema
  }
  const measuresParams = pageSchema.measuresParams.map((measure) => ({ ...measure }))
  for (const line of attached) {
    const { measureIndex, staveIndex } = line.target
    if (!measuresParams[measureIndex]) {
      continue
    }
    const existing = measuresParams[measureIndex].instrumentTitlesParams || []
    measuresParams[measureIndex].instrumentTitlesParams = [
      ...existing,
      {
        value: line.text,
        staveNumber: staveIndex,
        staveStartNumber: staveIndex,
        staveEndNumber: staveIndex
      }
    ]
  }
  return { ...pageSchema, measuresParams }
}

export default attachRecognizedInstrumentTitles
