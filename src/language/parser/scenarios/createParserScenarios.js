'use strict'

import addNotRecognizableCommandScenario from '#msq/language/parser/scenarios/addNotRecognizableCommandScenario.js'

import addCommentScenario from '#msq/language/parser/scenarios/addCommentScenario.js'
import addStyleScenarios from '#msq/language/parser/scenarios/addStyleScenarios.js'
import addMidiSettingsScenarios from '#msq/language/parser/scenarios/addMidiSettingsScenarios.js'
import addCompressAndStretchUnitsScenarios from '#msq/language/parser/scenarios/addCompressAndStretchUnitsScenarios.js'
import addHideLastMeasureScenario from '#msq/language/parser/scenarios/addHideLastMeasureScenario.js'
import addPageMetaScenarios from '#msq/language/parser/scenarios/addPageMetaScenarios.js'
import addMeasureNumbersScenarios from '#msq/language/parser/scenarios/addMeasureNumbersScenarios.js'
import addLyricsPositionScenarios from '#msq/language/parser/scenarios/addLyricsPositionScenarios.js'
import addMeasureSetupScenarios from '#msq/language/parser/scenarios/addMeasureSetupScenarios.js'
import addBarLineScenarios from '#msq/language/parser/scenarios/addBarLineScenarios.js'
import addRepeatSignScenarios from '#msq/language/parser/scenarios/addRepeatSignScenarios.js'
import addMeasureRestScenarios from '#msq/language/parser/scenarios/addMeasureRestScenarios.js'
import addMeasureSimileScenarios from '#msq/language/parser/scenarios/addMeasureSimileScenarios.js'
import addMeasureFermataScenarios from '#msq/language/parser/scenarios/addMeasureFermataScenarios.js'
import addNewLineScenarios from '#msq/language/parser/scenarios/addNewLineScenarios.js'
import addCrossStaveConnectionsScenarios from '#msq/language/parser/scenarios/addCrossStaveConnectionsScenarios.js'
import addInstrumentTitlesScenarios from '#msq/language/parser/scenarios/addInstrumentTitlesScenarios.js'
import addKeySignatureScenarios from '#msq/language/parser/scenarios/addKeySignatureScenarios.js'
import addTimeSignatureScenarios from '#msq/language/parser/scenarios/addTimeSignatureScenarios.js'
import addRepetitionNoteScenarios from '#msq/language/parser/scenarios/addRepetitionNoteScenarios.js'
import addCodaScenarios from '#msq/language/parser/scenarios/addCodaScenarios.js'
import addSignScenarios from '#msq/language/parser/scenarios/addSignScenarios.js'
import addTempoMarkScenario from '#msq/language/parser/scenarios/addTempoMarkScenario.js'
import addStaveSetupScenarios from '#msq/language/parser/scenarios/addStaveSetupScenarios.js'
import addClefScenarios from '#msq/language/parser/scenarios/addClefScenarios.js'
import addVoiceSetupScenarios from '#msq/language/parser/scenarios/addVoiceSetupScenarios.js'
import addNoteSetupScenarios from '#msq/language/parser/scenarios/addNoteSetupScenarios.js'
import addChordSetupScenarios from '#msq/language/parser/scenarios/addChordSetupScenarios.js'
import addSlurScenarios from '#msq/language/parser/scenarios/addSlurScenarios.js'
import addGlissandoScenarios from '#msq/language/parser/scenarios/addGlissandoScenarios.js'
import addTupletScenarios from '#msq/language/parser/scenarios/addTupletScenarios.js'
import addOctaveSignScenarios from '#msq/language/parser/scenarios/addOctaveSignScenarios.js'
import addCrescendoAndDiminuendoScenarios from '#msq/language/parser/scenarios/addCrescendoAndDiminuendoScenarios.js'
import addRepeatSimileScenarios from '#msq/language/parser/scenarios/addRepeatSimileScenarios.js'
import addVoltaScenarios from '#msq/language/parser/scenarios/addVoltaScenarios.js'
import addPunctuationScenario from '#msq/language/parser/scenarios/addPunctuationScenario.js'
import addGeneralEmptyLineScenario from '#msq/language/parser/scenarios/addGeneralEmptyLineScenario.js'

const addMainScenarious = (scenarios) => {
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
}

export default function () {
  const scenarios = {}
  addMainScenarious(scenarios)
  addNotRecognizableCommandScenario(scenarios)
  return scenarios
}
