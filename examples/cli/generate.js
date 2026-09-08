/**
 * The whole MuSemantiQ pipeline, in one place. Both the interactive flow and
 * the flag mode call only this, so there is exactly one description of how
 * output gets made.
 */
import {
  generateIntermediateStructuresForMultiplePages,
  generateStylesForMultiplePages,
  generateSvgForSinglePage,
  generateMidiForMultiplePages
} from '#msq/api.js'
import { loadFontSources, fontNamesFromSources, fontNamesFromConfig, defaultFontConfig } from './fonts.js'
import { planOutputs, resolveDestination, writeOutputs } from './output.js'
import { DEFAULT_PAGE_DELIMITER } from './input.js'
import { countErrors } from './report.js'

/**
 * @param {Object} params
 * @param {string[]} params.pages          page texts, already split and non-blank
 * @param {string} params.name             basename for generated files
 * @param {string[]} [params.pageNames]    per-page basenames when pages came from files
 * @param {{svg: boolean, midi: boolean, pageSchema: boolean, highlights: boolean}} params.formats
 * @param {Object} [params.fontConfig]     a user config, or nothing for the built-in one
 * @param {string} [params.outPath]
 * @param {string} [params.pageDelimiter]
 * @returns {Promise<{writtenPaths: string[], errorsForEachPage: Array<string[]>, errorCount: number}>}
 */
export default async function generate({
  pages,
  name,
  pageNames,
  formats,
  fontConfig,
  outPath,
  pageDelimiter = DEFAULT_PAGE_DELIMITER
}) {
  /*
   * Engraving needs the actual glyph outlines. Playback does not — it never
   * consults a font — so a MIDI-only run skips loading several megabytes of
   * OpenType data and glyph tables, and takes the font *names* from the config
   * instead. That mirrors the browser, where the MIDI element needs no fonts.
   */
  const needsGlyphs = formats.svg || formats.pageSchema
  let supportedFontSources = null
  let supportedFontNames

  if (needsGlyphs) {
    supportedFontSources = await loadFontSources(fontConfig)
    supportedFontNames = fontNamesFromSources(supportedFontSources)
  } else {
    supportedFontNames = fontNamesFromConfig({ ...defaultFontConfig(), ...(fontConfig || {}) })
  }

  /*
   * The multi-page entry point is used even for a single page. Besides handling
   * both cases identically, it stamps each measure with its page index and
   * position, which the MIDI stage needs to build reference ids; the
   * single-page path leaves that to the caller.
   */
  const intermediate = generateIntermediateStructuresForMultiplePages({
    multiplePagesText: pages,
    supportedFontNames
  })

  const {
    pageSchemaForEachPage,
    customStylesForEachPage,
    midiSettingsForEachPage,
    htmlHighlightsForEachPage,
    errorsForEachPage
  } = intermediate

  const planned = planOutputs({
    name,
    pageCount: pages.length,
    pageNames,
    formats
  })
  const { directory, fileNameOverride } = await resolveDestination(outPath, planned.length)

  let pageStylesForEachPage = null
  if (needsGlyphs) {
    pageStylesForEachPage = generateStylesForMultiplePages({
      customStylesForEachPage,
      supportedFontSources
    })
  }

  const files = planned.map((file) => {
    const fileName = fileNameOverride || file.fileName
    switch (file.kind) {
      case 'svg':
        /*
         * One SVG per page, rendered individually. The multi-page renderer
         * stacks every page into a single image instead, which is not what is
         * wanted here, and the API offers no "one image per page" call.
         */
        return {
          fileName,
          content: generateSvgForSinglePage({
            pageSchema: pageSchemaForEachPage[file.pageIndex],
            pageStyles: pageStylesForEachPage[file.pageIndex]
          })
        }
      case 'midi':
        /* One continuous performance across every page. */
        return {
          fileName,
          content: generateMidiForMultiplePages({
            pageSchemaForEachPage,
            midiSettingsForEachPage
          }).data
        }
      case 'page-schema':
        return { fileName, content: JSON.stringify(pageSchemaForEachPage, null, 2) }
      case 'highlights':
        return {
          fileName,
          content: htmlHighlightsForEachPage
            .map((page) => page.join(''))
            .join(`\n${pageDelimiter}\n`)
        }
      default:
        throw new Error(`unknown output kind "${file.kind}"`)
    }
  })

  const writtenPaths = await writeOutputs({ directory, files })

  return {
    writtenPaths,
    errorsForEachPage,
    errorCount: countErrors(errorsForEachPage),
    destination: directory
  }
}
