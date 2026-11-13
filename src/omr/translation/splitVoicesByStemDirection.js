'use strict'

/**
 * Stems up and stems down are two voices.
 *
 * One stave can carry two lines of music, and the engraving says which is
 * which by the way the stems point. When a measure has both, the stems-up
 * units are one voice and the stems-down units the other; when all agree, the
 * measure is one voice.
 */

export function splitVoicesByStemDirection (units) {
  const stemsUp = units.filter((unit) => unit.stemDirection === 'up')
  const stemsDown = units.filter((unit) => unit.stemDirection === 'down')
  if (stemsUp.length && stemsDown.length) {
    return [ stemsUp, stemsDown ]
  }
  return [ units ]
}

export default splitVoicesByStemDirection
