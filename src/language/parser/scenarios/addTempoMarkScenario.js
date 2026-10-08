'use strict'

import regexps from '#msq/language/parser/scenarios/static-objects/regexps.js'
import initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll from '#msq/language/parser/scenarios/page-schema/initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll.js'
import getLastMeasureParams from '#msq/language/parser/scenarios/page-schema/getLastMeasureParams.js'
import isVerticalCorrection from '#msq/language/parser/scenarios/token/isVerticalCorrection.js'
import parseVerticalCorrection from '#msq/language/parser/scenarios/token/parseVerticalCorrection.js'
import parseTempoValueParts from '#msq/language/parser/scenarios/token/parseTempoValueParts.js'
import findNextTokenValueOnTheLine from '#msq/language/parser/scenarios/token/findNextTokenValueOnTheLine.js'

export default function (scenarios) {
  scenarios['tempo mark'] = {
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return (
        regexps.tempoOrMetronome.test(tokenValues) &&
        !regexps.markOrNote.test(
          [
            findNextTokenValueOnTheLine(
              unitext,
              currentToken.firstCharIndexOfNextToken
            )
          ]
        )
      ) ||
      regexps.tempoMarkOrTempoNote.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      initNewMeasureParamsIfThereIsAlreadySuchMeasurePropertyOrNoMeasuresAtAll(parserState.pageSchema, 'tempoMark', parserState)
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
          regexps.tempoMarkHighlight, (match) => {
            return `<span class="eh" ref-id="tempo-mark-${numberOfMeasures}">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="tempo-mark-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElement}`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElement = joinedTokenValuesWithRealDelimiters.replace(
        regexps.tempoMarkHighlight, (match) => {
          return `<span class="eh">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElement
      )
    },
    itIsNewCommandProgressionFromLevel: 0,
    actionWhenProgressionOfCommandsChanges: (parserState, scenarioNameThatChangedCommandsProgression, lineNumber, argumentsFromMainAction) => {
      if (parserState.applyHighlighting) {
        parserState.highlightsHtmlBuffer.push(
          '</span>'
        )
      }
    },
    activateActionWhenProgressionOfCommandsChangesIfItIsLastTokenAndActionDidntHappenBefore: true
  }
  scenarios['tempo mark text'] = {
    requiredCommandProgression: 'tempo mark',
    onTheSameLineAsPrevScenario: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return regexps.tempoMarkText.test(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      const tempoValue = regexps.tempoMarkText.match(tokenValues)[0]
      lastMeasureParamsValue.tempoMark = {
        textValueParts: parseTempoValueParts(tempoValue)
      }
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString = joinedTokenValuesWithRealDelimiters.replace(
          regexps.stringHighlight, (matchWithHighlighedString) => {
            let matchIndexWithTempoDurationPart = 0
            let lastMatchIsNote = false
            const matchWithHighlighedNotes = matchWithHighlighedString.replace(regexps.tempoDurationPartHighlight, (matchWithTempoDurationPart, p1, offset, string) => {
              if (regexps.tempoDurationPartIsDot.test(matchWithTempoDurationPart)) {
                if (lastMatchIsNote) {
                  lastMatchIsNote = false
                  return `<span class="eh" ref-id="tempo-duration-part-${numberOfMeasures}-${++matchIndexWithTempoDurationPart}">${matchWithTempoDurationPart}</span>`
                } else {
                  return `<span class="sth" ref-id="tempo-mark-${numberOfMeasures}">${matchWithTempoDurationPart}</span>`
                }
              } else {
                lastMatchIsNote = true
                const textThatFollowsAfterMatchWithTempoDurationPart = string.slice(offset + matchWithTempoDurationPart.length)
                if (
                  !regexps.tempoMarkWithDotHighlight.test(textThatFollowsAfterMatchWithTempoDurationPart) &&
                  !regexps.tempoMarkDottedHighlight.test(textThatFollowsAfterMatchWithTempoDurationPart)
                ) {
                  lastMatchIsNote = false
                  return `<span class="cuph" ref-id="tempo-duration-part-${numberOfMeasures}-${++matchIndexWithTempoDurationPart}">${matchWithTempoDurationPart}</span>`
                }
                return `<span class="cuph" ref-id="tempo-duration-part-${numberOfMeasures}-${++matchIndexWithTempoDurationPart}">${matchWithTempoDurationPart}</span>`
              }
            })
            return `<span class="sth" ref-id="tempo-mark-${numberOfMeasures}">${matchWithHighlighedNotes}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="tempo-mark-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString}</span>`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString = joinedTokenValuesWithRealDelimiters.replace(
        regexps.stringHighlight, (matchWithHighlighedString) => {
          let lastMatchIsNote = false
          const matchWithHighlighedNotes = matchWithHighlighedString.replace(regexps.tempoDurationPartHighlight, (matchWithTempoDurationPart, p1, offset, string) => {
            if (regexps.tempoDurationPartIsDot.test(matchWithTempoDurationPart)) {
              if (lastMatchIsNote) {
                lastMatchIsNote = false
                return `<span class="eh">${matchWithTempoDurationPart}</span>`
              } else {
                return `<span class="sth">${matchWithTempoDurationPart}</span>`
              }
            } else {
              lastMatchIsNote = true
              const textThatFollowsAfterMatchWithTempoDurationPart = string.slice(offset + matchWithTempoDurationPart.length)
              if (
                !regexps.tempoMarkWithDotHighlight.test(textThatFollowsAfterMatchWithTempoDurationPart) &&
                !regexps.tempoMarkDottedHighlight.test(textThatFollowsAfterMatchWithTempoDurationPart)
              ) {
                lastMatchIsNote = false
                return `<span class="cuph">${matchWithTempoDurationPart}</span>`
              }
              return `<span class="cuph">${matchWithTempoDurationPart}</span>`
            }
          })
          return `<span class="sth">${matchWithHighlighedNotes}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedElementAndString
      )
    },
    itIsNewCommandProgressionFromLevel: 1
  }
  scenarios['tempo mark vertical correction'] = {
    requiredCommandProgression: 'tempo mark',
    onTheSameLineAsPrevScenario: true,
    considerJoinedTokenAccumulatorWithoutCommandDelimitersAsPartOfTokensAndConjunctionsBetweenThem: true,
    condition: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      return isVerticalCorrection(tokenValues)
    },
    action: (unitext, lineNumber, currentToken, tokenValues, joinedTokenValuesWithRealDelimiters, progressionOfCommandsFromScenarios, parserState) => {
      const lastMeasureParamsValue = getLastMeasureParams(parserState.pageSchema)
      lastMeasureParamsValue.tempoMark.yCorrection = parseVerticalCorrection(tokenValues)
      const numberOfMeasures = parserState.pageSchema.measuresParams.length
      if (parserState.applyHighlighting) {
        const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
          regexps.verticalCorrectionHighlight, (match) => {
            return `<span class="th" ref-id="tempo-mark-${numberOfMeasures}">${match}</span>`
          }
        )
        parserState.highlightsHtmlBuffer.push(
          `<span class="th" ref-id="tempo-mark-${numberOfMeasures}">${joinedTokenValuesWithRealDelimitersWithHighlightedNumber}</span>`
        )
      }
    },
    actionOnlyForHighlightingWithoutRefIds: (parserState, joinedTokenValuesWithRealDelimiters, tokenValues) => {
      const joinedTokenValuesWithRealDelimitersWithHighlightedNumber = joinedTokenValuesWithRealDelimiters.replace(
        regexps.verticalCorrectionHighlight, (match) => {
          return `<span class="th">${match}</span>`
        }
      )
      parserState.highlightsHtmlBuffer.push(
        joinedTokenValuesWithRealDelimitersWithHighlightedNumber
      )
    },
    itIsNewCommandProgressionFromLevel: 1
  }
}
