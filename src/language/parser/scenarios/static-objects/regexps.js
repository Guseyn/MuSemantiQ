'use strict'

import configurableStyleNames from '#msq/language/parser/scenarios/static-objects/configurableStyleNames.js'
import pageMetaNames from '#msq/language/parser/scenarios/static-objects/pageMetaNames.js'
import openingBarLineNames from '#msq/language/parser/scenarios/static-objects/openingBarLineNames.js'
import closingBarLineNames from '#msq/language/parser/scenarios/static-objects/closingBarLineNames.js'
import applicationOfMeasureNumbersNames from '#msq/language/parser/scenarios/static-objects/applicationOfMeasureNumbersNames.js'
import keySignatureNames from '#msq/language/parser/scenarios/static-objects/keySignatureNames.js'
import tempoDurationPartNames from '#msq/language/parser/scenarios/static-objects/tempoDurationPartNames.js'
import clefNames from '#msq/language/parser/scenarios/static-objects/clefNames.js'
import noteDurationNames from '#msq/language/parser/scenarios/static-objects/noteDurationNames.js'
import noteNames from '#msq/language/parser/scenarios/static-objects/noteNames.js'
import stavePositionNames from '#msq/language/parser/scenarios/static-objects/stavePositionNames.js'
import noteKeyNames from '#msq/language/parser/scenarios/static-objects/noteKeyNames.js'
import breathMarkNames from '#msq/language/parser/scenarios/static-objects/breathMarkNames.js'
import articulationNames from '#msq/language/parser/scenarios/static-objects/articulationNames.js'
import ornamentKeyNames from '#msq/language/parser/scenarios/static-objects/ornamentKeyNames.js'
import midiSettingNames from '#msq/language/parser/scenarios/static-objects/midiSettingNames.js'
import instrumentNames from '#msq/language/parser/scenarios/static-objects/instrumentNames.js'
import removeDoubleSpacesAndTrim from '#msq/language/parser/scenarios/token/removeDoubleSpacesAndTrim.js'

const VERTICAL_LINE = '|'
const SLASH = '/'
const EMPTY = ''
const SPACE = ' '
const SPACE_REGEXP = '(\\s+)'
const COLUMN = ':'
const SEMI_COLUMN = ';'
const COMMA = ','
const AND = 'and'
const AND_WITH_SEMI_COLUMN_AT_THE_START = ';and'
const AND_WITH_COMMA_AT_THE_START = ',and'
const AND_WITH_SEMI_COLUMN_AT_THE_END = 'and;'
const AND_WITH_COMMA_AT_THE_END = 'and,'
const IS = 'is'
const ARE = 'are'
const THE = 'the'
const OF = 'of'
const FOR = 'for'
const TO = 'to'
const FROM = 'from'
const TILL = 'till'
const BETWEEN = 'between'
const IN = 'in'
const ON = 'on'
const AT = 'at'
const UP = 'up'
const DOWN = 'down'
const LEFT = 'left'
const RIGHT = 'right'
const WITH = 'with'
const BY = 'by'
const WITH_NEXT = [ 'with', 'next' ]
const NEXT = 'next'
const BEFORE = 'before'
const AFTER = 'after'
const BESIDE = 'beside'
const SINGLE_QUOTE = '\''
const DOUBLE_QUOTE = '"'
const MEASURE_NUMBERS = [ 'measure', 'numbers' ]
const MEASURES = 'measures'
const MEASURE = 'measure'
const ABOVE = 'above'
const BELOW = 'below'
const OVER = 'over'
const UNDER = 'under'
const IS_UNDER = 'is under'
const LYRICS = 'lyrics'
const STAVE = 'stave'
const STAFF = 'staff'
const COMPRESS = 'compress'
const STRETCH = 'stretch'
const STAVE_WITH_AND_WITHOUT_DELIMITER = [
  [ 'stave' ], [ 'stave;' ], [ 'stave,' ],
  [ 'staff' ], [ 'staff;' ], [ 'staff,' ]
]
const WITHOUT_START_BARLINE = [
  [ 'without', 'opening', 'bar', 'line' ],
  [ 'without', 'start', 'bar', 'line' ],
  [ 'without', 'opening', 'barline' ],
  [ 'without', 'start', 'barline' ],
  [ 'starts', 'without', 'bar', 'line' ],
  [ 'opens', 'without', 'bar', 'line' ],
  [ 'starts', 'without', 'barline' ],
  [ 'opens', 'without', 'barline' ],
  [ 'with', 'no', 'opening', 'bar', 'line' ],
  [ 'with', 'no', 'start', 'bar', 'line' ],
  [ 'with', 'no', 'opening', 'barline' ],
  [ 'with', 'no', 'start', 'barline' ],
  [ 'starts', 'with', 'no', 'bar', 'line' ],
  [ 'opens', 'with', 'no', 'bar', 'line' ],
  [ 'starts', 'with', 'no', 'barline' ],
  [ 'opens', 'with', 'no', 'barline' ]
]
const NO_START_BARLINE = [
  [ 'no', 'opening', 'bar', 'line' ],
  [ 'no', 'start', 'bar', 'line' ],
  [ 'no', 'opening', 'barline' ],
  [ 'no', 'start', 'barline' ]
]
const STARTS_BEGINS_OPENS = [ 'starts', 'begins', 'opens' ]
const CLOSES_FINISHES_ENDS = [ 'closes', 'finishes', 'ends' ]
const OPENING = 'opening'
const START = 'start'
const CLOSING = 'closing'
const WITH_REPEAT_SIGN = [
  [ 'with', 'repeat', 'sign' ],
  [ 'with', 'colon' ]
]
const REPEAT_SIGN = [
  [ 'repeat', 'sign' ],
  [ 'colon' ]
]
const AT_THE_START = [
  [ 'at', 'the', 'start' ],
  [ 'at', 'start' ]
]
const AT_THE_END = [
  [ 'at', 'the', 'end' ],
  [ 'at', 'end' ]
]
const AT_THE_START_OF_THE_MEASURE = [
  [ 'at', 'the', 'start', 'of', 'the', 'measure' ],
  [ 'at', 'the', 'start', 'of', 'measure' ],
  [ 'at', 'start', 'of', 'the', 'measure' ],
  [ 'at', 'start', 'of', 'measure' ]
]
const AT_THE_END_OF_THE_MEASURE = [
  [ 'at', 'the', 'end', 'of', 'the', 'measure' ],
  [ 'at', 'the', 'end', 'of', 'measure' ],
  [ 'at', 'end', 'of', 'the', 'measure' ],
  [ 'at', 'end', 'of', 'measure' ]
]
const WITH_MEASURE_REST = [
  [ 'with', 'multi', 'measure', 'rest' ],
  [ 'with', 'measure', 'rest' ]
]
const MEASURE_REST = [
  [ 'multi', 'measure', 'rest' ],
  [ 'measure', 'rest' ]
]
const TIME = 'time'
const TIMES = 'times'
const COLOR = 'color'
const COLOUR = 'colour'
const OF_PREVIOUS_BEAT = [
  [ 'of', 'prev.', 'beat' ],
  [ 'of', 'prev', 'beat' ],
  [ 'of', 'previous', 'beat' ]
]
const OF_PREVIOUS_BEATS = [
  [ 'of', 'prev.', 'beats' ],
  [ 'of', 'prev', 'beats' ],
  [ 'of', 'previous', 'beats' ]
]
const MEASURE_WITH_SIMILE_OF_PREVIOUS_MEASURE = [
  [ 'with', 'simile', 'of', 'prev.', 'measure' ],
  [ 'with', 'simile', 'of', 'prev', 'measure' ],
  [ 'with', 'simile', 'of', 'previous', 'measure' ],
  [ 'with', 'repeat', 'of', 'prev.', 'measure' ],
  [ 'with', 'repeat', 'of', 'prev', 'measure' ],
  [ 'with', 'repeat', 'of', 'previous', 'measure' ],
  [ 'with', 'simile', 'for', 'prev.', 'measure' ],
  [ 'with', 'simile', 'for', 'prev', 'measure' ],
  [ 'with', 'simile', 'for', 'previous', 'measure' ],
  [ 'with', 'repeat', 'for', 'prev.', 'measure' ],
  [ 'with', 'repeat', 'for', 'prev', 'measure' ],
  [ 'with', 'repeat', 'for', 'previous', 'measure' ]
]
const MEASURE_WITH_SIMILE_OF_TWO_PREVIOUS_MEASURES = [
  [ 'with', 'simile', 'of', '2', 'prev.', 'measures' ],
  [ 'with', 'simile', 'of', '2', 'prev', 'measures' ],
  [ 'with', 'simile', 'of', '2', 'previous', 'measures' ],
  [ 'with', 'repeat', 'of', '2', 'prev.', 'measures' ],
  [ 'with', 'repeat', 'of', '2', 'prev', 'measures' ],
  [ 'with', 'repeat', 'of', '2', 'previous', 'measures' ],
  [ 'with', 'simile', 'of', 'two', 'prev.', 'measures' ],
  [ 'with', 'simile', 'of', 'two', 'prev', 'measures' ],
  [ 'with', 'simile', 'of', 'two', 'previous', 'measures' ],
  [ 'with', 'repeat', 'of', 'two', 'prev.', 'measures' ],
  [ 'with', 'repeat', 'of', 'two', 'prev', 'measures' ],
  [ 'with', 'repeat', 'of', 'two', 'previous', 'measures' ],
  [ 'with', 'simile', 'for', '2', 'prev.', 'measures' ],
  [ 'with', 'simile', 'for', '2', 'prev', 'measures' ],
  [ 'with', 'simile', 'for', '2', 'previous', 'measures' ],
  [ 'with', 'repeat', 'for', '2', 'prev.', 'measures' ],
  [ 'with', 'repeat', 'for', '2', 'prev', 'measures' ],
  [ 'with', 'repeat', 'for', '2', 'previous', 'measures' ],
  [ 'with', 'simile', 'for', 'two', 'prev.', 'measures' ],
  [ 'with', 'simile', 'for', 'two', 'prev', 'measures' ],
  [ 'with', 'simile', 'for', 'two', 'previous', 'measures' ],
  [ 'with', 'repeat', 'for', 'two', 'prev.', 'measures' ],
  [ 'with', 'repeat', 'for', 'two', 'prev', 'measures' ],
  [ 'with', 'repeat', 'for', 'two', 'previous', 'measures' ]
]
const SIMILE_OF_PREVIOUS_MEASURE = [
  [ 'simile', 'of', 'prev.', 'measure' ],
  [ 'simile', 'of', 'prev', 'measure' ],
  [ 'simile', 'of', 'previous', 'measure' ],
  [ 'repeat', 'of', 'prev.', 'measure' ],
  [ 'repeat', 'of', 'prev', 'measure' ],
  [ 'repeat', 'of', 'previous', 'measure' ],
  [ 'simile', 'for', 'prev.', 'measure' ],
  [ 'simile', 'for', 'prev', 'measure' ],
  [ 'simile', 'for', 'previous', 'measure' ],
  [ 'repeat', 'for', 'prev.', 'measure' ],
  [ 'repeat', 'for', 'prev', 'measure' ],
  [ 'repeat', 'for', 'previous', 'measure' ]
]
const SIMILE_OF_TWO_PREVIOUS_MEASURES = [
  [ 'simile', 'of', '2', 'prev.', 'measures' ],
  [ 'simile', 'of', '2', 'prev', 'measures' ],
  [ 'simile', 'of', '2', 'previous', 'measures' ],
  [ 'repeat', 'of', '2', 'prev.', 'measures' ],
  [ 'repeat', 'of', '2', 'prev', 'measures' ],
  [ 'repeat', 'of', '2', 'previous', 'measures' ],
  [ 'simile', 'of', 'two', 'prev.', 'measures' ],
  [ 'simile', 'of', 'two', 'prev', 'measures' ],
  [ 'simile', 'of', 'two', 'previous', 'measures' ],
  [ 'repeat', 'of', 'two', 'prev.', 'measures' ],
  [ 'repeat', 'of', 'two', 'prev', 'measures' ],
  [ 'repeat', 'of', 'two', 'previous', 'measures' ],
  [ 'simile', 'for', '2', 'prev.', 'measures' ],
  [ 'simile', 'for', '2', 'prev', 'measures' ],
  [ 'simile', 'for', '2', 'previous', 'measures' ],
  [ 'repeat', 'for', '2', 'prev.', 'measures' ],
  [ 'repeat', 'for', '2', 'prev', 'measures' ],
  [ 'repeat', 'for', '2', 'previous', 'measures' ],
  [ 'simile', 'for', 'two', 'prev.', 'measures' ],
  [ 'simile', 'for', 'two', 'prev', 'measures' ],
  [ 'simile', 'for', 'two', 'previous', 'measures' ],
  [ 'repeat', 'for', 'two', 'prev.', 'measures' ],
  [ 'repeat', 'for', 'two', 'prev', 'measures' ],
  [ 'repeat', 'for', 'two', 'previous', 'measures' ]
]
const NEW = 'new'
const LINE = 'line'
const LINES = 'lines'
const CROSS_STAVE_CONNECTIONS = [ 'bracket', 'brace' ]
const INSTRUMENT = 'instrument'
const TITLE = 'title'
const KEY_SIGNATURE = [ 'key', 'signature' ]
const TIME_SIGNATURE = [ 'time', 'signature' ]
const SIGNATURE = 'signature'
const C = 'c'
const CROSSED = 'crossed'
const REPETITION = 'repetition'
const MARK = 'mark'
const NOTE = 'note'
const INSTRUCTION = 'instruction'
const CODA = 'coda'
const SIGN = 'sign'
const SEGNO = 'segno'
const TEMPO = 'tempo'
const METRONOME = 'metronome'
const METRO = 'metro'
const TEMPO_MARK = [ 'tempo', 'mark' ]
const TEMPO_NOTE = [ 'tempo', 'note' ]
const DOTTED = 'dotted'
const WITH_DOT = [ 'with', 'dot' ]
const CLEF = 'clef'
const VOICE = 'voice'
const ONE = '1'
const TWO = '2'
const STEM = 'stem'
const ON_IN_AT = [ 'on', 'in', 'at' ]
const DOT = 'dot'
const DOTS = 'dots'
const ONE_AS_WORD = 'one'
const TWO_AS_WORD = 'two'
const IS_BEAMED = [ 'is', 'beamed' ]
const IS_NOT_BEAMED = [ 'is', 'not', 'beamed' ]
const NOT_BEAMED = [ 'not', 'beamed' ]
const BEAMED = 'beamed'
const WITH_ONLY_ONE_LINE = [ 'with', 'only', 'one', 'line' ]
const WITH_ONLY_PRIMARY_LINE = [ 'with', 'only', 'primary', 'line' ]
const KEY = 'key'
const TEXT = 'text'
const WITH_PARENTHESES = [ 'with', 'parentheses' ]
const WITH_BRACKETS = [ 'with', 'brackets' ]
const ROUNDNESS = 'roundness'
const CONVEX = 'convex'
const ROUND_COEFFICIENT = [ '1', '2', '3', '4', '5', '6', '7', '8', '9', '10' ]
const IS_TIED_WITH_NEXT = [ 'is', 'tied', 'with', 'next' ]
const TIED_WITH_NEXT = [ 'tied', 'with', 'next' ]
const IS_TIED_AFTER = [ 'is', 'tied', 'after' ]
const TIED_AFTER = [ 'tied', 'after' ]
const TIED = 'tied'
const IS_TIED_BEFORE = [ 'is', 'tied', 'before' ]
const TIED_BEFORE = [ 'tied', 'before' ]
const REST_POSITIONS = [ 'top', 'middle', 'mid', 'bottom' ]
const IS_REST = [ 'is', 'rest' ]
const REST = 'rest'
const IS_GHOST = [ 'is', 'ghost' ]
const IS_NOT_GHOST = [ 'is', 'not', 'ghost' ]
const NOT_GHOST = [ 'not', 'ghost' ]
const GHOST = 'ghost'
const GRACE = 'grace'
const CRUSHED = 'crushed'
const IS_GRACE = [ 'is', 'grace' ]
const IS_CRUSHED_GRACE = [ 'is', 'crushed', 'grace' ]
const CRUSHED_GRACE = [ 'crushed', 'grace' ]
const WITH_CRUSH_LINE = [ 'with', 'crush', 'line' ]
const GLISS = 'gliss'
const GLISS_DOT = 'gliss.'
const GLISSANDO = 'glissando'
const WITH_GLISSANDO = [
  [ 'with', 'glissando' ],
  [ 'with', 'gliss.' ],
  [ 'with', 'gliss' ]
]
const IS_IN_THE_CENTER = [ 'is', 'in', 'the', 'center' ]
const IN_THE_CENTER = [ 'in', 'the', 'center' ]
const IS_CENTRALIZED = [ 'is', 'centralized' ]
const CENTRALIZED = [ 'centralized' ]
const IS_NOT_IN_THE_CENTER = [ 'is', 'not', 'in', 'the', 'center' ]
const NOT_IN_THE_CENTER = [ 'not', 'in', 'the', 'center' ]
const IS_NOT_CENTRALIZED = [ 'is', 'not', 'centralized' ]
const NOT_CENTRALIZED = [ 'not', 'centralized' ]
const BREATH = 'breath'
const IS_INVERTED = 'inverted'
const INVERTED = 'inverted'
const WITH_WAVE_AFTER = [ 'with', 'wave', 'after' ]
const CHORD = 'chord'
const LETTERS = 'letters'
const UP_CARET = '^'
const OCTAVE = 'octave'
const OCTAVES = 'octaves'
const HIGHER = 'higher'
const LOWER = 'lower'
const WITH_TREMOLO = [ 'with', 'tremolo' ]
const TREMOLO = 'tremolo'
const REPEAT = 'repeat'
const SIMILE = 'simile'
const VIA_SIMILE = [ 'via', 'simile' ]
const DYNAMIC = 'dynamic'
const WITH_NEW_LYRICS = [ 'with', 'new', 'lyrics' ]
const WITH_NEW_LYRIC = [ 'with', 'new', 'lyric' ]
const WITH_LYRICS = [ 'with', 'lyrics' ]
const WITH_LYRIC = [ 'with', 'lyric' ]
const WITH_TURN = [ 'with', 'turn' ]
const TURN = 'turn'
const WITH_MORDENT = [ 'with', 'mordent' ]
const MORDENT = 'mordent'
const WITH_TRILL = [ 'with', 'trill' ]
const TRILL = 'trill'
const WITH_ONE_STROKE = [ 'with', '1', 'stroke' ]
const WITH_TWO_STROKES = [ 'with', '2', 'strokes' ]
const WITH_THREE_STROKES = [ 'with', '3', 'strokes' ]
const IS_FOLLOWED_BY_DASH = [ 'is', 'followed', 'by', 'dash' ]
const IS_FOLLOWED_BY_HYPEN = [ 'is', 'followed', 'by', 'hyphen' ]
const FOLLOWED_BY_DASH = [ 'followed', 'by', 'dash' ]
const FOLLOWED_BY_HYPEN = [ 'followed', 'by', 'hyphen' ]
const WHERE_UNDERSCORE_STARTS = [ 'where', 'underscore', 'starts' ]
const WHERE_UNDERSCORE_BEGINS = [ 'where', 'underscore', 'begins' ]
const WITH_UNDERSCORE_STARTS = [ 'with', 'underscore', 'starts' ]
const WITH_UNDERSCORE_BEGINS = [ 'with', 'underscore', 'begins' ]
const UNDERSCORE_STARTS = [ 'underscore', 'starts' ]
const UNDERSCORE_BEGINS = [ 'underscore', 'begins' ]
const WHERE_UNDERSCORE_FINISHES = [ 'where', 'underscore', 'finishes' ]
const WHERE_UNDERSCORE_ENDS = [ 'where', 'underscore', 'ends' ]
const WITH_UNDERSCORE_FINISHES = [ 'with', 'underscore', 'finishes' ]
const WITH_UNDERSCORE_ENDS = [ 'with', 'underscore', 'ends' ]
const UNDERSCORE_FINISHES = [ 'underscore', 'finishes' ]
const UNDERSCORE_ENDS = [ 'underscore', 'ends' ]
const UNDERSCORE = 'underscore'
const FOR_EACH_LINE = [ 'for', 'each', 'line' ]
const FOR_LINES_BELOW = [ 'for', 'lines', 'below' ]
const FOR_LINES = [ 'for', 'lines' ]
const FOR_EACH = [ 'for', 'each' ]
const COMMENT = 'comment'
const SIDE_NOTE = 'side note'
const SIDE = 'side'
var IS_ARPEGGIATED = [
  [ 'is', 'arpeggiated' ],
  [ 'is', 'arpeggio' ],
  [ 'arpeggiated' ],
  [ 'arpeggio' ]
]
const WITH_CHOR_BELOW = [ 'with', 'chord', 'below' ]
const WITH_ARROW = [ 'with', 'arrow' ]
const ARROW = 'arrow'
const SLUR = 'slur'
const STARTS = 'starts'
const BEGINS = 'begins'
const STARTS_FROM = [ 'starts', 'from' ]
const BEGINS_FROM = [ 'begins', 'from' ]
const FINISHES = 'finishes'
const ENDS = 'ends'
const STARTS_BEFORE = [ 'starts', 'before' ]
const BEGINS_BEFORE = [ 'begins', 'before' ]
const FINISHES_AFTER = [ 'finishes', 'after' ]
const ENDS_AFTER = [ 'ends', 'after' ]
const CHANGES_STAVE = [ 'changes', 'stave' ]
const CHANGES_STAFF = [ 'changes', 'staff' ]
const GOES_THROUGH = [ 'goes', 'through' ]
const WITH_S_SHAPE = [ 'with', 's', 'shape' ]
const WITH_S_DASH_SHAPE = [ 'with', 's-shape' ]
const WITH_SSHAPE = [ 'with', 'sshape' ]
const WITH_LEFT_POINT = [ 'with', 'left', 'point' ]
const WITH_RIGHT_POINT = [ 'with', 'right', 'point' ]
const ATTACHED_TO_MIDDLE_OF_STEM = [ 'attached', 'to', 'middle', 'of', 'stem' ]
const ATTACHED_TO_THE_MIDDLE_OF_THE_STEM = [ 'attached', 'to', 'the', 'middle', 'of', 'the', 'stem' ]
const ATTACHED_TO_NOTE_BODY = [ 'attached', 'to', 'note', 'body' ]
const ATTACHED_TO_THE_NOTE_BODY = [ 'attached', 'to', 'the', 'note', 'body' ]
const ATTACHED_TO_NOTE_HEAD = [ 'attached', 'to', 'note', 'head' ]
const ATTACHED_TO_THE_NOTE_HEAD = [ 'attached', 'to', 'the', 'note', 'head' ]
const AS_WAVE = [ 'as', 'wave' ]
const AS_WAVES = [ 'as', 'waves' ]
const AS_LINE = [ 'as', 'line' ]
const AS_LINES = [ 'as', 'lines' ]
const WAVE = 'wave'
const TUPLET = 'tuplet'
const CRESCENDO = 'crescendo'
const CRES_DOT = 'cres.'
const CRES = 'cres'
const CRESC_DOT = 'cresc.'
const CRESC = 'cresc'
const DIMINUENDO = 'diminuendo'
const DIM_DOT = 'dim.'
const DIM = 'dim'
const VOLTA = 'volta'
const VOLTA_BRACKET = [ 'volta', 'bracket' ]
const VOLTA_BRACKETS = [ 'volta', 'brackets' ]
const BRACKET = 'bracket'
const BRACKETS = 'brackets'
const OPENS_WITH_BRACKET = [
  [ 'opens', 'with', 'bracket' ],
  [ 'starts', 'with', 'bracket' ],
  [ 'begins', 'with', 'bracket' ]
]
const WITH_SUSTAIN_PEDAL = [ 'with', 'sustain', 'pedal' ]
const WITH_PEDAL = [ 'with', 'pedal' ]
const PEDAL = 'pedal'
const AFTER_MEASURE = [ 'after', 'measure' ]
const RELEASE = 'release'
const WITH_PEDAL_RELEASE = [ 'with', 'pedal', 'release' ]
const WITH_RELEASE = [ 'with', 'release' ]
const WITH_VARIABLE_PEAK = [ 'with', 'variable', 'peak' ]
const UNIT = 'unit'
const UNITS = 'units'
const SUSTAIN = 'sustain'
const HIDE_LAST_MEASURE = [ 'hide', 'the', 'last', 'measure' ]
const ENDS_WITH_FERMATA = [ 'ends', 'with', 'fermata' ]
const FERMATA = [ 'fermata' ]
const DURATION = [ 'duration' ]
const MUSIC_FONT = [ 'music', 'font' ]
const TEXT_FONT = [ 'text', 'font' ]
const CHORD_LETTERS_FONT = [ 'chord', 'letters', 'font' ]

