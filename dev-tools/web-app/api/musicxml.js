/**
 * Converting between MusicXML and a MuSemantiQ page, and drawing the result.
 *
 * The converting is pure and could happen in the page, but the drawing cannot —
 * engraving needs the fonts, which live on disk. Doing both here keeps the tool
 * to one request per conversion and means what you look at is what the renderer
 * actually produced, not an approximation of it.
 */

import endpoint from '#dev-nodes/endpoint.js'
import body from '#dev-nodes/body.js'

import fromMusicXml from '#tools/musicxml/fromMusicXml.js'
import toMusicXml from '#tools/musicxml/toMusicXml.js'
import serialize from '#msq/language/serializer/serialize.js'
import {
  setupFonts,
  generateIntermediateStructuresForMultiplePages,
  areAllPageSchemasValid,
  generateStylesForMultiplePages,
  generateSvgForMultiplePages
} from '#msq/api.js'

import { respondWith } from './shared.js'

/*
The fonts are read once and kept. `setupFonts` reads several files and parses
them, which is far too slow to do per keystroke.
*/
let fonts = null
async function loadedFonts() {
  if (!fonts) {
    const sources = await setupFonts()
    fonts = {
      sources,
      names: {
        'chord-letters': Object.keys(sources['chord-letters']),
        'music': Object.keys(sources['music']),
        'text': [ ...new Set([
          ...Object.keys(sources['text']['regular']),
          ...Object.keys(sources['text']['bold'])
        ]) ]
      }
    }
  }
  return fonts
}

/**
 * Engrave a page, so a conversion can be judged by looking at it.
 */
async function drawn(pageSchema, customStyles) {
  const { sources } = await loadedFonts()
  const pageStylesForEachPage = generateStylesForMultiplePages({
    customStylesForEachPage: [ customStyles || {} ],
    supportedFontSources: sources
  })
  return generateSvgForMultiplePages({
    pageSchemaForEachPage: [ pageSchema ],
    pageStylesForEachPage
  })
}

const readRequest = async (stream) =>
  JSON.parse((await body(stream, { maxSize: 16 })).toString('utf-8'))

/**
 * MusicXML in: the page it becomes, drawn, and what could not be carried over.
 */
const importing = endpoint('/dev/musicxml/import', 'POST', async ({ stream }) => {
  let request
  try {
    request = await readRequest(stream)
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }
  if (typeof request.xml !== 'string' || !request.xml.trim()) {
    return respondWith(stream, 400, { error: 'Expected { xml }' })
  }

  let converted
  try {
    converted = fromMusicXml(request.xml)
  } catch (error) {
    return respondWith(stream, 200, { error: `That is not a score this can read: ${error.message}` })
  }

  const valid = areAllPageSchemasValid([ converted.pageSchema ])
  let svg = null
  let drawingError = null
  if (valid) {
    try {
      svg = await drawn(converted.pageSchema, converted.customStyles)
    } catch (error) {
      drawingError = error.message
    }
  }

  /*
  The same page written back as MSQ.

  An imported score is far easier to judge as the language than as a tree of
  JSON — and it is the form you would actually keep, so the tool hands it over
  rather than leaving you to run the serializer yourself.
  */
  let msq = null
  let msqError = null
  try {
    msq = serialize(
      converted.pageSchema, converted.customStyles, converted.midiSettings, []
    )
  } catch (error) {
    msqError = error.message
  }

  respondWith(stream, 200, {
    pageSchema: converted.pageSchema,
    customStyles: converted.customStyles,
    midiSettings: converted.midiSettings,
    report: converted.report,
    valid,
    svg,
    drawingError,
    msq,
    msqError
  })
})

/**
 * A page out: as MusicXML, and drawn, so the two can be compared side by side.
 *
 * The page may be given outright or written as MSQ, which is what makes the
 * tool usable without hand-writing a page schema.
 */
const exporting = endpoint('/dev/musicxml/export', 'POST', async ({ stream }) => {
  let request
  try {
    request = await readRequest(stream)
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }

  let pageSchema = request.pageSchema
  let customStyles = request.customStyles || {}
  let midiSettings = request.midiSettings || {}
  let errors = []

  if (!pageSchema) {
    if (typeof request.msq !== 'string' || !request.msq.trim()) {
      return respondWith(stream, 400, { error: 'Expected { pageSchema } or { msq }' })
    }
    const { names } = await loadedFonts()
    const parsed = generateIntermediateStructuresForMultiplePages({
      multiplePagesText: request.msq.split('====next page===='),
      supportedFontNames: names
    })
    pageSchema = parsed.pageSchemaForEachPage[0]
    customStyles = parsed.customStylesForEachPage[0] || {}
    midiSettings = parsed.midiSettingsForEachPage[0] || {}
    errors = parsed.errorsForEachPage.flat()
  }

  let xml
  let exportReport = null
  try {
    const written = toMusicXml({ pageSchema, customStyles, midiSettings })
    xml = written.xml
    exportReport = written.report
  } catch (error) {
    return respondWith(stream, 200, { error: `Could not write it out: ${error.message}` })
  }

  /*
  The page is drawn from what was handed over, and read back from what was
  written, so the tool can show the two engravings beside each other — which is
  the only check that says whether the conversion kept the music.
  */
  let svg = null
  let backSvg = null
  let drawingError = null
  try {
    svg = await drawn(pageSchema, customStyles)
    const back = fromMusicXml(xml)
    if (areAllPageSchemasValid([ back.pageSchema ])) {
      backSvg = await drawn(back.pageSchema, back.customStyles)
    }
  } catch (error) {
    drawingError = error.message
  }

  respondWith(stream, 200, {
    xml, pageSchema, customStyles, midiSettings, errors, svg, backSvg, drawingError,
    report: exportReport
  })
})

export default [ importing, exporting ]
