'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import copyScenarioWithDifferentRequiredCommandProgression from '#msq/language/parser/scenarios/copyScenarioWithDifferentRequiredCommandProgression.js'

export default function (scenarios) {
  scenarios['note'] = {
    action: ({ tokenValues, joinedTokenValuesWithRealDelimiters, state }) => {
      let elementHighlightRegexp
      if (regexps.noteWithDurationAndOctave.test(tokenValues)) {
        elementHighlightRegexp = regexps.noteWithDurationAndOctaveHighlight
      } else if (regexps.topMidBottomRest.test(tokenValues)) {
        elementHighlightRegexp = regexps.topMidBottomRestHighlight
      }
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        elementHighlightRegexp, (match) => {
          return `<span class="cuph" ref-id="">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
      state.indexesInHighlightsHtmlBufferWithNotesDeclarationsOfLastChord.push(state.highlightsHtmlBuffer.length - 1)
    },
    // the note (or rest) is known now: its spans get their ref-id, and its span closes
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { isRest, currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfNotes } }) => {
      const indexInHighlightsHtmlBufferWithLastNoteDecalration = state.indexesInHighlightsHtmlBufferWithNotesDeclarationsOfLastChord[state.indexesInHighlightsHtmlBufferWithNotesDeclarationsOfLastChord.length - 1]
      if (isRest) {
        state.highlightsHtmlBuffer[indexInHighlightsHtmlBufferWithLastNoteDecalration] = state.highlightsHtmlBuffer[indexInHighlightsHtmlBufferWithLastNoteDecalration].replaceAll(
          'ref-id=""', `ref-id="rest-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}"`
        )
      } else {
        state.highlightsHtmlBuffer[indexInHighlightsHtmlBufferWithLastNoteDecalration] = state.highlightsHtmlBuffer[indexInHighlightsHtmlBufferWithLastNoteDecalration].replaceAll(
          'ref-id=""', `ref-id="note-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfNotes}"`
        )
      }
      state.indexesInHighlightsHtmlBufferWithNotesDeclarationsOfLastChord.length = 0
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['empty line after note'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note stem direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stemHighlight, (match) => {
          return `<span class="eh" ref-id="stem-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="stem-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note stave position'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { stavePositionName, stavePositionInRefId, currentNumberOfStaves, currentNumberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stavePositionHighlight, (match) => {
          if (stavePositionName === 'next') {
            stavePositionInRefId = currentNumberOfStaves + 1
          } else if (stavePositionName === 'prev') {
            stavePositionInRefId = currentNumberOfStaves - 1
          }
          return `<span class="csph" ref-id="stave-${currentNumberOfMeasures}-${stavePositionInRefId}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="stave-${currentNumberOfMeasures}-${stavePositionInRefId}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with number of dots'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNumberOfDotsHighlight, (match, p1, p2) => {
          return `${p1}<span class="eh" ref-id="dots-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${p2}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="dots-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['dotted note'] = {
    action: ({ tokenValues, joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.dotted.test(tokenValues)
        ? joinedTokenValuesWithRealDelimiters.replace(
          regexps.dottedHighlight, (match) => {
            return `<span class="eh" ref-id="dots-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
          }
        )
        : joinedTokenValuesWithRealDelimiters.replace(
          regexps.withDotHighlight, (match) => {
            return `<span class="eh" ref-id="dots-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
          }
        )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="dots-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note beamed'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.beamedHighlight, (match) => {
          return `<span class="eh" ref-id="beam-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="beam-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note not beamed'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note beamed with next'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNextHighlight, (match) => {
          return `<span class="cuph" ref-id="next-to-unit-connected-with-beam-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="next-to-unit-connected-with-beam-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note not beamed with next'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNextHighlight, (match) => {
          return `<span class="cuph" ref-id="next-to-unit-not-connected-with-beam-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="next-to-unit-not-connected-with-beam-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note beamed with only primary line'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withOnlyPrimaryLineHighlight, (match) => {
          return `<span class="eh" ref-id="beam-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="beam-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with key'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfNoteKeys } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNoteKeyHighlight, (match) => {
          return `<span class="eh" ref-id="note-key-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfNoteKeys}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="note-key-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfNoteKeys}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with key with parentheses'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfNoteKeys } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withParenthesesHighlight, (match) => {
          return `<span class="eh" ref-id="note-key-parentheses-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfNoteKeys}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="note-key-parentheses-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfNoteKeys}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with parentheses'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfNotes } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withParenthesesHighlight, (match) => {
          return `<span class="eh" ref-id="note-parentheses-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfNotes}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="note-parentheses-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfNotes}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with text'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth" ref-id="">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement = joinedTokenValuesWithRealDelimitersWithHighlightedString.replace(
        regexps.withTextHighlight, (match) => {
          return `<span class="eh" ref-id="">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="">${joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement}`
      )
    },
    // the text is placed on the note now: its span gets the note-key ref-id, and closes
    actionWhenProgressionOfCommandsChanges: ({ state, fromMain: { noteKeyRefId } }) => {
      if (noteKeyRefId) {
        state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replaceAll(
          'ref-id=""', `ref-id="${noteKeyRefId}"`
        )
      }
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with text beside'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, newKeyParams } }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replaceAll(
        'ref-id=""', `ref-id="note-key-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${newKeyParams.id + 1}"`
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="note-key-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${newKeyParams.id + 1}">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['note with text up or down'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replaceAll(
        'ref-id=""', `ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}"`
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['note with text above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replaceAll(
        'ref-id=""', `ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}"`
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimiters}</span>`
      )
    }
  }
  scenarios['note with text above or below stave'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1] = state.highlightsHtmlBuffer[state.highlightsHtmlBuffer.length - 1].replaceAll(
        'ref-id=""', `ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}"`
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveHighlight, (match) => {
          return `<span class="csph" ref-id="all-staves-in-measure-${currentNumberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="all-staves-in-measure-${currentNumberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with text up or down vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with text above or below vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with text up or down vertical correction'],
    'note with text above or below'
  )
  scenarios['note with text above or below stave vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with text up or down vertical correction'],
    'note with text above or below stave'
  )
  scenarios['note is tied with next'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.tiedHighlight, (match) => {
          return `<span class="eh" ref-id="tie-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      ).replace(
        regexps.withNextHighlight, (match) => {
          return `<span class="cuph" ref-id="next-to-unit-under-tie-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tie-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note is tied before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.tiedHighlight, (match) => {
          return `<span class="eh" ref-id="tie-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tie-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note is tied before measure number'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state, fromMain: { measureNumberValue } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureIndexHighlight, (match) => {
          return `<span class="cmph" ref-id="measure-${parserState.numberOfPageLines}-${measureNumberValue}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="measure-${parserState.numberOfPageLines}-${measureNumberValue}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note is tied after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.tiedHighlight, (match) => {
          return `<span class="eh" ref-id="tie-after-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tie-after-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note is tied after measure number'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state, fromMain: { measureNumberValue } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureIndexHighlight, (match) => {
          return `<span class="cmph" ref-id="measure-${parserState.numberOfPageLines}-${measureNumberValue}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="measure-${parserState.numberOfPageLines}-${measureNumberValue}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note tied with next direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied with next above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied before direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied before above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied after direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied after above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied with next roundness'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.roundnessHighlight, (match) => {
          return `<span class="th" ref-id="tie-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tie-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note tied before roundness'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.roundnessHighlight, (match) => {
          return `<span class="th" ref-id="tie-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tie-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note tied after roundness'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.roundnessHighlight, (match) => {
          return `<span class="th" ref-id="tie-after-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tie-after-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with glissando'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.glissandoHighlight, (match) => {
          return `<span class="eh" ref-id="glissando-${parserState.numberOfGlissandos}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="glissando-${parserState.numberOfGlissandos}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with glissando direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with glissando after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with glissando before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with glissando after measure number'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state, fromMain: { measureNumberValue } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureIndexHighlight, (match) => {
          return `<span class="cmph" ref-id="measure-${parserState.numberOfPageLines}-${measureNumberValue}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="glissando-${parserState.numberOfGlissandos}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with glissando before measure number'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state, fromMain: { measureNumberValue } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureIndexHighlight, (match) => {
          return `<span class="cmph" ref-id="measure-${parserState.numberOfPageLines}-${measureNumberValue}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="glissando-${parserState.numberOfGlissandos}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note is rest'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.restHighlight, (match) => {
          return `<span class="eh" ref-id="rest-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="rest-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note is ghost'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note is not ghost'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note is grace'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with crushed grace'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.crushLineHighlight, (match) => {
          return `<span class="eh" ref-id="grace-crush-line-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="grace-crush-line-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note is centralized'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with breath mark before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withBreathMarkBeforeHighlight, (match) => {
          return `<span class="eh" ref-id="breath-mark-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="breath-mark-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with breath mark before vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="breath-mark-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="breath-mark-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedNumber}</span>`
      )
    }
  }
  scenarios['note with key signature before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.keySignatureHighlight, (match) => {
          return `<span class="eh" ref-id="key-signature-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString = joinedTokenValuesWithRealDelimitersWithHighlightedElement.replace(
        regexps.keySignatureNameHighlight, (match) => {
          return `<span class="sth" ref-id="key-signature-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="key-signature-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString}</span>`
      )
    }
  }
  scenarios['note with clef before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.clefHighlight, (match) => {
          return `<span class="eh" ref-id="clef-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="clef-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with clef and key signature before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.keySignatureHighlight, (match) => {
          return `<span class="eh" ref-id="key-signature-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      ).replace(
        regexps.clefHighlight, (match) => {
          return `<span class="eh" ref-id="clef-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString = joinedTokenValuesWithRealDelimitersWithHighlightedElement.replace(
        regexps.keySignatureNameHighlight, (match) => {
          return `<span class="sth" ref-id="key-signature-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="key-signature-before-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString}</span>`
      )
    }
  }
  scenarios['note with articulation'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withArticulationHighlight, (match) => {
          return `<span class="eh" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with turn'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withTurnHighlight, (match) => {
          return `<span class="eh" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with mordent'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withMordentHighlight, (match) => {
          return `<span class="eh" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with trill'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withTrillHighlight, (match) => {
          return `<span class="eh" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with articulation direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with turn direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation direction'], 'note with turn'
  )
  scenarios['note with mordent direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation direction'], 'note with mordent'
  )
  scenarios['note with trill direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation direction'], 'note with trill'
  )
  scenarios['note with articulation above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with turn above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below'], 'note with turn'
  )
  scenarios['note with mordent above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below'], 'note with mordent'
  )
  scenarios['note with trill above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below'], 'note with trill'
  )
  scenarios['note with articulation above or below stave'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveHighlight, (match) => {
          return `<span class="csph" ref-id="all-staves-in-measure-${currentNumberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="all-staves-in-measure-${currentNumberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with turn above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below stave'], 'note with turn'
  )
  scenarios['note with mordent above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below stave'], 'note with mordent'
  )
  scenarios['note with trill above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below stave'], 'note with trill'
  )
  scenarios['note with turn key above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { ornamentKeyPositionValue, currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.ornamentKeyHighlight, (match) => {
          return `<span class="eh" ref-id="articulation-key-${ornamentKeyPositionValue}-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-key-${ornamentKeyPositionValue}-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with mordent key above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn key above or below'], 'note with mordent'
  )
  scenarios['note with trill key above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn key above or below'], 'note with trill'
  )
  scenarios['note with turn after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with turn inverted'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with mordent inverted'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn inverted'], 'note with mordent'
  )
  scenarios['note with trill with wave after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.waveHighlight, (match) => {
          return `<span class="eh" ref-id="articulation-wave-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-wave-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with articulation vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with turn vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation vertical correction'], 'note with turn'
  )
  scenarios['note with mordent vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation vertical correction'], 'note with mordent'
  )
  scenarios['note with trill vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation vertical correction'], 'note with trill'
  )
  scenarios['note with chord letter'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithSplittedParts = joinedTokenValuesWithRealDelimiters.split(regexps.withChordHighlight)
      const joinedTokenValuesWithRealDelimitersFirstPart = joinedTokenValuesWithRealDelimitersWithSplittedParts[0]
      const joinedTokenValuesWithRealDelimitersSecondPart = joinedTokenValuesWithRealDelimitersWithSplittedParts[1]
      const joinedTokenValuesWithRealDelimitersFirstPartWithHighlightedElement = `${joinedTokenValuesWithRealDelimitersFirstPart}<span class="eh" ref-id="chord-letter-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">chord</span>`
      const joinedTokenValuesWithRealDelimitersSecondPartWithHighlightedElement = joinedTokenValuesWithRealDelimitersSecondPart.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth" ref-id="chord-letter-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = `${joinedTokenValuesWithRealDelimitersFirstPartWithHighlightedElement}${joinedTokenValuesWithRealDelimitersSecondPartWithHighlightedElement}`
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="chord-letter-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with chord letter direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with chord letter above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="chord-letter-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimiters}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with chord letter above or below measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureHighlight, (match) => {
          return `<span class="cmph" ref-id="measure-${currentNumberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="measure-${currentNumberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with chord letter vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="chord-letter-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="chord-letter-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with octave sign'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.isOctaveOrTwoOctavesHigherOrLowerHighlight, (match) => {
          return `<span class="eh" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with octave sign vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with tremolo'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withTremoloHighlight, (match) => {
          return `<span class="eh" ref-id="tremolo-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tremolo-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with tremolo with next'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNextHighlight, (match) => {
          return `<span class="cuph" ref-id="unit-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits + 1}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="unit-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits + 1}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with tremolo number of strokes'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNumberOfStrokesHighlight, (match) => {
          return `<span class="eh" ref-id="tremolo-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="tremolo-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['repeat note'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.repeatHighlight, (match) => {
          return `<span class="eh" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['repeat note via simile'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['repeat note number of times'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.simileCountHighlight, (match) => {
          return `<span class="cnh" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedNumber}</span>`
      )
    }
  }
  scenarios['repeat note vertical correction'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="simile-mark-${parserState.numberOfSimileMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with dynamic'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithSplittedParts = joinedTokenValuesWithRealDelimiters.split(regexps.withDynamicHighlight)
      const joinedTokenValuesWithRealDelimitersFirstPart = joinedTokenValuesWithRealDelimitersWithSplittedParts[0]
      const joinedTokenValuesWithRealDelimitersSecondPart = joinedTokenValuesWithRealDelimitersWithSplittedParts[1]
      const joinedTokenValuesWithRealDelimitersFirstPartWithHighlightedElement = `${joinedTokenValuesWithRealDelimitersFirstPart}<span class="eh" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">dynamic</span>`
      const joinedTokenValuesWithRealDelimitersSecondPartWithHighlightedElement = joinedTokenValuesWithRealDelimitersSecondPart.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = `${joinedTokenValuesWithRealDelimitersFirstPartWithHighlightedElement}${joinedTokenValuesWithRealDelimitersSecondPartWithHighlightedElement}`
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with dynamic above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with dynamic above or below stave'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveHighlight, (match) => {
          return `<span class="csph" ref-id="all-staves-in-measure-${currentNumberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="all-staves-in-measure-${currentNumberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with dynamic direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note dynamic vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfArticulations } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfArticulations}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    }
  }
  scenarios['note with lyrics'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.lyricsHighlight, (match) => {
          return `<span class="eh" ref-id="lyrics-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="lyrics-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with lyrics text value'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth" ref-id="lyrics-text-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="lyrics-text-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}</span>`
      )
    }
  }
  scenarios['note with lyrics followed by dash'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.dashHighlight, (match) => {
          return `<span class="eh" ref-id="lyrics-dash-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="lyrics-dash-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with lyrics where underscore starts'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.underscoreHighlight, (match) => {
          return `<span class="eh" ref-id="lyrics-underscore-starts-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="lyrics-underscore-starts-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with lyrics where underscore finishes'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.underscoreHighlight, (match) => {
          return `<span class="eh" ref-id="lyrics-underscore-finishes-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="lyrics-underscore-finishes-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with lyrics with vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits, currentNumberOfLyrics } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="lyrics-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="lyrics-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}-${currentNumberOfLyrics}">${joinedTokenValuesWithRealDelimitersWithHighlightedNumber}</span>`
      )
    }
  }
  scenarios['note with pedal'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withPedalHighlight, (match) => {
          return `<span class="eh" ref-id="pedal-${parserState.numberOfPedalMarks}">${match}</span>`
        }
      ).replace(
        regexps.withSustainHighlight, (match) => {
          return `<span class="eh" ref-id="pedal-line-${parserState.numberOfPedalMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="pedal-${parserState.numberOfPedalMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with pedal under'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  scenarios['note with pedal under stave index'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { numberOfMeasures, staveIndex } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveIndexHighlight, (match) => {
          return `<span class="csph" ref-id="stave-${numberOfMeasures}-${staveIndex + 1}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="stave-${numberOfMeasures}-${staveIndex + 1}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with pedal vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="pedal-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="pedal-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
  scenarios['note with pedal text'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth" ref-id="pedal-text-${parserState.numberOfPedalMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="pedal-text-${parserState.numberOfPedalMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}</span>`
      )
    }
  }
  scenarios['note with pedal opens with bracket'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.bracketHighlight, (match) => {
          return `<span class="eh" ref-id="pedal-line-${parserState.numberOfPedalMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="pedal-line-${parserState.numberOfPedalMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}</span>`
      )
    }
  }
  scenarios['note with pedal before|after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with variable peak'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withVariablePeakHighlight, (match) => {
          return `<span class="eh" ref-id="variable-peak-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="variable-peak-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with variable peak before|after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with variable peak text'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth" ref-id="variable-peak-text-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="variable-peak-text-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}</span>`
      )
    }
  }
  scenarios['note with release'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withReleaseHighlight, (match) => {
          return `<span class="eh" ref-id="release-${parserState.numberOfPedalMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="release-${parserState.numberOfPedalMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}`
      )
    },
    actionWhenProgressionOfCommandsChanges: ({ state }) => {
      state.highlightsHtmlBuffer.push(
        '</span>'
      )
    }
  }
  scenarios['note with release before|after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with release bracket'] = {
    action: ({ parserState, joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.bracketHighlight, (match) => {
          return `<span class="eh" ref-id="pedal-line-${parserState.numberOfPedalMarks}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="pedal-line-${parserState.numberOfPedalMarks}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}</span>`
      )
    }
  }
  scenarios['note with release at the end of measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureHighlight, (match) => {
          return `<span class="cmph" ref-id="measure-${currentNumberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="measure-${currentNumberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}</span>`
      )
    }
  }
  scenarios['note with release after measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureHighlight, (match) => {
          return `<span class="cmph" ref-id="measure-${currentNumberOfMeasures}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="measure-${currentNumberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedString}</span>`
      )
    }
  },
  scenarios['note with horizontal correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state, fromMain: { currentNumberOfMeasures, currentNumberOfStaves, currentNumberOfVoices, currentNumberOfUnits } }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.horizontalCorrectionHighlight, (match) => {
          return `<span class="th" ref-id="unit-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        `<span class="th" ref-id="articulation-${currentNumberOfMeasures}-${currentNumberOfStaves}-${currentNumberOfVoices}-${currentNumberOfUnits}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}</span>`
      )
    }
  }
}
