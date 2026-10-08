'use strict'

export default function (measuresOnPageLine, voicesBodiesOnPageLine) {
  for (let measureIndexOnPageLine = 0; measureIndexOnPageLine < measuresOnPageLine.length; measureIndexOnPageLine++) {
    if (voicesBodiesOnPageLine[measureIndexOnPageLine] && !voicesBodiesOnPageLine[measureIndexOnPageLine].isEmpty) {
      measuresOnPageLine[measureIndexOnPageLine].top = Math.min(measuresOnPageLine[measureIndexOnPageLine].top, voicesBodiesOnPageLine[measureIndexOnPageLine].top)
      measuresOnPageLine[measureIndexOnPageLine].bottom = Math.max(measuresOnPageLine[measureIndexOnPageLine].bottom, voicesBodiesOnPageLine[measureIndexOnPageLine].bottom)
    }
  }
}