const allKeySignatureNamesWithDelimeter = keySignatureNames.join(VERTICAL_LINE)
const separateKeySignatureNames = allKeySignatureNamesWithDelimeter.split(VERTICAL_LINE)
const pageMetaNamesAsTokens = pageMetaNames.map(name => name.split(SPACE))
const configurableStyleNamesAsTokens = configurableStyleNames.map(name => name.split(SPACE))
const midiSettingNamesAsTokens = midiSettingNames.map(name => name.split(SPACE))
const instrumentNamesAsTokens = instrumentNames.map(name => name.split(SPACE))
const applicationOfMeasureNumbersNamesAsTokens = applicationOfMeasureNumbersNames.map(name => name.split(SPACE))
const openingBarLineNamesAsTokens = openingBarLineNames.map(name => name.split(SPACE))
const openingBarLineNamesAsTokensAsSeparateCommand = openingBarLineNames.map(name => `${START} ${name}`.split(SPACE)).concat(openingBarLineNames.map(name => `${OPENING} ${name}`.split(SPACE)))
const closingBarLineNamesAsTokens = closingBarLineNames.map(name => name.split(SPACE))
const closingBarLineNamesAsTokensAsSeparateCommand = closingBarLineNames.map(name => (`${CLOSING} ${name}`).split(SPACE))
const separateKeySignatureNamesAsTokens = separateKeySignatureNames.map(name => name.split(SPACE))
const clefNamesAsTokens = clefNames.map(name => name.split(SPACE))
const noteKeyNamesAsTokens = noteKeyNames.map(name => name.split(SPACE))
const mainNoteKeyNames = [ 'sharp', 'flat', 'natural', 'double sharp', 'double flat', 'demisharp', 'sesquisharp', 'demiflat', 'sesquiflat' ]
const mainNoteKeyNamesAsTokens = mainNoteKeyNames.map(name => name.split(SPACE))
const breathMarkNamesAsTokens = [
  ...breathMarkNames.map(name => name.split(SPACE)),
  ...breathMarkNames.map(name => ['as'].concat(name.split(SPACE)))
]
const articulationNamesAsTokens = articulationNames.map(name => name.split(SPACE))
const ornamentKeyNamesAsTokens = ornamentKeyNames.map(name => name.split(SPACE))

import cssColors from '#msq/language/parser/scenarios/static-objects/cssColors.js'

const isColor = (tokenValues) => {
  const joinedTokenValues = tokenValues.join(SPACE)
  return /^#([a-f0-9]{3,4}|[a-f0-9]{4}(?:[a-f0-9]{2}){1,2})\b$/i.test(joinedTokenValues) ||
    /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/.test(joinedTokenValues) ||
    /^rgba\((\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d*(?:\.\d+)?)\)$/.test(joinedTokenValues) ||
    (cssColors.indexOf(joinedTokenValues) !== -1)
}

const isSupportedMusicFont = (tokenValues, customMusicFonts) => {
  return customMusicFonts.indexOf(tokenValues.join(SPACE).toLowerCase()) !== -1
}

const isSupportedTextFont = (tokenValues, customTextFonts) => {
  return customTextFonts.indexOf(tokenValues.join(SPACE).toLowerCase()) !== -1
}

const isSupportedChordLettersFont = (tokenValues, customChordLettersFont) => {
  return customChordLettersFont.indexOf(tokenValues.join(SPACE).toLowerCase()) !== -1
}

const pageFormats = [
  'c4',
  'a3',
  'b4',
  'a4'
]

const isNumeric = (string) => {
  return !isNaN(string)
}

