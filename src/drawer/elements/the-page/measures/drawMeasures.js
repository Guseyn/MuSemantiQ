'use strict'

import drawMeasure from '#msq/drawer/elements/the-page/measures/drawMeasure.js'
import createLine from '#msq/drawer/elements/basic/createLine.js'

import collectMeasuresInformationAboutContainingBrokenConnectionsWhileAdjustingThemWithAdditionalUsefulInformation from '#msq/drawer/elements/shared/collectMeasuresInformationAboutContainingBrokenConnectionsWhileAdjustingThemWithAdditionalUsefulInformation.js'

import drawLedgerLines from '#msq/drawer/elements/notes-on-a-page/notes/drawLedgerLines.js'
import drawGraceCrushLines from '#msq/drawer/elements/marks-on-units/grace-units/drawGraceCrushLines.js'
import drawTies from '#msq/drawer/elements/grouping-notes/ties/drawTies.js'
import drawSlurs from '#msq/drawer/elements/spans/slurs/drawSlurs.js'
import drawLyrics from '#msq/drawer/elements/marks-on-units/lyrics/drawLyrics.js'
import drawTuplets from '#msq/drawer/elements/grouping-notes/tuplets/drawTuplets.js'
import drawGlissandos from '#msq/drawer/elements/spans/glissando/drawGlissandos.js'
import drawArticulationsAttachedToSingleUnits from '#msq/drawer/elements/marks-on-units/articulations/drawArticulationsAttachedToSingleUnits.js'
import drawArticulationsAboveOrBelowStave from '#msq/drawer/elements/marks-on-units/articulations/drawArticulationsAboveOrBelowStave.js'
import drawChordLetters from '#msq/drawer/elements/marks-on-units/chord-letters/drawChordLetters.js'
import drawOctaveSigns from '#msq/drawer/elements/spans/octave-signs/drawOctaveSigns.js'
import createGroup from '#msq/drawer/elements/basic/createGroup.js'
import createElementWithAdditionalInformation from '#msq/drawer/elements/basic/createElementWithAdditionalInformation.js'
import correctTopAndBottomOfVoicesBodyAccordingToSingleUnitsTheyContain from '#msq/drawer/elements/shared/correctTopAndBottomOfVoicesBodyAccordingToSingleUnitsTheyContain.js'
import correctTopAndBottomOfMeasuresAccordingToTheirVoicesBodies from '#msq/drawer/elements/shared/correctTopAndBottomOfMeasuresAccordingToTheirVoicesBodies.js'
import drawVoltas from '#msq/drawer/elements/measure-furniture/volta-brackets/drawVoltas.js'
import drawRepetitionNotes from '#msq/drawer/elements/measure-furniture/repetition-instructions/drawRepetitionNotes.js'
import drawCodas from '#msq/drawer/elements/measure-furniture/coda/drawCodas.js'
import drawSigns from '#msq/drawer/elements/measure-furniture/sign/drawSigns.js'
import drawTempoMarks from '#msq/drawer/elements/measure-furniture/tempo-and-metronome-marks/drawTempoMarks.js'
import drawPedals from '#msq/drawer/elements/spans/pedal-marks/drawPedals.js'
import drawDynamicChanges from '#msq/drawer/elements/spans/crescendo-and-diminuendo/drawDynamicChanges.js'
import drawTremoloBetweenStemlessSingleUnits from '#msq/drawer/elements/spans/tremolo/drawTremoloBetweenStemlessSingleUnits.js'
import drawBeams from '#msq/drawer/elements/grouping-notes/beams/drawBeams.js'
import drawSingleTremolos from '#msq/drawer/elements/spans/tremolo/drawSingleTremolos.js'
import drawBarlineFermatas from '#msq/drawer/elements/measure-furniture/fermata-over-barline/drawBarlineFermatas.js'

