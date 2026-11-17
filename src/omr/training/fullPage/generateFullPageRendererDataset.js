'use strict'

import {
  setupFonts,
  supportedFontNamesFrom,
  generateIntermediateStructuresForSinglePage,
  generateStylesForSinglePage,
  generateSvgForSinglePage
} from '#msq/api.js'
import serialize from '#msq/language/serializer/serialize.js'
import normalizePageSchemaForVisibleComparison from '#msq/omr/canonical/normalizePageSchemaForVisibleComparison.js'
import { rasterizeSvg } from '#msq/omr/training/raster/rasterizeSvg.js'
import rendererStylePresets from '#msq/omr/training/style/rendererStylePresets.js'
import appendRendererStylePresetToMsq from '#msq/omr/training/style/appendRendererStylePresetToMsq.js'
import selectBalancedRendererStylePreset from '#msq/omr/training/style/selectBalancedRendererStylePreset.js'
import fullPageMutationProfiles from '#msq/omr/training/mutation/fullPageMutationProfiles.js'
import mutateFullPageBitmap from '#msq/omr/training/mutation/mutateFullPageBitmap.js'
import varyFullPageLocalGeometry from '#msq/omr/training/mutation/varyFullPageLocalGeometry.js'
import detectStaves from '#msq/omr/analysis/detectStaves.js'
import titleSubtitleTextCorpus from '#msq/omr/training/text/titleSubtitleTextCorpus.js'
import extractTextTrainingTargets from '#msq/omr/training/text/extractTextTrainingTargets.js'
import deriveFullPageSeed from '#msq/omr/training/fullPage/deriveFullPageSeed.js'
import assignFullPageCompositionSplits from '#msq/omr/training/fullPage/assignFullPageCompositionSplits.js'
import extractSourceSvgSemanticGeometry from '#msq/omr/training/fullPage/extractSourceSvgSemanticGeometry.js'

/**
 * Each record is { compositionId, msq, id?, split?, textCompositionId? }.
 * A textCompositionId selects a title and subtitle from textCorpus before parsing.
 */
export async function generateFullPageRendererDataset ({
  sourceRecords,
  variantsPerRecord = 1,
  seed = 1,
  scale = 1,
  supersample = 2,
  splitRatios = { train: 0.8, validation: 0.1, test: 0.1 },
  splitByCompositionId = {},
  supportedFontSources = null,
  fontConfig,
  presets = rendererStylePresets,
  mutationProfiles = fullPageMutationProfiles,
  mutationProfileNames = Object.keys(mutationProfiles),
  localGeometryVariation = 0,
  textCorpus = titleSubtitleTextCorpus,
  includeCanonicalMsq = true,
  includeSourceSvgGeometry = true,
  collectSamples = true,
  onSample = null
} = {}) {
  if (!Array.isArray(sourceRecords)) {
    throw new Error('sourceRecords must be an array')
  }
  if (!Number.isSafeInteger(variantsPerRecord) || variantsPerRecord < 1) {
    throw new Error('variantsPerRecord must be a positive safe integer')
  }
  if (!Number.isFinite(scale) || scale <= 0) {
    throw new Error('scale must be a positive finite number')
  }
  if (!Array.isArray(mutationProfileNames) || !mutationProfileNames.length) {
    throw new Error('mutationProfileNames must be a non-empty array')
  }
  if (!Number.isFinite(localGeometryVariation) || localGeometryVariation < 0 || localGeometryVariation > 0.5) {
    throw new Error('localGeometryVariation must be between 0 and 0.5')
  }
  for (const profile of mutationProfileNames) {
    if (!mutationProfiles[profile]) {
      throw new Error(`Unknown full-page mutation profile: ${profile}`)
    }
  }
  if (onSample !== null && typeof onSample !== 'function') {
    throw new Error('onSample must be a function or null')
  }

  const splitForComposition = assignFullPageCompositionSplits({
    sourceRecords,
    seed,
    splitRatios,
    splitByCompositionId
  })
  if (!sourceRecords.length) {
    return []
  }
  validateSourceMsq(sourceRecords)

  const fonts = supportedFontSources || await setupFonts(fontConfig)
  const supportedFontNames = supportedFontNamesFrom(fonts)
  const styleSeed = deriveFullPageSeed(seed, 'renderer-style')
  const samples = []
  let sampleIndex = 0

  for (const [ sourceRecordIndex, record ] of sourceRecords.entries()) {
    const split = splitForComposition.get(record.compositionId)
    const sourceRecordId = record.id || `${record.compositionId}-${sourceRecordIndex}`
    const msq = msqWithCorpusText(record, textCorpus)

    for (let variantIndex = 0; variantIndex < variantsPerRecord; variantIndex++) {
      const stylePreset = selectBalancedRendererStylePreset({
        seed: styleSeed,
        index: sampleIndex,
        presets
      })
      const mutationProfile = mutationProfileNames[sampleIndex % mutationProfileNames.length]
      const mutationSeed = deriveFullPageSeed(
        seed,
        'full-page-mutation',
        record.compositionId,
        sourceRecordId,
        variantIndex
      )
      const sample = renderSample({
        msq,
        record,
        sourceRecordId,
        sourceRecordIndex,
        variantIndex,
        sampleIndex,
        split,
        stylePreset,
        mutationProfile,
        mutationSeed,
        fonts,
        supportedFontNames,
        scale,
        supersample,
        mutationProfiles,
        localGeometryVariation,
        includeCanonicalMsq,
        includeSourceSvgGeometry
      })
      if (onSample) {
        await onSample(sample)
      }
      if (collectSamples) {
        samples.push(sample)
      }
      sampleIndex++
    }
  }
  return samples
}

