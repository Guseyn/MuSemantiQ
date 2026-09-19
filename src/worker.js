self['__UNILANG_FONT_SOURCES_STORAGE__'] = {}

import {
  setupFonts,
  isPageSchemaValid,
  generateIntermediateStructuresForSinglePage,
  generateStylesForSinglePage,
  generateSvgForSinglePage,
  generateMidiForSinglePage
} from '#msq/api.js'

import { base64FromUint8 } from '#msq/utils.js'

import generateUnicodePoints from '#msq/drawer/generateUnicodePoints.js'

const eventHandlers = {
  'fonts.setup': async (event) => {
    const id = event.data.id
    const fontConfig = event.data.fontConfig
    const fontSourcesReference = event.data.fontSourcesReference

    if (!id) {
      self.postMessage({
        id,
        error: 'No id provided'
      })
      return
    }

    if (!fontConfig) {
      self.postMessage({
        id,
        error: 'No fontConfig provided'
      })
      return
    }

    if (!fontSourcesReference) {
      self.postMessage({
        id,
        error: 'No fontSourcesReference provided'
      })
      return
    }

    try {
      const supportedFontSources = await setupFonts(fontConfig)
      if (self['__UNILANG_FONT_SOURCES_STORAGE__'][fontSourcesReference]) {
        self.postMessage({
          id,
          error: `Font sources are already registered under reference (${fontSourcesReference})`
        })
        return
      }
      self['__UNILANG_FONT_SOURCES_STORAGE__'][fontSourcesReference] = supportedFontSources
      self.postMessage({ id, 'status': 'ok' })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      self.postMessage({
        id,
        error: errorMessage
      })
    }
  },
  'glyph.trace': async (event) => {
    const id = event.data.id
    if (!id) {
      self.postMessage({
        id,
        error: 'No id provided'
      })
      return
    }
    const fontSourcesReference = event.data.fontSourcesReference
    if (!fontSourcesReference) {
      self.postMessage({
        id,
        error: 'No fontSourcesReference provided'
      })
      return
    }
    if (!self['__UNILANG_FONT_SOURCES_STORAGE__'][fontSourcesReference]) {
      self.postMessage({
        id,
        error: `Font sources cannot be found by reference (${fontSourcesReference})`
      })
      return
    }
    const characters = event.data.characters
    if (!characters) {
      self.postMessage({
        id,
        error: 'No characters provided'
      })
      return
    }
    const supportedFontSources = self['__UNILANG_FONT_SOURCES_STORAGE__'][fontSourcesReference]
    const musicFontName = event.data.musicFontName
    const musicFontSource = supportedFontSources['music'][musicFontName]
    if (!musicFontSource) {
      self.postMessage({
        id,
        error: `Music font (${musicFontName}) is not registered under reference (${fontSourcesReference})`
      })
      return
    }

    try {
      const missingCharacters = [ ...characters ].filter(
        (character) => musicFontSource.charToGlyphIndex(character) === 0
      )
      if (missingCharacters.length) {
        self.postMessage({ status: 'ok', id, missingCharacters, points: [] })
        return
      }

      const points = generateUnicodePoints(
        characters,
        musicFontSource,
        null,
        event.data.musicFontSourceSize,
        event.data.intervalBetweenStaveLines
      )
      self.postMessage({ status: 'ok', id, missingCharacters, points })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      self.postMessage({
        id,
        error: errorMessage
      })
    }
  },
  'svg.generate': async (event) => {
    const id = event.data.id
    if (!self['__UNILANG_FONT_SOURCES_STORAGE__']) {
      self.postMessage({
        id,
        error: 'Fonts are not configured, please declare <template is="msq-font-loader"> first'
      })
      return
    }
    if (!id) {
      self.postMessage({
        id,
        error: 'No id provided'
      })
      return
    }
    const fontSourcesReference = event.data.fontSourcesReference
    if (!fontSourcesReference) {
      self.postMessage({
        id,
        error: 'No fontSourcesReference provided'
      })
      return
    }
    if (!self['__UNILANG_FONT_SOURCES_STORAGE__'][fontSourcesReference]) {
      self.postMessage({
        id,
        error: `Font sources cannot be found by reference (${fontSourcesReference})`
      })
      return
    }
    const supportedFontSources = self['__UNILANG_FONT_SOURCES_STORAGE__'][fontSourcesReference]
    const supportedFontNames = {
      'chord-letters': Object.keys(supportedFontSources['chord-letters']),
      'music': Object.keys(supportedFontSources['music']),
      'text': [
        ...new Set([
          ...Object.keys(supportedFontSources['text']['regular']),
          ...Object.keys(supportedFontSources['text']['bold'])
        ])
      ]
    }
    const inputText = event.data.inputText
    if (!inputText) {
      self.postMessage({
        id,
        error: 'No inputText provided'
      })
      return
    }
    const {
      pageSchema,
      errors,
      customStyles
    } = generateIntermediateStructuresForSinglePage({
      pageText: inputText,
      applyHighlighting: false,
      applyOnlyHighlightingWithoutRefIds: false,
      supportedFontNames
    })
    if (!isPageSchemaValid(pageSchema)) {
      self.postMessage({
        id,
        error: 'Page schema is not valid'
      })
      return
    }
    const pageStyles = generateStylesForSinglePage({
      customStyles,
      supportedFontSources
    })
    const svg = generateSvgForSinglePage({
      pageSchema,
      pageStyles
    })
    const svgDataSrc = `data:image/svg+xml;base64,${base64FromUint8(new TextEncoder().encode(svg))}`
    self.postMessage({
      status: 'ok',
      id,
      svg,
      svgDataSrc,
      errors
    })
    return
  },
  'midi.generate': async (event) => {
    const id = event.data.id
    if (!id) {
      self.postMessage({
        id,
        error: 'No id provided'
      })
      return
    }
    const inputText = event.data.inputText
    if (!inputText) {
      self.postMessage({
        id,
        error: 'No inputText provided'
      })
      return
    }
    const {
      pageSchema,
      errors,
      midiSettings
    } = generateIntermediateStructuresForSinglePage({
      pageText: inputText,
      applyHighlighting: false,
      applyOnlyHighlightingWithoutRefIds: false
    })
    if (!isPageSchemaValid(pageSchema)) {
      self.postMessage({
        id,
        error: 'Page schema is not valid'
      })
      return
    }
    const midi = generateMidiForSinglePage({
      pageSchema,
      midiSettings
    })
    const midiDataSrc = `data:audio/mpeg;base64,${base64FromUint8(midi.data)}`
    self.postMessage({
      status: 'ok',
      id,
      midiDataSrc,
      errors
    })
    return
  },
  'svg.midi.generate': (event) => {
    const id = event.data.id
    if (!self['__UNILANG_FONT_SOURCES_STORAGE__']) {
      self.postMessage({
        id,
        error: 'Fonts are not configured, please declare <template is="msq-font-loader"> first'
      })
      return
    }
    if (!id) {
      self.postMessage({
        id,
        error: 'No id provided'
      })
      return
    }
    const fontSourcesReference = event.data.fontSourcesReference
    if (!fontSourcesReference) {
      self.postMessage({
        id,
        error: 'No fontSourcesReference provided'
      })
      return
    }
    if (!self['__UNILANG_FONT_SOURCES_STORAGE__'][fontSourcesReference]) {
      self.postMessage({
        id,
        error: `Font sources cannot be found by reference (${fontSourcesReference})`
      })
      return
    }
    const supportedFontSources = self['__UNILANG_FONT_SOURCES_STORAGE__'][fontSourcesReference]
    const supportedFontNames = {
      'chord-letters': Object.keys(supportedFontSources['chord-letters']),
      'music': Object.keys(supportedFontSources['music']),
      'text': [
        ...new Set([
          ...Object.keys(supportedFontSources['text']['regular']),
          ...Object.keys(supportedFontSources['text']['bold'])
        ])
      ]
    }
    const inputText = event.data.inputText
    if (!inputText) {
      self.postMessage({
        id,
        error: 'No inputText provided'
      })
      return
    }
    const {
      pageSchema,
      errors,
      customStyles,
      midiSettings
    } = generateIntermediateStructuresForSinglePage({
      pageText: inputText,
      applyHighlighting: true,
      applyOnlyHighlightingWithoutRefIds: false,
      supportedFontNames
    })
    if (!isPageSchemaValid(pageSchema)) {
      self.postMessage({
        id,
        error: 'Page schema is not valid'
      })
      return
    }
    const pageStyles = generateStylesForSinglePage({
      customStyles,
      supportedFontSources
    })
    const svg = generateSvgForSinglePage({
      pageSchema,
      pageStyles
    })
    const svgDataSrc = `data:image/svg+xml;base64,${base64FromUint8(new TextEncoder().encode(svg))}`

    // TODO: this should be already in page schema somehow already
    if (pageSchema && pageSchema.measuresParams) {
      pageSchema.measuresParams.forEach((measureParams, measureIndex) => {
        measureParams.pageIndex = 0
        measureParams.measureIndexOnPage = measureIndex
      })
    }
    const midi = generateMidiForSinglePage({
      pageSchema,
      midiSettings
    })
    const midiDataSrc = `data:audio/mpeg;base64,${base64FromUint8(midi.data)}`
    const timeStampsMappedWithRefsOn = midi.timeStampsMappedWithRefsOn
    const refsOnMappedWithTimeStamps = midi.refsOnMappedWithTimeStamps
    self.postMessage({
      status: 'ok',
      id,
      svg,
      svgDataSrc,
      midiDataSrc,
      timeStampsMappedWithRefsOn,
      refsOnMappedWithTimeStamps,
      customStyles,
      errors
    })
    return
  },
  'svg.midi.text.generate': (event) => {
    const id = event.data.id
    if (!self['__UNILANG_FONT_SOURCES_STORAGE__']) {
      self.postMessage({
        id,
        error: 'Fonts are not configured, please declare <template is="msq-font-loader"> first'
      })
      return
    }
    if (!id) {
      self.postMessage({
        id,
        error: 'No id provided'
      })
      return
    }
    const fontSourcesReference = event.data.fontSourcesReference
    if (!fontSourcesReference) {
      self.postMessage({
        id,
        error: 'No fontSourcesReference provided'
      })
      return
    }
    if (!self['__UNILANG_FONT_SOURCES_STORAGE__'][fontSourcesReference]) {
      self.postMessage({
        id,
        error: `Font sources cannot be found by reference (${fontSourcesReference})`
      })
      return
    }
    const supportedFontSources = self['__UNILANG_FONT_SOURCES_STORAGE__'][fontSourcesReference]
    const supportedFontNames = {
      'chord-letters': Object.keys(supportedFontSources['chord-letters']),
      'music': Object.keys(supportedFontSources['music']),
      'text': [
        ...new Set([
          ...Object.keys(supportedFontSources['text']['regular']),
          ...Object.keys(supportedFontSources['text']['bold'])
        ])
      ]
    }
    const inputText = event.data.inputText
    if (!inputText) {
      self.postMessage({
        id,
        error: 'No inputText provided'
      })
      return
    }
    const {
      pageSchema,
      errors,
      customStyles,
      midiSettings,
      highlightsHtmlBuffer
    } = generateIntermediateStructuresForSinglePage({
      pageText: inputText,
      applyHighlighting: true,
      applyOnlyHighlightingWithoutRefIds: false,
      supportedFontNames
    })
    if (!isPageSchemaValid(pageSchema)) {
      self.postMessage({
        id,
        error: 'Page schema is not valid'
      })
      return
    }
    const pageStyles = generateStylesForSinglePage({
      customStyles,
      supportedFontSources
    })
    const svg = generateSvgForSinglePage({
      pageSchema,
      pageStyles
    })
    const svgDataSrc = `data:image/svg+xml;base64,${base64FromUint8(new TextEncoder().encode(svg))}`

    // TODO: this should be already in page schema somehow already
    if (pageSchema && pageSchema.measuresParams) {
      pageSchema.measuresParams.forEach((measureParams, measureIndex) => {
        measureParams.pageIndex = 0
        measureParams.measureIndexOnPage = measureIndex
      })
    }
    const midi = generateMidiForSinglePage({
      pageSchema,
      midiSettings
    })
    const midiDataSrc = `data:audio/mpeg;base64,${base64FromUint8(midi.data)}`
    const timeStampsMappedWithRefsOn = midi.timeStampsMappedWithRefsOn
    const refsOnMappedWithTimeStamps = midi.refsOnMappedWithTimeStamps
    self.postMessage({
      status: 'ok',
      id,
      svg,
      svgDataSrc,
      midiDataSrc,
      timeStampsMappedWithRefsOn,
      refsOnMappedWithTimeStamps,
      customStyles,
      highlightsHtmlBuffer,
      errors
    })
    return
  }
}

self.onmessage = async (event) => {
  const name = event.data.name
  if (!name || !eventHandlers[name]) {
    throw new Error('event must have a name and it must be supported')
  }
  await eventHandlers[name](event)
}
