'use strict'

/**
 * The shape of a music-js font, as data.
 *
 * Every entry names a glyph the drawer expects, the SMuFL codepoint it is traced
 * from, and which point arrays it carries. The generator walks this and writes a
 * font file in the same shape as src/drawer/font/music-js/bravura.js.
 *
 * The adjustment values — yCorrection, yOffset, the scalar metrics — are the
 * **mean of bravura.js and leland.js**, so a newly generated font starts from
 * the midpoint of the two hand-tuned ones rather than from either.
 *
 * `unit` says how a number is written back out:
 *   interval  x * intervalBetweenStaveLines
 *   default   x * MUSCIC_FONT_SOURCE_SIZE * defaultIntervalBetweenStaveLines
 *   plain     x
 *
 * `drawn` entries have no codepoint at all — they are shapes the drawer tiles,
 * kept verbatim because no font supplies them.
 */

export default [
  { kind: 'scalar', name: "musicFontSourceSize", value: 4, unit: 'plain' },
  { kind: 'scalar', name: "staveLineHeight", value: 0.12, unit: 'interval' },
  {
    kind: 'glyph',
    name: "accent",
    smufl: '\uE4A0',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "articulationSharpKey",
    smufl: '\uE262',
    fields: [ 'points' ]
  },
  {
    kind: 'glyph',
    name: "articulationFlatKey",
    smufl: '\uE260',
    fields: [ 'points' ]
  },
  {
    kind: 'glyph',
    name: "articulationNaturalKey",
    smufl: '\uE261',
    fields: [ 'points' ]
  },
  { kind: 'scalar', name: "yDistanceBetweenArticulationKeysInVerticalLine", value: 0.25, unit: 'interval' },
  { kind: 'scalar', name: "scaleFactorForArticulationKeys", value: 0.76, unit: 'plain' },
  {
    kind: 'glyph',
    name: "trill",
    smufl: '\uE566',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.6, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "turn",
    smufl: '\uE568',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.6, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "turnInverted",
    smufl: '\uE569',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.6, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "mordent",
    smufl: '\uE56C',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.6, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "mordentInverted",
    smufl: '\uE56D',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.6, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "fermata",
    smufl: '\uE4C0\uE4C1',
    fields: [ 'upPoints', 'downPoints' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
    ]
  },
  { kind: 'scalar', name: "measureFermataOffsetY", value: 0.8, unit: 'interval' },
  {
    kind: 'glyph',
    name: "marcato",
    smufl: '\uE4AC\uE4AD',
    fields: [ 'upPoints', 'downPoints' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "downBow",
    smufl: '\uE610\uE611',
    fields: [ 'upPoints', 'downPoints' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "leftHandPizzicato",
    smufl: '\uE633',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "naturalHarmonic",
    smufl: '\uE614',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "upBow",
    smufl: '\uE612\uE613',
    fields: [ 'upPoints', 'downPoints' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "snapPizzicato",
    smufl: '\uE631\uE630',
    fields: [ 'upPoints', 'downPoints' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "spiccato",
    smufl: '\uE4A6\uE4A7',
    fields: [ 'upPoints', 'downPoints' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "staccato",
    smufl: '\uE4A2',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "tenuto",
    smufl: '\uE4A4',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 0.46, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "treble",
    smufl: '\uE050',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -4.05, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "bass",
    smufl: '\uE062',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.515, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "alto",
    smufl: '\uE05C',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1.95, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "trebleOctaveEightUp",
    smufl: '\uE053',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -4.95, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "trebleOctaveEightDown",
    smufl: '\uE052',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -4.95, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "trebleOctaveFifteenUp",
    smufl: '\uE054',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -4.95, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "trebleOctaveFifteenDown",
    smufl: '\uE051',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -4.95, unit: 'interval' }
    ]
  },
  {
    kind: 'group',
    name: "yCorrectionsForMidMeasureClefs",
    entries: [
      { kind: 'scalar', name: "treble", value: 1.5, unit: 'interval' },
      { kind: 'scalar', name: "bass", value: 0.335, unit: 'interval' },
      { kind: 'scalar', name: "alto", value: 0.665, unit: 'interval' },
      { kind: 'scalar', name: "baritone", value: -1.335, unit: 'interval' },
      { kind: 'scalar', name: "mezzoSoprano", value: 1.665, unit: 'interval' },
      { kind: 'scalar', name: "soprano", value: 2.665, unit: 'interval' },
      { kind: 'scalar', name: "tenor", value: -0.335, unit: 'interval' },
      { kind: 'scalar', name: "octaveEightUp", value: 1.7, unit: 'interval' },
      { kind: 'scalar', name: "octaveEightDown", value: 1.5, unit: 'interval' },
      { kind: 'scalar', name: "octaveFifteenUp", value: 1.7, unit: 'interval' },
      { kind: 'scalar', name: "octaveFifteenDown", value: 1.5, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "darkNoteBody",
    smufl: '\uE1B1',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1.08, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "halfNoteBody",
    smufl: '\uE1B0',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1.08, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "wholeNoteBody",
    smufl: '\uE1D2',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1.085, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "ghostWholeNoteBody",
    smufl: '\uE0A7',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "ghostHalfNoteBody",
    smufl: '\uE0DA',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "ghostDarkNoteBody",
    smufl: '\uE0A9',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1, unit: 'interval' }
    ]
  },
  { kind: 'scalar', name: "stemWidth", value: 0.14, unit: 'interval' },
  { kind: 'scalar', name: "verticalStemCorrectionForGhostNoteAtEdgeOfUnitBody", value: 0.25, unit: 'interval' },
  { kind: 'scalar', name: "verticalStemCorrectionForGhostHalfNoteAtEdgeOfUnitBody", value: 0.2, unit: 'interval' },
  {
    kind: 'glyph',
    name: "sharpKey",
    smufl: '\uE262',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.73, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "sesquisharpKey",
    smufl: '\uED37',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.82, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "demisharpKey",
    smufl: '\uED35',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.695, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "doubleSharpKey",
    smufl: '\uED38',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "naturalKey",
    smufl: '\uE261',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.64, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "flatKey",
    smufl: '\uE260',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.45, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "sesquiflatKey",
    smufl: '\uE489',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.45, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "demiflatKey",
    smufl: '\uE284',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.45, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "doubleFlatKey",
    smufl: '\uE264',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.45, unit: 'interval' }
    ]
  },
  { kind: 'scalar', name: "stavePaddingForAccidentals", value: 0.15, unit: 'interval' },
  { kind: 'scalar', name: "distanceBetweenKeysForSingleUnit", value: 0.3, unit: 'interval' },
  { kind: 'scalar', name: "distanceBetweenKeysAsNoteLettersForSingleUnit", value: 0.1, unit: 'interval' },
  { kind: 'scalar', name: "spaceAfterKeysForSingleUnits", value: 0.45, unit: 'interval' },
  { kind: 'scalar', name: "spaceAfterKeysForSingleUnitsBeforeCrossStaveUnitThatContainsNotesOnAdditionalStaveLines", value: 0.9, unit: 'interval' },
  {
    kind: 'group',
    name: "graceKeyOnStaveLineCenterYCorrections",
    entries: [
      { kind: 'scalar', name: "doubleFlatKey", value: 0.5, unit: 'interval' },
      { kind: 'scalar', name: "doubleSharpKey", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "flatKey", value: 0.5, unit: 'interval' },
      { kind: 'scalar', name: "naturalKey", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "sharpKey", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "demiflatKey", value: 0.5, unit: 'interval' },
      { kind: 'scalar', name: "sesquiflatKey", value: 0.5, unit: 'interval' },
      { kind: 'scalar', name: "demisharpKey", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "sesquisharpKey", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "noteLetter", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "default", value: 0, unit: 'interval' }
    ]
  },
  {
    kind: 'group',
    name: "graceKeyBetweenStaveLinesCenterYCorrections",
    entries: [
      { kind: 'scalar', name: "doubleFlatKey", value: 0.4, unit: 'interval' },
      { kind: 'scalar', name: "doubleSharpKey", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "flatKey", value: 0.4, unit: 'interval' },
      { kind: 'scalar', name: "naturalKey", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "sharpKey", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "demiflatKey", value: 0.4, unit: 'interval' },
      { kind: 'scalar', name: "sesquiflatKey", value: 0.4, unit: 'interval' },
      { kind: 'scalar', name: "demisharpKey", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "sesquisharpKey", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "noteLetter", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "default", value: 0, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "coda",
    smufl: '\uE048',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 1, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "sign",
    smufl: '\uE047',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yOffset", value: 1, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "measureRest",
    smufl: '\uE4EF\uE4F0\uE4F1',
    fields: [ 'leftPoints', 'centerPoints', 'rightPoints' ],
    rest: [
      { kind: 'scalar', name: "numberOfCentralSymbols", value: 7, unit: 'plain' },
      { kind: 'scalar', name: "centralSymbolXCorrection", value: -0.15, unit: 'interval' },
      { kind: 'scalar', name: "sidePadding", value: 4, unit: 'interval' },
      { kind: 'scalar', name: "leftYCorrection", value: -0.145, unit: 'interval' },
      { kind: 'scalar', name: "rightYCorrection", value: -0.145, unit: 'interval' },
      { kind: 'scalar', name: "centerYCorrection", value: 1.175, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "quadrupleWholeRest",
    smufl: '\uE4E1',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "doubleWholeRest",
    smufl: '\uE4E2',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: 0, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "wholeRest",
    smufl: '\uE4E3',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -0.525, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "halfRest",
    smufl: '\uE4E4',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -0.575, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "quarterRest",
    smufl: '\uE4E5',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -3.2, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "eighthRest",
    smufl: '\uE4E6',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "outlineRadiusX", value: 0.8, unit: 'interval' },
      { kind: 'scalar', name: "outlineRadiusY", value: 0.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset", value: -0.3, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset", value: -0.4, unit: 'interval' },
      { kind: 'scalar', name: "yCorrection", value: -1.3, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "sixteenthRest",
    smufl: '\uE4E7',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "outlineRadiusX", value: 0.8, unit: 'interval' },
      { kind: 'scalar', name: "outlineRadiusY", value: 0.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset1", value: 0, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset1", value: -1.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset2", value: -0.3, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset2", value: -0.4, unit: 'interval' },
      { kind: 'scalar', name: "yCorrection", value: -3.3, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "thirtySecondRest",
    smufl: '\uE4E8',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "outlineRadiusX", value: 0.8, unit: 'interval' },
      { kind: 'scalar', name: "outlineRadiusY", value: 0.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset1", value: 0.15, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset1", value: -1.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset2", value: -0.075, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset2", value: -0.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset3", value: -0.3, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset3", value: 0.6, unit: 'interval' },
      { kind: 'scalar', name: "yCorrection", value: -3.3, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "sixtyFourthRest",
    smufl: '\uE4E9',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "outlineRadiusX", value: 0.8, unit: 'interval' },
      { kind: 'scalar', name: "outlineRadiusY", value: 0.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset1", value: 0.3, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset1", value: -2.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset2", value: 0.1, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset2", value: -1.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset3", value: -0.1, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset3", value: -0.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset4", value: -0.3, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset4", value: 0.6, unit: 'interval' },
      { kind: 'scalar', name: "yCorrection", value: -5.3, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "hundredTwentyEighthRest",
    smufl: '\uE4EA',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "outlineRadiusX", value: 0.8, unit: 'interval' },
      { kind: 'scalar', name: "outlineRadiusY", value: 0.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset1", value: 0.6, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset1", value: -2.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset2", value: 0.375, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset2", value: -1.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset3", value: 0.15, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset3", value: -0.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset4", value: -0.075, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset4", value: 0.6, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset5", value: -0.3, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset5", value: 1.6, unit: 'interval' },
      { kind: 'scalar', name: "yCorrection", value: -5.3, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "twoHundredFiftySixthRest",
    smufl: '\uE4EB',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "outlineRadiusX", value: 0.8, unit: 'interval' },
      { kind: 'scalar', name: "outlineRadiusY", value: 0.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset1", value: 0.9, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset1", value: -3.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset2", value: 0.66, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset2", value: -2.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset3", value: 0.42, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset3", value: -1.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset4", value: 0.18, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset4", value: -0.4, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset5", value: -0.06, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset5", value: 0.6, unit: 'interval' },
      { kind: 'scalar', name: "outlineLeftOffset6", value: -0.3, unit: 'interval' },
      { kind: 'scalar', name: "outlineTopOffset6", value: 1.6, unit: 'interval' },
      { kind: 'scalar', name: "yCorrection", value: -7.3, unit: 'interval' }
    ]
  },
  { kind: 'scalar', name: "xDistanceBetweenSimileStrokes", value: -1.2, unit: 'interval' },
  { kind: 'scalar', name: "similePreviousMeasureStaveWidth", value: 5, unit: 'interval' },
  { kind: 'scalar', name: "simileTwoPreviousMeasuresStaveWidth", value: 10, unit: 'interval' },
  {
    kind: 'glyph',
    name: "singleMixedSimile",
    smufl: '\uE500',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1.05, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "mixedSimile",
    smufl: '\uE501',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1.05, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "simile",
    smufl: '\uE504',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1.05, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "oneTopFlag",
    smufl: '\uE240',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -3.45, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "twoTopFlags",
    smufl: '\uE242',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -3.45, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "threeTopFlags",
    smufl: '\uE244',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -4.1, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "fourTopFlags",
    smufl: '\uE246',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -4.9, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "fiveTopFlags",
    smufl: '\uE248',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -5.65, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "sixTopFlags",
    smufl: '\uE24A',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -6.35, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "oneBottomFlag",
    smufl: '\uE241',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.9, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "twoBottomFlags",
    smufl: '\uE243',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.9, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "threeBottomFlags",
    smufl: '\uE245',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -3.55, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "fourBottomFlags",
    smufl: '\uE247',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -4.35, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "fiveBottomFlags",
    smufl: '\uE249',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -5.2, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "sixBottomFlags",
    smufl: '\uE24B',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -5.9, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "breathMarkAsComma",
    smufl: '\uE4CE',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -1.5, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "breathMarkAsDoubleSlash",
    smufl: '\uE549\uE549',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -2.3, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "noteDot",
    smufl: '\uE920',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: -0.5, unit: 'interval' }
    ]
  },
  { kind: 'scalar', name: "distanceBetweenDots", value: 0.25, unit: 'interval' },
  { kind: 'scalar', name: "emptyPaddingAroundDotsOnNonAddtionalStaveLines", value: 0.2, unit: 'interval' },
  { kind: 'scalar', name: "leftOffsetForDotsInSingleUnitWithNotesOnStaveLinesAndStemDirectionIsUpAndUnitDurationIsEqualToEighth", value: 1.2, unit: 'interval' },
  { kind: 'scalar', name: "leftOffsetForDotsInSingleUnitWithNotesOnStaveLinesAndStemDirectionIsUpAndUnitDurationIsLessThanEighth", value: 1.4, unit: 'interval' },
  { kind: 'scalar', name: "leftOffsetForDotsInSingleUnit", value: 0.5, unit: 'interval' },
  {
    kind: 'group',
    name: "noteLetters",
    entries: [
      {
        kind: 'glyph',
        name: "0",
        smufl: '\uED10',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "1",
        smufl: '\uED11',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "2",
        smufl: '\uED12',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "3",
        smufl: '\uED13',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "4",
        smufl: '\uED14',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "5",
        smufl: '\uED15',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "6",
        smufl: '\uED24',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "7",
        smufl: '\uED25',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "8",
        smufl: '\uED26',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "9",
        smufl: '\uED27',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "T",
        smufl: '\uED16',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "t",
        smufl: '\uED18',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "p",
        smufl: '\uED17',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "i",
        smufl: '\uED19',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "m",
        smufl: '\uED1A',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "a",
        smufl: '\uED1B',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "c",
        smufl: '\uED1C',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "x",
        smufl: '\uED1D',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "e",
        smufl: '\uED1E',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "o",
        smufl: '\uED1F',
        fields: [ 'points' ]
      }
    ]
  },
  {
    kind: 'group',
    name: "dynamicLetters",
    entries: [
      {
        kind: 'glyph',
        name: "p",
        smufl: '\uE520',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "m",
        smufl: '\uE521',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "f",
        smufl: '\uE522',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "r",
        smufl: '\uE523',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "s",
        smufl: '\uE524',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "z",
        smufl: '\uE525',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "pppppp",
        smufl: '\uE527',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "ppppp",
        smufl: '\uE528',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "pppp",
        smufl: '\uE529',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "ppp",
        smufl: '\uE52A',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "pp",
        smufl: '\uE52B',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "mp",
        smufl: '\uE52C',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "mf",
        smufl: '\uE52D',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "pf",
        smufl: '\uE52E',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "ff",
        smufl: '\uE52F',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "fff",
        smufl: '\uE530',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "ffff",
        smufl: '\uE531',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "fffff",
        smufl: '\uE532',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "ffffff",
        smufl: '\uE533',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "fp",
        smufl: '\uE534',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "fz",
        smufl: '\uE535',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "sf",
        smufl: '\uE536',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "sfp",
        smufl: '\uE537',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "sfpp",
        smufl: '\uE538',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "sfz",
        smufl: '\uE539',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "sfzp",
        smufl: '\uE53A',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "sffz",
        smufl: '\uE53B',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "rf",
        smufl: '\uE53C',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "rfz",
        smufl: '\uE53D',
        fields: [ 'points' ]
      }
    ]
  },
  {
    kind: 'group',
    name: "octaveSignLetters",
    entries: [
      {
        kind: 'glyph',
        name: "8va-up",
        smufl: '\uE511',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "8va-down",
        smufl: '\uE512',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "15ma-up",
        smufl: '\uE515',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "15ma-down",
        smufl: '\uE516',
        fields: [ 'points' ]
      }
    ]
  },
  {
    kind: 'group',
    name: "pedalLetters",
    entries: [
      {
        kind: 'glyph',
        name: "Ped.",
        smufl: '\uE650',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "Ped",
        smufl: '\uF434',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "P",
        smufl: '\uE651',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "e",
        smufl: '\uE652',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "d",
        smufl: '\uE653',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "Soft.",
        smufl: '\uE659',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "Soft",
        smufl: '\uF435',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "S",
        smufl: '\uE65A',
        fields: [ 'points' ]
      }
    ]
  },
  {
    kind: 'glyph',
    name: "releasePedal",
    smufl: '\uE655',
    fields: [ 'points' ]
  },
  {
    kind: 'group',
    name: "tupletLetters",
    entries: [
      {
        kind: 'glyph',
        name: "0",
        smufl: '\uE880',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "1",
        smufl: '\uE881',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "2",
        smufl: '\uE882',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "3",
        smufl: '\uE883',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "4",
        smufl: '\uE884',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "5",
        smufl: '\uE885',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "6",
        smufl: '\uE886',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "7",
        smufl: '\uE887',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "8",
        smufl: '\uE888',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "9",
        smufl: '\uE889',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: ":",
        smufl: '\uE88A',
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: 0.7, unit: 'interval' }
        ]
      }
    ]
  },
  {
    kind: 'group',
    name: "timeSignatureLetters",
    entries: [
      {
        kind: 'glyph',
        name: "0",
        smufl: '\uE080',
        scale: 0.95,
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "1",
        smufl: '\uE081',
        scale: 0.95,
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "2",
        smufl: '\uE082',
        scale: 0.95,
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "3",
        smufl: '\uE083',
        scale: 0.95,
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "4",
        smufl: '\uE084',
        scale: 0.95,
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "5",
        smufl: '\uE085',
        scale: 0.95,
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "6",
        smufl: '\uE086',
        scale: 0.95,
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "7",
        smufl: '\uE087',
        scale: 0.95,
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "8",
        smufl: '\uE088',
        scale: 0.95,
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "9",
        smufl: '\uE089',
        scale: 0.95,
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "c",
        smufl: '\uE08A',
        fields: [ 'points' ]
      },
      {
        kind: 'glyph',
        name: "crossedC",
        smufl: '\uE08B',
        fields: [ 'points' ]
      }
    ]
  },
  { kind: 'scalar', name: "cTimeTopOffset", value: -0.02, unit: 'plain' },
  { kind: 'scalar', name: "croccedCTimeTopOffset", value: -0.965, unit: 'interval' },
  { kind: 'scalar', name: "numeratorTopOffset", value: -0.925, unit: 'interval' },
  { kind: 'scalar', name: "denominatorTopOffset", value: 1.075, unit: 'interval' },
  {
    kind: 'group',
    name: "tempoLetters",
    entries: [
      { kind: 'scalar', name: "fontSize", value: 2.5, unit: 'plain' },
      {
        kind: 'glyph',
        name: "whole",
        smufl: '\uE1D2',
        scale: 0.875,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -0.9, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "half",
        smufl: '\uE1D3',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "quarter",
        smufl: '\uE1D5',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "eighth",
        smufl: '\uE1D7',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "sixteenth",
        smufl: '\uE1D9',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "thirtySecond",
        smufl: '\uE1DB',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2.35, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "sixtyFourth",
        smufl: '\uE1DD',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2.8, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "wholeDotted",
        smufl: '\uE1D2\u0020\uE1E7',
        scale: 0.875,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -0.9, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "halfDotted",
        smufl: '\uE1D3\u0020\uE1E7',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "quarterDotted",
        smufl: '\uE1D5\u0020\uE1E7',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "eighthDotted",
        smufl: '\uE1D7\u0020\uE1E7',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "sixteenthDotted",
        smufl: '\uE1D9\u0020\uE1E7',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "thirtySecondDotted",
        smufl: '\uE1DB\u0020\uE1E7',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2.35, unit: 'interval' }
        ]
      },
      {
        kind: 'glyph',
        name: "sixtyFourthDotted",
        smufl: '\uE1DD\u0020\uE1E7',
        scale: 0.625,
        fields: [ 'points' ],
        rest: [
          { kind: 'scalar', name: "yCorrection", value: -2.8, unit: 'interval' }
        ]
      }
    ]
  },
  {
    kind: 'glyph',
    name: "curlySmallBrace",
    smufl: '\uF400',
    fields: [  ],
    rest: [
      { kind: 'scalar', name: "minHeight", value: 0, unit: 'default' },
      { kind: 'scalar', name: "maxHeight", value: 12, unit: 'default' }
    ]
  },
  {
    kind: 'glyph',
    name: "curlyLargeBrace",
    smufl: '\uF401',
    fields: [  ],
    rest: [
      { kind: 'scalar', name: "minHeight", value: 12, unit: 'default' },
      { kind: 'scalar', name: "maxHeight", value: 32, unit: 'default' }
    ]
  },
  {
    kind: 'glyph',
    name: "curlyLargerBrace",
    smufl: '\uF402',
    fields: [  ],
    rest: [
      { kind: 'scalar', name: "minHeight", value: 32, unit: 'default' },
      { kind: 'scalar', name: "maxHeight", value: 48, unit: 'default' }
    ]
  },
  {
    kind: 'glyph',
    name: "curlyFlatBrace",
    smufl: '\uF403',
    fields: [  ],
    rest: [
      { kind: 'scalar', name: "minHeight", value: 48, unit: 'default' },
      { kind: 'scalar', name: "maxHeight", value: Infinity, unit: 'interval' }
    ]
  },
  { kind: 'scalar', name: "spaceAfterBrace", value: 0.4, unit: 'interval' },
  { kind: 'scalar', name: "bracketLineWidth", value: 0.4, unit: 'interval' },
  {
    kind: 'glyph',
    name: "bracketTop",
    smufl: '\uE003',
    fields: [ 'points' ]
  },
  {
    kind: 'glyph',
    name: "bracketBottom",
    smufl: '\uE004',
    fields: [ 'points' ]
  },
  { kind: 'scalar', name: "bracketXCorrection", value: 0.8, unit: 'interval' },
  {
    kind: 'glyph',
    name: "repeatDots",
    smufl: '\uE043',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "yCorrection", value: 2.55, unit: 'interval' }
    ]
  },
  { kind: 'scalar', name: "repeatDotsPadding", value: 0.4, unit: 'interval' },
  {
    kind: 'glyph',
    name: "trillWavePeriod",
    smufl: '\uEAA4',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "intersectionLength", value: 0.25, unit: 'interval' },
      { kind: 'scalar', name: "yCorrection", value: 0, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "glissandoWavePeriod",
    smufl: '\uEAA4',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "intersectionLength", value: 0.25, unit: 'interval' },
      { kind: 'scalar', name: "yCorrection", value: 0, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "arpeggioWavePeriod",
    smufl: '\uEAA9',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "intersectionLength", value: 0.25, unit: 'interval' },
      { kind: 'scalar', name: "yCorrection", value: -0.25, unit: 'interval' }
    ]
  },
  {
    kind: 'glyph',
    name: "arpeggioWaveWithArrowPeriod",
    smufl: '\uEAAD',
    fields: [ 'points' ],
    rest: [
      { kind: 'scalar', name: "intersectionLength", value: 0.325, unit: 'interval' },
      { kind: 'scalar', name: "yCorrection", value: -0.85, unit: 'interval' }
    ]
  }
]
