'use strict'

import loadModelArtifact from '#msq/omr/model/loadModelArtifact.js'
import classifyComponent from '#msq/omr/analysis/classifyComponent.js'
import { resampleComponentToGrid } from '#msq/omr/training/cropComponents.js'
import createTextOcrAlphabetManifest from '#msq/omr/training/text/createTextOcrAlphabetManifest.js'

export function createCharacterClassifier (artifact, { threshold } = {}) {
  const { model, classIds } = loadModelArtifact(artifact)
  const expected = createTextOcrAlphabetManifest().characters
  if (classIds.length !== expected.length || classIds.some((character, index) => character !== expected[index])) {
    throw new Error('OCR weights are incompatible: classIds must match the six-language OCR alphabet exactly')
  }
  return (candidate) => {
    const source = {
      width: candidate.box.w,
      height: candidate.box.h,
      grayscale: candidate.sourcePixels
    }
    const box = { x: 0, y: 0, w: candidate.box.w, h: candidate.box.h }
    return classifyComponent(model, resampleComponentToGrid(source, box, model.shape.gridSize), classIds, threshold)
  }
}

export default createCharacterClassifier
