'use strict'

/*
Highlights with ref-ids: the spans the editor shows next to the score, each linked by its
ref-id to what it drew. It runs with the main scenarios and reads what each main action
returns (fromMain). Its scenario files have the same names as the main ones and are added
in the same order, so copies of scenarios find what they copy.
*/

import addNotRecognizableCommandScenario from '#msq/language/parser/scenarios/highlight/addNotRecognizableCommandScenario.js'
import addCommentScenario from '#msq/language/parser/scenarios/highlight/addCommentScenario.js'
import addStyleScenarios from '#msq/language/parser/scenarios/highlight/addStyleScenarios.js'
import addMidiSettingsScenarios from '#msq/language/parser/scenarios/highlight/addMidiSettingsScenarios.js'
import addCompressAndStretchUnitsScenarios from '#msq/language/parser/scenarios/highlight/addCompressAndStretchUnitsScenarios.js'
import addHideLastMeasureScenario from '#msq/language/parser/scenarios/highlight/addHideLastMeasureScenario.js'
import addPageMetaScenarios from '#msq/language/parser/scenarios/highlight/addPageMetaScenarios.js'
import addMeasureNumbersScenarios from '#msq/language/parser/scenarios/highlight/addMeasureNumbersScenarios.js'
import addLyricsPositionScenarios from '#msq/language/parser/scenarios/highlight/addLyricsPositionScenarios.js'
import addMeasureSetupScenarios from '#msq/language/parser/scenarios/highlight/addMeasureSetupScenarios.js'
import addBarLineScenarios from '#msq/language/parser/scenarios/highlight/addBarLineScenarios.js'
import addRepeatSignScenarios from '#msq/language/parser/scenarios/highlight/addRepeatSignScenarios.js'
import addMeasureRestScenarios from '#msq/language/parser/scenarios/highlight/addMeasureRestScenarios.js'
import addMeasureSimileScenarios from '#msq/language/parser/scenarios/highlight/addMeasureSimileScenarios.js'
import addMeasureFermataScenarios from '#msq/language/parser/scenarios/highlight/addMeasureFermataScenarios.js'
import addNewLineScenarios from '#msq/language/parser/scenarios/highlight/addNewLineScenarios.js'
import addCrossStaveConnectionsScenarios from '#msq/language/parser/scenarios/highlight/addCrossStaveConnectionsScenarios.js'
import addInstrumentTitlesScenarios from '#msq/language/parser/scenarios/highlight/addInstrumentTitlesScenarios.js'
import addKeySignatureScenarios from '#msq/language/parser/scenarios/highlight/addKeySignatureScenarios.js'
import addTimeSignatureScenarios from '#msq/language/parser/scenarios/highlight/addTimeSignatureScenarios.js'
import addRepetitionNoteScenarios from '#msq/language/parser/scenarios/highlight/addRepetitionNoteScenarios.js'
import addCodaScenarios from '#msq/language/parser/scenarios/highlight/addCodaScenarios.js'
import addSignScenarios from '#msq/language/parser/scenarios/highlight/addSignScenarios.js'
import addTempoMarkScenario from '#msq/language/parser/scenarios/highlight/addTempoMarkScenario.js'
import addStaveSetupScenarios from '#msq/language/parser/scenarios/highlight/addStaveSetupScenarios.js'
import addClefScenarios from '#msq/language/parser/scenarios/highlight/addClefScenarios.js'
import addVoiceSetupScenarios from '#msq/language/parser/scenarios/highlight/addVoiceSetupScenarios.js'
import addNoteSetupScenarios from '#msq/language/parser/scenarios/highlight/addNoteSetupScenarios.js'
import addChordSetupScenarios from '#msq/language/parser/scenarios/highlight/addChordSetupScenarios.js'
import addSlurScenarios from '#msq/language/parser/scenarios/highlight/addSlurScenarios.js'
import addGlissandoScenarios from '#msq/language/parser/scenarios/highlight/addGlissandoScenarios.js'
import addTupletScenarios from '#msq/language/parser/scenarios/highlight/addTupletScenarios.js'
import addOctaveSignScenarios from '#msq/language/parser/scenarios/highlight/addOctaveSignScenarios.js'
import addCrescendoAndDiminuendoScenarios from '#msq/language/parser/scenarios/highlight/addCrescendoAndDiminuendoScenarios.js'
import addRepeatSimileScenarios from '#msq/language/parser/scenarios/highlight/addRepeatSimileScenarios.js'
import addVoltaScenarios from '#msq/language/parser/scenarios/highlight/addVoltaScenarios.js'
import addPunctuationScenario from '#msq/language/parser/scenarios/highlight/addPunctuationScenario.js'
import addGeneralEmptyLineScenario from '#msq/language/parser/scenarios/highlight/addGeneralEmptyLineScenario.js'

export default {
  name: 'highlight',
  runsWithMain: true,
  coversAllScenarios: false,
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
    highlightsHtmlBuffer: [],
    // spans written before the positions they link to were known (filled by fillAllPlaceholders…)
    indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholders: [],
    indexesInHighlightsHtmlBufferWhereWeShouldFillPositionPlaceholdersForConnection: [],
    // spans of the notes of the chord being written, which get their ref-ids when it is over
    indexesInHighlightsHtmlBufferWithNotesDeclarationsOfLastChord: []
  }),
  addTrailingWhitespace: (state, whitespace) => {
    state.highlightsHtmlBuffer.push(whitespace)
  },
  finish: (state) => ({
    highlightsHtmlBuffer: state.highlightsHtmlBuffer
  })
}
