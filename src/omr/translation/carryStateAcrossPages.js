'use strict'

/**
 * What page 1 declared, page 2 repeats.
 *
 * Every page's text parses on its own, so a key signature or a meter that
 * started on an earlier page has to be written again at the top of this one —
 * unless this page shows its own (a key change mid-piece). Styles carry the
 * same way: what was measured once and not contradicted stands.
 */

export function carryStateAcrossPages ({ musicModel, customStyles }, carried = {}) {
  const keySignatureName = musicModel.keySignatureName || carried.keySignatureName || null
  const timeSignatureParams = musicModel.timeSignatureParams || carried.timeSignatureParams || null
  return {
    musicModel: { ...musicModel, keySignatureName, timeSignatureParams },
    customStyles: { ...carried.customStyles, ...prune(customStyles) },
    carried: {
      keySignatureName,
      timeSignatureParams,
      customStyles: { ...carried.customStyles, ...prune(customStyles) }
    }
  }
}

function prune (values) {
  return Object.fromEntries(Object.entries(values || {}).filter(([ , value ]) => value !== null && value !== undefined))
}

export default carryStateAcrossPages