const styleValueTests = {
  backgroundColor: (tokenValues) => {
    return isColor(tokenValues)
  },
  musicFont: (tokenValues, customMusicFonts) => {
    return isSupportedMusicFont(tokenValues, customMusicFonts)
  },
  textFont: (tokenValues, customTextFonts) => {
    return isSupportedTextFont(tokenValues, customTextFonts)
  },
  chordLettersFont: (tokenValues, customChordLettersFont) => {
    return isSupportedChordLettersFont(tokenValues, customChordLettersFont)
  },
  fontColor: (tokenValues) => {
    return isColor(tokenValues)
  },
  pageBorderStrokeColor: (tokenValues) => {
    return isColor(tokenValues)
  },
  staveLinesColor: (tokenValues) => {
    return isColor(tokenValues)
  },
  intervalBetweenStaveLines: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  intervalBetweenStaves: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  intervalBetweenPageLines: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  pageLeftAndRightPadding: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  pageLineMaxWidth: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  pageTopPadding: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  pageBottomPadding: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  pageLinesTopOffset: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  pageNumberOffsetFromBottomOfThePage: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  titleTopOffset: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  subtitleTopOffset: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  leftAndRightSubtitlesTopOffset: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  pageBorderStrokeWidth: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  titleFontSize: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  subtitleFontSize: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  leftSubtitleFontSize: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  rightSubtitleFontSize: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  pageNumberFontSize: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  instrumentTitleFontSize: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  emptyMeasureWidth: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  },
  pageFormat: (tokenValues) => {
    return (tokenValues.length === 1) &&
      (pageFormats.indexOf(tokenValues[0]) !== -1)
  },
  pageHeight: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  }
}

const midiSettingValueTests = {
  defaultInstrument: (tokenValues) => {
    return doesFirstArrayContainSecondArray(instrumentNamesAsTokens, tokenValues)
  },
  defaultTempo: (tokenValues) => {
    return isWrappedWithQuotes(tokenValues)
  },
  fermataDuration: (tokenValues) => {
    return isNumeric(tokenValues.join(SPACE))
  }
}

const areTwoArraysEqual = (firstArray, secondArray) => {
  if (firstArray.length !== secondArray.length) {
    return false
  }
  for (let index = 0; index < firstArray.length; index++) {
    if (firstArray[index] !== secondArray[index]) {
      return false
    }
  }
  return true
}

const doesFirstArrayContainSecondArray = (firstArray, secondArray) => {
  for (let index = 0; index < firstArray.length; index++) {
    if (areTwoArraysEqual(firstArray[index], secondArray)) {
      return true
    }
  }
  return false
}

const isPositiveInteger = (string) => {
  if (typeof string !== 'string') {
    return false
  }
  const number = Number(string)
  if (Number.isInteger(number) && number > 0) {
    return true
  }
  return false
}

const isDirection = (string) => {
  return (string === UP) || (string === DOWN)
}

const isLeftOrRight = (string) => {
  return (string === LEFT) || (string === RIGHT)
}

const isQuote = (string) => {
  return (string === SINGLE_QUOTE) || (string === DOUBLE_QUOTE)
}

const isCommentQuote = (string) => {
  return (string === DOUBLE_QUOTE)
}

const isWrappedWithQuotes = (tokenValues, itIsComment = false, canBeFollowedByComma = false) => {
  if (tokenValues.length === 0) {
    return false
  }
  if (
    (tokenValues.length === 1) &&
    (tokenValues[0].length === 1)
  ) {
    return false
  }
  const firstToken = tokenValues[0]
  const lastToken = tokenValues[tokenValues.length - 1]
  const firstCharInFirstToken = firstToken[0]
  const lastCharInLastToken = lastToken[lastToken.length - 1]
  const prevToLastCharInLastToken = lastToken[lastToken.length - 2]
  if (itIsComment) {
    return isCommentQuote(firstCharInFirstToken) &&
      isCommentQuote(lastCharInLastToken) &&
      (firstCharInFirstToken === lastCharInLastToken)
  }
  return (
    isQuote(firstCharInFirstToken) &&
    isQuote(lastCharInLastToken) &&
    (firstCharInFirstToken === lastCharInLastToken)
  ) ||
  (
    isQuote(firstCharInFirstToken) &&
    isQuote(prevToLastCharInLastToken) &&
    (lastCharInLastToken === ',') &&
    (firstCharInFirstToken === prevToLastCharInLastToken)
  )
}

const unwrapValueFromQuotes = (tokenValues) => {
  const joinedTokenValues = tokenValues.join(SPACE)
  if (joinedTokenValues[joinedTokenValues.length - 1] === ',') {
    return joinedTokenValues.slice(1, joinedTokenValues.length - 2)
  }
  return joinedTokenValues.slice(1, joinedTokenValues.length - 1)
}

const isAboveBelowOverUnder = (string) => {
  return (string === ABOVE) || (string === BELOW) || (string === OVER) || (string === UNDER)
}

const isBelowUnder = (string) => {
  return (string === BELOW) || (string === UNDER)
}

const isStave = (string) => {
  return (string === STAVE) || (string === STAFF)
}

const isUpHigherDownLower = (string) => {
  return (string === UP) ||
    (string === DOWN) ||
    (string === LOWER) ||
    (string === HIGHER)
}

