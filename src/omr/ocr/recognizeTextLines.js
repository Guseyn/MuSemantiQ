'use strict'

import segmentTextLines from '#msq/omr/ocr/segmentTextLines.js'
import createTextOcrAlphabetManifest from '#msq/omr/training/text/createTextOcrAlphabetManifest.js'

const DEFAULT_MINIMUM_CHARACTER_CONFIDENCE = 0.8

/**
 * Characters come only from the supplied classifier and the training
 * alphabet. No spelling or language stage can replace an uncertain glyph.
 * `text` is therefore null until every non-space candidate has been resolved.
 *
 * The classifier receives `(candidate, context)`. `candidate` has `box` and
 * `sourcePixels`; context carries the alphabet manifest and source location.
 */
export function recognizeTextLines (bitmap, textBlocks = [], {
  classifyCharacter,
  intervalBetweenStaveLines,
  minimumCharacterConfidence = DEFAULT_MINIMUM_CHARACTER_CONFIDENCE
} = {}) {
  if (typeof classifyCharacter !== 'function') {
    throw new TypeError('recognizeTextLines needs classifyCharacter')
  }
  const alphabetManifest = createTextOcrAlphabetManifest()
  const alphabet = new Set(alphabetManifest.characters)
  const threshold = Number.isFinite(minimumCharacterConfidence)
    ? minimumCharacterConfidence
    : DEFAULT_MINIMUM_CHARACTER_CONFIDENCE
  const segmentedLines = segmentTextLines(bitmap, textBlocks, { intervalBetweenStaveLines })
  const lines = segmentedLines.map((line) => recognizeLine(line, {
    classifyCharacter,
    alphabet,
    alphabetManifest,
    minimumCharacterConfidence: threshold
  }))
  const status = lines.length === 0 || lines.every((line) => line.status === 'exact')
    ? 'exact'
    : lines.some((line) => line.status !== 'rejected') ? 'draft' : 'rejected'
  return {
    status,
    text: status === 'exact' ? lines.map((line) => line.text).join('\n') : null,
    lines,
    uncertainties: lines.flatMap((line) => line.uncertainties),
    alphabetManifest
  }
}

function recognizeLine (line, options) {
  if (line.status === 'rejected') {
    return {
      ...line,
      text: null,
      characters: [],
      uncertainties: line.segmentationUncertainties.map((uncertainty) => locatedUncertainty(line, uncertainty))
    }
  }
  const characters = []
  const uncertainties = []
  let rejected = false
  for (let characterIndex = 0; characterIndex < line.candidates.length; characterIndex++) {
    const candidate = line.candidates[characterIndex]
    if (candidate.kind === 'space') {
      characters.push({ ...candidate, confidence: 1, candidates: [] })
      continue
    }
    let classification
    try {
      classification = options.classifyCharacter(candidate, {
        alphabet: options.alphabetManifest.characters,
        alphabetManifest: options.alphabetManifest,
        role: line.role,
        textBlockIndex: line.textBlockIndex,
        lineIndex: line.lineIndex,
        characterIndex,
        ...(line.target ? { target: { ...line.target } } : {})
      })
    } catch (error) {
      rejected = true
      characters.push({ ...candidate, character: null, confidence: 0, candidates: [] })
      uncertainties.push(locatedUncertainty(line, {
        box: candidate.box,
        characterIndex,
        reason: 'classifier-error',
        message: error instanceof Error ? error.message : String(error)
      }))
      continue
    }
    const resolved = resolveClassification(classification, options)
    characters.push({
      ...candidate,
      character: resolved.character,
      confidence: resolved.confidence,
      candidates: resolved.candidates
    })
    if (!resolved.character) {
      uncertainties.push(locatedUncertainty(line, {
        box: candidate.box,
        characterIndex,
        reason: resolved.reason,
        confidence: resolved.confidence,
        candidates: resolved.candidates,
        ...(resolved.proposedCharacter ? { proposedCharacter: resolved.proposedCharacter } : {})
      }))
    }
  }
  const status = rejected ? 'rejected' : uncertainties.length ? 'draft' : 'exact'
  return {
    ...line,
    status,
    text: status === 'exact' ? characters.map((character) => character.character).join('') : null,
    characters,
    uncertainties
  }
}

function resolveClassification (classification, { alphabet, minimumCharacterConfidence }) {
  if (typeof classification === 'string') {
    return checkedCharacter(classification, 1, [], false, alphabet, minimumCharacterConfidence)
  }
  if (!classification || typeof classification !== 'object') {
    return {
      character: null,
      confidence: 0,
      candidates: [],
      reason: 'unresolved-character'
    }
  }
  const proposed = typeof classification.character === 'string'
    ? classification.character
    : typeof classification.className === 'string' ? classification.className : null
  const confidence = Number.isFinite(classification.confidence) ? classification.confidence : 1
  const candidates = Array.isArray(classification.candidates) ? classification.candidates : []
  return checkedCharacter(
    proposed,
    confidence,
    candidates,
    classification.isUnknown === true || proposed === 'unknown',
    alphabet,
    minimumCharacterConfidence
  )
}

function checkedCharacter (proposed, confidence, candidates, isUnknown, alphabet, minimumCharacterConfidence) {
  if (!isUnknown && proposed && alphabet.has(proposed) && confidence >= minimumCharacterConfidence) {
    return { character: proposed, confidence, candidates }
  }
  return {
    character: null,
    proposedCharacter: proposed,
    confidence,
    candidates,
    reason: !isUnknown && proposed && !alphabet.has(proposed)
      ? 'character-outside-alphabet'
      : 'unresolved-character'
  }
}

function locatedUncertainty (line, uncertainty) {
  return {
    ...uncertainty,
    box: { ...uncertainty.box },
    role: line.role,
    textBlockIndex: line.textBlockIndex,
    lineIndex: line.lineIndex,
    ...(line.target ? { target: { ...line.target } } : {})
  }
}

export default recognizeTextLines
