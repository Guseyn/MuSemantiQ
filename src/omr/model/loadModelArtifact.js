'use strict'

const layerNames = [ 'conv1', 'conv2', 'dense1', 'dense2' ]

// Inference accepts a complete artifact, never a silent fallback to unrelated
// numbers. The class order belongs to the artifact and travels with it.
export function loadModelArtifact (artifact) {
  if (!artifact) {
    throw new Error('OMR weights are required; pass weights from a trained candidate artifact')
  }
  if (!artifact.shape || !Number.isInteger(artifact.shape.gridSize) || artifact.shape.gridSize < 1) {
    throw new Error('OMR weights are invalid: shape.gridSize must be a positive integer')
  }
  if (!Array.isArray(artifact.classIds) || artifact.classIds.length === 0) {
    throw new Error('OMR weights are invalid: classIds must be a non-empty array')
  }
  if (new Set(artifact.classIds).size !== artifact.classIds.length) {
    throw new Error('OMR weights are invalid: classIds must be unique')
  }
  const model = { shape: artifact.shape }
  for (const name of layerNames) {
    const layer = artifact.layers?.[name]
    if (!layer || !Array.isArray(layer.weights) || !Array.isArray(layer.biases)) {
      throw new Error(`OMR weights are invalid: layers.${name} needs weights and biases arrays`)
    }
    model[name] = {
      weights: Float64Array.from(layer.weights),
      biases: Float64Array.from(layer.biases)
    }
  }
  if (model.dense2.biases.length !== artifact.classIds.length) {
    throw new Error(`OMR weights are incompatible: dense2 has ${model.dense2.biases.length} outputs but classIds has ${artifact.classIds.length}`)
  }
  return { model, classIds: [ ...artifact.classIds ] }
}

export default loadModelArtifact
