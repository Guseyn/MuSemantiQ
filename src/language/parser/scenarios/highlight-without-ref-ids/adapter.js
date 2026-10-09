'use strict'

/*
Highlights without ref-ids: what the editor shows while you type. It runs instead of the
main scenarios, so there is no page schema to link the text to. Its scenario files have
the same names as the main ones and are added in the same order, so copies of scenarios
find what they copy.
*/

import addNotRecognizableCommandScenario from '#msq/language/parser/scenarios/highlight-without-ref-ids/addNotRecognizableCommandScenario.js'
import addCommentScenario from '#msq/language/parser/scenarios/highlight-without-ref-ids/addCommentScenario.js'
import addStyleScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addStyleScenarios.js'
import addMidiSettingsScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addMidiSettingsScenarios.js'
import addCompressAndStretchUnitsScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addCompressAndStretchUnitsScenarios.js'
import addHideLastMeasureScenario from '#msq/language/parser/scenarios/highlight-without-ref-ids/addHideLastMeasureScenario.js'
import addPageMetaScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addPageMetaScenarios.js'
import addMeasureNumbersScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addMeasureNumbersScenarios.js'
import addLyricsPositionScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addLyricsPositionScenarios.js'
import addMeasureSetupScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addMeasureSetupScenarios.js'
import addBarLineScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addBarLineScenarios.js'
import addRepeatSignScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addRepeatSignScenarios.js'
import addMeasureRestScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addMeasureRestScenarios.js'
import addMeasureSimileScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addMeasureSimileScenarios.js'
import addMeasureFermataScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addMeasureFermataScenarios.js'
import addNewLineScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addNewLineScenarios.js'
import addCrossStaveConnectionsScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addCrossStaveConnectionsScenarios.js'
import addInstrumentTitlesScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addInstrumentTitlesScenarios.js'
import addKeySignatureScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addKeySignatureScenarios.js'
import addTimeSignatureScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addTimeSignatureScenarios.js'
import addRepetitionNoteScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addRepetitionNoteScenarios.js'
import addCodaScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addCodaScenarios.js'
import addSignScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addSignScenarios.js'
import addTempoMarkScenario from '#msq/language/parser/scenarios/highlight-without-ref-ids/addTempoMarkScenario.js'
import addStaveSetupScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addStaveSetupScenarios.js'
import addClefScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addClefScenarios.js'
import addVoiceSetupScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addVoiceSetupScenarios.js'
import addNoteSetupScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addNoteSetupScenarios.js'
import addChordSetupScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addChordSetupScenarios.js'
import addSlurScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addSlurScenarios.js'
import addGlissandoScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addGlissandoScenarios.js'
import addTupletScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addTupletScenarios.js'
import addOctaveSignScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addOctaveSignScenarios.js'
import addCrescendoAndDiminuendoScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addCrescendoAndDiminuendoScenarios.js'
import addRepeatSimileScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addRepeatSimileScenarios.js'
import addVoltaScenarios from '#msq/language/parser/scenarios/highlight-without-ref-ids/addVoltaScenarios.js'
import addPunctuationScenario from '#msq/language/parser/scenarios/highlight-without-ref-ids/addPunctuationScenario.js'
import addGeneralEmptyLineScenario from '#msq/language/parser/scenarios/highlight-without-ref-ids/addGeneralEmptyLineScenario.js'

export default {
  name: 'highlight-without-ref-ids',
  runsWithMain: false,
  coversAllScenarios: true,
  addScenarios: (scenarios) => {
    addCommentScenario(scenarios)
    addStyleScenarios(scenarios)
    addMidiSettingsScenarios(scenarios)
    addCompressAndStretchUnitsScenarios(scenarios)
    addHideLastMeasureScenario(scenarios)
    addPageMetaScenarios(scenarios)
    addMeasureNumbersScenarios(scenarios)
    addLyricsPositionScenarios(scenarios)
    addMeasureSetupScenarios(scenarios)
    addBarLineScenarios(scenarios)
    addRepeatSignScenarios(scenarios)
    addMeasureRestScenarios(scenarios)
    addMeasureSimileScenarios(scenarios)
    addMeasureFermataScenarios(scenarios)
    addNewLineScenarios(scenarios)
    addCrossStaveConnectionsScenarios(scenarios)
    addInstrumentTitlesScenarios(scenarios)
    addKeySignatureScenarios(scenarios)
    addTimeSignatureScenarios(scenarios)
    addRepetitionNoteScenarios(scenarios)
    addCodaScenarios(scenarios)
    addSignScenarios(scenarios)
    addTempoMarkScenario(scenarios)
    addStaveSetupScenarios(scenarios)
    addClefScenarios(scenarios)
    addVoiceSetupScenarios(scenarios)
    addSlurScenarios(scenarios)
    addGlissandoScenarios(scenarios)
    addTupletScenarios(scenarios)
    addOctaveSignScenarios(scenarios)
    addCrescendoAndDiminuendoScenarios(scenarios)
    addRepeatSimileScenarios(scenarios)
    addVoltaScenarios(scenarios)
    addNoteSetupScenarios(scenarios)
    addChordSetupScenarios(scenarios)
    addPunctuationScenario(scenarios)
    addGeneralEmptyLineScenario(scenarios)
    addNotRecognizableCommandScenario(scenarios)
    addNotRecognizableCommandScenario(scenarios)
  },
  createState: () => ({
    highlightsHtmlBuffer: []
  }),
  addTrailingWhitespace: (state, whitespace) => {
    state.highlightsHtmlBuffer.push(whitespace)
  },
  finish: (state) => ({
    highlightsHtmlBuffer: state.highlightsHtmlBuffer
  })
}
