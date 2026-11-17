'use strict'

import rendererStylePresetToMsq from '#msq/omr/training/style/rendererStylePresetToMsq.js'

export function prependRendererStylePresetToMsq (source, preset) {
  if (typeof source !== 'string') {
    throw new Error('source must be a string')
  }
  return `${rendererStylePresetToMsq(preset)}\n${source}`
}

export default prependRendererStylePresetToMsq