export default {
  punctuation: {
    test: (tokenValues) => {
      return (tokenValues.length === 1) &&
        (
          (tokenValues[0] === COMMA) ||
          (tokenValues[0] === SEMI_COLUMN)
        )
    }
  },
  numbers: {
    test: (tokenValues) => {
      return isPositiveInteger(tokenValues[0]) && (tokenValues.length === 1)
    },
    match: (tokenValues) => {
      return [ Number(tokenValues[0]) ]
    }
  },
  stringHighlight: /(['"])(.+)\1/,
  numberHighlight: /(\d+)/,
  globalCommandDelimiter: {
    replaceAllWithEmptyString: (tokens) => {
      const result = []
      for (let index = 0; index < tokens.length; index++) {
        if (
          (tokens[index].value !== AND_WITH_SEMI_COLUMN_AT_THE_START) &&
          (tokens[index].value !== AND_WITH_COMMA_AT_THE_START) &&
          (tokens[index].value !== AND_WITH_SEMI_COLUMN_AT_THE_END) &&
          (tokens[index].value !== AND_WITH_COMMA_AT_THE_END) &&
          (tokens[index].value !== COMMA) &&
          (tokens[index].value !== SEMI_COLUMN) &&
          (tokens[index].value !== AND)
        ) {
          const value = []
          for (let textValueIndex = 0; textValueIndex < tokens[index].value.length; textValueIndex++) {
            if (
              (tokens[index].value[textValueIndex] !== SEMI_COLUMN) &&
              (tokens[index].value[textValueIndex] !== COMMA)
            ) {
              value.push(tokens[index].value[textValueIndex])
            }
          }
          if (value.length > 0) {
            result.push(value.join(''))
          }
        }
      }
      return result
    }
  },
  is: {
    test: (tokenValues) => {
      return (tokenValues[0] === IS) && (tokenValues.length === 1)
    }
  },
  verticalCorrection: {
    test: (tokenValues) => {
      if (
        (tokenValues[0] === IS && isNumeric(tokenValues[1]) && isDirection(tokenValues[2])) ||
        (isNumeric(tokenValues[0]) && isDirection(tokenValues[1]))
      ) {
        return true
      }
      return false
    },
    match: (tokenValues) => {
      if (tokenValues[0] === IS) {
        return [ tokenValues[1], tokenValues[2] ]
      }
      return [ tokenValues[0], tokenValues[1] ]
    }
  },
  verticalCorrectionHighlight: /(\d*\.?\d*)(\s+)(up|down)/,
  horizontalCorrection: {
    test: (tokenValues) => {
      if (
        ((tokenValues[0] === IS) && isLeftOrRight(tokenValues[1]) && (tokenValues[2] === BY) && isNumeric(tokenValues[3])) ||
        (isLeftOrRight(tokenValues[0]) && (tokenValues[1] === BY) && isNumeric(tokenValues[2]))
      ) {
        return true
      }
      return false
    },
    match: (tokenValues) => {
      if (tokenValues[0] === IS) {
        return [ tokenValues[3], tokenValues[1] ]
      }
      return [ tokenValues[2], tokenValues[0] ]
    }
  },
  horizontalCorrectionHighlight: /(left|right)(\s+)(by)(\s+)(\d*\.?\d*)/,
  styleName: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(configurableStyleNamesAsTokens, tokenValues)
    },
    match: (tokenValues) => {
      return [ tokenValues.join(SPACE) ]
    }
  },
  isIs: {
    test: (tokenValues) => {
      return tokenValues[0] === IS
    }
  },
  styleValue: {
    test: (tokenValues, styleKey, customFonts) => {
      if (!styleValueTests[styleKey]) {
        return false
      }
      if (['musicFont', 'chordLettersFont', 'textFont'].indexOf(styleKey) !== -1) {
        return styleValueTests[styleKey](tokenValues, customFonts) 
      }
      return styleValueTests[styleKey](tokenValues)
    },
    match: (tokenValues) => {
      return [ tokenValues.join(SPACE) ]
    }
  },
  midiSettingName: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(midiSettingNamesAsTokens, tokenValues)
    },
    match: (tokenValues) => {
      return [ tokenValues.join(SPACE) ]
    }
  },
  midiSettingValue: {
    test: (tokenValues, midiSettingKey) => {
      if (!midiSettingValueTests[midiSettingKey]) {
        return false
      }
      return midiSettingValueTests[midiSettingKey](tokenValues)
    },
    match: (tokenValues) => {
      return [ tokenValues.join(SPACE) ]
    }
  },
  pageMeta: {
    test: (tokenValues) => {
      const tokenValueWithIsIndex = tokenValues.indexOf(IS)
      if (tokenValueWithIsIndex === -1) {
        return false
      }
      if (
        doesFirstArrayContainSecondArray(pageMetaNamesAsTokens, tokenValues.slice(0, tokenValueWithIsIndex)) &&
        isWrappedWithQuotes(tokenValues.slice(tokenValueWithIsIndex + 1))
      ) {
        return true
      }
      return false
    },
    match: (tokenValues) => {
      const tokenValueWithIsIndex = tokenValues.indexOf(IS)
      const pageMetaName = tokenValues.slice(0, tokenValueWithIsIndex).join(SPACE)
      const pageMetaValue = unwrapValueFromQuotes(tokenValues.slice(tokenValueWithIsIndex + 1))
      return [ pageMetaName, pageMetaValue ]
    }
  },
  measureNumbers: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, MEASURE_NUMBERS)
    }
  },
  measureNumbersHighlight: /measure(\s+)numbers/,
  applicationOfMeasureNumbers: {
    test: (tokenValues) => {
      return (tokenValues[0] === FOR) &&
        (tokenValues[tokenValues.length - 1] === MEASURES) &&
        doesFirstArrayContainSecondArray(applicationOfMeasureNumbersNamesAsTokens, tokenValues.slice(1, tokenValues.length - 1))
    },
    match: (tokenValues) => {
      return [ tokenValues.slice(1, tokenValues.length - 1).join(SPACE) ]
    }
  },
  applicationOfMeasureNumbersHighlight: new RegExp(`(${applicationOfMeasureNumbersNames.join(VERTICAL_LINE)}) measures`.replaceAll(SPACE, SPACE_REGEXP)),
  measure: {
    test: (tokenValues) => {
      return (tokenValues[0] === MEASURE) &&
        (tokenValues.length === 1)
    }
  },
  measureHighlight: MEASURE,
  measures: {
    test: (tokenValues) => {
      return (tokenValues[0] === MEASURES) &&
        (tokenValues.length === 1)
    }
  },
  measuresHighlight: MEASURES,
  lyricsPosition: {
    test: (tokenValues) => {
      if (tokenValues[0] !== LYRICS) {
        return false
      }
      if (tokenValues.length === 3) {
        return isAboveBelowOverUnder(tokenValues[2]) && (tokenValues[1] === IS || tokenValues[1] === ARE)
      }
      if (tokenValues.length === 2) {
        return isAboveBelowOverUnder(tokenValues[1])
      }
      return false
    }
  },
  staveIndex: {
    test: (tokenValues) => {
      if (tokenValues.length === 3) {
        return (tokenValues[0] === THE) && isStave(tokenValues[1]) && isPositiveInteger(tokenValues[2])
      }
      if (tokenValues.length === 2) {
        return isStave(tokenValues[0]) && isPositiveInteger(tokenValues[1])
      }
      return false
    },
    match: (tokenValues) => {
      if (tokenValues.length === 3) {
        return [ tokenValues[2] ]
      }
      if (tokenValues.length === 2) {
        return [ tokenValues[1] ]
      }
    }
  },
  indexOfStave: {
    test: (tokenValues) => {
      if (tokenValues.length === 3) {
        return (tokenValues[0] === THE) && isPositiveInteger(tokenValues[1]) && isStave(tokenValues[2])
      }
      if (tokenValues.length === 2) {
        return isPositiveInteger(tokenValues[0]) && isStave(tokenValues[1])
      }
      return false
    },
    match: (tokenValues) => {
      if (tokenValues.length === 3) {
        return [ tokenValues[1] ]
      }
      if (tokenValues.length === 2) {
        return [ tokenValues[0] ]
      }
    }
  },
  staveIndexHighlight: /(((stave|staff)((\w|\s)+\w))|(((\w|\s)+\s)(stave|staff)))/,
  measureIndexHighlight: /(((measure)((\w|\s)+\w))|(((\w|\s)+\s)(measure)))/,
  withoutStartBarLine: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(WITHOUT_START_BARLINE, tokenValues)
    }
  },
  withoutStartBarLineHighlight: /without(\s+)(opening|start)(\s+)(bar(\s+)line|barline)/,
  noStartBarLine: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(NO_START_BARLINE, tokenValues)
    }
  },
  noStartBarLineHighlight: /no(\s+)(opening|start)(\s+)(bar(\s+)line|barline)/,
  opensWithBarLine: {
    test: (tokenValues) => {
      return (STARTS_BEGINS_OPENS.indexOf(tokenValues[0]) !== -1) &&
        (tokenValues[1] === WITH) &&
        doesFirstArrayContainSecondArray(openingBarLineNamesAsTokens, tokenValues.slice(2))
    },
    match: (tokenValues) => {
      return [ tokenValues.slice(2).join(SPACE) ]
    }
  },
  openingBarLine: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(openingBarLineNamesAsTokensAsSeparateCommand, tokenValues)
    },
    match: (tokenValues) => {
      return [ tokenValues.slice(1).join(SPACE) ]
    }
  },
  closesWithBarLine: {
    test: (tokenValues) => {
      return (CLOSES_FINISHES_ENDS.indexOf(tokenValues[0]) !== -1) &&
        (tokenValues[1] === WITH) &&
        doesFirstArrayContainSecondArray(closingBarLineNamesAsTokens, tokenValues.slice(2))
    },
    match: (tokenValues) => {
      return [ tokenValues.slice(2).join(SPACE) ]
    }
  },
  closingBarLine: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(closingBarLineNamesAsTokensAsSeparateCommand, tokenValues)
    },
    match: (tokenValues) => {
      return [ tokenValues.slice(1).join(SPACE) ]
    }
  },
  openingBarLineHighlight: new RegExp(`((${START}|${OPENING}) )?(${openingBarLineNames.join(VERTICAL_LINE)})`.replaceAll(SPACE, SPACE_REGEXP)),
  closingBarLineHighlight: new RegExp(`(${CLOSING} )?(${closingBarLineNames.join(VERTICAL_LINE)})`.replaceAll(SPACE, SPACE_REGEXP)),
  withRepeatSign: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(WITH_REPEAT_SIGN, tokenValues)
    }
  },
  repeatSign: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(REPEAT_SIGN, tokenValues)
    }
  },
  withRepeatSignHighlight: /((repeat(\s+)sign)|colon)/,
  atTheStart: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(AT_THE_START, tokenValues)
    }
  },
  atTheStartHighlight: /(at(\s+))?(the(\s+))?start/,
  atTheEnd: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(AT_THE_END, tokenValues)
    }
  },
  atTheEndHighlight: /(at(\s+))?(the(\s+))?end/,
  atTheStartOfTheMeasure: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(AT_THE_START_OF_THE_MEASURE, tokenValues)
    }
  },
  atTheStartOfTheMeasureHighlight: /(at(\s+))?(the(\s+))?start((\s+)of)?((\s+)the)?((\s+)measure)?/,
  atTheEndOfTheMeasure: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(AT_THE_END_OF_THE_MEASURE, tokenValues)
    }
  },
  atTheEndOfTheMeasureHighlight: /(at(\s+))?(the(\s+))?end((\s+)of)?((\s+)the)?((\s+)measure)?/,
  withMeasureRest: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(WITH_MEASURE_REST, tokenValues)
    }
  },
  measureRest: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(MEASURE_REST, tokenValues)
    }
  },
  measureRestHighlight: /(multi\s+)?measure(\s+)rest/,
  multiMeasureRestCount: {
    test: (tokenValues) => {
      return isPositiveInteger(tokenValues[0]) && (tokenValues[1] === TIMES)
    },
    match: (tokenValues) => {
      return [ tokenValues[0] ]
    }
  },
  ofPreviousBeat: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(OF_PREVIOUS_BEAT, tokenValues)
    }
  },
  ofPreviousBeats: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(OF_PREVIOUS_BEATS, tokenValues)
    }
  },
  measureWithSimileOfPreviousMeasure: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(MEASURE_WITH_SIMILE_OF_PREVIOUS_MEASURE, tokenValues)
    }
  },
  measureWithSimileOfTwoPreviousMeasures: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(MEASURE_WITH_SIMILE_OF_TWO_PREVIOUS_MEASURES, tokenValues)
    }
  },
  simileOfPreviousMeasure: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(SIMILE_OF_PREVIOUS_MEASURE, tokenValues)
    }
  },
  simileOfTwoPreviousMeasures: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(SIMILE_OF_TWO_PREVIOUS_MEASURES, tokenValues)
    }
  },
  simileHighlight: /(simile|repeat)/,
  previousMeasureHighlight: /prev(.|ious)?(\s+)measure/,
  twoPreviousMeasuresHighlight: /(two|2)(\s+)prev(.|ious)?(\s+)measures/,
  simileCount: {
    test: (tokenValues) => {
      return isPositiveInteger(tokenValues[0]) && (tokenValues[1] === TIMES)
    },
    match: (tokenValues) => {
      return [ tokenValues[0] ]
    }
  },
  new: {
    test: (tokenValues) => {
      return tokenValues[0] === NEW
    }
  },
  line: {
    test: (tokenValues) => {
      return tokenValues[0] === LINE
    }
  },
  newHighlight: /new(\s+)/,
  lineHighlight: LINE,
  crossStaveConnection: {
    test: (tokenValues) => {
      return CROSS_STAVE_CONNECTIONS.indexOf(tokenValues[0]) !== -1
    }
  },
  crossStaveConnectionHighlight: /(bracket|brace)/,
  to: {
    test: (tokenValues) => {
      return (tokenValues[0] === TO) &&
        (tokenValues.length === 1)
    }
  },
  from: {
    test: (tokenValues) => {
      return (tokenValues[0] === FROM) &&
        (tokenValues.length === 1)
    }
  },
  for: {
    test: (tokenValues) => {
      return (tokenValues[0] === FOR) &&
        (tokenValues.length === 1)
    }
  },
  of : {
    test: (tokenValues) => {
      return (tokenValues[0] === OF) &&
        (tokenValues.length === 1)
    }
  },
  till: {
    test: (tokenValues) => {
      return (tokenValues[0] === TILL) &&
        (tokenValues.length === 1)
    }
  },
  stave: {
    test: (tokenValues) => {
      return isStave(tokenValues[0]) &&
        (tokenValues.length === 1)
    }
  },
  staveWithAndWithoutDelimeter: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(STAVE_WITH_AND_WITHOUT_DELIMITER, tokenValues)
    }
  },
  staveHighlight: /stave|staff/,
  instrumentTitle: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === INSTRUMENT) &&
        (tokenValues[1] === TITLE) &&
        (tokenValues[2] === IS) &&
        isWrappedWithQuotes(tokenValues.slice(3))
      ) ||
      (
        (tokenValues[0] === INSTRUMENT) &&
        (tokenValues[1] === TITLE) &&
        isWrappedWithQuotes(tokenValues.slice(2))
      ) ||
      (
        (tokenValues[0] === INSTRUMENT) &&
        (tokenValues[1] === IS) &&
        isWrappedWithQuotes(tokenValues.slice(2))
      ) ||
      (
        (tokenValues[0] === INSTRUMENT) &&
        isWrappedWithQuotes(tokenValues.slice(1))
      )
    },
    match: (tokenValues) => {
      if (
        (tokenValues[0] === INSTRUMENT) &&
        (tokenValues[1] === TITLE) &&
        (tokenValues[2] === IS)
      ) {
        const titleWithQuotes = tokenValues.slice(3)
        const title = unwrapValueFromQuotes(titleWithQuotes)
        return [ title ]
      }
      if (
        (tokenValues[0] === INSTRUMENT) &&
        (tokenValues[1] === TITLE)
      ) {
        const titleWithQuotes = tokenValues.slice(2)
        const title = unwrapValueFromQuotes(titleWithQuotes)
        return [ title ]
      }
      if (
        (tokenValues[0] === INSTRUMENT) &&
        (tokenValues[1] === IS)
      ) {
        const titleWithQuotes = tokenValues.slice(2)
        const title = unwrapValueFromQuotes(titleWithQuotes)
        return [ title ]
      }
      if (
        (tokenValues[0] === INSTRUMENT)
      ) {
        const titleWithQuotes = tokenValues.slice(1)
        const title = unwrapValueFromQuotes(titleWithQuotes)
        return [ title ]
      }
    }
  },
  instrumentTitleHighlight: /instrument( title)?/,
  between: {
    test: (tokenValues) => {
      return (tokenValues[0] === BETWEEN) &&
        (tokenValues.length === 1)
    }
  },
  and: {
    test: (tokenValues) => {
      return (tokenValues[0] === AND) &&
        (tokenValues.length === 1)
    }
  },
  keySignature: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, KEY_SIGNATURE)
    }
  },
  keySignatureHighlight: /key(\s+)signature/,
  keySignatureName: {
    test: (tokenValues) => {
      if (tokenValues[0] === IS) {
        return doesFirstArrayContainSecondArray(separateKeySignatureNamesAsTokens, tokenValues.slice(1))
      }
      return doesFirstArrayContainSecondArray(separateKeySignatureNamesAsTokens, tokenValues)
    },
    match: (tokenValues) => {
      if (tokenValues[0] === IS) {
        return [ tokenValues.slice(1).join(SPACE) ]
      }
      const joinedTokenValues = tokenValues.join(SPACE)
      return [ joinedTokenValues ]
    }
  },
  keySignatureNameHighlight: new RegExp(`(${allKeySignatureNamesWithDelimeter})`.replaceAll(' ', '(\\s+)')),
  timeSignature: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, TIME_SIGNATURE)
    }
  },
  timeSignatureHighlight: /time(\s+)signature/,
  color: {
    test: (tokenValues) => {
      return tokenValues.indexOf(COLOR) !== -1 ||
        tokenValues.indexOf(COLOUR) !== -1
    }
  },
  musicFont: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, MUSIC_FONT)
    }
  },
  textFont: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, TEXT_FONT)
    }
  },
  chordLettersFont: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, CHORD_LETTERS_FONT)
    }
  },
  timeSignatureValue: {
    test: (tokenValues) => {
      if (tokenValues[0] === IS) {
        if (tokenValues[1] === C) {
          return true
        }
        if (
          (tokenValues[1] === CROSSED) &&
          (tokenValues[2] === C)
        ) {
          return true
        }
        if (tokenValues[1]) {
          const timeFraction = tokenValues[1].split(COLUMN)
          if (
            (timeFraction.length === 2) &&
            isPositiveInteger(timeFraction[0]) &&
            isPositiveInteger(timeFraction[1])
          ) {
            return true
          }
        }
      }
      if (tokenValues[0] === C) {
        return true
      }
      if (
        (tokenValues[0] === CROSSED) &&
        (tokenValues[1] === C)
      ) {
        return true
      }
      if (tokenValues[0]) {
        const timeFraction = tokenValues[0].split(COLUMN)
        if (
          (timeFraction.length === 2) &&
          isPositiveInteger(timeFraction[0]) &&
          isPositiveInteger(timeFraction[1])
        ) {
          return true
        }
      }
      return false
    },
    match: (tokenValues) => {
      if (tokenValues[0] === IS) {
        if (tokenValues[1] === C) {
          return [ 'c' ]
        }
        if (
          (tokenValues[1] === CROSSED) &&
          (tokenValues[2] === C)
        ) {
          return [ 'crossed c' ]
        }
        const timeFraction = tokenValues[1].split(COLUMN)
        if (
          (timeFraction.length === 2) &&
          isPositiveInteger(timeFraction[0]) &&
          isPositiveInteger(timeFraction[1])
        ) {
          return [ timeFraction[0], timeFraction[1] ]
        }
      }
      if (tokenValues[0] === C) {
        return [ 'c' ]
      }
      if (
        (tokenValues[0] === CROSSED) &&
        (tokenValues[1] === C)
      ) {
        return [ 'crossed c' ]
      }
      const timeFraction = tokenValues[0].split(COLUMN)
      if (
        (timeFraction.length === 2) &&
        isPositiveInteger(timeFraction[0]) &&
        isPositiveInteger(timeFraction[1])
      ) {
        return [ timeFraction[0], timeFraction[1] ]
      }
    }
  },
  timeSignatureValueHighlight: new RegExp('((\\d+:\\d+)|crossed c|c)'.replaceAll(SPACE, SPACE_REGEXP)),
  repetitionNote: {
    test: (tokenValues) => {
      if (tokenValues[2] === IS) {
        return (tokenValues[0] === REPETITION) &&
          (
            (tokenValues[1] === MARK) ||
            (tokenValues[1] === NOTE) ||
            (tokenValues[1] === INSTRUCTION)
          ) &&
          isWrappedWithQuotes(
            tokenValues.slice(3)
          )
      }
      return (tokenValues[0] === REPETITION) &&
        (
          (tokenValues[1] === MARK) ||
          (tokenValues[1] === NOTE) ||
          (tokenValues[1] === INSTRUCTION)
        ) &&
        isWrappedWithQuotes(
          tokenValues.slice(2)
        )
    },
    match: (tokenValues) => {
      if (tokenValues[2] === IS) {
        const repeatNoteValueWithQuotes = tokenValues.slice(3)
        const repeatNoteValue = unwrapValueFromQuotes(repeatNoteValueWithQuotes)
        return [ repeatNoteValue ]
      }
      const repeatNoteValueWithQuotes = tokenValues.slice(2)
      const repeatNoteValue = unwrapValueFromQuotes(repeatNoteValueWithQuotes)
      return [ repeatNoteValue ]
    }
  },
  repetitionNoteHighlight: /repetition(\s+)(mark|note|instruction)/,
  coda: {
    test: (tokenValues) => {
      return tokenValues[0] === CODA
    }
  },
  codaHighlight: CODA,
  sign: {
    test: (tokenValues) => {
      return (tokenValues[0] === SIGN) ||
        (tokenValues[0] === SEGNO)
    }
  },
  signHighlight: /sign|segno/,
  tempoOrMetronome: {
    test: (tokenValues) => {
      return (tokenValues[0] === TEMPO) ||
        (tokenValues[0] === METRONOME) ||
        (tokenValues[0] === METRO)
    }
  },
  markOrNote: {
    test: (tokenValues) => {
      return (tokenValues[0] === MARK) ||
        (tokenValues[0] === NOTE)
    }
  },
  tempoMarkOrTempoNote: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, TEMPO_MARK) ||
        areTwoArraysEqual(tokenValues, TEMPO_NOTE)
    }
  },
  tempoMarkHighlight: /(tempo(\s+)mark|tempo(\s+)note|tempo|metronome|metro)/,
  tempoMarkWithDotHighlight: {
    test: (string) => {
      const stringWithoutDoubleSpacesAndTrimmed = removeDoubleSpacesAndTrim(string)
      return stringWithoutDoubleSpacesAndTrimmed === WITH_DOT
    }
  },
  tempoMarkDottedHighlight: {
    test: (string) => {
      const stringWithoutDoubleSpacesAndTrimmed = removeDoubleSpacesAndTrim(string)
      return stringWithoutDoubleSpacesAndTrimmed === DOTTED
    }
  },
  tempoMarkText: {
    test: (tokenValues) => {
      if (tokenValues[0] === IS) {
        return isWrappedWithQuotes(tokenValues.slice(1))
      }
      return isWrappedWithQuotes(tokenValues)
    },
    match: (tokenValues) => {
      if (tokenValues[0] === IS) {
        return [ unwrapValueFromQuotes(tokenValues.slice(1)) ]
      }
      return [ unwrapValueFromQuotes(tokenValues) ]
    }
  },
  tempoDurationPart: new RegExp(`(${tempoDurationPartNames.join(VERTICAL_LINE)}|dotted|with dot)`),
  tempoDurationPartHighlight: new RegExp(`(${tempoDurationPartNames.join(VERTICAL_LINE)}|dotted|with dot)`, 'g'),
  tempoDurationPartIsDot: {
    test: (tokenValues) => {
      return (tokenValues[0] === DOTTED) ||
        areTwoArraysEqual(tokenValues, WITH_DOT)
    }
  },
  withClef: {
    test: (tokenValues) => {
      return (tokenValues[0] === WITH) &&
        (tokenValues[tokenValues.length - 1] === CLEF) &&
        doesFirstArrayContainSecondArray(clefNamesAsTokens, tokenValues.slice(1, tokenValues.length - 1))
    },
    match: (tokenValues) => {
      return [ tokenValues.slice(1, tokenValues.length - 1).join(SPACE) ]
    }
  },
  clef: {
    test: (tokenValues) => {
      return (tokenValues[tokenValues.length - 1] === CLEF) &&
        doesFirstArrayContainSecondArray(clefNamesAsTokens, tokenValues.slice(0, tokenValues.length - 1))
    },
    match: (tokenValues) => {
      return [ tokenValues.slice(0, tokenValues.length - 1).join(SPACE) ]
    }
  },
  clefHighlight: new RegExp(`(${clefNames.join(VERTICAL_LINE)}) clef`.replaceAll(SPACE, SPACE_REGEXP)),
  voice: {
    test: (tokenValues) => {
      return tokenValues[0] === VOICE
    }
  },
  voiceHighlight: VOICE,
  noteWithDurationAndOctave: {
    test: (tokenValues) => {
      if (tokenValues.length === 1) {
        return (noteNames.indexOf(tokenValues[0][0]) !== -1) &&
          (
            !tokenValues[0][1] ||
            (
              isPositiveInteger(tokenValues[0][1]) &&
              !tokenValues[0][2]
            )
          )
      }
      if (tokenValues.length === 2) {
        return (noteDurationNames.indexOf(tokenValues[0]) !== -1) &&
          (noteNames.indexOf(tokenValues[1][0]) !== -1) &&
          (
            !tokenValues[1][1] ||
            (
              isPositiveInteger(tokenValues[1][1]) &&
              !tokenValues[1][2]
            )
          )
      }
      return false
    },
    match: (tokenValues) => {
      if (tokenValues.length === 1) {
        return [ null, tokenValues[0][0], tokenValues[0][1] ]
      }
      if (tokenValues.length === 2) {
        return [ tokenValues[0], tokenValues[1][0], tokenValues[1][1] ]
      }
    }
  },
  // a note counts only between spaces, delimiters or the ends of the text, so neither the `a` nor the `d` of `and` in `c and d` is taken for a note
  noteWithDurationAndOctaveHighlight: new RegExp(`(?<![^\\s,;])(${noteDurationNames.join(VERTICAL_LINE)})?( *)(${noteNames.join(VERTICAL_LINE)})(\\d)?(?![^\\s,;])`),
  stemDirection: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === WITH) &&
        (tokenValues[1] === STEM) &&
        isDirection(tokenValues[2])
      ) ||
      (
        (tokenValues[0] === STEM) &&
        isDirection(tokenValues[1])
      )
    },
    match: (tokenValues) => {
      if (tokenValues[0] === WITH) {
        return [ tokenValues[2] ]
      }
      return [ tokenValues[1] ]
    }
  },
  directionOfStem: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === WITH) &&
        isDirection(tokenValues[1]) &&
        (tokenValues[2] === STEM)
      ) ||
      (
        isDirection(tokenValues[0]) &&
        (tokenValues[1] === STEM)
      )
    },
    match: (tokenValues) => {
      if (isDirection(tokenValues[1])) {
        return [ tokenValues[1] ]
      }
      if (isDirection(tokenValues[0])) {
        return [ tokenValues[0] ]
      }
    }
  },
  stemHighlight: STEM,
  stavePosition: {
    test: (tokenValues) => {
      return (
        tokenValues[0] === IS &&
        (
          (
            (ON_IN_AT.indexOf(tokenValues[1]) !== -1) &&
            (tokenValues[2] === THE) &&
            (stavePositionNames.indexOf(tokenValues[3]) !== -1) &&
            isStave(tokenValues[4])
          ) ||
          (
            (ON_IN_AT.indexOf(tokenValues[1]) !== -1) &&
            (stavePositionNames.indexOf(tokenValues[2]) !== -1) &&
            isStave(tokenValues[3])
          )
        )
      ) ||
      (
        (
          (ON_IN_AT.indexOf(tokenValues[0]) !== -1) &&
          (tokenValues[1] === THE) &&
          (stavePositionNames.indexOf(tokenValues[2]) !== -1) &&
          isStave(tokenValues[3])
        ) ||
        (
          (ON_IN_AT.indexOf(tokenValues[0]) !== -1) &&
          (stavePositionNames.indexOf(tokenValues[1]) !== -1) &&
          isStave(tokenValues[2])
        )
      )
    },
    match: (tokenValues) => {
      if (isStave(tokenValues[3])) {
        return [ tokenValues[2] ]
      }
      if (isStave(tokenValues[2])) {
        return [ tokenValues[1] ]
      }
    }
  },
  stavePositionHighlight: new RegExp(`(${stavePositionNames.join(VERTICAL_LINE)})(\\s+)(stave|staff)`),
  withNumberOfDots: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === WITH) &&
        tokenValues[1] &&
        (tokenValues[1].length === 1) &&
        isPositiveInteger(tokenValues[1]) &&
        (tokenValues[2] === DOTS)
      )
    },
    match: (tokenValues) => {
      return [ tokenValues[1] ]
    }
  },
  withNumberOfDotsHighlight: /(with\s+)(((\w|\s)+)(\s+)dots)/,
  dotted: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === IS) &&
        (tokenValues[1] === DOTTED)
      ) || (
        tokenValues[0] === DOTTED
      )
    }
  },
  dottedHighlight: DOTTED,
  withDot: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === WITH) &&
        (
          (tokenValues[1] === ONE) ||
          (tokenValues[1] === ONE_AS_WORD)
        ) &&
        (tokenValues[2] === DOT)
      ) ||
      (
        (tokenValues[0] === WITH) &&
        (tokenValues[1] === DOT)
      )
    }
  },
  withDotHighlight: /( (1|one))? dot/,
  beamed: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_BEAMED) ||
        tokenValues[0] === BEAMED
    }
  },
  beamedHighlight: BEAMED,
  notBeamed: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_NOT_BEAMED) ||
        areTwoArraysEqual(tokenValues, NOT_BEAMED)
    }
  },
  withNext: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_NEXT)
    }
  },
  withNextHighlight: NEXT,
  withOnlyPrimaryLine: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_ONLY_ONE_LINE) ||
        areTwoArraysEqual(tokenValues, WITH_ONLY_PRIMARY_LINE)
    }
  },
  withOnlyPrimaryLineHighlight: /only(\s+)(primary|one)?(\s+)line/,
  withNoteKey: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === WITH) &&
        doesFirstArrayContainSecondArray(noteKeyNamesAsTokens, tokenValues.slice(1, tokenValues.length - 1)) &&
        (tokenValues[tokenValues.length - 1] === KEY)
      ) ||
      (
        doesFirstArrayContainSecondArray(mainNoteKeyNamesAsTokens, tokenValues)
      )
    },
    match: (tokenValues) => {
      if (doesFirstArrayContainSecondArray(mainNoteKeyNamesAsTokens, tokenValues)) {
        return [ tokenValues.join(SPACE) ]
      }
      return [ tokenValues.slice(1, tokenValues.length - 1).join(SPACE) ]
    }
  },
  withNoteKeyHighlight: new RegExp(`((${noteKeyNames.join(VERTICAL_LINE)})(\\s+)key)|(${mainNoteKeyNames.join(VERTICAL_LINE)})`),
  withParentheses: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_BRACKETS) ||
        areTwoArraysEqual(tokenValues, WITH_PARENTHESES)
    }
  },
  withParenthesesHighlight: /(parentheses|brackets)/,
  withText: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === WITH) &&
        (tokenValues[1] === TEXT) &&
        isWrappedWithQuotes(tokenValues.slice(2))
      ) ||
      (
        (tokenValues[0] === WITH) &&
        isWrappedWithQuotes(tokenValues.slice(1))
      )
    },
    match: (tokenValues) => {
      if (isWrappedWithQuotes(tokenValues.slice(2))) {
        return [ unwrapValueFromQuotes(tokenValues.slice(2)) ]
      }
      if (isWrappedWithQuotes(tokenValues.slice(1))) {
        return [ unwrapValueFromQuotes(tokenValues.slice(1)) ]
      }
    }
  },
  withTextHighlight: TEXT,
  direction: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === IS) &&
        (isDirection(tokenValues[1]))
      ) ||
      (isDirection(tokenValues[0]) && tokenValues.length === 1)
    },
    match: (tokenValues) => {
      if (tokenValues[0] === IS) {
        return [ tokenValues[1] ]
      }
      return [ tokenValues[0] ]
    }
  },
  beside: {
    test: (tokenValues) => {
      return (tokenValues[0] === BESIDE) &&
        (tokenValues.length === 1)
    }
  },
  aboveBelowOverUnderStaveLines: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === IS) &&
        isAboveBelowOverUnder(tokenValues[1]) &&
        isStave(tokenValues[2])
      ) ||
      (
        isAboveBelowOverUnder(tokenValues[0]) &&
        isStave(tokenValues[1])
      )
    },
    match: (tokenValues) => {
      if (tokenValues[0] === IS) {
        return [ tokenValues[1] ]
      }
      return [ tokenValues[0] ]
    }
  },
  belowUnderStaveLines: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === IS) &&
        isBelowUnder(tokenValues[1]) &&
        isStave(tokenValues[2])
      ) ||
      (
        isBelowUnder(tokenValues[0]) &&
        isStave(tokenValues[1])
      )
    }
  },
  belowUnder: {
    test: (tokenValues) => {
      return ((tokenValues[0] === IS) && isBelowUnder(tokenValues[1])) || isBelowUnder(tokenValues[0])
    }
  },
  withRoundness: {
    test: (tokenValues) => {
      return (tokenValues[0] === WITH) &&
        (
          (tokenValues[1] === ROUNDNESS) || (tokenValues[1] === CONVEX)
        ) &&
        (ROUND_COEFFICIENT.indexOf(tokenValues[2]) !== -1)
    },
    match: (tokenValues) => {
      return [ tokenValues[2] ]
    }
  },
  roundnessHighlight: /(roundness|convex)(\s+)(10|[1-9])/,
  tiedWithNext: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_TIED_WITH_NEXT) ||
        areTwoArraysEqual(tokenValues, TIED_WITH_NEXT)
    }
  },
  tiedBefore: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_TIED_BEFORE) ||
        areTwoArraysEqual(tokenValues, TIED_BEFORE)
    }
  },
  tiedAfter: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_TIED_AFTER) ||
        areTwoArraysEqual(tokenValues, TIED_AFTER)
    }
  },
  tiedHighlight: TIED,
  topMidBottomRest: {
    test: (tokenValues) => {
      return (
        (noteDurationNames.indexOf(tokenValues[0]) !== -1) &&
        (REST_POSITIONS.indexOf(tokenValues[1]) !== -1) &&
        (tokenValues[2] === REST)
      ) ||
      (
        (noteDurationNames.indexOf(tokenValues[0]) !== -1) &&
        (tokenValues[1] === REST)
      ) ||
      (
        (REST_POSITIONS.indexOf(tokenValues[0]) !== -1) &&
        (tokenValues[1] === REST)
      ) ||
      (tokenValues[0] === REST)
    },
    match: (tokenValues) => {
      if (tokenValues[2] === REST) {
        return [ tokenValues[0], tokenValues[1] ]
      }
      if (tokenValues[1] === REST) {
        if (noteDurationNames.indexOf(tokenValues[0]) !== -1) {
          return [ tokenValues[0] ]
        }
        if (REST_POSITIONS.indexOf(tokenValues[0]) !== -1) {
          return [ null, tokenValues[0] ]
        }
      }
      return [ null, null ]
    }
  },
  topMidBottomRestHighlight: new RegExp(`(${noteDurationNames.join(VERTICAL_LINE)})?( *)((top|middle|mid|bottom)(\\s+))?rest`),
  isRest: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_REST)
    }
  },
  rest: {
    test: (tokenValues) => {
      return (tokenValues[0] === REST) &&
        (tokenValues.length === 1)
    }
  },
  restHighlight: REST,
  isGhost: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_GHOST) ||
        (tokenValues[0] === GHOST)
    }
  },
  ghostHighlight: GHOST,
  isNotGhost: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_NOT_GHOST) ||
        areTwoArraysEqual(tokenValues, NOT_GHOST)
    }
  },
  isGrace: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_CRUSHED_GRACE) ||
        areTwoArraysEqual(tokenValues, CRUSHED_GRACE) ||
        areTwoArraysEqual(tokenValues, IS_GRACE) ||
        (tokenValues[0] === GRACE)
    },
    match: (tokenValues) => {
      const isCrushed = (tokenValues[0] === CRUSHED) || (tokenValues[1] === CRUSHED)
      return [ isCrushed ]
    }
  },
  graceHighlight: GRACE,
  withCrushLine: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_CRUSH_LINE)
    }
  },
  crushLineHighlight: /crush\s+line/,
  measureNumber: {
    test: (tokenValues) => {
      return (tokenValues[0] === MEASURE) &&
        isPositiveInteger(tokenValues[1])
    },
    match: (tokenValues) => {
      return [ tokenValues[1] ]
    }
  },
  numberOfMeasure: {
    test: (tokenValues) => {
      return isPositiveInteger(tokenValues[0]) &&
        (tokenValues[1] === MEASURE)
    },
    match: (tokenValues) => {
      return [ tokenValues[0] ]
    }
  },
  isCentralized: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_IN_THE_CENTER) ||
        areTwoArraysEqual(tokenValues, IN_THE_CENTER) ||
        areTwoArraysEqual(tokenValues, IS_CENTRALIZED) ||
        areTwoArraysEqual(tokenValues, CENTRALIZED)
    }
  },
  isNotCentralized: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_NOT_IN_THE_CENTER) ||
        areTwoArraysEqual(tokenValues, NOT_IN_THE_CENTER) ||
        areTwoArraysEqual(tokenValues, IS_NOT_CENTRALIZED) ||
        areTwoArraysEqual(tokenValues, NOT_CENTRALIZED)
    }
  },
  withBreathMarkBefore: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === WITH) &&
        (tokenValues[1] === BREATH) &&
        (tokenValues[2] === MARK) &&
        doesFirstArrayContainSecondArray(breathMarkNamesAsTokens, tokenValues.slice(3, tokenValues.length - 1)) &&
        (tokenValues[tokenValues.length - 1] === BEFORE)
      ) ||
      (
        (tokenValues[0] === WITH) &&
        (tokenValues[1] === BREATH) &&
        doesFirstArrayContainSecondArray(breathMarkNamesAsTokens, tokenValues.slice(2, tokenValues.length - 1)) &&
        (tokenValues[tokenValues.length - 1] === BEFORE)
      ) ||
      (
        (tokenValues[0] === WITH) &&
        (tokenValues[1] === BREATH) &&
        (tokenValues[2] === MARK) &&
        (tokenValues[3] === BEFORE)
      ) ||
      (
        (tokenValues[0] === WITH) &&
        (tokenValues[1] === BREATH) &&
        (tokenValues[2] === BEFORE)
      )
    },
    match: (tokenValues) => {
      const joinedTokenValues = tokenValues.join(SPACE)
      for (let index = 0; index < breathMarkNames.length; index++) {
        if (joinedTokenValues.includes(breathMarkNames[index])) {
          return [ breathMarkNames[index] ]
        }
      }
      return [ breathMarkNames[0] ]
    }
  },
  withBreathMarkBeforeHighlight: new RegExp(`breath( mark)?( (${breathMarkNames.join(VERTICAL_LINE)}))?|(${breathMarkNames.join(VERTICAL_LINE)})`.replaceAll(' ', SPACE_REGEXP), 'g'),
  withKeySignatureBefore: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === WITH) &&
        (tokenValues[1] === KEY) &&
        (tokenValues[2] === SIGNATURE) &&
        doesFirstArrayContainSecondArray(separateKeySignatureNamesAsTokens, tokenValues.slice(3, tokenValues.length - 1)) &&
        (tokenValues[tokenValues.length - 1] === BEFORE)
      ) ||
      (
        (tokenValues[0] === WITH) &&
        doesFirstArrayContainSecondArray(separateKeySignatureNamesAsTokens, tokenValues.slice(1, tokenValues.length - 1)) &&
        (tokenValues[tokenValues.length - 1] === BEFORE)
      )
    },
    match: (tokenValues) => {
      const firstOption = tokenValues.slice(3, tokenValues.length - 1)
      if (doesFirstArrayContainSecondArray(separateKeySignatureNamesAsTokens, firstOption)) {
        return [ firstOption.join(SPACE) ]
      }
      const secondOption = tokenValues.slice(1, tokenValues.length - 1)
      if (doesFirstArrayContainSecondArray(separateKeySignatureNamesAsTokens, secondOption)) {
        return [ secondOption.join(SPACE) ]
      }
    }
  },
  withClefBefore: {
    test: (tokenValues) => {
      return (tokenValues[0] === WITH) &&
        doesFirstArrayContainSecondArray(clefNamesAsTokens, tokenValues.slice(1, tokenValues.length - 2)) &&
        (tokenValues[tokenValues.length - 2] === CLEF) &&
        (tokenValues[tokenValues.length - 1] === BEFORE)
    },
    match: (tokenValues) => {
      return [ tokenValues.slice(1, tokenValues.length - 2).join(SPACE) ]
    }
  },
  withClefAndKeySignatureBefore: {
    test: (tokenValues) => {
      const tokenValueWithClefIndex = tokenValues.indexOf(CLEF)
      if (tokenValueWithClefIndex === -1) {
        return false
      }
      return (
        (tokenValues[0] === WITH) &&
        doesFirstArrayContainSecondArray(clefNamesAsTokens, tokenValues.slice(1, tokenValueWithClefIndex)) &&
        (tokenValues[tokenValueWithClefIndex + 1] === KEY) &&
        (tokenValues[tokenValueWithClefIndex + 2] === SIGNATURE) &&
        doesFirstArrayContainSecondArray(separateKeySignatureNamesAsTokens, tokenValues.slice(tokenValueWithClefIndex + 3, tokenValues.length - 1)) &&
        (tokenValues[tokenValues.length - 1] === BEFORE)
      ) ||
      (
        (tokenValues[0] === WITH) &&
        (clefNames.indexOf(tokenValues.slice(1, tokenValueWithClefIndex).join(SPACE)) !== -1) &&
        doesFirstArrayContainSecondArray(separateKeySignatureNamesAsTokens, tokenValues.slice(tokenValueWithClefIndex + 1, tokenValues.length - 1)) &&
        (tokenValues[tokenValues.length - 1] === BEFORE)
      )
    },
    match: (tokenValues) => {
      const tokenValueWithClefIndex = tokenValues.indexOf(CLEF)
      const clefName = tokenValues.slice(1, tokenValueWithClefIndex).join(SPACE)
      const firstOption = tokenValues.slice(tokenValueWithClefIndex + 3, tokenValues.length - 1)
      if (doesFirstArrayContainSecondArray(separateKeySignatureNamesAsTokens, firstOption)) {
        return [ clefName, firstOption.join(SPACE) ]
      }
      const secondOption = tokenValues.slice(tokenValueWithClefIndex + 1, tokenValues.length - 1)
      if (doesFirstArrayContainSecondArray(separateKeySignatureNamesAsTokens, secondOption)) {
        return [ clefName, secondOption.join(SPACE) ]
      }
    }
  },
  withArticulation: {
    test: (tokenValues) => {
      return (tokenValues[0] === WITH) &&
        doesFirstArrayContainSecondArray(articulationNamesAsTokens, tokenValues.slice(1))
    },
    match: (tokenValues) => {
      return [ tokenValues.slice(1).join(SPACE) ]
    }
  },
  withArticulationHighlight: new RegExp(`(${articulationNames.join(VERTICAL_LINE)})`.replaceAll(SPACE, SPACE_REGEXP)),
  withTurn: {
    test: (tokenValues) => {
      return areTwoArraysEqual(WITH_TURN, tokenValues)
    }
  },
  withTurnHighlight: TURN,
  withMordent: {
    test: (tokenValues) => {
      return areTwoArraysEqual(WITH_MORDENT, tokenValues)
    }
  },
  withMordentHighlight: MORDENT,
  withTrill: {
    test: (tokenValues) => {
      return areTwoArraysEqual(WITH_TRILL, tokenValues)
    }
  },
  withTrillHighlight: TRILL,
  withOrnamentKeyAboveBelowOverUnder: {
    test: (tokenValues) => {
      const tokenValueWithKeyIndex = tokenValues.indexOf(KEY)
      if (tokenValueWithKeyIndex === -1) {
        return false
      }
      return (tokenValues[0] === WITH) &&
        doesFirstArrayContainSecondArray(ornamentKeyNamesAsTokens, tokenValues.slice(1, tokenValueWithKeyIndex)) &&
        isAboveBelowOverUnder(tokenValues[tokenValueWithKeyIndex + 1])
    },
    match: (tokenValues) => {
      const tokenValueWithKeyIndex = tokenValues.indexOf(KEY)
      return [ tokenValues.slice(1, tokenValueWithKeyIndex).join(SPACE), tokenValues[tokenValueWithKeyIndex + 1] ]
    }
  },
  ornamentKeyHighlight: new RegExp(`(${ornamentKeyNames.join(VERTICAL_LINE)}) key`.replaceAll(SPACE, SPACE_REGEXP)),
  isInverted: {
    test: (tokenValues) => {
      return ((tokenValues[0] === INVERTED) && (tokenValues.length === 1)) ||
        areTwoArraysEqual(tokenValues, IS_INVERTED)
    }
  },
  withWaveAfter: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_WAVE_AFTER)
    }
  },
  waveHighlight: WAVE,
  withChord: {
    test: (tokenValues) => {
      const wrappedChordValue = tokenValues.slice(2)
      if (
        (tokenValues[0] === WITH) &&
        (tokenValues[1] === CHORD) &&
        isWrappedWithQuotes(wrappedChordValue)
      ) {
        const chordValue = unwrapValueFromQuotes(wrappedChordValue)
        const devidedByBackSlash = chordValue.split(SLASH)
        if (
          (devidedByBackSlash.length === 1) ||
          (devidedByBackSlash.length === 2)
        ) {
          const devidedByUpCaretFirstPart = devidedByBackSlash[0].split(UP_CARET)
          if (
            (devidedByUpCaretFirstPart.length === 1) ||
            (devidedByUpCaretFirstPart.length === 2)
          ) {
            if (devidedByBackSlash.length === 2) {
              const devidedByUpCaretSecondPart = devidedByBackSlash[1].split(UP_CARET)
              if (
                (devidedByUpCaretSecondPart.length === 1) ||
                (devidedByUpCaretSecondPart.length === 2)
              ) {
                return true
              }
              return false
            }
            return true
          }
          return false
        }
        return false
      }
      return false
    },
    match: (tokenValues) => {
      const wrappedChordValue = tokenValues.slice(2)
      return [ unwrapValueFromQuotes(wrappedChordValue) ]
    }
  },
  withChordHighlight: CHORD,
  withChordWithDurationHighlight: new RegExp(`(${noteDurationNames.join(VERTICAL_LINE)})?( *)chord`),
  isOctaveOrTwoOctavesHigherOrLower: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === IS) &&
        (
          (tokenValues[1] === TWO) ||
          (tokenValues[1] === TWO_AS_WORD)
        ) &&
        (tokenValues[2] === OCTAVES) &&
        isUpHigherDownLower(tokenValues[3]) &&
        (tokenValues.length === 4)
      ) ||
      (
        (
          (tokenValues[0] === TWO) ||
          (tokenValues[0] === TWO_AS_WORD)
        ) &&
        (tokenValues[1] === OCTAVES) &&
        isUpHigherDownLower(tokenValues[2]) &&
        (tokenValues.length === 3)
      ) ||
      (
        (tokenValues[0] === IS) &&
        (tokenValues[1] === OCTAVE) &&
        isUpHigherDownLower(tokenValues[2]) &&
        (tokenValues.length === 3)
      ) ||
      (
        (tokenValues[0] === OCTAVE) &&
        isUpHigherDownLower(tokenValues[1]) &&
        (tokenValues.length === 2)
      )
    },
    match: (tokenValues) => {
      if (
        (tokenValues[1] === TWO) ||
        (tokenValues[1] === TWO_AS_WORD)
      ) {
        return [ tokenValues[1], tokenValues[3] ]
      }
      if (
        (tokenValues[0] === TWO) ||
        (tokenValues[0] === TWO_AS_WORD)
      ) {
        return [ tokenValues[0], tokenValues[2] ]
      }
      if (isUpHigherDownLower(tokenValues[2])) {
        return [ null, tokenValues[2] ]
      }
      if (isUpHigherDownLower(tokenValues[1])) {
        return [ null, tokenValues[1] ]
      }
    }
  },
  isOctaveOrTwoOctavesHigherOrLowerHighlight: /((2|two)(\s+))?octave(s)?/,
  octaveOrTwoOctavesHigherOrLower: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === TWO) ||
          (tokenValues[0] === TWO_AS_WORD)
        ) &&
        (tokenValues[1] === OCTAVES) &&
        isUpHigherDownLower(tokenValues[2]) &&
        (tokenValues.length === 3)
      ) ||
      (
        (tokenValues[0] === OCTAVE) &&
        isUpHigherDownLower(tokenValues[1]) &&
        (tokenValues.length === 2)
      )
    },
    match: (tokenValues) => {
      if (
        (tokenValues[0] === TWO) ||
        (tokenValues[0] === TWO_AS_WORD)
      ) {
        return [ tokenValues[0], tokenValues[2] ]
      }
      if (isUpHigherDownLower(tokenValues[1])) {
        return [ null, tokenValues[1] ]
      }
    }
  },
  withTremolo: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_TREMOLO)
    }
  },
  withTremoloHighlight: TREMOLO,
  withNumberOfStrokes: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_ONE_STROKE) ||
        areTwoArraysEqual(tokenValues, WITH_TWO_STROKES) ||
        areTwoArraysEqual(tokenValues, WITH_THREE_STROKES)
    },
    match: (tokenValues) => {
      return [ tokenValues[1] ]
    }
  },
  withNumberOfStrokesHighlight: /(\w+)(\s+)stroke(s)?/,
  numberOfTimes: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === ONE) &&
        (tokenValues[1] === TIME)
      ) ||
      (
        (tokenValues[0] !== ONE && isPositiveInteger(tokenValues[0])) &&
        (tokenValues[1] === TIMES)
      )
    },
    match: (tokenValues) => {
      return [ tokenValues[0] ]
    }
  },
  numberOfTimesHighlight: /^(\d+) time(s)?$/,
  repeat: {
    test: (tokenValues) => {
      return tokenValues[0] === REPEAT
    }
  },
  repeatHighlight: REPEAT,
  viaSimile: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, VIA_SIMILE)
    }
  },
  withDynamic: {
    test: (tokenValues) => {
      return (tokenValues[0] === WITH) &&
        (tokenValues[1] === DYNAMIC) &&
        (isWrappedWithQuotes(tokenValues.slice(2)))
    },
    match: (tokenValues) => {
      return [ unwrapValueFromQuotes(tokenValues.slice(2)) ]
    }
  },
  withDynamicHighlight: DYNAMIC,
  withLyrics: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_NEW_LYRICS) ||
        areTwoArraysEqual(tokenValues, WITH_NEW_LYRIC) ||
        areTwoArraysEqual(tokenValues, WITH_LYRICS) ||
        areTwoArraysEqual(tokenValues, WITH_LYRIC)
    }
  },
  lyricsHighlight: /lyric(s)?/,
  textValue: {
    test: (tokenValues) => {
      return isWrappedWithQuotes(tokenValues)
    },
    match: (tokenValues) => {
      return [ unwrapValueFromQuotes(tokenValues) ]
    }
  },
  followedByDash: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_FOLLOWED_BY_DASH) ||
        areTwoArraysEqual(tokenValues, IS_FOLLOWED_BY_HYPEN) ||
        areTwoArraysEqual(tokenValues, FOLLOWED_BY_DASH) ||
        areTwoArraysEqual(tokenValues, FOLLOWED_BY_HYPEN)
    }
  },
  dashHighlight: /(dash|hyphen)/,
  underscoreStarts: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WHERE_UNDERSCORE_STARTS) ||
        areTwoArraysEqual(tokenValues, WHERE_UNDERSCORE_BEGINS) ||
        areTwoArraysEqual(tokenValues, WITH_UNDERSCORE_STARTS) ||
        areTwoArraysEqual(tokenValues, WITH_UNDERSCORE_BEGINS) ||
        areTwoArraysEqual(tokenValues, UNDERSCORE_STARTS) ||
        areTwoArraysEqual(tokenValues, UNDERSCORE_BEGINS)
    }
  },
  underscoreFinishes: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WHERE_UNDERSCORE_FINISHES) ||
        areTwoArraysEqual(tokenValues, WHERE_UNDERSCORE_ENDS) ||
        areTwoArraysEqual(tokenValues, WITH_UNDERSCORE_FINISHES) ||
        areTwoArraysEqual(tokenValues, WITH_UNDERSCORE_ENDS) ||
        areTwoArraysEqual(tokenValues, UNDERSCORE_FINISHES) ||
        areTwoArraysEqual(tokenValues, UNDERSCORE_ENDS)
    }
  },
  underscoreHighlight: UNDERSCORE,
  forEachLine: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, FOR_EACH_LINE)
    }
  },
  forLinesBelow: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, FOR_LINES_BELOW)
    }
  },
  forLines: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, FOR_LINES)
    }
  },
  forEachLineHighlight: /each(\s+)line/,
  forEach: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, FOR_EACH)
    }
  },
  commentStartsAndEndsWithText: {
    test: (tokenValues) => {
      if (!tokenValues) {
        return false
      }
      if (!tokenValues[0]) {
        return false
      }
      if (!tokenValues[0].startsWith(COMMENT) && !tokenValues[0].startsWith(SIDE)) {
        return false
      }
      const joinedTokenValues = tokenValues.join(SPACE)
      const splittedCommand = joinedTokenValues.split(COLUMN)
      return ((splittedCommand[0] === COMMENT) || (splittedCommand[0] === SIDE_NOTE)) &&
        splittedCommand[1] &&
        isWrappedWithQuotes([ splittedCommand[1].slice(1) ], true)
    },
    match: (tokenValues) => {
      const joinedTokenValues = tokenValues.join(SPACE)
      const splittedCommand = joinedTokenValues.split(COLUMN)
      return [ splittedCommand[1][0], unwrapValueFromQuotes([ splittedCommand[1].slice(1) ]) ]
    }
  },
  commentStartsWithText: {
    test: (tokenValues) => {
      if (!tokenValues) {
        return false
      }
      if (!tokenValues[0]) {
        return false
      }
      if (!tokenValues[0].startsWith(COMMENT) && !tokenValues[0].startsWith(SIDE)) {
        return false
      }
      const joinedTokenValues = tokenValues.join(SPACE)
      const splittedCommand = joinedTokenValues.split(COLUMN)
      return ((splittedCommand[0] === COMMENT) || (splittedCommand[0] === SIDE_NOTE)) &&
        splittedCommand[1] && isQuote(splittedCommand[1][0])
    },
    match: (tokenValues) => {
      const joinedTokenValues = tokenValues.join(SPACE)
      const splittedCommand = joinedTokenValues.split(COLUMN)
      return [ splittedCommand[1][0], splittedCommand[1].slice(1) ]
    }
  },
  comment: {
    test: (tokenValues) => {
      if (!tokenValues) {
        return false
      }
      if (!tokenValues[0]) {
        return false
      }
      if (!tokenValues[0].startsWith(COMMENT) && !tokenValues[0].startsWith(SIDE)) {
        return false
      }
      const joinedTokenValues = tokenValues.join(SPACE)
      const splittedCommand = joinedTokenValues.split(COLUMN)
      return ((splittedCommand[0] === COMMENT) || (splittedCommand[0] === SIDE_NOTE)) &&
        ((splittedCommand[1] === undefined) || (splittedCommand[1].trimStart() === EMPTY))
    }
  },
  column: {
    test: (tokenValues) => {
      return tokenValues[0] === COLUMN
    }
  },
  commentTextStartsAndEnds: {
    test: (tokenValues) => {
      return isWrappedWithQuotes(tokenValues, true)
    },
    match: (tokenValues) => {
      const joinedTokenValues = tokenValues.join(SPACE)
      return [ joinedTokenValues[0], joinedTokenValues.slice(1, joinedTokenValues.length - 1) ]
    }
  },
  commentTextStarts: {
    test: (tokenValues) => {
      const joinedTokenValues = tokenValues.join(SPACE)
      const splittedCommand = joinedTokenValues.split(COLUMN)
      if (splittedCommand.length === 1) {
        return isCommentQuote(splittedCommand[0][0])
      }
      if (splittedCommand.length > 1) {
        return isCommentQuote(splittedCommand[1][0])
      }
      return false
    },
    match: (tokenValues) => {
      const joinedTokenValues = tokenValues.join(SPACE)
      const splittedCommand = joinedTokenValues.split(COLUMN)
      if (splittedCommand.length === 1) {
        return [ splittedCommand[0][0], splittedCommand[0].slice(1) ]
      }
      if (splittedCommand.length > 1) {
        return [ splittedCommand[1][0], splittedCommand[1].slice(1) ]
      }
    }
  },
  commentTextEnds: {
    test: (tokenValues) => {
      const joinedTokenValues = tokenValues.join(SPACE)
      return isCommentQuote(joinedTokenValues[joinedTokenValues.length - 1])
    },
    match: (tokenValues) => {
      const joinedTokenValues = tokenValues.join(SPACE)
      return [ joinedTokenValues.slice(0, joinedTokenValues.length - 1), joinedTokenValues[joinedTokenValues.length - 1] ]
    }
  },
  commentQuote: {
    test: (tokenValues) => {
      return isCommentQuote(tokenValues[0]) &&
        (tokenValues.length === 1)
    }
  },
  anything: {
    test: (tokenValues) => {
      return tokenValues.length > 0
    },
    match: (tokenValues) => {
      const joinedTokenValues = tokenValues.join(SPACE)
      return [ joinedTokenValues ]
    }
  },
  chordWithDuration: {
    test: (tokenValues) => {
      if (tokenValues[0] === CHORD && tokenValues.length === 1) {
        return true
      }
      return (noteDurationNames.indexOf(tokenValues[0]) !== -1) &&
        (tokenValues[1] === CHORD)
    },
    match: (tokenValues) => {
      if (tokenValues[0] === CHORD) {
        return [ null ]
      }
      return [ tokenValues[0] ]
    }
  },
  letters: {
    test: (tokenValues) => {
      return tokenValues[0] === LETTERS
    }
  },
  noteIndex: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === THE) &&
        (tokenValues[1] === NOTE) &&
        (isPositiveInteger(tokenValues[2]))
      ) ||
      (
        (tokenValues[0] === NOTE) &&
        (isPositiveInteger(tokenValues[1]))
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      if (isPositiveInteger(tokenValues[1])) {
        return [ tokenValues[1] ]
      }
    }
  },
  indexOfNote: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === THE) &&
        (isPositiveInteger(tokenValues[1])) &&
        (tokenValues[2] === NOTE)
      ) ||
      (
        (isPositiveInteger(tokenValues[0])) &&
        (tokenValues[1] === NOTE)
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[1])) {
        return [ tokenValues[1] ]
      }
      if (isPositiveInteger(tokenValues[0])) {
        return [ tokenValues[0] ]
      }
    }
  },
  noteIndexHighlight: /(((note)((\w|\s)+\w))|(((\w|\s)+\s)(note)))/,
  arpeggiated: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(IS_ARPEGGIATED, tokenValues)
    }
  },
  arpeggiatedHighlight: /arpeggiated|arpeggio/,
  withChordBelow: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_CHOR_BELOW)
    }
  },
  chordHighlight: CHORD,
  withArrow: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_ARROW)
    }
  },
  arrowHighlight: ARROW,
  positionPreposition: /((in|on|at|with)(\s+))?((\w|\s)+)/g,
  unitPosition: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        (
          tokenValues[2] === UNIT ||
          tokenValues[2] === CHORD ||
          tokenValues[2] === NOTE
        ) &&
        isPositiveInteger(tokenValues[3])
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        (
          tokenValues[1] === UNIT ||
          tokenValues[1] === CHORD ||
          tokenValues[1] === NOTE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === UNIT ||
          tokenValues[1] === CHORD ||
          tokenValues[1] === NOTE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          tokenValues[0] === UNIT ||
          tokenValues[0] === CHORD ||
          tokenValues[0] === NOTE
        ) &&
        isPositiveInteger(tokenValues[1])
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[3])) {
        return [ tokenValues[3] ]
      }
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      return [ tokenValues[1] ]
    }
  },
  positionOfUnit: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        isPositiveInteger(tokenValues[2]) &&
        (
          (tokenValues[3] === UNIT) ||
          (tokenValues[3] === CHORD) ||
          (tokenValues[3] === NOTE)
        )
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          (tokenValues[2] === UNIT) ||
          (tokenValues[2] === CHORD) ||
          (tokenValues[2] === NOTE)
        )
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === UNIT ||
          tokenValues[2] === CHORD ||
          tokenValues[2] === NOTE
        )
      ) ||
      (
        isPositiveInteger(tokenValues[0]) &&
        (
          (tokenValues[1] === UNIT) ||
          (tokenValues[1] === CHORD) ||
          (tokenValues[1] === NOTE)
        )
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      if (isPositiveInteger(tokenValues[1])) {
        return [ tokenValues[1] ]
      }
      return [ tokenValues[0] ]
    }
  },
  unitLinePosition: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        (
          tokenValues[2] === LINE
        ) &&
        isPositiveInteger(tokenValues[3])
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        (
          tokenValues[1] === LINE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === LINE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          tokenValues[0] === LINE
        ) &&
        isPositiveInteger(tokenValues[1])
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[3])) {
        return [ tokenValues[3] ]
      }
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      return [ tokenValues[1] ]
    }
  },
  linePositionOfUnit: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        isPositiveInteger(tokenValues[2]) &&
        (
          tokenValues[3] === LINE
        )
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === LINE
        )
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === LINE
        )
      ) ||
      (
        isPositiveInteger(tokenValues[0]) &&
        (
          tokenValues[1] === LINE
        )
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      if (isPositiveInteger(tokenValues[1])) {
        return [ tokenValues[1] ]
      }
      return [ tokenValues[0] ]
    }
  },
  unitMeasurePosition: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        (
          tokenValues[2] === MEASURE
        ) &&
        isPositiveInteger(tokenValues[3])
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        (
          tokenValues[1] === MEASURE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === MEASURE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          tokenValues[0] === MEASURE
        ) &&
        isPositiveInteger(tokenValues[1])
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[3])) {
        return [ tokenValues[3] ]
      }
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      return [ tokenValues[1] ]
    }
  },
  measurePositionOfUnit: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        isPositiveInteger(tokenValues[2]) &&
        (
          tokenValues[3] === MEASURE
        )
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === MEASURE
        )
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === MEASURE
        )
      ) ||
      (
        isPositiveInteger(tokenValues[0]) &&
        (
          tokenValues[1] === MEASURE
        )
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      if (isPositiveInteger(tokenValues[1])) {
        return [ tokenValues[1] ]
      }
      return [ tokenValues[0] ]
    }
  },
  unitStavePosition: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        (
          tokenValues[2] === STAVE ||
          tokenValues[2] === STAFF
        ) &&
        isPositiveInteger(tokenValues[3])
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        (
          tokenValues[1] === STAVE ||
          tokenValues[1] === STAFF
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === STAVE ||
          tokenValues[1] === STAFF
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          tokenValues[0] === STAVE ||
          tokenValues[0] === STAFF
        ) &&
        isPositiveInteger(tokenValues[1])
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[3])) {
        return [ tokenValues[3] ]
      }
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      return [ tokenValues[1] ]
    }
  },
  stavePositionOfUnit: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        isPositiveInteger(tokenValues[2]) &&
        (
          tokenValues[3] === STAVE ||
          tokenValues[3] === STAFF
        )
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === STAVE ||
          tokenValues[2] === STAFF
        )
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === STAVE ||
          tokenValues[2] === STAFF
        )
      ) ||
      (
        isPositiveInteger(tokenValues[0]) &&
        (
          tokenValues[1] === STAVE ||
          tokenValues[1] === STAFF
        )
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      if (isPositiveInteger(tokenValues[1])) {
        return [ tokenValues[1] ]
      }
      return [ tokenValues[0] ]
    }
  },
  unitVoicePosition: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        (
          tokenValues[2] === VOICE
        ) &&
        isPositiveInteger(tokenValues[3])
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        (
          tokenValues[1] === VOICE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === VOICE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          tokenValues[0] === VOICE
        ) &&
        isPositiveInteger(tokenValues[1])
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[3])) {
        return [ tokenValues[3] ]
      }
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      return [ tokenValues[1] ]
    }
  },
  voicePositionOfUnit: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        isPositiveInteger(tokenValues[2]) &&
        (
          tokenValues[3] === VOICE
        )
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === VOICE
        )
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === VOICE
        )
      ) ||
      (
        isPositiveInteger(tokenValues[0]) &&
        (
          tokenValues[1] === VOICE
        )
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      if (isPositiveInteger(tokenValues[1])) {
        return [ tokenValues[1] ]
      }
      return [ tokenValues[0] ]
    }
  },
  pageLinePosition: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        (
          tokenValues[2] === LINE
        ) &&
        isPositiveInteger(tokenValues[3])
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        (
          tokenValues[1] === LINE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === LINE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          tokenValues[0] === LINE
        ) &&
        isPositiveInteger(tokenValues[1])
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[3])) {
        return [ tokenValues[3] ]
      }
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      return [ tokenValues[1] ]
    }
  },
  positionOfPageLine: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        isPositiveInteger(tokenValues[2]) &&
        (
          tokenValues[3] === LINE
        )
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === LINE
        )
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === LINE
        )
      ) ||
      (
        isPositiveInteger(tokenValues[0]) &&
        (
          tokenValues[1] === LINE
        )
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      if (isPositiveInteger(tokenValues[1])) {
        return [ tokenValues[1] ]
      }
      return [ tokenValues[0] ]
    }
  },
  measurePosition: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        (
          tokenValues[2] === MEASURE
        ) &&
        isPositiveInteger(tokenValues[3])
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        (
          tokenValues[1] === MEASURE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === MEASURE
        ) &&
        isPositiveInteger(tokenValues[2])
      ) ||
      (
        (
          tokenValues[0] === MEASURE
        ) &&
        isPositiveInteger(tokenValues[1])
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[3])) {
        return [ tokenValues[3] ]
      }
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      return [ tokenValues[1] ]
    }
  },
  positionOfMeasure: {
    test: (tokenValues) => {
      return (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        (
          tokenValues[1] === THE
        ) &&
        isPositiveInteger(tokenValues[2]) &&
        (
          tokenValues[3] === MEASURE
        )
      ) ||
      (
        (
          tokenValues[0] === THE
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === MEASURE
        )
      ) ||
      (
        (
          (tokenValues[0] === IN) ||
          (tokenValues[0] === ON) ||
          (tokenValues[0] === AT) ||
          (tokenValues[0] === WITH)
        ) &&
        isPositiveInteger(tokenValues[1]) &&
        (
          tokenValues[2] === MEASURE
        )
      ) ||
      (
        isPositiveInteger(tokenValues[0]) &&
        (
          tokenValues[1] === MEASURE
        )
      )
    },
    match: (tokenValues) => {
      if (isPositiveInteger(tokenValues[2])) {
        return [ tokenValues[2] ]
      }
      if (isPositiveInteger(tokenValues[1])) {
        return [ tokenValues[1] ]
      }
      return [ tokenValues[0] ]
    }
  },
  slur: {
    test: (tokenValues) => {
      return tokenValues[0] === SLUR
    }
  },
  slurHighlight: SLUR,
  starts: {
    test: (tokenValues) => {
      return ((tokenValues[0] === STARTS) || (tokenValues[0] === BEGINS)) &&
        (tokenValues.length === 1)
    }
  },
  startsFrom: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, STARTS_FROM) ||
        areTwoArraysEqual(tokenValues, BEGINS_FROM)
    }
  },
  finishes: {
    test: (tokenValues) => {
      return ((tokenValues[0] === FINISHES) || (tokenValues[0] === ENDS)) &&
        (tokenValues.length === 1)
    }
  },
  startsBefore: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, STARTS_BEFORE) ||
        areTwoArraysEqual(tokenValues, BEGINS_BEFORE)
    }
  },
  before: {
    test: (tokenValues) => {
      return (tokenValues[0] === BEFORE) &&
        (tokenValues.length === 1)
    }
  },
  finishesAfter: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, FINISHES_AFTER) ||
        areTwoArraysEqual(tokenValues, ENDS_AFTER)
    }
  },
  after: {
    test: (tokenValues) => {
      return (tokenValues[0] === AFTER) &&
        (tokenValues.length === 1)
    }
  },
  changesStaveOrGoesThrough: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, CHANGES_STAVE) ||
        areTwoArraysEqual(tokenValues, CHANGES_STAFF) ||
        areTwoArraysEqual(tokenValues, GOES_THROUGH)
    }
  },
  withSShape: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_S_SHAPE) ||
        areTwoArraysEqual(tokenValues, WITH_S_DASH_SHAPE) ||
        areTwoArraysEqual(tokenValues, WITH_SSHAPE)
    }
  },
  aboveBelowOverUnder: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === IS) &&
        isAboveBelowOverUnder(tokenValues[1])
      ) ||
      (isAboveBelowOverUnder(tokenValues[0]) && tokenValues.length === 1)
    },
    match: (tokenValues) => {
      if (tokenValues[0] === IS) {
        return [ tokenValues[1] ]
      }
      return [ tokenValues[0] ]
    }
  },
  leftPoint: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_LEFT_POINT)
    }
  },
  rightPoint: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_RIGHT_POINT)
    }
  },
  attachedToMiddleOfStem: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, ATTACHED_TO_MIDDLE_OF_STEM) ||
        areTwoArraysEqual(tokenValues, ATTACHED_TO_THE_MIDDLE_OF_THE_STEM)
    }
  },
  attachedToNoteBody: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, ATTACHED_TO_NOTE_BODY) ||
        areTwoArraysEqual(tokenValues, ATTACHED_TO_THE_NOTE_BODY) ||
        areTwoArraysEqual(tokenValues, ATTACHED_TO_NOTE_HEAD) ||
        areTwoArraysEqual(tokenValues, ATTACHED_TO_THE_NOTE_HEAD)
    }
  },
  glissando: {
    test: (tokenValues) => {
      return (tokenValues[0] === GLISS) ||
        (tokenValues[0] === GLISS_DOT) ||
        (tokenValues[0] === GLISSANDO)
    }
  },
  withGlissando: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(WITH_GLISSANDO, tokenValues)
    }
  },
  glissandoHighlight: /(glissando|gliss\.|gliss|glis\.|glis)/,
  asWaveLine: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, AS_WAVE) ||
        areTwoArraysEqual(tokenValues, AS_WAVES) ||
        areTwoArraysEqual(tokenValues, AS_LINE) ||
        areTwoArraysEqual(tokenValues, AS_LINES)
    },
    match: (tokenValues) => {
      if (
        areTwoArraysEqual(tokenValues, AS_WAVE) ||
        areTwoArraysEqual(tokenValues, AS_WAVES)
      ) {
        return [ WAVE ]
      }
      return [ LINE ]
    }
  },
  asWaveLineHighlight: /(line|wave)(s)?/,
  tupletWithValue: {
    test: (tokenValues) => {
      if ((tokenValues[0] !== TUPLET) || !tokenValues[1]) {
        return false
      }
      const tupletValueParts = tokenValues[1].split(COLUMN)
      if (tupletValueParts.length === 1) {
        return isPositiveInteger(tupletValueParts[0])
      }
      if (tupletValueParts.length === 2) {
        return isPositiveInteger(tupletValueParts[0]) &&
          isPositiveInteger(tupletValueParts[1])
      }
      return false
    },
    match: (tokenValues) => {
      return [ tokenValues[1] ]
    }
  },
  tupletHighlight: TUPLET,
  tupletValueHighlight: /((\d+)(:(\d+)))|(\d+)/,
  withBrackets: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_BRACKETS)
    }
  },
  bracketsHighlight: BRACKETS,
  startsWithTextValue: {
    test: (tokenValues) => {
      return ((tokenValues[0] === STARTS) || (tokenValues[0] === BEGINS)) &&
        (tokenValues[1] === WITH) &&
        isWrappedWithQuotes(tokenValues.slice(2))
    },
    match: (tokenValues) => {
      return [ unwrapValueFromQuotes(tokenValues.slice(2)) ]
    }
  },
  startsWithTextValueFrom: {
    test: (tokenValues) => {
      return ((tokenValues[0] === STARTS) || (tokenValues[0] === BEGINS)) &&
        (tokenValues[1] === WITH) &&
        isWrappedWithQuotes(tokenValues.slice(2, tokenValues.length - 1)) &&
        (tokenValues[tokenValues.length - 1] === FROM)
    },
    match: (tokenValues) => {
      return [ unwrapValueFromQuotes(tokenValues.slice(2, tokenValues.length - 1)) ]
    }
  },
  finishesWithTextValue: {
    test: (tokenValues) => {
      return ((tokenValues[0] === FINISHES) || (tokenValues[0] === ENDS)) &&
        (tokenValues[1] === WITH) &&
        isWrappedWithQuotes(tokenValues.slice(2))
    },
    match: (tokenValues) => {
      return [ unwrapValueFromQuotes(tokenValues.slice(2)) ]
    }
  },
  crescendoOrDiminuendo: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === CRESCENDO) ||
        (tokenValues[0] === CRES_DOT) ||
        (tokenValues[0] === CRES) ||
        (tokenValues[0] === CRESC_DOT) ||
        (tokenValues[0] === CRESC) ||
        (tokenValues[0] === DIMINUENDO) ||
        (tokenValues[0] === DIM_DOT) ||
        (tokenValues[0] === DIM)
      ) && (tokenValues.length === 1)
    },
    match: (tokenValues) => {
      if (
        (tokenValues[0] === CRESCENDO) ||
        (tokenValues[0] === CRES_DOT) ||
        (tokenValues[0] === CRES) ||
        (tokenValues[0] === CRESC_DOT) ||
        (tokenValues[0] === CRESC)
      ) {
        return [ CRESCENDO ]
      }
      return [ DIMINUENDO ]
    }
  },
  crescendoOrDiminuendoHighlight: /(crescendo|cres.|cres|cresc.|cresc|diminuendo|dim.|dim)/,
  with: {
    test: (tokenValues) => {
      return (tokenValues[0] === WITH) &&
        (tokenValues.length === 1)
    }
  },
  repeatSimile: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === REPEAT) ||
        (tokenValues[0] === SIMILE)
      ) && (tokenValues.length === 1)
    }
  },
  repeatSimileHighlight: /(repeat|simile)/,
  volta: {
    test: (tokenValues) => {
      return (tokenValues[0] === VOLTA) &&
         (tokenValues.length === 1)
    }
  },
  voltaBrackets: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, VOLTA_BRACKET) ||
        areTwoArraysEqual(tokenValues, VOLTA_BRACKETS)
    }
  },
  voltaBracketsHighlight: /volta( bracket(s)?)?/,
  brackets: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === BRACKET) ||
        (tokenValues[0] === BRACKETS)
      ) && (tokenValues.length === 1)
    }
  },
  withPedal: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_SUSTAIN_PEDAL) ||
        areTwoArraysEqual(tokenValues, WITH_PEDAL)
    }
  },
  withSustain: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_SUSTAIN_PEDAL)
    }
  },
  withSustainHighlight: SUSTAIN,
  withPedalHighlight: PEDAL,
  under: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, IS_UNDER) ||
        ((tokenValues[0] === UNDER) && (tokenValues.length === 1))
    }
  },
  afterBefore: {
    test: (tokenValues) => {
      return (
        (tokenValues[0] === BEFORE) ||
        (tokenValues[0] === AFTER)
      ) && (tokenValues.length === 1)
    },
    match: (tokenValues) => {
      const joinedTokenValues = tokenValues.join(SPACE)
      return [ joinedTokenValues ]
    }
  },
  text: {
    test: (tokenValues) => {
      return isWrappedWithQuotes(tokenValues)
    },
    match: (tokenValues) => {
      return [ unwrapValueFromQuotes(tokenValues) ]
    }
  },
  bracket: {
    test: (tokenValues) => {
      return (tokenValues[0] === BRACKET) && (tokenValues.length === 1)
    }
  },
  opensWithBracket: {
    test: (tokenValues) => {
      return doesFirstArrayContainSecondArray(OPENS_WITH_BRACKET, tokenValues)
    }
  },
  bracketHighlight: BRACKET,
  afterMeasure: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, AFTER_MEASURE)
    }
  },
  release: {
    test: (tokenValues) => {
      return (tokenValues[0] === RELEASE) &&
        (tokenValues.length === 1)
    }
  },
  withRelease: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_PEDAL_RELEASE) ||
        areTwoArraysEqual(tokenValues, WITH_RELEASE)
    }
  },
  withReleaseHighlight: /(pedal(\s+))?release/,
  withVariablePeak: {
    test: (tokenValues) => {
      return areTwoArraysEqual(tokenValues, WITH_VARIABLE_PEAK)
    }
  },
  withVariablePeakHighlight: /variable(\s+)peak/,
  lines: {
    test: (tokenValues) => {
      return (tokenValues[0] === LINES) &&
        (tokenValues.length === 1)
    }
  },
  linesHighlight: /lines/,
  somethingIsSomethingWithDelimetersHighlight: /^(.+?)(?=(is))(.+)$/m,
  compressUnitsByNTimes: {
    test: (tokenValues) => {
      const copressionValue = tokenValues[3] * 1
      return (tokenValues[0] === COMPRESS) &&
        (tokenValues[1] === UNITS) &&
        (tokenValues[2] === BY) &&
        (copressionValue > 1 && copressionValue <= 5) &&
        (tokenValues[4] === TIMES) &&
        (tokenValues.length === 5)
    },
    match: (tokenValues) => {
      return [ tokenValues[3] * 1 ]
    }
  },
  stretchUnitsByNTimes: {
    test: (tokenValues) => {
      const stretchingValue = tokenValues[3]
      return (tokenValues[0] === STRETCH) &&
        (tokenValues[1] === UNITS) &&
        (tokenValues[2] === BY) &&
        (stretchingValue > 1 && stretchingValue <= 5) &&
        (tokenValues[4] === TIMES) &&
        (tokenValues.length === 5)
    },
    match: (tokenValues) => {
      return [ tokenValues[3] * 1 ]
    }
  },
  unitsHighlight: UNITS,
  hideLastMeasure: {
    test: (tokenValues) => {
      return areTwoArraysEqual(HIDE_LAST_MEASURE, tokenValues)
    }
  },
  lastMeasureHighlight: /the(\s+)last(\s+)measure/,
  endsWithFermata: {
    test: (tokenValues) => {
      return areTwoArraysEqual(ENDS_WITH_FERMATA, tokenValues)
    }
  },
  fermata: {
    test: (tokenValues) => {
      return areTwoArraysEqual(FERMATA, tokenValues)
    }
  },
  fermataHighlight: /fermata/,
  duration: {
    test: (tokenValues) => {
      return areTwoArraysEqual(DURATION, tokenValues)
    }
  }
}