function validateSourceMsq (sourceRecords) {
  for (const [ index, record ] of sourceRecords.entries()) {
    if (typeof record.msq !== 'string') {
      throw new Error(`sourceRecords[${index}].msq must be a string`)
    }
  }
}

function msqWithCorpusText (record, textCorpus) {
  if (record.textCompositionId === undefined) {
    return record.msq
  }
  if (!Array.isArray(textCorpus)) {
    throw new Error('textCorpus must be an array')
  }
  const textComposition = textCorpus.find(entry => entry.compositionId === record.textCompositionId)
  if (!textComposition) {
    throw new Error(`Unknown text composition: ${record.textCompositionId}`)
  }
  const declarations = []
  for (const name of [ 'title', 'subtitle' ]) {
    if (typeof textComposition[name] === 'string') {
      declarations.push(`${name} is ${JSON.stringify(textComposition[name])}`)
    }
  }
  return `${declarations.join('\n')}${declarations.length ? '\n' : ''}${record.msq}`
}

function renderSample ({
  msq,
  record,
  sourceRecordId,
  sourceRecordIndex,
  variantIndex,
  sampleIndex,
  split,
  stylePreset,
  mutationProfile,
  mutationSeed,
  fonts,
  supportedFontNames,
  scale,
  supersample,
  mutationProfiles,
  localGeometryVariation,
  includeCanonicalMsq,
  includeSourceSvgGeometry
}) {
  const styledMsq = appendRendererStylePresetToMsq(msq, stylePreset)
  const parsed = generateIntermediateStructuresForSinglePage({
    pageText: styledMsq,
    applyHighlighting: false,
    supportedFontNames
  })
  if (parsed.errors.length) {
    const messages = parsed.errors.map(error => error.message || String(error)).join(', ')
    throw new Error(`Cannot generate ${record.compositionId}/${sourceRecordId}: ${messages}`)
  }
  const pageStyles = generateStylesForSinglePage({
    customStyles: parsed.customStyles,
    supportedFontSources: fonts
  })
  const svg = generateSvgForSinglePage({
    pageSchema: parsed.pageSchema,
    pageStyles
  })
  const sourceBitmap = rasterizeSvg(svg, { scale, supersample })
  const intervalBetweenStaveLines = pageStyles.intervalBetweenStaveLines * scale
  const staveLineThickness = (pageStyles.staveLineHeight || 0.12 * pageStyles.intervalBetweenStaveLines) * scale
  let bitmapForMutation = sourceBitmap
  let localGeometryMetadata = null
  if (localGeometryVariation > 0) {
    const { staves } = detectStaves(sourceBitmap)
    if (staves.length) {
      const varied = varyFullPageLocalGeometry(sourceBitmap, staves, {
        seed: deriveFullPageSeed(mutationSeed, 'local-geometry'),
        variation: localGeometryVariation
      })
      bitmapForMutation = varied.bitmap
      localGeometryMetadata = varied.metadata
    }
  }
  const mutated = mutateFullPageBitmap(bitmapForMutation, {
    seed: mutationSeed,
    profile: mutationProfile,
    intervalBetweenStaveLines,
    staveLineThickness,
    profiles: mutationProfiles
  })
  const canonical = canonicalMsq(parsed, includeCanonicalMsq)
  const sourceSvgGeometry = includeSourceSvgGeometry
    ? extractSourceSvgSemanticGeometry(svg, { scale, bitmap: sourceBitmap })
    : null

  return {
    sampleId: `${record.compositionId}/${sourceRecordId}/${variantIndex}`,
    compositionId: record.compositionId,
    split,
    sourceRecordId,
    sourceRecordIndex,
    variantIndex,
    bitmap: mutated.bitmap,
    canonicalPageSchema: normalizePageSchemaForVisibleComparison(parsed.pageSchema),
    canonicalMsq: canonical.value,
    canonicalMsqSerializationError: canonical.error,
    stylePreset: {
      ...stylePreset,
      styles: { ...stylePreset.styles }
    },
    mutationMetadata: {
      ...mutated.metadata,
      notationTarget: 'unmutated-page-schema',
      sampleIndex
    },
    rasterizationMetadata: {
      scale,
      supersample,
      unsupportedElements: sourceBitmap.unsupportedElements,
      unsupportedCommands: sourceBitmap.unsupportedCommands,
      unsupportedTransforms: sourceBitmap.unsupportedTransforms,
      unsupportedColors: sourceBitmap.unsupportedColors
    },
    sourceSvgGeometry,
    localGeometryMetadata,
    textTargets: extractTextTrainingTargets(parsed.pageSchema),
    textCompositionId: record.textCompositionId ?? null
  }
}

function canonicalMsq (parsed, includeCanonicalMsq) {
  if (!includeCanonicalMsq) {
    return { value: null, error: null }
  }
  try {
    return {
      value: serialize(parsed.pageSchema, parsed.customStyles, parsed.midiSettings, parsed.comments),
      error: null
    }
  } catch (error) {
    // Some parser extensions may not have a serializer yet; the canonical schema remains the target
    return { value: null, error: error.message || String(error) }
  }
}

export default generateFullPageRendererDataset
