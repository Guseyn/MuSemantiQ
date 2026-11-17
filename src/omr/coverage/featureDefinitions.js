'use strict'

const measurePath = '$.measuresParams[*]'
const stavePath = `${measurePath}.stavesParams[*]`
const voicePath = `${stavePath}.voicesParams[*]`
const unitPath = `${voicePath}[*]`
const notePath = `${unitPath}.notes[*]`

export default [
  {
    id: 'structure.page',
    category: 'structure',
    description: 'A page and its score-level properties.',
    observability: 'layout',
    scenarios: { exact: [], patterns: [ '^page meta$' ] },
    schema: [ { path: '$.measuresParams' } ]
  },
  {
    id: 'structure.system',
    category: 'structure',
    description: 'Stave groups connected by braces or brackets.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:bracket or brace|connection )' ] },
    schema: [
      { path: `${measurePath}.connectionsParams[*].name`, values: [ 'brace', 'bracket' ] },
      { path: `${measurePath}.connectionsParams[*].staveStartNumber` },
      { path: `${measurePath}.connectionsParams[*].staveEndNumber` }
    ]
  },
  {
    id: 'structure.measure',
    category: 'structure',
    description: 'A measure boundary in the score timeline.',
    observability: 'layout',
    scenarios: { exact: [], patterns: [ '^measure$' ] },
    schema: [ { path: measurePath } ]
  },
  {
    id: 'structure.stave',
    category: 'structure',
    description: 'A stave inside a measure.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^stave$' ] },
    schema: [ { path: stavePath } ]
  },
  {
    id: 'structure.voice',
    category: 'structure',
    description: 'An independent rhythmic voice on a stave.',
    observability: 'ambiguous',
    scenarios: { exact: [], patterns: [ '^voice$' ] },
    schema: [ { path: voicePath } ]
  },
  {
    id: 'layout.page-line',
    category: 'layout',
    description: 'Line breaks and declarations applied to selected page lines.',
    observability: 'layout',
    scenarios: { exact: [], patterns: [ '^(?:new|new line)$|for each line|for lines below' ] },
    schema: [
      { path: `${measurePath}.pageLineNumber` },
      { path: `${measurePath}.isLastMeasureOnPageLine`, values: [ true ] }
    ]
  },
  {
    id: 'layout.unit-spacing',
    category: 'layout',
    description: 'Compression and stretching of horizontal unit spacing.',
    observability: 'layout',
    scenarios: { exact: [], patterns: [ '^(?:compress units|stretch units)' ] },
    schema: [
      { path: '$.compressUnitsByNTimes' },
      { path: '$.stretchUnitsByNTimes' },
      { path: '$.compressUnitsByNTimesInLines[*]' },
      { path: '$.stretchUnitsByNTimesInLines[*]' }
    ]
  },
  {
    id: 'layout.measure-visibility',
    category: 'layout',
    description: 'Suppression of the final measure on a page.',
    observability: 'nonvisual',
    nonvisualCategory: 'rendering-configuration',
    scenarios: { exact: [], patterns: [ '^hide the last measure on a page$' ] },
    schema: [ { path: '$.hideLastMeasure', values: [ true ] } ]
  },
  {
    id: 'layout.manual-correction',
    category: 'layout',
    description: 'Explicit horizontal and vertical adjustments to engraved marks.',
    observability: 'layout',
    scenarios: { exact: [], patterns: [ '(?:vertical|horizontal) correction' ] },
    schema: [
      { path: `${unitPath}.relatedXCorrection` },
      { path: `${measurePath}.tempoMark.yCorrection` },
      { path: `${measurePath}.voltaMark.yCorrection` }
    ]
  },
  {
    id: 'notation.clef',
    category: 'notation',
    description: 'Clefs at stave or unit boundaries.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:stave with clef|clef|note with clef before|chord with clef before|note with clef and key signature before|chord with clef and key signature before)$' ] },
    schema: [
      {
        path: `${stavePath}.clef`,
        values: [ 'treble', 'bass', 'alto', 'baritone', 'mezzoSoprano', 'octaveEightUp', 'octaveEightDown', 'octaveFifteenUp', 'octaveFifteenDown', 'soprano', 'tenor' ]
      },
      { path: `${unitPath}.clefBefore` }
    ]
  },
  {
    id: 'notation.key-signature',
    category: 'notation',
    description: 'Key signatures at measure or unit boundaries.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:key signature|note with key signature before|chord with key signature before|note with clef and key signature before|chord with clef and key signature before)' ] },
    schema: [
      { path: `${measurePath}.keySignatureName` },
      { path: `${unitPath}.keySignatureBefore` }
    ]
  },
  {
    id: 'notation.time-signature',
    category: 'notation',
    description: 'Numeric and common-time signatures.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^time signature' ] },
    schema: [
      { path: `${measurePath}.timeSignatureParams.numerator` },
      { path: `${measurePath}.timeSignatureParams.denominator` },
      { path: `${measurePath}.timeSignatureParams.cMode`, values: [ true ] }
    ]
  },
  {
    id: 'notation.barline',
    category: 'notation',
    description: 'Opening, closing, dotted, double, and bold barlines.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:measure without start bar line|measure opens with bar line|measure closes with bar line|no start bar line|opening bar line|closing bar line)$' ] },
    schema: [
      { path: `${measurePath}.withoutStartBarLine`, values: [ true ] },
      { path: `${measurePath}.openingBarLineName`, values: [ 'startBarLine', 'startBoldDoubleBarLine' ] },
      { path: `${measurePath}.closingBarLineName`, values: [ 'barLine', 'boldDoubleBarLine', 'dottedBarLine', 'doubleBarLine' ] }
    ]
  },
  {
    id: 'unit.note',
    category: 'unit',
    description: 'A pitched note and its staff position.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^note$' ] },
    schema: [
      { path: `${notePath}.noteName`, values: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g' ] },
      { path: `${notePath}.octaveNumber` },
      { path: `${notePath}.positionNumber` }
    ]
  },
  {
    id: 'unit.rest',
    category: 'unit',
    description: 'Ordinary and positioned rests.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|note is rest|chord is rest)$' ] },
    schema: [
      { path: `${unitPath}.isRest`, values: [ true ] },
      { path: `${notePath}.positionNumber` }
    ]
  },
  {
    id: 'unit.duration',
    category: 'unit',
    description: 'Written note, chord, and rest durations.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord)$' ] },
    schema: [
      { path: `${unitPath}.unitDuration`, values: [ 4, 2, 1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625, 0.0078125, 0.00390625 ] }
    ]
  },
  {
    id: 'unit.dot',
    category: 'unit',
    description: 'One or more augmentation dots.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note with number of dots|dotted note|chord with number of dots|dotted chord)$' ] },
    schema: [ { path: `${unitPath}.numberOfDots` } ]
  },
  {
    id: 'unit.chord',
    category: 'unit',
    description: 'Multiple notes sharing one rhythmic unit.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^chord$' ] },
    schema: [ { path: `${unitPath}.notes[*]` } ]
  },
  {
    id: 'unit.stem',
    category: 'unit',
    description: 'Stem presence and direction.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) stem direction$' ] },
    schema: [ { path: `${unitPath}.stemDirection`, values: [ 'up', 'down' ] } ]
  },
  {
    id: 'unit.beam',
    category: 'unit',
    description: 'Beams, beam breaks, and primary-only partial beams.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) (?:beamed|not beamed)' ] },
    schema: [
      { path: `${unitPath}.beamedWithNext`, values: [ true, false ] },
      { path: `${unitPath}.beamedWithNextWithJustOneBeam`, values: [ true ] }
    ]
  },
  {
    id: 'unit.grace',
    category: 'unit',
    description: 'Grace notes and chords, including crushed grace slashes.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) (?:is grace|with crushed grace)$' ] },
    schema: [
      { path: `${unitPath}.isGrace`, values: [ true ] },
      { path: `${unitPath}.hasGraceCrushLine`, values: [ true ] }
    ]
  },
  {
    id: 'unit.ghost',
    category: 'unit',
    description: 'Ghost notes and the command that restores ordinary noteheads.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) is (?:not )?ghost$' ] },
    schema: [ { path: `${notePath}.isGhost`, values: [ true, false ] } ]
  },
  {
    id: 'unit.accidental',
    category: 'unit',
    description: 'Standard, double, and microtonal accidentals.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^note with key(?: with parentheses)?$' ] },
    schema: [
      {
        path: `${unitPath}.keysParams[*].keyType`,
        values: [ 'doubleFlatKey', 'doubleSharpKey', 'flatKey', 'naturalKey', 'sharpKey', 'demiflatKey', 'sesquiflatKey', 'demisharpKey', 'sesquisharpKey' ]
      }
    ]
  },
  {
    id: 'unit.cross-staff',
    category: 'unit',
    description: 'Notes assigned to the previous, current, or next stave.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) stave position$' ] },
    schema: [
      { path: `${notePath}.stave`, values: [ 'prev', 'current', 'next' ] },
      { path: `${unitPath}.keysParams[*].stave`, values: [ 'prev', 'current', 'next' ] }
    ]
  },
  {
    id: 'unit.parentheses',
    category: 'unit',
    description: 'Parentheses around notes, chords, or accidentals.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) with (?:key with )?parentheses' ] },
    schema: [
      { path: `${unitPath}.parentheses[*]` },
      { path: `${unitPath}.keysParams[*].withParentheses`, values: [ true ] }
    ]
  },
  {
    id: 'mark.articulation',
    category: 'mark',
    description: 'Unit-local articulation marks and their placement.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) with articulation' ] },
    schema: [
      {
        path: `${unitPath}.articulationParams[*].name`,
        values: [ 'staccato', 'spiccato', 'accent', 'tenuto', 'marcato', 'fermata', 'leftHandPizzicato', 'snapPizzicato', 'naturalHarmonic', 'upBow', 'downBow' ]
      }
    ]
  },
  {
    id: 'mark.ornament',
    category: 'mark',
    description: 'Turns, mordents, trills, and their accidentals and variants.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) with (?:turn|mordent|trill)' ] },
    schema: [
      { path: `${unitPath}.articulationParams[*].name`, values: [ 'turn', 'trill', 'mordent' ] },
      { path: `${unitPath}.articulationParams[*].keyAbove`, values: [ 'flat', 'natural', 'sharp' ] },
      { path: `${unitPath}.articulationParams[*].keyBelow`, values: [ 'flat', 'natural', 'sharp' ] }
    ]
  },
  {
    id: 'mark.breath',
    category: 'mark',
    description: 'Comma and double-slash breath marks before units.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) with breath mark' ] },
    schema: [ { path: `${unitPath}.breathMarkBefore.type`, values: [ 'double slash', 'comma' ] } ]
  },
  {
    id: 'mark.arpeggio',
    category: 'mark',
    description: 'Arpeggio lines, connections, and directional arrows.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^chord is arpeggiated' ] },
    schema: [
      { path: `${unitPath}.arpeggiated` },
      { path: `${unitPath}.arpeggiated.arrow`, values: [ 'up', 'down' ] }
    ]
  },
  {
    id: 'mark.fermata',
    category: 'mark',
    description: 'A fermata at the end of a measure.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:measure ends with fermata|measure fermata)' ] },
    schema: [ { path: `${measurePath}.endsWithFermata`, values: [ true ] } ]
  },
  {
    id: 'mark.dynamic',
    category: 'mark',
    description: 'Unit-local dynamic letters and placement.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) (?:with dynamic|dynamic vertical correction)' ] },
    schema: [
      { path: `${unitPath}.articulationParams[*].name`, values: [ 'dynamicMark' ] },
      { path: `${unitPath}.articulationParams[*].textValue` }
    ]
  },
  {
    id: 'mark.rest-position',
    category: 'mark',
    description: 'Centering of a unit-local rest.',
    observability: 'layout',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) is centralized$' ] },
    schema: [ { path: `${unitPath}.isFullMeasure`, values: [ true ] } ]
  },
  {
    id: 'mark.note-text',
    category: 'mark',
    description: 'Text attached beside, above, or below a note or chord.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) with text' ] },
    schema: [
      { path: `${unitPath}.keysParams[*].textValue` },
      { path: `${unitPath}.articulationParams[*].textValue` }
    ]
  },
  {
    id: 'mark.chord-symbol',
    category: 'mark',
    description: 'Chord letters attached to a rhythmic unit.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) with chord letter' ] },
    schema: [ { path: `${unitPath}.relatedChordLetter.textValue` } ]
  },
  {
    id: 'span.tie',
    category: 'span',
    description: 'Ties within and across measures.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) (?:is tied|tied )' ] },
    schema: [
      { path: `${unitPath}.tiedWithNext` },
      { path: `${unitPath}.tiedBefore` },
      { path: `${unitPath}.tiedAfter` },
      { path: `${unitPath}.tiedBeforeMeasure.index` },
      { path: `${unitPath}.tiedAfterMeasure.index` }
    ]
  },
  {
    id: 'span.slur',
    category: 'span',
    description: 'Slurs, their endpoints, shape, direction, and attachment.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ 'slur' ] },
    schema: [
      { path: `${unitPath}.slurMarks[*].key` },
      { path: `${unitPath}.slurMarks[*].direction`, values: [ 'up', 'down' ] },
      { path: `${unitPath}.slurMarks[*].sShape`, values: [ true ] }
    ]
  },
  {
    id: 'span.tuplet',
    category: 'span',
    description: 'Tuplets, ratios, brackets, and placement.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ 'tuplet' ] },
    schema: [
      { path: `${unitPath}.tupletMarks[*].key` },
      { path: `${unitPath}.tupletMarks[*].value` },
      { path: `${unitPath}.tupletMarks[*].withBrackets`, values: [ true ] }
    ]
  },
  {
    id: 'span.octave',
    category: 'span',
    description: 'Octave transposition signs and their spans.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ 'octave sign' ] },
    schema: [
      { path: `${unitPath}.octaveSignMark.octaveNumber` },
      { path: `${unitPath}.octaveSignMark.octavePostfix` },
      { path: `${unitPath}.octaveSignMark.direction`, values: [ 'up', 'down' ] }
    ]
  },
  {
    id: 'span.glissando',
    category: 'span',
    description: 'Line and wave glissandi within and across measures.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ 'glissando' ] },
    schema: [
      { path: `${unitPath}.glissandoMarks[*].key` },
      { path: `${unitPath}.glissandoMarks[*].form`, values: [ 'wave', 'line' ] },
      { path: `${unitPath}.glissandoMarks[*].direction`, values: [ 'up', 'down' ] }
    ]
  },
  {
    id: 'span.hairpin',
    category: 'span',
    description: 'Crescendo and diminuendo hairpins.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ 'crescendo\\|diminuendo' ] },
    schema: [
      { path: `${unitPath}.dynamicChangeMark.type`, values: [ 'crescendo', 'diminuendo' ] },
      { path: `${unitPath}.dynamicChangeMark.direction`, values: [ 'up', 'down' ] }
    ]
  },
  {
    id: 'span.pedal',
    category: 'span',
    description: 'Pedal starts, variable peaks, releases, and brackets.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) with (?:pedal|variable peak|release)' ] },
    schema: [
      { path: `${unitPath}.pedalMark.start`, values: [ true ] },
      { path: `${unitPath}.pedalMark.variablePeak`, values: [ true ] },
      { path: `${unitPath}.pedalMark.release`, values: [ true ] },
      { path: `${unitPath}.pedalMark.withBrackets`, values: [ true ] }
    ]
  },
  {
    id: 'mark.tremolo',
    category: 'mark',
    description: 'Single-unit and two-unit tremolo strokes.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:note|chord) with tremolo' ] },
    schema: [
      { path: `${unitPath}.tremoloParams.type`, values: [ 'single', 'withNext' ] },
      { path: `${unitPath}.tremoloParams.customNumberOfTremoloStrokes`, values: [ 1, 2, 3 ] }
    ]
  },
  {
    id: 'repeat.barline',
    category: 'repeat',
    description: 'Repeat dots at measure boundaries.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:measure with repeat sign|repeat sign)' ] },
    schema: [
      { path: `${measurePath}.repeatDotsMarkAtTheStart`, values: [ true ] },
      { path: `${measurePath}.repeatDotsMarkAtTheEnd`, values: [ true ] }
    ]
  },
  {
    id: 'repeat.volta',
    category: 'repeat',
    description: 'Volta brackets, labels, and open or closed endpoints.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ 'volta' ] },
    schema: [
      { path: `${measurePath}.voltaMark.value` },
      { path: `${measurePath}.voltaMark.startsBefore`, values: [ true ] },
      { path: `${measurePath}.voltaMark.finishesAfter`, values: [ true ] }
    ]
  },
  {
    id: 'repeat.unit-simile',
    category: 'repeat',
    description: 'Beat and unit repetition with simile marks.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^repeat (?:note|chord)|repeat simile' ] },
    schema: [
      { path: `${unitPath}.simileMark.refId` },
      { path: `${unitPath}.simileMark.count` },
      { path: `${unitPath}.isSimile`, values: [ true ] }
    ]
  },
  {
    id: 'measure.simile',
    category: 'measure',
    description: 'Repetition of one or two preceding measures.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:measure with simile|simile (?:of|count))' ] },
    schema: [
      { path: `${measurePath}.similePreviousMeasureCount` },
      { path: `${measurePath}.simileTwoPreviousMeasuresCount` }
    ]
  },
  {
    id: 'measure.rest',
    category: 'measure',
    description: 'Single-measure and multi-measure rests.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:measure with (?:measure rest|multi measure rest count)|measure rest|multi measure rest count)' ] },
    schema: [
      { path: `${measurePath}.isMeasureRest`, values: [ true ] },
      { path: `${measurePath}.multiMeasureRestCount` }
    ]
  },
  {
    id: 'repeat.repetition-note',
    category: 'repeat',
    description: 'Written repetition instructions at measure boundaries.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^repetition note' ] },
    schema: [
      { path: `${measurePath}.repetitionNote.value` },
      { path: `${measurePath}.repetitionNote.measurePosition`, values: [ 'start', 'end' ] }
    ]
  },
  {
    id: 'navigation.coda',
    category: 'navigation',
    description: 'Coda signs at measure boundaries.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^coda' ] },
    schema: [ { path: `${measurePath}.coda.measurePosition`, values: [ 'start', 'end' ] } ]
  },
  {
    id: 'navigation.segno',
    category: 'navigation',
    description: 'Segno signs at measure boundaries.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^sign' ] },
    schema: [ { path: `${measurePath}.sign.measurePosition`, values: [ 'start', 'end' ] } ]
  },
  {
    id: 'notation.tempo',
    category: 'notation',
    description: 'Tempo text and duration-based tempo marks.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^tempo mark' ] },
    schema: [ { path: `${measurePath}.tempoMark.textValueParts[*]` } ]
  },
  {
    id: 'notation.measure-number',
    category: 'notation',
    description: 'Measure number visibility, application, and placement.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:measure numbers|direction of measure numbers|application of measure numbers)' ] },
    schema: [
      { path: '$.showMeasureNumbers', values: [ 'all', 'first', 'last', 'first&last' ] },
      { path: '$.directionOfMeasureNumbers', values: [ 'up', 'down' ] }
    ]
  },
  {
    id: 'text.page-metadata',
    category: 'text',
    description: 'Titles, subtitles, and page numbers.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^page meta$' ] },
    schema: [
      { path: '$.title' },
      { path: '$.subtitle' },
      { path: '$.leftSubtitle' },
      { path: '$.rightSubtitle' },
      { path: '$.pageNumber' }
    ]
  },
  {
    id: 'text.instrument',
    category: 'text',
    description: 'Instrument labels attached to one or more staves.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^instrument title' ] },
    schema: [
      { path: `${measurePath}.instrumentTitlesParams[*].value` },
      { path: `${measurePath}.instrumentTitlesParams[*].staveNumber` }
    ]
  },
  {
    id: 'text.lyrics',
    category: 'text',
    description: 'Lyrics, syllable dashes, melismas, and their stave placement.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:lyrics position|note with lyrics|chord with lyrics)' ] },
    schema: [
      { path: '$.lyricsUnderStaveIndex' },
      { path: `${unitPath}.relatedLyrics[*].textValue` },
      { path: `${unitPath}.relatedLyrics[*].dashAfter`, values: [ true ] },
      { path: `${unitPath}.relatedLyrics[*].underscoreStarts`, values: [ true ] },
      { path: `${unitPath}.relatedLyrics[*].underscoreFinishes`, values: [ true ] }
    ]
  },
  {
    id: 'configuration.style',
    category: 'configuration',
    description: 'Font, color, and rendering style declarations.',
    observability: 'visual',
    scenarios: { exact: [], patterns: [ '^(?:color style|music font style|text font style|chord letters font style|style (?:name|value))' ] },
    schema: []
  },
  {
    id: 'configuration.midi',
    category: 'configuration',
    description: 'MIDI playback settings that do not create notation.',
    observability: 'nonvisual',
    nonvisualCategory: 'playback',
    scenarios: { exact: [], patterns: [ '^midi setting' ] },
    schema: []
  },
  {
    id: 'source.comment',
    category: 'source',
    description: 'MSQ comments omitted from the engraved score.',
    observability: 'nonvisual',
    nonvisualCategory: 'source-only',
    scenarios: { exact: [], patterns: [ '^(?:comment|quote ends comment)' ] },
    schema: []
  },
  {
    id: 'source.punctuation',
    category: 'source',
    description: 'Source punctuation with no independent engraved meaning.',
    observability: 'nonvisual',
    nonvisualCategory: 'source-only',
    scenarios: { exact: [], patterns: [ '^punctuation$' ] },
    schema: []
  },
  {
    id: 'source.empty-line',
    category: 'source',
    description: 'Empty source lines, including parser chord-scope control.',
    observability: 'nonvisual',
    nonvisualCategory: 'parser-control',
    scenarios: { exact: [], patterns: [ '^empty line' ] },
    schema: []
  },
  {
    id: 'source.unrecognized-command',
    category: 'source',
    description: 'Input rejected by the parser rather than engraved.',
    observability: 'nonvisual',
    nonvisualCategory: 'parser-diagnostic',
    scenarios: { exact: [], patterns: [ '^command is not recognizable$' ] },
    schema: []
  }
]
