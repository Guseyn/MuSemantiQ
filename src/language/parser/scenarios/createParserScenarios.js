'use strict'

import adapters from '#msq/language/parser/scenarios/adapters.js'
import addNotRecognizableCommandScenario from '#msq/language/parser/scenarios/main/addNotRecognizableCommandScenario.js'

import addCommentScenario from '#msq/language/parser/scenarios/main/addCommentScenario.js'
import addStyleScenarios from '#msq/language/parser/scenarios/main/addStyleScenarios.js'
import addMidiSettingsScenarios from '#msq/language/parser/scenarios/main/addMidiSettingsScenarios.js'
import addCompressAndStretchUnitsScenarios from '#msq/language/parser/scenarios/main/addCompressAndStretchUnitsScenarios.js'
import addHideLastMeasureScenario from '#msq/language/parser/scenarios/main/addHideLastMeasureScenario.js'
import addPageMetaScenarios from '#msq/language/parser/scenarios/main/addPageMetaScenarios.js'
import addMeasureNumbersScenarios from '#msq/language/parser/scenarios/main/addMeasureNumbersScenarios.js'
import addLyricsPositionScenarios from '#msq/language/parser/scenarios/main/addLyricsPositionScenarios.js'
import addMeasureSetupScenarios from '#msq/language/parser/scenarios/main/addMeasureSetupScenarios.js'
import addBarLineScenarios from '#msq/language/parser/scenarios/main/addBarLineScenarios.js'
import addRepeatSignScenarios from '#msq/language/parser/scenarios/main/addRepeatSignScenarios.js'
import addMeasureRestScenarios from '#msq/language/parser/scenarios/main/addMeasureRestScenarios.js'
import addMeasureSimileScenarios from '#msq/language/parser/scenarios/main/addMeasureSimileScenarios.js'
import addMeasureFermataScenarios from '#msq/language/parser/scenarios/main/addMeasureFermataScenarios.js'
import addNewLineScenarios from '#msq/language/parser/scenarios/main/addNewLineScenarios.js'
import addCrossStaveConnectionsScenarios from '#msq/language/parser/scenarios/main/addCrossStaveConnectionsScenarios.js'
import addInstrumentTitlesScenarios from '#msq/language/parser/scenarios/main/addInstrumentTitlesScenarios.js'
import addKeySignatureScenarios from '#msq/language/parser/scenarios/main/addKeySignatureScenarios.js'
import addTimeSignatureScenarios from '#msq/language/parser/scenarios/main/addTimeSignatureScenarios.js'
import addRepetitionNoteScenarios from '#msq/language/parser/scenarios/main/addRepetitionNoteScenarios.js'
import addCodaScenarios from '#msq/language/parser/scenarios/main/addCodaScenarios.js'
import addSignScenarios from '#msq/language/parser/scenarios/main/addSignScenarios.js'
import addTempoMarkScenario from '#msq/language/parser/scenarios/main/addTempoMarkScenario.js'
import addStaveSetupScenarios from '#msq/language/parser/scenarios/main/addStaveSetupScenarios.js'
import addClefScenarios from '#msq/language/parser/scenarios/main/addClefScenarios.js'
import addVoiceSetupScenarios from '#msq/language/parser/scenarios/main/addVoiceSetupScenarios.js'
import addNoteSetupScenarios from '#msq/language/parser/scenarios/main/addNoteSetupScenarios.js'
import addChordSetupScenarios from '#msq/language/parser/scenarios/main/addChordSetupScenarios.js'
import addSlurScenarios from '#msq/language/parser/scenarios/main/addSlurScenarios.js'
import addGlissandoScenarios from '#msq/language/parser/scenarios/main/addGlissandoScenarios.js'
import addTupletScenarios from '#msq/language/parser/scenarios/main/addTupletScenarios.js'
import addOctaveSignScenarios from '#msq/language/parser/scenarios/main/addOctaveSignScenarios.js'
import addCrescendoAndDiminuendoScenarios from '#msq/language/parser/scenarios/main/addCrescendoAndDiminuendoScenarios.js'
import addRepeatSimileScenarios from '#msq/language/parser/scenarios/main/addRepeatSimileScenarios.js'
import addVoltaScenarios from '#msq/language/parser/scenarios/main/addVoltaScenarios.js'
import addPunctuationScenario from '#msq/language/parser/scenarios/main/addPunctuationScenario.js'
import addGeneralEmptyLineScenario from '#msq/language/parser/scenarios/main/addGeneralEmptyLineScenario.js'

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
