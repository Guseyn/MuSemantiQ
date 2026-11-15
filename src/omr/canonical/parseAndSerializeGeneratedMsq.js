'use strict'

import { generateIntermediateStructuresForSinglePage } from '#msq/language/api.js'
import serialize from '#msq/language/serializer/serialize.js'

export function parseAndSerializeGeneratedMsq (msqText) {
  const { pageSchema, customStyles, errors } = generateIntermediateStructuresForSinglePage({
    pageText: msqText,
    applyHighlighting: false
  })
  return {
    pageSchema,
    customStyles,
    // Visible styles survive the round trip; playback settings and source comments do not belong in this comparison path
    serializedMsq: serialize(pageSchema, customStyles, {}, []),
    errors
  }
}

export default parseAndSerializeGeneratedMsq