export default function (measuresParams, pageLineMaxWidth) {
  return (styles, leftOffset, topOffset) => {
    const { intervalBetweenStaveLines, intervalBetweenStaves, intervalBetweenPageLines, pageMaxWidthLineStrokeOptions } = styles
    const clefNamesAuraByStaveIndexes = {}

    const measures = []
    const measuresOnPageLine = []
    const topOfFirstStave = topOffset
    const durationsAccumulatorsForEachVoice = []
    const elementsOnPageLineToCompleteMeasuresContent = []
    const lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem = []
    const chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem = []
    const voicesOnPageLine = []
    const voicesBodiesOnPageLine = []
    const informationAboutBrokenConnectionsInMeasures = collectMeasuresInformationAboutContainingBrokenConnectionsWhileAdjustingThemWithAdditionalUsefulInformation(measuresParams)

    let affectingTupletValuesByStaveAndVoiceIndexes = {}
    let nextLeftOffset = leftOffset
    let nextTopOffset = topOffset
    let bottomOfLastPageLineConsideringOnlyStaves = nextTopOffset
    let maxNumberOfStavesOnPageLine = 0
    let maxNumberOfStaveLinesOnPageLine = 0
    let beamingStatusesForEachVoiceOnPageLine = {}
    let similesInformationByStaveAndVoiceIndexes = {}
    let measureIndexOnPageLine = 0
    let pageLineNumber = 0
    let atLeastOnePageLineInGreaterThanItShouldBe = false
    let currentPageLineWidth = 0

    measuresParams.forEach(
      (measureParams, measureIndex) => {
        if (measureParams) {
          const isFirstMeasureOnPageLine = measureIndexOnPageLine === 0
          const isLastMeasureInGeneral = measureIndex === measuresParams.length - 1
          if (isLastMeasureInGeneral) {
            measureParams.isLastMeasureOnPageLine = true
          }

          const { currentMeasureContainsBreakingConnectionsThatStartBefore, currentMeasureContainsBreakingConnectionsThatFinishAfter } = informationAboutBrokenConnectionsInMeasures[pageLineNumber][measureIndexOnPageLine]
          measureParams.stavesParams = measureParams.stavesParams || []

          const measure = drawMeasure({
            pageLineNumber,
            pageLineMaxWidth,
            measureIndexOnPageLine,
            measureIndexInGeneral: measureIndex,
            maxNumberOfStavesInThisAndNextMeasures: measureParams.maxNumberOfStavesInThisAndNextMeasures,
            numberOfStaveLines: measureParams.numberOfStaveLines || 5,
            connectionsParams: measureParams.connectionsParams,
            instrumentTitlesParams: measureParams.instrumentTitlesParams,
            withoutStartBarLine: measureParams.withoutStartBarLine,
            keySignatureName: measureParams.keySignatureName,
            keySignatureNameForEachLineId: measureParams.keySignatureNameForEachLineId,
            timeSignatureParams: measureParams.timeSignatureParams,
            stavesParams: measureParams.stavesParams,
            openingBarLineName: measureParams.openingBarLineName,
            closingBarLineName: measureParams.closingBarLineName,
            repeatDotsMarkAtTheStart: measureParams.repeatDotsMarkAtTheStart,
            repeatDotsMarkAtTheEnd: measureParams.repeatDotsMarkAtTheEnd,
            containsAtLeastOneVoiceWithMoreThanOneUnit: measureParams.containsAtLeastOneVoiceWithMoreThanOneUnit,
            containsFullMeasureUnitsThatShouldBeCentralized: measureParams.containsFullMeasureUnitsThatShouldBeCentralized,
            isFirstMeasureOnPageLine,
            isLastMeasureOnPageLine: measureParams.isLastMeasureOnPageLine,
            isLastMeasureInGeneral,
            currentPageLineWidth,
            showMeasureNumber: measureParams.showMeasureNumber,
            directionOfMeasureNumber: measureParams.directionOfMeasureNumber,
            lyricsUnderStaveIndex: measureParams.lyricsUnderStaveIndex,
            compressUnitsByNTimes: measureParams.compressUnitsByNTimes,
            stretchUnitsByNTimes: measureParams.stretchUnitsByNTimes,
            isHidden: measureParams.isHidden,
            minUnitDurationOnPageLine: measureParams.minUnitDurationOnPageLine,
            durationsAccumulatorsForEachVoice,
            similesInformationByStaveAndVoiceIndexes,
            clefNamesAuraByStaveIndexes,
            beamingStatusesForEachVoiceOnPageLine,
            affectingTupletValuesByStaveAndVoiceIndexes,
            currentMeasureContainsBreakingConnectionsThatStartBefore,
            currentMeasureContainsBreakingConnectionsThatFinishAfter,
            measureContainsFermataOverBarline: measureParams.endsWithFermata,
            prevMeasureContainsFermataOverBarline: measuresParams[measureIndex - 1] && measuresParams[measureIndex - 1].endsWithFermata,
            voltaMark: measureParams.voltaMark,
            repetitionNote: measureParams.repetitionNote,
            coda: measureParams.coda,
            sign: measureParams.sign,
            tempoMark: measureParams.tempoMark,
            isMeasureRest: measureParams.isMeasureRest,
            multiMeasureRestCount: measureParams.multiMeasureRestCount,
            similePreviousMeasureCount: measureParams.similePreviousMeasureCount,
            simileTwoPreviousMeasuresCount: measureParams.simileTwoPreviousMeasuresCount,
            previousMeasure: measures[measures.length - 1],
            measureBeforePreviousMeasure: measures[measures.length - 2],
            simileYCorrection: measureParams.simileYCorrection,
            lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem,
            chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem
          })(styles, nextLeftOffset, nextTopOffset)
          measures.push(measure)
          measuresOnPageLine.push(measure)
          if (
            measure.voicesOnMultipleStavesWithStavesPiece &&
            measure.voicesOnMultipleStavesWithStavesPiece.voices &&
            measure.voicesOnMultipleStavesWithStavesPiece.voices.voicesBody &&
            !measure.voicesOnMultipleStavesWithStavesPiece.voices.voicesBody.isEmpty
          ) {
            const voicesInCurrentMeasure = measure.voicesOnMultipleStavesWithStavesPiece.voices
            voicesBodiesOnPageLine.push(voicesInCurrentMeasure.voicesBody)
            voicesOnPageLine.push(voicesInCurrentMeasure)
          } else {
            voicesOnPageLine.push({
              withoutVoices: true
            })
            if (measure.isHidden) {
              measure.properties['visibility'] = 'hidden'
            }
          }
          currentPageLineWidth += (measure.right - measure.measureStartXPosition)
          if (measure.numberOfStaves > maxNumberOfStavesOnPageLine) {
            maxNumberOfStavesOnPageLine = measure.numberOfStaves
          }
          if (measure.numberOfStaveLines > maxNumberOfStaveLinesOnPageLine) {
            maxNumberOfStaveLinesOnPageLine = measure.numberOfStaveLines
          }

          if (measureParams.isLastMeasureOnPageLine || isLastMeasureInGeneral) {
            if (measure.pageLineInGreaterThanItShouldBe) {
              atLeastOnePageLineInGreaterThanItShouldBe = true
            }

            elementsOnPageLineToCompleteMeasuresContent.push(
              ...drawBarlineFermatas(measuresOnPageLine, styles),
              ...drawBeams(voicesOnPageLine, styles),
              ...drawGraceCrushLines(voicesOnPageLine, styles),
              ...drawTies(voicesOnPageLine, voicesBodiesOnPageLine, styles),
              ...drawGlissandos(voicesOnPageLine, voicesBodiesOnPageLine, measuresOnPageLine, styles),
              ...drawSingleTremolos(voicesOnPageLine, styles),
              ...drawArticulationsAttachedToSingleUnits(voicesOnPageLine, true, false, styles),
              ...drawTremoloBetweenStemlessSingleUnits(voicesOnPageLine, styles),
              ...drawTuplets(voicesOnPageLine, voicesBodiesOnPageLine, styles),
              ...drawSlurs(voicesOnPageLine, styles),
              ...drawOctaveSigns(voicesOnPageLine, styles),
              ...drawArticulationsAboveOrBelowStave(voicesOnPageLine, true, false, styles)
            )

            voicesOnPageLine.forEach(voicesOnPageLineForCurrentMeasure => {
              const { measureIndexOnPageLine, singleUnitsInVoices, withoutVoices } = voicesOnPageLineForCurrentMeasure
              if (!withoutVoices) {
                correctTopAndBottomOfVoicesBodyAccordingToSingleUnitsTheyContain(
                  voicesBodiesOnPageLine[measureIndexOnPageLine],
                  singleUnitsInVoices
                )
              }
            })
            correctTopAndBottomOfMeasuresAccordingToTheirVoicesBodies(measuresOnPageLine, voicesBodiesOnPageLine)

            elementsOnPageLineToCompleteMeasuresContent.push(
              ...drawLyrics(voicesOnPageLine, measuresOnPageLine, voicesBodiesOnPageLine, styles),
              ...drawChordLetters(voicesOnPageLine, measuresOnPageLine, voicesBodiesOnPageLine, styles),
              ...drawPedals(voicesOnPageLine, measuresOnPageLine, styles),
              ...drawDynamicChanges(voicesOnPageLine, measuresOnPageLine, styles),
              ...drawArticulationsAttachedToSingleUnits(voicesOnPageLine, false, true, styles),
              ...drawArticulationsAboveOrBelowStave(voicesOnPageLine, false, true, styles)
            )

            voicesOnPageLine.forEach(voicesOnPageLineForCurrentMeasure => {
              const { measureIndexOnPageLine, singleUnitsInVoices, withoutVoices } = voicesOnPageLineForCurrentMeasure
              if (!withoutVoices) {
                correctTopAndBottomOfVoicesBodyAccordingToSingleUnitsTheyContain(
                  voicesBodiesOnPageLine[measureIndexOnPageLine],
                  singleUnitsInVoices
                )
              }
            })
            correctTopAndBottomOfMeasuresAccordingToTheirVoicesBodies(measuresOnPageLine, voicesBodiesOnPageLine)

            elementsOnPageLineToCompleteMeasuresContent.push(
              ...drawRepetitionNotes(measuresOnPageLine, styles),
              ...drawCodas(measuresOnPageLine, styles),
              ...drawSigns(measuresOnPageLine, styles),
              ...drawVoltas(measuresOnPageLine, voicesBodiesOnPageLine, styles),
              ...drawTempoMarks(measuresOnPageLine, voicesBodiesOnPageLine, styles)
            )

            const groupedDrawnElementsOnPageLineToCompleteMeasuresContent = createGroup(
              'additionalMeasureElementsOnPageLine',
              elementsOnPageLineToCompleteMeasuresContent
            )
            measures.push(groupedDrawnElementsOnPageLineToCompleteMeasuresContent)
            const groupedLedgerLinesOnPageLine = createGroup(
              'ledgerLinesOnPageLine',
              drawLedgerLines(voicesOnPageLine, styles)
            )
            measures.unshift(groupedLedgerLinesOnPageLine)
            bottomOfLastPageLineConsideringOnlyStaves = nextTopOffset + maxNumberOfStavesOnPageLine * (maxNumberOfStaveLinesOnPageLine - 1) * intervalBetweenStaveLines + (maxNumberOfStavesOnPageLine - 1) * intervalBetweenStaves
            nextTopOffset = bottomOfLastPageLineConsideringOnlyStaves + intervalBetweenPageLines
            nextLeftOffset = leftOffset

            voicesOnPageLine.splice(0)
            measuresOnPageLine.splice(0)
            elementsOnPageLineToCompleteMeasuresContent.splice(0)
            lyricsWordsElementsWithMaxWidthAmongAllLyricsWordsForEachCrossStaveUnitOnPageLineToPrepareSpaceBeforeDrawingThem.splice(0)
            chordLetterElementsOnPageLineToPrepareSpaceBeforeDrawingThem.splice(0)
            voicesBodiesOnPageLine.splice(0)
            measureIndexOnPageLine = 0
            maxNumberOfStavesOnPageLine = 0
            maxNumberOfStaveLinesOnPageLine = 0
            currentPageLineWidth = 0
            beamingStatusesForEachVoiceOnPageLine = {}
            affectingTupletValuesByStaveAndVoiceIndexes = {}
            similesInformationByStaveAndVoiceIndexes = {}
            pageLineNumber += 1
          } else {
            nextLeftOffset = measure.right
            measureIndexOnPageLine += 1
          }
        }
      }
    )
    if (atLeastOnePageLineInGreaterThanItShouldBe) {
      measures.push(
        createLine(leftOffset + pageLineMaxWidth, topOfFirstStave, leftOffset + pageLineMaxWidth, bottomOfLastPageLineConsideringOnlyStaves, pageMaxWidthLineStrokeOptions)
      )
    }
    return createElementWithAdditionalInformation(
      createGroup(
        'measures',
        measures
      ),
      {
        topOfFirstStave,
        bottomOfLastPageLineConsideringOnlyStaves
      }
    )
  }
}
