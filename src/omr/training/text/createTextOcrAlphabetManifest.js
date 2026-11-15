'use strict'

import { textOcrAlphabet } from '#msq/omr/training/text/textOcrAlphabet.js'

export function createTextOcrAlphabetManifest () {
  return {
    name: 'six-language-text-ocr',
    version: 1,
    languages: [ 'English', 'French', 'German', 'Italian', 'Spanish', 'Russian' ],
    characterCount: textOcrAlphabet.length,
    characters: [ ...textOcrAlphabet ]
  }
}

export default createTextOcrAlphabetManifest
