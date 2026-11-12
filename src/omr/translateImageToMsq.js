'use strict'

import deskewBitmap from './analysis/deskewBitmap.js'
import { analyzeStraightenedImage } from './analysis/analyzeImage.js'
import extractSymbols from './analysis/extractSymbols.js'
import classifyComponent from './analysis/classifyComponent.js'
import buildMusicModel from './translation/buildMusicModel.js'
import buildPageSchemaFromMusicModel from './translation/buildPageSchemaFromMusicModel.js'
import serialize from '#msq/language/serializer/serialize.js'

/**
 * A score image becomes MSQ text and a report.
 *
 * Straighten once, measure, extract symbols, walk the music rules, hand the
 * page schema to the language's own serializer — so the text round-trips
 * through the parser by construction. The report names what the classifier
 * was unsure of; nothing uncertain becomes silent fact.
 */

export function translateImageToMsq (bitmap, options = {}) {
  const classify = options.classify || classifyWithModel(options)
  const upright = deskewBitmap(bitmap)
  const analysis = analyzeStraightenedImage(upright)
  const symbols = extractSymbols(upright, analysis.staves, { classify })
  const musicModel = buildMusicModel(symbols, analysis.staves)
  const pageSchema = buildPageSchemaFromMusicModel(musicModel)
  return {
    msqText: serialize(pageSchema, {}, {}, []),
    report: createReport(symbols)
  }
}

function classifyWithModel ({ model, classIds, threshold }) {
  return (pixels) => classifyComponent(model, pixels, classIds, threshold)
}

function createReport ({ blobs }) {
  return {
    uncertain: blobs
      .filter((blob) => blob.className === 'unknown' || blob.confidence < 0.9)
      .map((blob) => ({
        box: blob.box,
        staveIndex: blob.staveIndex,
        staffPosition: blob.staffPosition,
        className: blob.className,
        confidence: blob.confidence,
        candidates: blob.candidates
      })),
    ignored: []
  }
}

export default translateImageToMsq
