'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import copyScenarioWithDifferentRequiredCommandProgression from '#msq/language/parser/scenarios/copyScenarioWithDifferentRequiredCommandProgression.js'

export default function (scenarios) {
  scenarios['note'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, tokenValues, state }) => {
      let elementHighlightRegexp
      if (regexps.noteWithDurationAndOctave.test(tokenValues)) {
        elementHighlightRegexp = regexps.noteWithDurationAndOctaveHighlight
      } else if (regexps.topMidBottomRest.test(tokenValues)) {
        elementHighlightRegexp = regexps.topMidBottomRestHighlight
      }
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        elementHighlightRegexp, (match) => {
          return `<span class="cuph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['empty line after note'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note stem direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stemHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note stave position'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stavePositionHighlight, (match) => {
          return `<span class="csph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with number of dots'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNumberOfDotsHighlight, (match, p1, p2) => {
          return `${p1}<span class="eh">${p2}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['dotted note'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, tokenValues, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = regexps.dotted.test(tokenValues)
        ? joinedTokenValuesWithRealDelimiters.replace(
          regexps.dottedHighlight, (match) => {
            return `<span class="eh">${match}</span>`
          }
        )
        : joinedTokenValuesWithRealDelimiters.replace(
          regexps.withDotHighlight, (match) => {
            return `<span class="eh">${match}</span>`
          }
        )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note beamed'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.beamedHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note not beamed'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note beamed with next'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNextHighlight, (match) => {
          return `<span class="cuph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note not beamed with next'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNextHighlight, (match) => {
          return `<span class="cuph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note beamed with only primary line'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withOnlyPrimaryLineHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with key'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNoteKeyHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with key with parentheses'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withParenthesesHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with parentheses'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withParenthesesHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with text'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement = joinedTokenValuesWithRealDelimitersWithHighlightedString.replace(
        regexps.withTextHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedStringAndElement
      )
    }
  }
  scenarios['note with text beside'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  scenarios['note with text up or down'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  scenarios['note with text above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  scenarios['note with text above or below stave'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveHighlight, (match) => {
          return `<span class="csph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with text up or down vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
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
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.tiedHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      ).replace(
        regexps.withNextHighlight, (match) => {
          return `<span class="cuph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note is tied before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.tiedHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note is tied before measure number'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureIndexHighlight, (match) => {
          return `<span class="cmph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note is tied after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.tiedHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note is tied after measure number'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureIndexHighlight, (match) => {
          return `<span class="cmph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note tied with next direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied with next above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied before direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied before above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied after direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied after above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note tied with next roundness'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.roundnessHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note tied before roundness'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.roundnessHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note tied after roundness'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.roundnessHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with glissando'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.glissandoHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with glissando direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with glissando after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with glissando before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with glissando after measure number'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureIndexHighlight, (match) => {
          return `<span class="cmph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with glissando before measure number'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureIndexHighlight, (match) => {
          return `<span class="cmph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note is rest'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.restHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note is ghost'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note is not ghost'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note is grace'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with crushed grace'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.crushLineHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note is centralized'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with breath mark before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withBreathMarkBeforeHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with breath mark before vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedNumber
      )
    }
  }
  scenarios['note with key signature before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.keySignatureHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString = joinedTokenValuesWithRealDelimitersWithHighlightedElement.replace(
        regexps.keySignatureNameHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString
      )
    }
  }
  scenarios['note with clef before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.clefHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with clef and key signature before'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.keySignatureHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      ).replace(
        regexps.clefHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString = joinedTokenValuesWithRealDelimitersWithHighlightedElement.replace(
        regexps.keySignatureNameHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString
      )
    }
  }
  scenarios['note with articulation'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withArticulationHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with turn'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withTurnHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with mordent'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withMordentHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with trill'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withTrillHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with articulation direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
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
      // no highlights needed
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
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveHighlight, (match) => {
          return `<span class="csph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
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
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.ornamentKeyHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
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
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with turn inverted'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with mordent inverted'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn inverted'], 'note with mordent'
  )
  scenarios['note with trill with wave after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.waveHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with articulation vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
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
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithSplittedParts = joinedTokenValuesWithRealDelimiters.split(regexps.withChordHighlight)
      const joinedTokenValuesWithRealDelimitersFirstPart = joinedTokenValuesWithRealDelimitersWithSplittedParts[0]
      const joinedTokenValuesWithRealDelimitersSecondPart = joinedTokenValuesWithRealDelimitersWithSplittedParts[1]
      const joinedTokenValuesWithRealDelimitersFirstPartWithHighlightedElement = `${joinedTokenValuesWithRealDelimitersFirstPart}<span class="eh">chord</span>`
      const joinedTokenValuesWithRealDelimitersSecondPartWithHighlightedElement = joinedTokenValuesWithRealDelimitersSecondPart.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = `${joinedTokenValuesWithRealDelimitersFirstPartWithHighlightedElement}${joinedTokenValuesWithRealDelimitersSecondPartWithHighlightedElement}`
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with chord letter direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with chord letter above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with chord letter above or below measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureHighlight, (match) => {
          return `<span class="cmph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with chord letter vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with octave sign'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.isOctaveOrTwoOctavesHigherOrLowerHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with octave sign vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with tremolo'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withTremoloHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with tremolo with next'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNextHighlight, (match) => {
          return `<span class="cuph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with tremolo number of strokes'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withNumberOfStrokesHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['repeat note'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.repeatHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['repeat note via simile'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['repeat note number of times'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.simileCountHighlight, (match) => {
          return `<span class="cnh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedNumber
      )
    }
  }
  scenarios['repeat note vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.simileCountHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedNumber
      )
    }
  }
  scenarios['note with dynamic'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithSplittedParts = joinedTokenValuesWithRealDelimiters.split(regexps.withDynamicHighlight)
      const joinedTokenValuesWithRealDelimitersFirstPart = joinedTokenValuesWithRealDelimitersWithSplittedParts[0]
      const joinedTokenValuesWithRealDelimitersSecondPart = joinedTokenValuesWithRealDelimitersWithSplittedParts[1]
      const joinedTokenValuesWithRealDelimitersFirstPartWithHighlightedElement = `${joinedTokenValuesWithRealDelimitersFirstPart}<span class="eh">dynamic</span>`
      const joinedTokenValuesWithRealDelimitersSecondPartWithHighlightedElement = joinedTokenValuesWithRealDelimitersSecondPart.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = `${joinedTokenValuesWithRealDelimitersFirstPartWithHighlightedElement}${joinedTokenValuesWithRealDelimitersSecondPartWithHighlightedElement}`
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with dynamic above or below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with dynamic above or below stave'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveHighlight, (match) => {
          return `<span class="csph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with dynamic direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note dynamic vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with lyrics'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.lyricsHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with lyrics text value'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    }
  }
  scenarios['note with lyrics followed by dash'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.dashHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with lyrics where underscore starts'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.underscoreHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with lyrics where underscore finishes'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.underscoreHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with lyrics with vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedNumber
      )
    }
  }
  scenarios['note with pedal'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withPedalHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      ).replace(
        regexps.withSustainHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
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
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.staveIndexHighlight, (match) => {
          return `<span class="csph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with pedal vertical correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with pedal text'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    }
  }
  scenarios['note with pedal opens with bracket'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.bracketHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    }
  }
  scenarios['note with pedal before|after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with variable peak'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withVariablePeakHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['note with variable peak before|after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with variable peak text'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (match) => {
          return `<span class="sth">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    }
  }
  scenarios['note with release'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withReleaseHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    }
  }
  scenarios['note with release before|after'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['note with release bracket'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.bracketHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    }
  }
  scenarios['note with release at the end of measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureHighlight, (match) => {
          return `<span class="cmph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    }
  }
  scenarios['note with release after measure'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.measureHighlight, (match) => {
          return `<span class="cmph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedString
      )
    }
  },
  scenarios['note with horizontal correction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.horizontalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
}
