'use strict'

import deskewBitmap from '#msq/omr/analysis/deskewBitmap.js'
import { analyzeStraightenedImage } from '#msq/omr/analysis/analyzeImage.js'
import extractSymbols from '#msq/omr/analysis/extractSymbols.js'
import classifyComponent from '#msq/omr/analysis/classifyComponent.js'
import { resampleToGrid } from '#msq/omr/training/cropComponents.js'
import shippedModel from '#msq/omr/model/shippedModel.js'
import buildMusicModel from '#msq/omr/translation/buildMusicModel.js'
import buildPageSchemaFromMusicModel from '#msq/omr/translation/buildPageSchemaFromMusicModel.js'
import carryStateAcrossPages from '#msq/omr/translation/carryStateAcrossPages.js'
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
  const upright = deskewBitmap(bitmap)
  const analysis = analyzeStraightenedImage(upright)
  const classify = options.classify || classifyWithModel(options)
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
  // no numbers given, no problem: the shipped model knows the classes it
  // was trained with, and says so in its own file
  const loaded = model ? { model, classIds } : shippedModel()
  if (!loaded.classIds) {
    throw new Error('a model needs its classIds — the order it was trained with')
  }
  // Training drew each symbol centred in a square of twice its nominal size,
  // and the model has only ever seen symbols framed like that. The
  // component's own box, framed twice as wide, puts it in the same picture.
  return (pixels, box, source) => {
    const side = 2 * Math.max(box.w, box.h)
    const centerX = box.x + box.w / 2
    const centerY = box.y + box.h / 2
    return classifyComponent(
      loaded.model,
      resampleToGrid(source, {
        x1: centerX - side / 2,
        y1: centerY - side / 2,
        x2: centerX + side / 2,
        y2: centerY + side / 2
      }, loaded.model.shape.gridSize),
      loaded.classIds,
      threshold
    )
  }
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
