'use strict'

import deskewBitmap from '#msq/omr/analysis/deskewBitmap.js'
import { analyzeStraightenedImage } from '#msq/omr/analysis/analyzeImage.js'
import extractSymbols from '#msq/omr/analysis/extractSymbols.js'
import classifyComponent from '#msq/omr/analysis/classifyComponent.js'
import { roleOf } from '#msq/omr/analysis/symbolClasses.js'
import { resampleComponentToGrid } from '#msq/omr/training/cropComponents.js'
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
  const symbols = extractSymbols(upright, analysis.staves, { classify, textBlocks: analysis.textBlocks })
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
      report: createReport(symbols, withState.musicModel, msqText),
      ...(options.diagnostics ? { diagnostics: createDiagnostics(analysis, symbols) } : {})
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
  return (pixels, box, source) => classifyComponent(
    loaded.model,
    resampleComponentToGrid(source, box, loaded.model.shape.gridSize),
    loaded.classIds,
    threshold
  )
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

function createDiagnostics (analysis, symbols) {
  const classes = {}
  for (const blob of symbols.blobs) {
    classes[blob.className] = (classes[blob.className] || 0) + 1
  }
  return {
    staves: analysis.staves.length,
    systems: analysis.systems.map((system) => system.staveIndexes),
    barLines: symbols.barLines,
    stems: symbols.stems.length,
    curves: symbols.curves.length,
    hairpins: symbols.hairpins.length,
    blobs: symbols.blobs.length,
    unassignedBlobs: symbols.blobs.filter((blob) => blob.staveIndex === null).length,
    classes
  }
}

function createReport ({ blobs }, musicModel, msqText) {
  const unitsInTextOrder = unitsInSerializationOrder(musicModel)
  const consumedBlobs = new Set(unitsInTextOrder.flatMap((entry) => entry.unit.sourceBlobs || []))
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
    ignored: blobs.flatMap((blob) => {
      const supportedRoles = [ 'head', 'rest', 'clef', 'accidental', 'dot', 'digit' ]
      const unsupported = blob.className === 'other' ||
        (!supportedRoles.includes(roleOf(blob.className)) && !consumedBlobs.has(blob))
      if (!unsupported && blob.staveIndex !== null) {
        return []
      }
      return [ {
        box: blob.box,
        staveIndex: blob.staveIndex,
        className: blob.className,
        confidence: blob.confidence,
        reason: blob.staveIndex === null ? 'no staff owns this ink' : 'this class has no music translation'
      } ]
    })
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
