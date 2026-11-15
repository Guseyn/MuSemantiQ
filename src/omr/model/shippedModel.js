'use strict'

import loadModelArtifact from '#msq/omr/model/loadModelArtifact.js'

// Kept for callers of the old entry point. The artifact is now explicit so a
// missing weights.json cannot become a module-import error or a silent model.
export function shippedModel (weights) {
  return loadModelArtifact(weights)
}

export default shippedModel
