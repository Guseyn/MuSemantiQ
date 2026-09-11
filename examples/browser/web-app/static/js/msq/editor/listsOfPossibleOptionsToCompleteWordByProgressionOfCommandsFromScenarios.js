import configurableStyleNames from '/js/msq/worker/language/parser/scenarios/static-objects/configurableStyleNames.js'
import pageMetaNames from '/js/msq/worker/language/parser/scenarios/static-objects/pageMetaNames.js'
import openingBarLineNames from '/js/msq/worker/language/parser/scenarios/static-objects/openingBarLineNames.js'
import closingBarLineNames from '/js/msq/worker/language/parser/scenarios/static-objects/closingBarLineNames.js'
import keySignatureNames from '/js/msq/worker/language/parser/scenarios/static-objects/keySignatureNames.js'
import cssColors from '/js/msq/worker/language/parser/scenarios/static-objects/cssColors.js'
import instrumentNames from '/js/msq/worker/language/parser/scenarios/static-objects/instrumentNames.js'
import midiSettingNames from '/js/msq/worker/language/parser/scenarios/static-objects/midiSettingNames.js'
const splittedKeySignatureNames = keySignatureNames.join('|').split('|')
const mainTimeSignatureValues = [ 'c', 'crossed c', '3:4', '4:4', '2:4', '3:8', '9:4', '6:8', '12:8' ]
const mainRepetitionNotes = [ 'repetition note "D.C. al Fine"', 'repetition note "D.C. al Coda"', 'repetition note "D.S. al Fine"', 'repetition note "D.S. al Coda"', 'repetition note "Fine"', 'repetition note "Coda"' ]
import clefNames from '/js/msq/worker/language/parser/scenarios/static-objects/clefNames.js'
const positionCoordinates = [ 'unit ', 'chord ', 'note ', 'stave ', 'voice ', 'measure ', 'line ' ]
const mainTupletValues = [ '3', '3:2', '2', '2:3', '5', '5:4', '6', '6:4', '7', '7:4', '9', '9:8', '12', '12:8' ]
import noteKeyNames from '/js/msq/worker/language/parser/scenarios/static-objects/noteKeyNames.js'
const mainNoteKeyNames = [ 'sharp', 'flat', 'natural', 'double sharp', 'double flat', 'demisharp', 'demiflat', 'sesquisharp', 'sesquiflat' ]
import articulationNames from '/js/msq/worker/language/parser/scenarios/static-objects/articulationNames.js'
import ornamentKeyNames from '/js/msq/worker/language/parser/scenarios/static-objects/ornamentKeyNames.js'

const autoCompletesForStyles = (style, autocompletes = []) => {
  autocompletes.push(`${style} is `)
  const styleWords = style.split(' ')
  const styleWordsWithoutFirstWord = styleWords.slice(1)
  if (styleWordsWithoutFirstWord.length > 0) {
    autoCompletesForStyles(styleWordsWithoutFirstWord.join(' '), autocompletes)
  }
  return autocompletes
}

const autoCompletesForMidiSettings = (midiSetting, autocompletes = []) => {
  autocompletes.push(`${midiSetting} is `)
  const styleWords = midiSetting.split(' ')
  const styleWordsWithoutFirstWord = styleWords.slice(1)
  if (styleWordsWithoutFirstWord.length > 0) {
    autoCompletesForMidiSettings(styleWordsWithoutFirstWord.join(' '), autocompletes)
  }
  return autocompletes
}

const autoCompletesForPageMeta = (pageMeta, autocompletes = []) => {
  autocompletes.push(`${pageMeta} is ""`)
  const pageMetaWords = pageMeta.split(' ')
  const pageMetaWordsWithoutFirstWord = pageMetaWords.slice(1)
  if (pageMetaWordsWithoutFirstWord.length > 0) {
    autoCompletesForPageMeta(pageMetaWordsWithoutFirstWord.join(' '), autocompletes)
  }
  return autocompletes
}

