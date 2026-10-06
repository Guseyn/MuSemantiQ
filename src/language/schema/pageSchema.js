'use strict'

const keySignatureNames = [
  'c major|a minor',
  'g major|e minor',
  'd major|b minor',
  'a major|f sharp minor',
  'e major|c sharp minor',
  'b major|g sharp minor',
  'f sharp major|d sharp minor',
  'c sharp major|a sharp minor',
  'f major|d minor',
  'b flat major|g minor',
  'e flat major|c minor',
  'a flat major|f minor',
  'd flat major|b flat minor',
  'g flat major|e flat minor',
  'c flat major|a flat minor',
  'g major to c major|g major to a minor|e minor to c major|e minor to a minor',
  'd major to c major|d major to a minor|b minor to c major|b minor to a minor',
  'a major to c major|a major to a minor|f sharp minor to c major|f sharp minor to a minor',
  'e major to c major|e major to a minor|c sharp minor to c major|c sharp minor to a minor',
  'b major to c major|b major to a minor|g sharp minor to c major|g sharp minor to a minor',
  'f sharp major to c major|f sharp major to a minor|d sharp minor to c major|d sharp minor to a minor',
  'c sharp major to c major|c sharp major to a minor|a sharp minor to c major|a sharp minor to a minor',
  'f major to c major|f major to a minor|d minor to c major|d minor to a minor',
  'b flat major to c major|b flat major to a minor|g minor to c major|g minor to a minor',
  'e flat major to c major|e flat major to a minor|c minor to c major|c minor to a minor',
  'a flat major to c major|a flat major to a minor|f minor to c major|f minor to a minor',
  'd flat major to c major|d flat major to a minor|b flat minor to c major|b flat minor to a minor',
  'g flat major to c major|g flat major to a minor|e flat minor to c major|e flat minor to a minor',
  'c flat major to c major|c flat major to a minor|a flat minor to c major|a flat minor to a minor'
]

const clefNames = [
  'treble',
  'bass',
  'alto',
  'baritone',
  'mezzoSoprano',
  'octaveEightUp',
  'octaveEightDown',
  'octaveFifteenUp',
  'octaveFifteenDown',
  'soprano',
  'tenor'
]
const noteNames = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g'
]
const keyTypeNames = [
  'doubleFlatKey',
  'doubleSharpKey',
  'flatKey',
  'naturalKey',
  'sharpKey',
  'demiflatKey',
  'sesquiflatKey',
  'demisharpKey',
  'sesquisharpKey',
  'noteLetter'
]
const simpleKeyNames = [
  'flat',
  'natural',
  'sharp'
]
const measurePositions = [ 'start', 'end' ]
const stavePositions = [ 'prev', 'current', 'next' ]
const unitDurations = [ 4, 2, 1, 1 / 2, 1 / 4, 1 / 8, 1 / 16, 1 / 32, 1 / 64, 1 / 128, 1 / 256 ]
const directions = [ 'up', 'down' ]
const closingBarLineNames = [
  'barLine',
  'boldDoubleBarLine',
  'dottedBarLine',
  'doubleBarLine'
]
const openingBarLineNames = [
  'startBarLine',
  'startBoldDoubleBarLine'
]
const articulations = [
  'staccato',
  'spiccato',
  'accent',
  'tenuto',
  'marcato',
  'fermata',
  'leftHandPizzicato',
  'snapPizzicato',
  'naturalHarmonic',
  'upBow',
  'downBow',
  'turn',
  'trill',
  'mordent',
  'noteLetter',
  'dynamicMark',
  'octaveSign'
]

const glissandoForms = [
  'wave',
  'line'
]

const pageSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', isNotEmpty: true },
    subtitle: { type: 'string', isNotEmpty: true },
    leftSubtitle: { type: 'string', isNotEmpty: true },
    rightSubtitle: { type: 'string', isNotEmpty: true },
    pageNumber: { type: 'string', isNotEmpty: true },
    showMeasureNumbers: { type: 'string', possibleValues: [ 'all', 'first', 'last', 'first&last' ] },
    directionOfMeasureNumbers: { type: 'string', possibleValues: directions },
    lyricsUnderStaveIndex: { type: 'number', isPositiveInteger: true },
    compressUnitsByNTimes: { type: 'number', greaterThanOrEqualTo: 1, lessThanOrEqualTo: 5 },
    stretchUnitsByNTimes: { type: 'number', greaterThanOrEqualTo: 1, lessThanOrEqualTo: 5 },
    compressUnitsByNTimesInLines: {
      type: 'array',
      items: {
        greaterThanOrEqualTo: 1,
        lessThanOrEqualTo: 5
      },
      isNullableNumber: true
    },
    stretchUnitsByNTimesInLines: {
      type: 'array',
      items: {
        greaterThanOrEqualTo: 1,
        lessThanOrEqualTo: 5
      },
      isNullableNumber: true
    },
    hideLastMeasure: { type: 'boolean' },
    measuresParams: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pageLineNumber: { type: 'number' },
          isMeasureRest: { type: 'boolean' },
          multiMeasureRestCount: { type: 'string', isNotEmpty: true, isPositiveInteger: true },
          similePreviousMeasureCount: { type: 'string', isNotEmpty: true, isPositiveInteger: true },
          simileTwoPreviousMeasuresCount: { type: 'string', isNotEmpty: true, isPositiveInteger: true },
          simileYCorrection: { type: 'number' },
          numberOfStaveLines: { type: 'number', isPositiveInteger: true, greaterThan: 0 },
          connectionsParams: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', possibleValues: [ 'brace', 'bracket' ] },
                staveStartNumber: { type: 'number', isPositiveInteger: true },
                staveEndNumber: { type: 'number', isPositiveInteger: true },
                forEachLineId: { type: 'number', isPositiveInteger: true }
              },
              firstNumberIsGreaterThanOrEqualToSecondOne: [ 'staveEndNumber', 'staveStartNumber' ],
              required: ['name', 'staveStartNumber', 'staveEndNumber']
            }
          },
          instrumentTitlesParams: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                value: { type: 'string', isNotEmpty: true },
                staveNumber: { type: 'number', isPositiveInteger: true },
                staveStartNumber: { type: 'number', isPositiveInteger: true },
                staveEndNumber: { type: 'number', isPositiveInteger: true },
                forEachLineId: { type: 'number', isPositiveInteger: true }
              },
              firstNumberIsGreaterThanOrEqualToSecondOne: [ 'staveEndNumber', 'staveStartNumber' ],
              required: ['value']
            }
          },
          keySignatureName: { type: 'string', possibleValues: keySignatureNames },
          keySignatureNameForEachLineId: { type: 'number', isPositiveInteger: true },
          timeSignatureParams: {
            type: 'object',
            properties: {
              numerator: { type: 'string', isNotEmpty: true, isPositiveInteger: true },
              denominator: { type: 'string', isNotEmpty: true, isPositiveInteger: true },
              cMode: { type: 'boolean' }
            }
          },
          withoutStartBarLine: { type: 'boolean' },
          endsWithFermata: { type: 'boolean' },
          closingBarLineName: { type: 'string', possibleValues: closingBarLineNames },
          openingBarLineName: { type: 'string', possibleValues: openingBarLineNames },
          repeatDotsMarkAtTheStart: { type: 'boolean' },
          repeatDotsMarkAtTheEnd: { type: 'boolean' },
          voltaMark: {
            type: 'object',
            properties: {
              key: { type: 'string', isNotEmpty: true },
              value: { type: 'string', isNotEmpty: true },
              startsBefore: { type: 'boolean' },
              finishesAfter: { type: 'boolean' },
              startsHere: { type: 'boolean' },
              finishesHere: { type: 'boolean' },
              yCorrection: { type: 'number' }
            },
            required: [ 'key' ]
          },
          repetitionNote: {
            type: 'object',
            properties: {
              value: { type: 'string', isNotEmpty: true },
              measurePosition: { type: 'string', possibleValues: measurePositions },
              yCorrection: { type: 'number' }
            },
            required: [ 'value' ]
          },
          coda: {
            type: 'object',
            properties: {
              measurePosition: { type: 'string', possibleValues: measurePositions },
              yCorrection: { type: 'number' }
            }
          },
          sign: {
            type: 'object',
            properties: {
              measurePosition: { type: 'string', possibleValues: measurePositions },
              yCorrection: { type: 'number' }
            }
          },
          tempoMark: {
            type: 'object',
            properties: {
              textValueParts: {
                type: 'array',
                items: {
                  type: 'string',
                  isNotEmpty: true
                }
              },
              yCorrection: { type: 'number' }
            }
          },
          isLastMeasureOnPageLine: { type: 'boolean' },
          stavesParams: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                clef: { type: 'string', possibleValues: clefNames },
                voicesParams: {
                  type: 'array',
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        notes: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'number' },
                              noteName: { type: 'string', possibleValues: noteNames },
                              octaveNumber: { type: 'string', greaterThanOrEqualTo: 1, lessThanOrEqualTo: 9 },
                              positionNumber: { type: 'number', isNotePositionNumber: true },
                              stave: { type: 'string', possibleValues: stavePositions },
                              isGhost: { type: 'boolean' }
                            }
                          }
                        },
                        keysParams: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'number' },
                              noteName: { type: 'string', possibleValues: noteNames },
                              octaveNumber: { type: 'string', greaterThanOrEqualTo: 1, lessThanOrEqualTo: 9 },
                              positionNumber: { type: 'number', isNotePositionNumber: true },
                              keyType: { type: 'string', possibleValues: keyTypeNames },
                              stave: { type: 'string', possibleValues: stavePositions },
                              withParentheses: { type: 'boolean' },
                              textValue: { type: 'string', isNotEmpty: true }
                            }
                          }
                        },
                        relatedLyrics: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              textValue: { type: 'string', isNotEmpty: true },
                              dashAfter: { type: 'boolean' },
                              underscoreStarts: { type: 'boolean' },
                              underscoreFinishes: { type: 'boolean' },
                              yCorrection: { type: 'number' }
                            }
                          }
                        },
                        parentheses: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'number' },
                              fromNoteIndex: { type: 'number', isPositiveInteger: true },
                              toNoteIndex: { type: 'number', isPositiveInteger: true },
                              appliedToWholeUnit: { type: 'boolean' }
                            }
                          }
                        },
                        arpeggiated: {
                          type: ['object', 'boolean'],
                          properties: {
                            isConnectedWithNextChord: { type: 'boolean' },
                            arrow: { type: 'string', possibleValues: directions }
                          }
                        },
                        unitDuration: { type: 'number', possibleValues: unitDurations },
                        stemDirection: { type: 'string', possibleValues: directions },
                        numberOfDots: { type: 'number', isPositiveInteger: true, greaterThan: 0 },
                        beamedWithNext: { type: 'boolean' },
                        beamedWithNextWithJustOneBeam: { type: 'boolean' },
                        tiedWithNext: {
                          type: 'object',
                          properties: {
                            direction: { type: 'string', possibleValues: directions },
                            roundCoefficientFactor: { type: 'number', greaterThanOrEqualTo: 1, lessThanOrEqualTo: 10 }
                          }
                        },
                        tiedAfter: {
                          type: 'object',
                          properties: {
                            direction: { type: 'string', possibleValues: directions },
                            roundCoefficientFactor: { type: 'number', greaterThanOrEqualTo: 1, lessThanOrEqualTo: 10 }
                          }
                        },
                        tiedBefore: {
                          type: 'object',
                          properties: {
                            direction: { type: 'string', possibleValues: directions },
                            roundCoefficientFactor: { type: 'number', greaterThanOrEqualTo: 1, lessThanOrEqualTo: 10 }
                          }
                        },
                        tiedAfterMeasure: {
                          type: 'object',
                          properties: {
                            index: { type: 'number', isPositiveInteger: true },
                            direction: { type: 'string', possibleValues: directions },
                            roundCoefficientFactor: { type: 'number', greaterThanOrEqualTo: 1, lessThanOrEqualTo: 10 }
                          }
                        },
                        tiedBeforeMeasure: {
                          type: 'object',
                          properties: {
                            index: { type: 'number', isPositiveInteger: true },
                            direction: { type: 'string', possibleValues: directions },
                            roundCoefficientFactor: { type: 'number', greaterThanOrEqualTo: 1, lessThanOrEqualTo: 10 }
                          }
                        },
                        slurMarks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              key: { type: 'string', isNotEmpty: true },
                              after: { type: 'boolean' },
                              before: { type: 'boolean' },
                              direction: { type: 'string', possibleValues: directions },
                              finish: { type: 'boolean' },
                              sShape: { type: 'boolean' },
                              roundCoefficientFactor: { type: 'number', greaterThanOrEqualTo: 1, lessThanOrEqualTo: 10 },
                              leftYCorrection: { type: 'number' },
                              rightYCorrection: { type: 'number' },
                              rightPlacement: { type: 'string', possibleValues: [ 'middleStem', 'noteBody' ] }
                            },
                            required: [ 'key' ]
                          }
                        },
                        glissandoMarks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              key: { type: 'string', isNotEmpty: true },
                              after: { type: 'boolean' },
                              before: { type: 'boolean' },
                              afterMeasure: { type: 'number', isPositiveInteger: true },
                              beforeMeasure: { type: 'number', isPositiveInteger: true },
                              direction: { type: 'string', possibleValues: directions },
                              form: { type: 'string', possibleValues: glissandoForms }
                            },
                            required: [ 'key' ]
                          }
                        },
                        articulationParams: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string', possibleValues: articulations },
                              direction: { type: 'string', possibleValues: directions },
                              aboveBelowOverUnderStaveLines: { type: 'boolean' },
                              keyAbove: { type: 'string', possibleValues: simpleKeyNames },
                              keyBelow: { type: 'string', possibleValues: simpleKeyNames },
                              followedAfter: { type: 'boolean' },
                              inverted: { type: 'boolean' },
                              withWave: { type: 'boolean' },
                              textValue: { type: 'string', isNotEmpty: true },
                              subTextValue: { type: 'string', isNotEmpty: true },
                              yCorrection: { type: 'number' }
                            },
                            required: [ 'name' ]
                          }
                        },
                        tupletMarks: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              key: { type: 'string', isNotEmpty: true },
                              value: { type: 'string', matches: /^(\d+)(:(\d+))?$/ },
                              finish: { type: 'boolean' },
                              after: { type: 'boolean' },
                              before: { type: 'boolean' },
                              direction: { type: 'string', possibleValues: directions },
                              aboveBelowOverUnderStaveLines: { type: 'boolean' },
                              withBrackets: { type: 'boolean' },
                              yCorrection: { type: 'number' }
                            },
                            required: [ 'key' ]
                          }
                        },
                        octaveSignMark: {
                          type: 'object',
                          properties: {
                            key: { type: 'string', isNotEmpty: true },
                            octaveNumber: { type: 'string', isNotEmpty: true },
                            octavePostfix: { type: 'string', isNotEmpty: true },
                            yCorrection: { type: 'number' },
                            direction: { type: 'string', possibleValues: directions },
                            finish: { type: 'boolean' }
                          },
                          required: [ 'key' ]
                        },
                        pedalMark: {
                          type: 'object',
                          properties: {
                            start: { type: 'boolean' },
                            key: { type: 'string', isNotEmpty: true },
                            textValue: { type: 'string', isNotEmpty: true },
                            release: { type: 'boolean' },
                            finish: { type: 'boolean' },
                            afterChord: { type: 'boolean' },
                            beforeChord: { type: 'boolean' },
                            tillEndOfMeasure: { type: 'boolean' },
                            atEndOfMeasure: { type: 'boolean' },
                            withBrackets: { type: 'boolean' },
                            variablePeak: { type: 'boolean' },
                            underStaveIndex: { type: 'number', isPositiveInteger: true },
                            yCorrection: { type: 'number' },
                            withBracketClosure: { type: 'boolean' }
                          },
                          required: [ 'key' ]
                        },
                        isRest: { type: 'boolean' },
                        isFullMeasure: { type: 'boolean' },
                        clefBefore: { type: 'string', possibleValues: clefNames },
                        keySignatureBefore: { type: 'string', possibleValues: keySignatureNames },
                        breathMarkBefore: {
                          type: 'object',
                          properties: {
                            type: { type: 'string', possibleValues: [ 'double slash', 'comma' ] },
                            yCorrection: { type: 'number' }
                          }
                        },
                        tremoloParams: {
                          type: 'object',
                          properties: {
                            type: { type: 'string', possibleValues: [ 'single', 'withNext' ] },
                            customNumberOfTremoloStrokes: { type: 'number', greaterThanOrEqualTo: 1, lessThanOrEqualTo: 3, isPositiveInteger: true }
                          }
                        },
                        // A simile mark is named by its refId, which the parser always writes, not by a key
                        simileMark: {
                          type: 'object',
                          properties: {
                            key: { type: 'string', isNotEmpty: true },
                            refId: { type: 'string', isNotEmpty: true },
                            count: { type: 'number', isPositiveInteger: true, greaterThan: 0 },
                            numberOfBeats: { type: 'number', isPositiveInteger: true, greaterThan: 0 },
                            yCorrection: { type: 'number' },
                            finish: { type: 'boolean' }
                          },
                          required: [ 'refId' ]
                        },
                        dynamicChangeMark: {
                          type: 'object',
                          properties: {
                            key: { type: 'string', isNotEmpty: true },
                            type: { type: 'string', possibleValues: [ 'crescendo', 'diminuendo' ] },
                            direction: { type: 'string', possibleValues: directions },
                            valueBefore: { type: 'string', isNotEmpty: true },
                            valueAfter: { type: 'string', isNotEmpty: true },
                            yCorrection: { type: 'number' },
                            finish: true
                          },
                          // The unit that finishes a crescendo or diminuendo carries only its key; the type is on the one that starts it
                          required: [ 'key' ]
                        },
                        relatedChordLetter: {
                          type: 'object',
                          properties: {
                            textValue: { type: 'string', isNotEmpty: true },
                            direction: { type: 'string', possibleValues: directions },
                            yCorrection: { type: 'number' }
                          }
                        },
                        isGrace: { type: 'boolean' },
                        hasGraceCrushLine: { type: 'boolean' },
                        isSimile: { type: 'boolean' },
                        relatedXCorrection: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

export default pageSchema
