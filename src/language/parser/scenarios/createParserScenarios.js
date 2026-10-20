'use strict'

import adapters from '#msq/language/parser/scenarios/adapterDefinitions.js'
import addNotRecognizableCommandScenario from '#msq/language/parser/scenarios/main-set/addNotRecognizableCommandScenario.js'

import addCommentScenario from '#msq/language/parser/scenarios/main-set/addCommentScenario.js'
import addStyleScenarios from '#msq/language/parser/scenarios/main-set/addStyleScenarios.js'
import addMidiSettingsScenarios from '#msq/language/parser/scenarios/main-set/addMidiSettingsScenarios.js'
import addCompressAndStretchUnitsScenarios from '#msq/language/parser/scenarios/main-set/addCompressAndStretchUnitsScenarios.js'
import addHideLastMeasureScenario from '#msq/language/parser/scenarios/main-set/addHideLastMeasureScenario.js'
import addPageMetaScenarios from '#msq/language/parser/scenarios/main-set/addPageMetaScenarios.js'
import addMeasureNumbersScenarios from '#msq/language/parser/scenarios/main-set/addMeasureNumbersScenarios.js'
import addLyricsPositionScenarios from '#msq/language/parser/scenarios/main-set/addLyricsPositionScenarios.js'
import addMeasureSetupScenarios from '#msq/language/parser/scenarios/main-set/addMeasureSetupScenarios.js'
import addBarLineScenarios from '#msq/language/parser/scenarios/main-set/addBarLineScenarios.js'
import addRepeatSignScenarios from '#msq/language/parser/scenarios/main-set/addRepeatSignScenarios.js'
import addMeasureRestScenarios from '#msq/language/parser/scenarios/main-set/addMeasureRestScenarios.js'
import addMeasureSimileScenarios from '#msq/language/parser/scenarios/main-set/addMeasureSimileScenarios.js'
import addMeasureFermataScenarios from '#msq/language/parser/scenarios/main-set/addMeasureFermataScenarios.js'
import addNewLineScenarios from '#msq/language/parser/scenarios/main-set/addNewLineScenarios.js'
import addCrossStaveConnectionsScenarios from '#msq/language/parser/scenarios/main-set/addCrossStaveConnectionsScenarios.js'
import addInstrumentTitlesScenarios from '#msq/language/parser/scenarios/main-set/addInstrumentTitlesScenarios.js'
import addKeySignatureScenarios from '#msq/language/parser/scenarios/main-set/addKeySignatureScenarios.js'
import addTimeSignatureScenarios from '#msq/language/parser/scenarios/main-set/addTimeSignatureScenarios.js'
import addRepetitionNoteScenarios from '#msq/language/parser/scenarios/main-set/addRepetitionNoteScenarios.js'
import addCodaScenarios from '#msq/language/parser/scenarios/main-set/addCodaScenarios.js'
import addSignScenarios from '#msq/language/parser/scenarios/main-set/addSignScenarios.js'
import addTempoMarkScenario from '#msq/language/parser/scenarios/main-set/addTempoMarkScenario.js'
import addStaveSetupScenarios from '#msq/language/parser/scenarios/main-set/addStaveSetupScenarios.js'
import addClefScenarios from '#msq/language/parser/scenarios/main-set/addClefScenarios.js'
import addVoiceSetupScenarios from '#msq/language/parser/scenarios/main-set/addVoiceSetupScenarios.js'
import addNoteSetupScenarios from '#msq/language/parser/scenarios/main-set/addNoteSetupScenarios.js'
import addChordSetupScenarios from '#msq/language/parser/scenarios/main-set/addChordSetupScenarios.js'
import addSlurScenarios from '#msq/language/parser/scenarios/main-set/addSlurScenarios.js'
import addGlissandoScenarios from '#msq/language/parser/scenarios/main-set/addGlissandoScenarios.js'
import addTupletScenarios from '#msq/language/parser/scenarios/main-set/addTupletScenarios.js'
import addOctaveSignScenarios from '#msq/language/parser/scenarios/main-set/addOctaveSignScenarios.js'
import addCrescendoAndDiminuendoScenarios from '#msq/language/parser/scenarios/main-set/addCrescendoAndDiminuendoScenarios.js'
import addRepeatSimileScenarios from '#msq/language/parser/scenarios/main-set/addRepeatSimileScenarios.js'
import addVoltaScenarios from '#msq/language/parser/scenarios/main-set/addVoltaScenarios.js'
import addPunctuationScenario from '#msq/language/parser/scenarios/main-set/addPunctuationScenario.js'
import addGeneralEmptyLineScenario from '#msq/language/parser/scenarios/main-set/addGeneralEmptyLineScenario.js'

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

// each adapter's scenarios hang on the main scenario with the same name, under scenario.adapters[adapterName]
const attachAdapters = (scenarios) => {
  for (const scenarioName in scenarios) {
    scenarios[scenarioName].adapters = {}
  }
  for (const adapterName in adapters) {
    const adapter = adapters[adapterName]
    const adapterScenarios = {}
    adapter.addScenarios(adapterScenarios)
    for (const scenarioName in adapterScenarios) {
      if (!scenarios[scenarioName]) {
        throw new Error(`adapter '${adapterName}' has scenario '${scenarioName}', which the main scenarios don't have`)
      }
      scenarios[scenarioName].adapters[adapterName] = adapterScenarios[scenarioName]
    }
    if (adapter.coversAllScenarios) {
      for (const scenarioName in scenarios) {
        if (!adapterScenarios[scenarioName]) {
          throw new Error(`adapter '${adapterName}' has no scenario '${scenarioName}'`)
        }
      }
    }
  }
}

export default function () {
  const scenarios = {}
  addMainScenarious(scenarios)
  addNotRecognizableCommandScenario(scenarios)
  attachAdapters(scenarios)
  return scenarios
}