const autoCompletesForKeySignatureNames = (keySignatureName, autocompletes = []) => {
  autocompletes.push(keySignatureName)
  const keySignatureNameWords = keySignatureName.split(' ')
  const keySignatureNameWordsWithoutFirstWord = keySignatureNameWords.slice(1)
  if (keySignatureNameWordsWithoutFirstWord.length > 0) {
    autoCompletesForKeySignatureNames(keySignatureNameWordsWithoutFirstWord.join(' '), autocompletes)
  }
  return autocompletes
}

const autoCompletesForKeySignatureNamesBefore = (keySignatureName, autocompletes = []) => {
  autocompletes.push(`${keySignatureName} before`)
  const keySignatureNameWords = keySignatureName.split(' ')
  const keySignatureNameWordsWithoutFirstWord = keySignatureNameWords.slice(1)
  if (keySignatureNameWordsWithoutFirstWord.length > 0) {
    autoCompletesForKeySignatureNames(keySignatureNameWordsWithoutFirstWord.join(' '), autocompletes)
  }
  return autocompletes
}

/**
 * The font names come from whatever the font loader registered for this editor,
 * not from a list kept here: the parser accepts exactly those names, so a
 * hardcoded copy could only ever drift out of sync with it.
 */
export default (supportedFontNames = {}) => ({
  'general': [
    'compress units by 1.5 times',
    'compress units by 2.0 times',
    'compress units by 3.0 times',
    'compress units by 4.0 times',
    'compress units by 5.0 times',
    'stretch units by 1.5 times',
    'stretch units by 2.0 times',
    'stretch units by 3.0 times',
    'stretch units by 4.0 times',
    'stretch units by 5.0 times',

    'comment: ""',
    'side note: ""',
    'note: ""',

    'new line',
    'line',
    'measures',
    'measure',
    'stave',
    'voice',
    'chord',
    'rest',
    ...clefNames.map(clefName => `stave with ${clefName} clef`),
    ...clefNames.map(clefName => `${clefName} clef`),
    'clef',

    ...splittedKeySignatureNames.map(keySignatureName => `key signature is ${keySignatureName}`),
    ...splittedKeySignatureNames.map(keySignatureName => `signature is ${keySignatureName}`),
    'major',
    'minor',

    'lyrics is under',
    'is under',
    'under',

    'measure numbers for all measures',
    'measure numbers for first measures',
    'measure numbers for last measures',
    'measure numbers for first and last measures',

    ...pageMetaNames.map(pageMetaName => `${pageMetaName} is ""`),
    ...pageMetaNames.map(pageMetaName => autoCompletesForPageMeta(pageMetaName)).flat(),

    ...configurableStyleNames.map(style => autoCompletesForStyles(style)).flat(),
    ...midiSettingNames.map(setting => autoCompletesForMidiSettings(setting)).flat(),

    'hide the last measure',
    'the last measure',
    'last measure',

    'slur',
    'glissando',
    'tuplet',
    'octave up',
    'octave higher',
    'octave down',
    'octave lower',
    'two octaves up',
    'two octaves higher',
    'two octaves down',
    'two octaves lower',
    'crescendo',
    'diminuendo',
    'simile',
    'volta',

    'tempo',
    'metronome',
    'instrument title is ""',
    'brace',
    'bracket',
    'measure rest',
    ...mainTimeSignatureValues.map(value => `time signature is ${value}`),
    ...mainTimeSignatureValues,
    'time signature is ',
    ...mainRepetitionNotes
  ],
  'color style name is': [
    ...cssColors
  ],
  'music font style name is': [
    ...(supportedFontNames['music'] || [])
  ],
  'text font style name is': [
    ...(supportedFontNames['text'] || [])
  ],
  'chord letters font style name is': [
    ...(supportedFontNames['chord-letters'] || [])
  ],
  'midi setting name is': [
    ...instrumentNames
  ],
  'stave': [
    'new line',
    'measure',
    'voice',
    'stave',
    ...clefNames.map(clefName => `with ${clefName} clef`),
    ...clefNames.map(clefName => `${clefName} clef`),
    'clef',
    'chord'
  ],
  'voice': [
    'new line',
    'measure',
    'stave',
    'voice',
    'chord'
  ],
  'chord': [
    'new line',
    'measure',
    'stave',
    'voice',
    'chord',

    'on next stave',
    'next stave',
    'on previous stave',
    'previous stave',
    'on prev. stave',
    'prev. stave',
    'on prev stave',
    'prev stave',
    'on current stave',
    'current stave',

    'with parentheses',
    'parentheses',

    'is ghost',
    'is not ghost',
    'not ghost',
    'ghost',

    'is arpeggiated',
    'arpeggiated',
    'is arpeggio',
    'arpeggio',

    'with chord ""',
    'with text ""',
    'text ""',

    ...articulationNames.map(articulationName => `with ${articulationName}`),
    ...articulationNames,

    'with turn',
    'with mordent',
    'with trill',
    'turn',
    'mordent',
    'trill',

    'is dotted',
    'dotted',
    'with one dot',
    'with two dots',
    'with three dots',
    'one dot',
    'two dots',
    'three dots',
    'dot',
    'dots',

    'with stem up',
    'with stem down',
    'stem up',
    'stem down',

    'is beamed with next',
    'beamed with next',
    'is not beamed with next',
    'not beamed with next',
    'not beamed',

    'is tied with next',
    'tied with next',
    'is tied before',
    'tied before',
    'is tied after',
    'tied after',

    'with glissando after',
    'glissando after',
    'with glissando before',
    'glissando before',

    'is grace',
    'is crushed grace',
    'crushed grace',
    'grace',
    'with crush line',
    'crush line',

    'is rest',
    'rest',

    'is centralized',
    'centralized',

    'with breath mark before',
    'breath mark before',
    'mark before',
    'with breath mark as comma before',
    'breath mark as comma before',
    'mark as comma before',
    'as comma before',
    'comma before',
    'with breath mark as double slashes before',
    'breath mark as double slashes before',
    'mark as double slashes before',
    'as double slashes before',
    'double slashes before',
    'slashes before',

    ...splittedKeySignatureNames.map(keySignatureName => `with key signature ${keySignatureName} before`),
    ...splittedKeySignatureNames.map(keySignatureName => `key signature ${keySignatureName} before`),
    ...splittedKeySignatureNames.map(keySignatureName => `signature ${keySignatureName} before`),
    ...splittedKeySignatureNames.map(keySignatureName => `${keySignatureName} before`),
    ...splittedKeySignatureNames.map(keySignatureName => autoCompletesForKeySignatureNamesBefore(keySignatureName)).flat(),

    ...clefNames.map(clefName => `with ${clefName} clef before`),
    ...clefNames.map(clefName => `${clefName} clef before`),
    'clef before',

    'chord',

    'is octave up',
    'is octave down',
    'octave up',
    'octave down',
    'is two octaves up',
    'is two octaves down',
    'two octaves up',
    'two octaves down',
    'octaves up',
    'octaves down',
    'is octave higher',
    'is octave lower',
    'octave higher',
    'octave lower',
    'is two octaves higher',
    'is two octaves lower',
    'two octaves higher',
    'two octaves lower',
    'octaves higher',
    'octaves lower',

    'with tremolo',
    'with tremolo with next',
    'tremolo with next',
    'tremolo',

    'strokes',
    'stroke',
    'repeat',
    'simile',

    'with dynamic ""',
    'dynamic ""',

    'with lyrics ""',
    'with lyric ""',
    'lyrics ""',
    'lyric ""',

    'with pedal',
    'pedal',
    'with variable peak',
    'variable peak',
    'peak',
    'with release',
    'release',

    'stave',
    'is ',
    'up',
    'down',
    'is left by ',
    'left by ',
    'is right by ',
    'right by ',
    'higher',
    'lower',
    'with next',
    'next',
    'before',
    'after',
    'line'
  ],
  'chord with parentheses': [
    'from ',
    'to ',
    'note '
  ],
  'chord is arpeggiated': [
    'with chord below',
    'chord below',
    'below',
    'with arrow up',
    'with arrow down',
    'arrow up',
    'arrow down',
    'up',
    'down'
  ],
  'chord with text': [
    'is ',
    'up',
    'down',
    'beside',
    'above',
    'above stave',
    'below',
    'below stave',
    'stave'
  ],
  'chord beamed': [
    'with only primary line',
    'with only one line',
    'only primary line',
    'only one line',
    'primary line',
    'one line',
    'line'
  ],
  'chord is tied before': [
    'measure',
    'is ',
    'up',
    'down',
    'above',
    'below',
    'over',
    'under',
    'with roundness ',
    'roundness '
  ],
  'chord is tied after': [
    'measure',
    'is ',
    'up',
    'down',
    'above',
    'below',
    'over',
    'under',
    'with roundness ',
    'roundness '
  ],
  'chord is tied with next': [
    'is ',
    'up',
    'down',
    'above',
    'below',
    'over',
    'under',
    'with roundness ',
    'roundness '
  ],
  'chord with glissando after': [
    'measure ',
    'up',
    'down'
  ],
  'chord with glissando before': [
    'measure ',
    'up',
    'down'
  ],
  'chord with breath mark before': [
    'up',
    'down'
  ],
  'chord with articulation': [
    'is ',
    'up',
    'down',
    'above',
    'above stave',
    'below',
    'below stave',
    'stave'
  ],
  'chord with ornament': [
    'is ',
    'up',
    'down',
    'above',
    'above stave',
    'below',
    'below stave',
    'stave',
    'followed after',
    'inverted',
    'with wave after',
    'wave after',
    'after',
    ...ornamentKeyNames.map(ornamentKeyName => `with ${ornamentKeyName}`)
  ],
  'chord with dynamic': [
    'is ',
    'up',
    'down',
    'above',
    'above stave',
    'below',
    'below stave',
    'stave'
  ],
  'chord with chord letter': [
    'is ',
    'up',
    'down',
    'above',
    'above measure',
    'below',
    'below measure',
    'measure'
  ],
  'chord with lyrics': [
    'followed by dash',
    'by dash',
    'dash',
    'with underscore starts',
    'where underscore starts',
    'underscore starts',
    'starts',
    'with underscore begins',
    'where underscore begins',
    'underscore begins',
    'begins',
    'with underscore finishes',
    'where underscore finishes',
    'underscore finishes',
    'finishes',
    'with underscore ends',
    'where underscore ends',
    'underscore ends',
    'ends'
  ],
  'chord with pedal': [
    'under stave ',
    'stave ',
    'opens with bracket',
    'with bracket',
    'bracket',
    'before',
    'after'
  ],
  'chord with variable peak': [
    'before',
    'after'
  ],
  'chord with release': [
    'before',
    'after',
    'after measure',
    'at the end of the measure',
    'the end of the measure',
    'end of the measure',
    'of the measure',
    'the measure',
    'measure',
    'bracket'
  ],
  'coda': [
    'at the start of the measure',
    'the start of the measure',
    'start of the measure',
    'at the end of the measure',
    'the end of the measure',
    'end of the measure',
    'of the measure',
    'measure',
    'up',
    'down'
  ],
  'sign': [
    'at the start of the measure',
    'the start of the measure',
    'start of the measure',
    'at the end of the measure',
    'the end of the measure',
    'end of the measure',
    'of the measure',
    'measure',
    'up',
    'down'
  ],
  'crescendo|diminuendo': [
    ...positionCoordinates,
    'starts with "" from ',
    'with "" from ',
    'starts from ',
    'starts at ',
    'finishes with "" at ',
    'with "" at ',
    'finishes at ',
    'from ',
    'at ',
    'to ',
    'above stave',
    'below stave',
    'up',
    'down'
  ],
  'bracket or brace': [
    'for ',
    'from  ',
    'to ',
    'for each line',
    'each line',
    'line',
    'for lines below',
    'lines below',
    'below',
    'stave '
  ],
  'glissando': [
    ...positionCoordinates,
    'starts before ',
    'finishes after ',
    'starts at ',
    'finishes at ',
    'before ',
    'after ',
    'at ',
    'is ',
    'up',
    'down',
    'as line',
    'as wave'
  ],
  'instrument title': [
    'for ',
    'between',
    'and ',
    'for each line',
    'each line',
    'line',
    'stave ',
    'for lines below',
    'lines below'
  ],
  'key signature': [
    ...splittedKeySignatureNames,
    'for each line',
    'each line',
    'line',
    'for lines below',
    'lines below',
    'below'
  ],
  'lyrics position': [
    'stave '
  ],
  'measure': [
    'new line',
    'measure',
    'stave',
    'voice',
    'chord',

    'without start barline',
    'start barline',
    'with no start barline',
    'no start barline',
    ...openingBarLineNames.map(bar => `opens with ${bar}`),
    ...openingBarLineNames.map(bar => `starts with ${bar}`),
    ...openingBarLineNames.map(bar => `with ${bar}`),
    ...openingBarLineNames,
    ...closingBarLineNames.map(bar => `closes with ${bar}`),
    ...closingBarLineNames.map(bar => `ends with ${bar}`),
    ...closingBarLineNames.map(bar => `finishes with ${bar}`),
    ...closingBarLineNames.map(bar => `with ${bar}`),
    ...closingBarLineNames,
    'barLine',

    'with repeat sign at the start and at the end',
    'repeat sign at the start and at the end',
    'sign at the start and at the end',
    'at the start and at the end',
    'the start and at the end',
    'start and at the end',
    'and at the end',
    'with repeat sign at the start',
    'repeat sign at the start',
    'sign at the start',
    'with repeat sign at the end',
    'repeat sign at the end',
    'sign at the end',
    'at the start',
    'the start',
    'start',
    'at the end',
    'the end',
    'end',

    'rest',

    'times',

    'tempo',
    'metronome',

    'instrument title is ""',

    'brace',
    'bracket',

    'with simile of previous measure',
    'simile of previous measure',
    'of previous measure',
    'previous measure',
    'measure rest',
    'with simile of two previous measures',
    'simile of two previous measures',
    'of previous two measures',
    'previous measures',

    'ends with fermata',
    'with fermata',
    'fermata',

    ...mainTimeSignatureValues.map(value => `time signature is ${value}`),
    ...mainTimeSignatureValues,
    'time signature is ',
    'signature is ',

    ...mainRepetitionNotes
  ],
  'measure numbers': [
    'for first measures',
    'first measures',
    'measures',
    'for last measures',
    'last measures',
    'for first and last measures',
    'first and last measures',
    'for first and last measures',
    'and last measures',
    'below',
    'above'
  ],
  'note': [
    'new line',
    'measure',
    'stave',
    'voice',
    'chord',

    'on next stave',
    'next stave',
    'on previous stave',
    'previous stave',
    'on prev. stave',
    'prev. stave',
    'on prev stave',
    'prev stave',

    'with parentheses',
    'parentheses',

    'is ghost',
    'is not ghost',
    'not ghost',
    'ghost',

    'with text ""',
    'text ""',

    'is dotted',
    'dotted',
    'with one dot',
    'with two dots',
    'with three dots',
    'one dot',
    'two dots',
    'three dots',
    'dot',
    'dots',

    'with stem up',
    'with stem down',
    'stem up',
    'stem down',

    'is beamed with next',
    'beamed with next',
    'is not beamed with next',
    'not beamed with next',
    'beamed',
    'not beamed',

    'is tied with next',
    'tied with next',
    'is tied before',
    'tied before',
    'is tied after',
    'tied after',

    'with glissando after',
    'glissando after',
    'with glissando before',
    'glissando before',
    'is grace',
    'is crushed grace',
    'crushed grace',
    'grace',
    'with crush line',
    'crush line',

    'is rest',
    'rest',

    'is centralized',
    'centralized',

    'with breath mark before',
    'breath mark before',
    'mark before',
    'with breath mark as comma before',
    'breath mark as comma before',
    'mark as comma before',
    'as comma before',
    'comma before',
    'with breath mark as double slashes before',
    'breath mark as double slashes before',
    'mark as double slashes before',
    'as double slashes before',
    'double slashes before',
    'slashes before',

    ...splittedKeySignatureNames.map(keySignatureName => `with key signature ${keySignatureName} before`),
    ...splittedKeySignatureNames.map(keySignatureName => `key signature ${keySignatureName} before`),
    ...splittedKeySignatureNames.map(keySignatureName => `signature ${keySignatureName} before`),
    'major',
    'minor',

    ...clefNames.map(clefName => `with ${clefName} clef before`),
    ...clefNames.map(clefName => `${clefName} clef before`),
    'clef before',

    ...articulationNames.map(articulationName => `with ${articulationName}`),
    ...articulationNames,

    'with turn',
    'with mordent',
    'with trill',
    'turn',
    'mordent',
    'trill',

    'with chord ""',

    'is octave up',
    'is octave down',
    'octave up',
    'octave down',
    'is two octaves up',
    'is two octaves down',
    'two octaves up',
    'two octaves down',
    'octaves up',
    'octaves down',
    'is octave higher',
    'is octave lower',
    'octave higher',
    'octave lower',
    'is two octaves higher',
    'is two octaves lower',
    'two octaves higher',
    'two octaves lower',
    'octaves higher',
    'octaves lower',

    'with tremolo',
    'with tremolo with next',
    'tremolo with next',
    'tremolo',
    'strokes',
    'stroke',
    'repeat',
    'simile',

    'with dynamic ""',
    'dynamic ""',

    'with lyrics ""',
    'with lyric ""',
    'lyrics ""',
    'lyric ""',

    'with pedal',
    'pedal',
    'with variable peak',
    'variable peak',
    'peak',
    'with release',
    'release',

    ...noteKeyNames.map(keyName => `with ${keyName} key`),
    'key',
    ...mainNoteKeyNames,

    'stave',
    'is ',
    'up',
    'down',
    'is left by ',
    'left by ',
    'is right by ',
    'right by ',
    'higher',
    'lower',
    'with next',
    'next',
    'before',
    'after',
    'line'
  ],
  'note with parentheses': [
    'from',
    'to',
    'note'
  ],
  'note with text': [
    'is ',
    'up',
    'down',
    'beside',
    'above',
    'above stave',
    'below',
    'below stave',
    'stave'
  ],
  'note beamed': [
    'with only primary line',
    'with only one line',
    'only primary line',
    'only one line',
    'primary line',
    'one line',
    'line'
  ],
  'note is tied before': [
    'measure',
    'is ',
    'up',
    'down',
    'above',
    'below',
    'over',
    'under',
    'with roundness ',
    'roundness '
  ],
  'note is tied after': [
    'measure',
    'is ',
    'up',
    'down',
    'above',
    'below',
    'over',
    'under',
    'with roundness ',
    'roundness '
  ],
  'note is tied with next': [
    'is ',
    'up',
    'down',
    'above',
    'below',
    'over',
    'under',
    'with roundness ',
    'roundness '
  ],
  'note with glissando after': [
    'measure',
    'up',
    'down'
  ],
  'note with glissando before': [
    'measure',
    'up',
    'down'
  ],
  'note with breath mark before': [
    'up',
    'down'
  ],
  'note with articulation': [
    'is ',
    'up',
    'down',
    'above',
    'above stave',
    'below',
    'below stave',
    'stave'
  ],
  'note with turn': [
    'is ',
    'up',
    'down',
    'above',
    'above stave',
    'below',
    'below stave',
    'stave',
    'inverted',
    'after',
    ...ornamentKeyNames.map(ornamentKeyName => `with ${ornamentKeyName}`)
  ],
  'note with mordent': [
    'is ',
    'up',
    'down',
    'above',
    'above stave',
    'below',
    'below stave',
    'stave',
    'inverted',
    'after',
    ...ornamentKeyNames.map(ornamentKeyName => `with ${ornamentKeyName}`)
  ],
  'note with trill': [
    'is ',
    'up',
    'down',
    'above',
    'above stave',
    'below',
    'below stave',
    'stave',
    'with wave after',
    'wave after',
    'after'
  ],
  'note with dynamic': [
    'is ',
    'up',
    'down',
    'above',
    'above stave',
    'below',
    'below stave',
    'stave'
  ],
  'note with chord letter': [
    'is ',
    'up',
    'down',
    'above',
    'above measure',
    'below',
    'below measure',
    'measure'
  ],
  'note with lyrics': [
    'followed by dash',
    'by dash',
    'dash',
    'with underscore starts',
    'where underscore starts',
    'underscore starts',
    'starts',
    'with underscore begins',
    'where underscore begins',
    'underscore begins',
    'begins',
    'with underscore finishes',
    'where underscore finishes',
    'underscore finishes',
    'finishes',
    'with underscore ends',
    'where underscore ends',
    'underscore ends',
    'ends'
  ],
  'note with pedal': [
    'under stave ',
    'stave ',
    'opens with bracket',
    'with bracket',
    'bracket',
    'before',
    'after'
  ],
  'note with variable peak': [
    'before',
    'after'
  ],
  'note with release': [
    'before',
    'after',
    'after measure',
    'at the end of the measure',
    'the end of the measure',
    'end of the measure',
    'of the measure',
    'the measure',
    'measure',
    'bracket'
  ],
  'octave sign': [
    'from ',
    'to ',
    'up',
    'down',
    'and finishes at '
  ],
  'repeat simile': [
    ...positionCoordinates,
    'of previous beat',
    'previous beat',
    'of prev. beat',
    'prev. beat',
    'of prev beat',
    'prev beat',
    'beat',
    'of previous beats',
    'previous beats',
    'of prev. beats',
    'prev. beats',
    'of prev beats',
    'prev beats',
    'beats',
    'times',
    'is ',
    'up',
    'down',
    'from ',
    'to ',
    'starts at ',
    'finishes at',
    'at '
  ],
  'repetition note': [
    'at the start of the measure',
    'the start of the measure',
    'start of the measure',
    'at the end of the measure',
    'the end of the measure',
    'end of the measure',
    'of the measure',
    'the measure',
    'measure',
    'up',
    'down'
  ],
  'slur': [
    ...positionCoordinates,
    'starts before ',
    'starts at ',
    'starts before below ',
    'starts before above ',
    'starts above ',
    'starts below ',
    'finishes after ',
    'finishes at ',
    'finishes after below ',
    'finishes after above ',
    'finishes above ',
    'finishes below ',
    'before ',
    'after ',
    'below',
    'above',
    'at ',
    'is ',
    'up',
    'down',
    'with roundness ',
    'roundness ',
    'goes through ',
    'through',
    'goes through below ',
    'goes through above ',
    'with left point ',
    'left point',
    'with right point',
    'right point',
    'point',
    'with s-shape',
    'from',
    'to'
  ],
  'slur right point': [
    'attached to middle of stem',
    'to middle of stem',
    'middle of stem',
    'of stem',
    'stem',
    'attached to note head',
    'to note head',
    'note head',
    'head'
  ],
  'tempo mark': [
    'up',
    'down'
  ],
  'time signature': [
    'for each line',
    'each line',
    'line',
    'for lines below',
    'lines below',
    'below'
  ],
  'tuplet': [
    ...mainTupletValues,
    ...positionCoordinates,
    'starts before ',
    'starts at ',
    'finishes after ',
    'finishes at ',
    'before ',
    'after ',
    'is ',
    'up',
    'down',
    'above',
    'below',
    'above stave',
    'below stave',
    'with brackets',
    'brackets'
  ],
  'volta': [
    'starts before ',
    'finishes after ',
    'starts at ',
    'finishes at ',
    'up',
    'down',
    'before ',
    'after ',
    'at ',
    'with text ""'
  ],
  'compress units by n times': [
    'in line ',
    'line '
  ],
  'stretch units by n times': [
    'in line ',
    'line '
  ]
})
