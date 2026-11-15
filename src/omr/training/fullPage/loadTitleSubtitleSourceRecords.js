'use strict'

import titleSubtitleTextCorpus from '#msq/omr/training/text/titleSubtitleTextCorpus.js'

export function loadTitleSubtitleSourceRecords () {
  return titleSubtitleTextCorpus.map((entry, index) => ({
    compositionId: `multilingual-title-${entry.compositionId}`,
    id: `multilingual-title-${entry.compositionId}`,
    textCompositionId: entry.compositionId,
    split: entry.split === 'heldOut' ? 'test' : index % 4 === 0 ? 'validation' : 'train',
    msq: 'stave with treble clef\n1/4 c5'
  }))
}

export default loadTitleSubtitleSourceRecords
