'use strict'

import rendererStylePresetToMsq from '#msq/omr/training/style/rendererStylePresetToMsq.js'

// Dataset styles are deliberate mutations, so they override declarations in
// the source fixture instead of silently disappearing behind them.
export function appendRendererStylePresetToMsq (msq, preset) {
  const declarations = rendererStylePresetToMsq(preset)
  return `${msq.trimEnd()}\n${declarations}`
}

export default appendRendererStylePresetToMsq
