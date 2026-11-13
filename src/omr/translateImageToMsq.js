'use strict'

import deskewBitmap from './analysis/deskewBitmap.js'
import { analyzeStraightenedImage } from './analysis/analyzeImage.js'
import extractSymbols from './analysis/extractSymbols.js'
import classifyComponent from './analysis/classifyComponent.js'
import buildMusicModel from './translation/buildMusicModel.js'
import buildPageSchemaFromMusicModel from './translation/buildPageSchemaFromMusicModel.js'
import carryStateAcrossPages from './translation/carryStateAcrossPages.js'
import serialize from '#msq/language/serializer/serialize.js'

/**
 * A score image becomes MSQ text and a report.
 *
 * Straighten once, measure, extract symbols, walk the music rules, hand the
 * page schema to the language's own serializer — so the text round-trips
 * through the parser by construction. The measured styles ride along as the
 * page's style commands. The report names what the classifier was unsure of,
 * with the unit it became and its line in the text; nothing uncertain becomes
 * silent fact.
 */

export function translateImageToMsq (bitmap, options = {}) {
  return translatePage(bitmap, options).result
}

// The same, with the page's carry-over state in and out — what
// translateImagesToMsqPages threads through a project's pages.
export function translatePage (bitmap, options = {}, carried = {}) {
  const classify = options.classify || classifyWithModel(options)
  const upright = deskewBitmap(bitmap)
  const analysis = analyzeStraightenedImage(upright)
  const symbols = extractSymbols(upright, analysis.staves, { classify })
  const built = buildMusicModel(symbols, analysis.staves)
  const withState = carryStateAcrossPages(
    { musicModel: built, customStyles: customStylesFrom(analysis) },
    carried
  )
  const pageSchema = buildPageSchemaFromMusicModel(withState.musicModel)
  const msqText = serialize(pageSchema, withState.customStyles, {}, [])
  return {
    result: {
      msqText,
      report: createReport(symbols, withState.musicModel, msqText)
    },
    carried: withState.carried
  }
}

function classifyWithModel ({ model, classIds, threshold }) {
  return (pixels) => classifyComponent(model, pixels, classIds, threshold)
}

// Sizes in staff spaces and colours as measured; the one pixel anchor
// (`font size`) is left at its default on purpose.
function customStylesFrom (analysis) {
  const sizes = analysis.measuredStyles
  const colors = analysis.colors
  return {
    titleFontSize: sizes.titleFontSize,
    subtitleFontSize: sizes.subtitleFontSize,
    leftSubtitleFontSize: sizes.leftSubtitleFontSize,
    rightSubtitleFontSize: sizes.rightSubtitleFontSize,
    instrumentTitleFontSize: sizes.instrumentFontSize,
    pageNumberFontSize: sizes.pageNumberFontSize,
    intervalBetweenStaves: sizes.intervalBetweenStaves,
    intervalBetweenPageLines: sizes.intervalBetweenPageLines,
    backgroundColor: colors.background,
    fontColor: colors.text,
    staveLinesColor: colors.staveLines
  }
}

function createReport ({ blobs }, musicModel, msqText) {
  const unitsInTextOrder = unitsInSerializationOrder(musicModel)
  const unitLines = msqText.split('\n')
    .map((line, index) => ({ line, msqLine: index + 1 }))
    .filter(({ line }) => /^\d/.test(line))
  return {
    uncertain: blobs
      .filter((blob) => blob.className === 'unknown' || blob.confidence < 0.9)
      .map((blob) => {
        const position = positionOfBlob(blob, unitsInTextOrder)
        return {
          box: blob.box,
          staveIndex: blob.staveIndex,
          staffPosition: blob.staffPosition,
          className: blob.className,
          confidence: blob.confidence,
          candidates: blob.candidates,
          unit: position,
          msqLine: position ? (unitLines[position.flatIndex] || {}).msqLine || null : null
        }
      }),
    ignored: []
  }
}

function unitsInSerializationOrder (musicModel) {
  const ordered = []
  musicModel.measures.forEach((measure, measureIndex) => {
    measure.staves.forEach((stave, staveIndex) => {
      stave.voices.forEach((voice, voiceIndex) => {
        voice.forEach((unit, unitIndex) => {
          ordered.push({ unit, measureIndex, staveIndex, voiceIndex, unitIndex })
        })
      })
    })
  })
  return ordered.map((entry, flatIndex) => ({ ...entry, flatIndex }))
}

function positionOfBlob (blob, orderedUnits) {
  for (const entry of orderedUnits) {
    if ((entry.unit.sourceBlobs || []).includes(blob)) {
      return {
        measureIndex: entry.measureIndex,
        staveIndex: entry.staveIndex,
        voiceIndex: entry.voiceIndex,
        unitIndex: entry.unitIndex,
        flatIndex: entry.flatIndex
      }
    }
  }
  return null
}

export default translateImageToMsq
