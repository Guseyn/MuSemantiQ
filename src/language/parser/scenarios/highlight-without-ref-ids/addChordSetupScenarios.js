'use strict'

import copyScenarioWithDifferentRequiredCommandProgression from '#msq/language/parser/scenarios/copyScenarioWithDifferentRequiredCommandProgression.js'
import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'

export default function (scenarios) {
  scenarios['chord'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.withChordWithDurationHighlight, (match) => {
          return `<span class="cuph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['chord stave position'] = {
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
  scenarios['chord with parentheses'] = {
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
  scenarios['chord with parentheses from'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  scenarios['chord with parentheses from note index'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.noteIndexHighlight, (match) => {
          return `<span class="cuph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['chord with parentheses to'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimiters
      )
    }
  }
  scenarios['chord with parentheses to note index'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.noteIndexHighlight, (match) => {
          return `<span class="cuph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['chord is ghost'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['chord is not ghost'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['chord is arpeggiated'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.arpeggiatedHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['chord is arpeggiated with chord below'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.chordHighlight, (match) => {
          return `<span class="cuph">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['chord is arpeggiated with arrow'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.arrowHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      state.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    }
  }
  scenarios['chord is arpeggiated with arrow direction'] = {
    action: ({ joinedTokenValuesWithRealDelimiters, state }) => {
      // no highlights needed
      state.highlightsHtmlBuffer.push(joinedTokenValuesWithRealDelimiters)
    }
  }
  scenarios['chord with text'] = {
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
  scenarios['chord with text up or down'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with text up or down'], 'chord with text'
  )
  scenarios['chord with text above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with text above or below'], 'chord with text'
  )
  scenarios['chord with text above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with text above or below stave'], 'chord with text'
  )
  scenarios['chord with text up or down vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with text up or down vertical correction'], 'chord with text up or down'
  )
  scenarios['chord with text above or below vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with text above or below vertical correction'], 'chord with text above or below'
  )
  scenarios['chord with text above or below stave vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with text above or below stave vertical correction'], 'chord with text above or below stave'
  )
  scenarios['chord with number of dots'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with number of dots'], 'chord'
  )
  scenarios['dotted chord'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['dotted note'], 'chord'
  )
  scenarios['chord stem direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note stem direction'], 'chord'
  )
  scenarios['chord beamed'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note beamed'], 'chord'
  )
  scenarios['chord not beamed'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note not beamed'], 'chord'
  )
  scenarios['chord beamed with next'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note beamed with next'], 'chord beamed'
  )
  scenarios['chord not beamed with next'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note not beamed with next'], 'chord not beamed'
  )
  scenarios['chord beamed with only primary line'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note beamed with only primary line'], 'chord beamed'
  )
  scenarios['chord is tied with next'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note is tied with next'], 'chord'
  )
  scenarios['chord is tied before'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note is tied before'], 'chord'
  )
  scenarios['chord is tied before measure number'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note is tied before measure number'], 'chord is tied before'
  )
  scenarios['chord is tied after'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note is tied after'], 'chord'
  )
  scenarios['chord is tied after measure number'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note is tied after measure number'], 'chord is tied after'
  )
  scenarios['chord tied with next direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note tied with next direction'], 'chord is tied with next'
  )
  scenarios['chord tied with next above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note tied with next above or below'], 'chord is tied with next'
  )
  scenarios['chord tied before direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note tied before direction'], 'chord is tied before'
  )
  scenarios['chord tied before above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note tied before above or below'], 'chord is tied before'
  )
  scenarios['chord tied after direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note tied after direction'], 'chord is tied after'
  )
  scenarios['chord tied after above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note tied after above or below'], 'chord is tied after'
  )
  scenarios['chord tied with next roundness'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note tied with next roundness'], 'chord is tied with next'
  )
  scenarios['chord tied before roundness'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note tied before roundness'], 'chord is tied before'
  )
  scenarios['chord tied after roundness'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note tied after roundness'], 'chord is tied after'
  )
  scenarios['chord with glissando'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with glissando'], 'chord'
  )
  scenarios['chord with glissando direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with glissando direction'], 'chord with glissando'
  )
  scenarios['chord with glissando after'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with glissando after'], 'chord with glissando'
  )
  scenarios['chord with glissando before'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with glissando before'], 'chord with glissando'
  )
  scenarios['chord with glissando after measure number'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with glissando after measure number'], 'chord with glissando after'
  )
  scenarios['chord with glissando before measure number'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with glissando after measure number'], 'chord with glissando before'
  )
  scenarios['chord is grace'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note is grace'], 'chord'
  )
  scenarios['chord with crushed grace'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with crushed grace'], 'chord is grace'
  )
  scenarios['chord is rest'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note is rest'], 'chord'
  )
  scenarios['chord is centralized'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note is centralized'], 'chord'
  )
  scenarios['chord with breath mark before'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with breath mark before'], 'chord'
  )
  scenarios['chord with breath mark before vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with breath mark before vertical correction'], 'chord with breath mark before'
  )
  scenarios['chord with key signature before'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with key signature before'], 'chord'
  )
  scenarios['chord with clef before'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with clef before'], 'chord'
  )
  scenarios['chord with clef and key signature before'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with clef before'], 'chord'
  )
  scenarios['chord with articulation'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation'], 'chord'
  )
  scenarios['chord with turn'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn'], 'chord'
  )
  scenarios['chord with mordent'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with mordent'], 'chord'
  )
  scenarios['chord with trill'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with trill'], 'chord'
  )
  scenarios['chord with articulation direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation direction'], 'chord with articulation'
  )
  scenarios['chord with turn direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn direction'], 'chord with turn'
  )
  scenarios['chord with mordent direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with mordent direction'], 'chord with mordent'
  )
  scenarios['chord with trill direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with trill direction'], 'chord with trill'
  )
  scenarios['chord with articulation above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below'], 'chord with articulation'
  )
  scenarios['chord with turn above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn above or below'], 'chord with turn'
  )
  scenarios['chord with mordent above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with mordent above or below'], 'chord with mordent'
  )
  scenarios['chord with trill above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with trill above or below'], 'chord with trill'
  )
  scenarios['chord with articulation above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation above or below stave'], 'chord with articulation'
  )
  scenarios['chord with turn above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn above or below stave'], 'chord with turn'
  )
  scenarios['chord with mordent above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with mordent above or below stave'], 'chord with mordent'
  )
  scenarios['chord with trill above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with trill above or below stave'], 'chord with trill'
  )
  scenarios['chord with turn key above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn key above or below'], 'chord with turn'
  )
  scenarios['chord with mordent key above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with mordent key above or below'], 'chord with mordent'
  )
  scenarios['chord with trill key above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with trill key above or below'], 'chord with trill'
  )
  scenarios['chord with turn after'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn after'], 'chord with turn'
  )
  scenarios['chord with turn inverted'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn inverted'], 'chord with turn'
  )
  scenarios['chord with trill with wave after'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with trill with wave after'], 'chord with trill'
  )
  scenarios['chord with articulation vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with articulation vertical correction'], 'chord with articulation'
  )
  scenarios['chord with turn vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with turn vertical correction'], 'chord with turn'
  )
  scenarios['chord with mordent vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with mordent vertical correction'], 'chord with mordent'
  )
  scenarios['chord with trill vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with trill vertical correction'], 'chord with trill'
  )
  scenarios['chord with chord letter'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with chord letter'], 'chord'
  )
  scenarios['chord with chord letter direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with chord letter direction'], 'chord with chord letter'
  )
  scenarios['chord with chord letter above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with chord letter above or below'], 'chord with chord letter'
  )
  scenarios['chord with chord letter above or below measure'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with chord letter above or below measure'], 'chord with chord letter above or below'
  )
  scenarios['chord with chord letter vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with chord letter vertical correction'], 'chord with chord letter'
  )
  scenarios['chord with octave sign'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with octave sign'], 'chord'
  )
  scenarios['chord with octave sign vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with octave sign vertical correction'], 'chord with octave sign'
  )
  scenarios['chord with tremolo'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with tremolo'], 'chord'
  )
  scenarios['chord with tremolo with next'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with tremolo with next'], 'chord with tremolo'
  )
  scenarios['chord with tremolo number of strokes'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with tremolo number of strokes'], 'chord with tremolo'
  )
  scenarios['repeat chord'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['repeat note'], 'chord'
  )
  scenarios['repeat chord via simile'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['repeat note via simile'], 'repeat chord'
  )
  scenarios['repeat chord number of times'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['repeat note number of times'], 'repeat chord'
  )
  scenarios['repeat chord vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['repeat note vertical correction'], 'repeat chord'
  )
  scenarios['chord with dynamic'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with dynamic'], 'chord'
  )
  scenarios['chord with dynamic direction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with dynamic direction'], 'chord with dynamic'
  )
  scenarios['chord with dynamic above or below'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with dynamic above or below'], 'chord with dynamic'
  )
  scenarios['chord with dynamic above or below stave'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with dynamic above or below stave'], 'chord with dynamic'
  )
  scenarios['chord dynamic vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note dynamic vertical correction'], 'chord with dynamic'
  )
  scenarios['chord with lyrics'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with lyrics'], 'chord'
  )
  scenarios['chord with lyrics text value'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with lyrics text value'], 'chord with lyrics'
  )
  scenarios['chord with lyrics followed by dash'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with lyrics followed by dash'], 'chord with lyrics'
  )
  scenarios['chord with lyrics where underscore starts'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with lyrics where underscore starts'], 'chord with lyrics'
  )
  scenarios['chord with lyrics where underscore finishes'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with lyrics where underscore finishes'], 'chord with lyrics'
  )
  scenarios['chord with lyrics with vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with lyrics with vertical correction'], 'chord with lyrics'
  )
  scenarios['chord with pedal'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with pedal'], 'chord'
  )
  scenarios['chord with pedal under'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with pedal under'], 'chord with pedal'
  )
  scenarios['chord with pedal under stave index'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with pedal under stave index'], 'chord with pedal under'
  )
  scenarios['chord with pedal vertical correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with pedal vertical correction'], 'chord with pedal'
  )
  scenarios['chord with pedal text'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with pedal text'], 'chord with pedal'
  )
  scenarios['chord with pedal opens with bracket'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with pedal opens with bracket'], 'chord with pedal'
  )
  scenarios['chord with pedal before|after'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with pedal before|after'], 'chord with pedal'
  )
  scenarios['chord with variable peak'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with variable peak'], 'chord'
  )
  scenarios['chord with variable peak before|after'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with variable peak before|after'], 'chord with variable peak'
  )
  scenarios['chord with variable peak text'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with variable peak text'], 'chord with variable peak'
  )
  scenarios['chord with release'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with release'], 'chord'
  )
  scenarios['chord with release before|after'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with release before|after'], 'chord with release'
  )
  scenarios['chord with release bracket'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with release bracket'], 'chord with release'
  )
  scenarios['chord with release at the end of measure'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with release at the end of measure'], 'chord with release'
  )
  scenarios['chord with release after measure'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with release after measure'], 'chord with release'
  )
  scenarios['chord with horizontal correction'] = copyScenarioWithDifferentRequiredCommandProgression(
    scenarios['note with horizontal correction'], 'chord'
  )
}
