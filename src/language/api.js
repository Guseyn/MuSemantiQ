import parsedLanguage from '#msq/language/parser/parsedLanguage.js'

const NEW_LINE = '\n'

/**
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *               2. generateIntermediateStructuresForSinglePage
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 * /
/**
 * High-level convenience wrapper around the low-level `parsedLanguage()` engine.
 * It prepares the MuSemantiQ text, invokes the parser with correct defaults, and
 * extracts only the per-page rendering-related intermediate structures needed
 * by the drawer (SVG renderer), highlighting engine, and MIDI generator.
 *
 * This function is intentionally minimal: it does **not** produce SVG or MIDI.
 * Instead, it returns the *intermediate page IR*, which downstream components
 * (drawer, styles, MIDI engine, tests) can consume.
 *
 * ---------------------------------------------------------------------------
 * @async
 * @function generateIntermediateStructuresForSinglePage
 *
 * @param {Object} params
 * @param {string} params.pageText
 *        MuSemantiQ text for a single page. Multi-page inputs must already be
 *        split before calling this function.
 *
 * @param {boolean} [params.applyHighlighting=true]
 *        Controls whether highlighting instructions should be produced.
 *
 *        - `true`: highlighting is enabled
 *        - `false`: no highlighting logic is executed; the raw text is returned
 *                   as a single highlight block
 *
 * @param {boolean} [params.applyOnlyHighlightingWithoutRefIds=false]
 *        Enables “highlight-only mode” from inside `parsedLanguage()`:
 *
 *        - only `actionOnlyForHighlightingWithoutRefIds` of scenarios are run
 *        - NO reference IDs
 *        - NO pageSchema modifications
 *        - NO MIDI settings
 *        - NO command progression effects
 *
 *        This is perfect for editors or live preview UIs that want markup
 *        but not engraving/musical semantics.
 *
 * @param {Array<string>} [params.progressionOfCommandsFromScenarios=[]]
 *        Optional scenario progression seed.
 *
 *        This is normally left empty. It is primarily used by:
 *          - multi-page audio/visual tests
 *          - very advanced internal tooling
 *
 * @param {Object} [params.supportedFontNames]
 *        A stable list of supported font family names that `parsedLanguage()`
 *        attaches to `parserState.pageSchema.fonts`.
 *
 *        These are *names*, not loaded font sources.
 *
 *        Defaults match audio test expectations:
 *
 *        {
 *          'chord-letters': ['gentium plus', 'gothic a1'],
 *          'music': ['bravura', 'leland'],
 *          'text': ['noto-sans', 'noto-serif']
 *        }
 *
 *        Actual font loading is handled separately:
 *             setupFonts() → generatedStyles() → page() renderer
 *
 * ---------------------------------------------------------------------------
 * @returns {GeneratePageModelsResult}
 *
 * Returns an object containing the **intermediate representation (IR)** for
 * a fully parsed MuSemantiQ page:
 *
 *   {
 *     pageSchema,           // engraving layout model
 *     highlightsHtmlBuffer, // highlighting fragments
 *     errors,               // parser/semantic errors
 *     customStyles,         // page-level style overrides
 *     midiSettings          // MuSemantiQ musical semantics
 *   }
 *
 * ---------------------------------------------------------------------------
 * @typedef {Object} GeneratePageModelsResult
 *
 * @property {Object} pageSchema
 *          The rendering/engraving model built by parsedLanguage:
 *            - measure & stave geometry
 *            - symbols, durations, directions
 *            - key/time signatures
 *            - connections, slurs, tuplets
 *            - positioning indexes
 *
 *          This structure is consumed by drawer/pages/page.js to produce SVG.
 *
 * @property {string[]} highlightsHtmlBuffer
 *          An array of HTML-safe fragments used for editor/highlighting layers.
 *          Must usually be `.join('')` before inserting.
 *
 * @property {Object[]} errors
 *          Structural, parsing, or semantic errors encountered while parsing.
 *          The pipeline is fault-tolerant: errors do not abort parsing.
 *
 * @property {Object} customStyles
 *          Any inline styling commands encountered in MuSemantiQ that override
 *          engraving parameters, spacing, fonts, color, etc. These feed into
 *          generatedStyles().
 *
 * @property {Object} midiSettings
 *          All musical-performance metadata extracted from MuSemantiQ commands:
 *            - tempo, pedal, dynamics
 *            - slurs, tuplets
 *            - staccato, accents
 *            - per-voice parameters
 *          These feed directly into the MIDI engine.
 *
 * ---------------------------------------------------------------------------
 * @description
 *
 * ### What generateIntermediateStructuresForSinglePage() actually does
 * 1. Normalizes trailing newline behavior (required by parser mechanics).
 * 2. Passes configuration flags directly into parsedLanguage().
 * 3. Returns only the subset of the parsed output needed for:
 *      - SVG generation
 *      - highlight overlays
 *      - test comparisons
 *      - MIDI generation
 *
 * ### What is *not* done here
 *  - No SVG rendering
 *  - No MIDI file generation
 *  - No font loading
 *  - No multi-page splitting
 *
 * ### Why this exists
 * It provides a clean public API that hides the dozens of parser state fields,
 * command-progression internals, tokenizer behavior, and scenario engine
 * complexity inside parsedLanguage().
 *
 * What you get is the **stable, simplified IR** for one page.
 *
 * ---------------------------------------------------------------------------
 */
export function generateIntermediateStructuresForSinglePage({
  pageText,
  applyHighlighting,
  applyOnlyHighlightingWithoutRefIds,
  progressionOfCommandsFromScenarios,
  supportedFontNames
}) {
  const {
    pageSchema,
    highlightsHtmlBuffer,
    errors,
    customStyles,
    mapOfCharIndexesWithProgressionOfCommandsFromScenarios,
    comments,
    midiSettings
  } = parsedLanguage(
    normalizeMuSemantiQText(
      pageText
    ),
    progressionOfCommandsFromScenarios || [],
    applyHighlighting || true,
    applyOnlyHighlightingWithoutRefIds || false,
    supportedFontNames || {
      'chord-letters': ['gentium plus', 'gothic a1'],
      'music': ['bravura', 'leland'],
      'text': ['noto-sans', 'noto-serif']
    }
  )
  return {
    pageSchema,
    highlightsHtmlBuffer,
    errors,
    customStyles,
    mapOfCharIndexesWithProgressionOfCommandsFromScenarios,
    comments,
    midiSettings
  }
} 

/**
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *              6. generateIntermediateStructuresForMultiplePages
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 */
/**
 * High-level wrapper for **multi-page MuSemantiQ inputs**.
 *
 * This function iterates over already-split MuSemantiQ page texts and delegates
 * the actual parsing work to `generateIntermediateStructuresForSinglePage()` for each page, while
 * collecting and grouping results **per page**.
 *
 * It provides a stable, page-aligned API for consumers that operate on
 * *documents* rather than individual pages:
 *   - multi-page SVG rendering
 *   - paginated editors / viewers
 *   - multi-page MIDI pipelines
 *   - snapshot-based visual & audio tests
 *
 * ---------------------------------------------------------------------------
 * @async
 * @function generateIntermediateStructuresForMultiplePages
 *
 * @param {Object} params
 *
 * @param {Array<string>} params.multiplePagesText
 *        An array of MuSemantiQ page texts.
 *
 *        Important:
 *        - Page splitting must be done **before** calling this function.
 *        - Each array entry is treated as a fully independent page.
 *
 * @param {boolean} [params.applyHighlighting=true]
 *        Enables or disables highlighting generation for **all pages**.
 *        Passed through verbatim to `generateIntermediateStructuresForSinglePage()`.
 *
 * @param {boolean} [params.applyOnlyHighlightingWithoutRefIds=false]
 *        Enables parser “highlight-only mode” for **all pages**:
 *
 *        - no reference IDs
 *        - no pageSchema mutations
 *        - no MIDI semantics
 *        - no command progression effects
 *
 *        Intended for editors, inspectors, and fast preview pipelines.
 *
 * @param {Array<string>} [params.progressionOfCommandsFromScenarios=[]]
 *        Optional shared scenario command progression seed.
 *
 *        This progression is reused across pages and allows:
 *          - cross-page scenario continuity
 *          - deterministic multi-page test runs
 *
 * @param {Object} [params.supportedFontNames]
 *        Same meaning as in `generateIntermediateStructuresForSinglePage()`.
 *        Applied consistently to every page.
 *
 * ---------------------------------------------------------------------------
 * @returns {GenerateMultiplePagesModelsResult}
 *
 * Returns an object where **each field is an array**, indexed by page number:
 *
 *   {
 *     pageSchemaForEachPage,
 *     htmlHighlightsForEachPage,
 *     errorsForEachPage,
 *     customStylesForEachPage,
 *     mapOfCharIndexesWithProgressionOfCommandsFromScenariosForEachPage,
 *     commentsForEachPage,
 *     midiSettingsForEachPage,
 *   }
 *
 * ---------------------------------------------------------------------------
 * @typedef {Object} GenerateMultiplePagesModelsResult
 *
 * @property {Object[]} pageSchemaForEachPage
 *          One `pageSchema` per page, preserving original order.
 *
 * @property {string[][]} htmlHighlightsForEachPage
 *          Highlight HTML buffers per page.
 *          Each entry mirrors `highlightsHtmlBuffer` from
 *          `generateIntermediateStructuresForSinglePage()`.
 *
 * @property {Object[][]} errorsForEachPage
 *          Parser and semantic errors grouped by page.
 *
 * @property {Object[]} customStylesForEachPage
 *          Page-level custom style overrides per page.
 *
 * @property {Object[]} midiSettingsForEachPage
 *          MIDI semantics per page, suitable for:
 *            - page-isolated MIDI export
 *            - later cross-page MIDI stitching
 *
 * ---------------------------------------------------------------------------
 * @description
 *
 * ### What generateIntermediateStructuresForMultiplePages() actually does
 * 1. Iterates over pre-split MuSemantiQ page texts.
 * 2. Normalizes each page’s text independently.
 * 3. Calls `generateIntermediateStructuresForSinglePage()` for every page.
 * 4. Adds properties like pageIndex and measureIndexOnPage to each measure on page
 * 5. Collects results into page-aligned arrays.
 *
 * ### What is *not* done here
 *  - No page splitting logic
 *  - No SVG rendering
 *  - No MIDI file generation
 *  - No cross-page layout merging
 *
 * ### Why this exists
 * It provides a **document-level API** while keeping
 * `generateIntermediateStructuresForSinglePage()` clean, focused, and single-responsibility.
 *
 * ---------------------------------------------------------------------------
 */
export function generateIntermediateStructuresForMultiplePages({
  multiplePagesText,
  applyHighlighting,
  applyOnlyHighlightingWithoutRefIds,
  progressionOfCommandsFromScenarios,
  supportedFontNames
}) {
  const pageSchemaForEachPage = []
  const htmlHighlightsForEachPage = []
  const errorsForEachPage = []
  const customStylesForEachPage = []
  const midiSettingsForEachPage = []
  const mapOfCharIndexesWithProgressionOfCommandsFromScenariosForEachPage = []
  const commentsForEachPage = []

  multiplePagesText.forEach((textForCurrentPage, pageIndex) => {
    const thisIsLastPage = pageIndex === multiplePagesText.length - 1

    const {
      pageSchema,
      highlightsHtmlBuffer,
      errors,
      customStyles,
      mapOfCharIndexesWithProgressionOfCommandsFromScenarios,
      comments,
      midiSettings
    } = generateIntermediateStructuresForSinglePage({
      pageText: textForCurrentPage,
      applyHighlighting,
      applyOnlyHighlightingWithoutRefIds,
      progressionOfCommandsFromScenarios,
      supportedFontNames
    })

    if (pageSchema.measuresParams) {
      pageSchema.measuresParams.forEach((measureParams, measureIndex) => {
        measureParams.pageIndex = pageIndex
        measureParams.measureIndexOnPage = measureIndex
      })
    }

    pageSchemaForEachPage.push(pageSchema)
    htmlHighlightsForEachPage.push(highlightsHtmlBuffer)
    errorsForEachPage.push(errors)
    customStylesForEachPage.push(customStyles)
    midiSettingsForEachPage.push(midiSettings)
    mapOfCharIndexesWithProgressionOfCommandsFromScenariosForEachPage.push(mapOfCharIndexesWithProgressionOfCommandsFromScenarios)
    commentsForEachPage.push(comments)
  })

  return {
    pageSchemaForEachPage,
    htmlHighlightsForEachPage,
    errorsForEachPage,
    customStylesForEachPage,
    mapOfCharIndexesWithProgressionOfCommandsFromScenariosForEachPage,
    commentsForEachPage,
    midiSettingsForEachPage
  }
}

// ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
//               HELPERS
// ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆

function normalizeMuSemantiQText(repertoireText) {
  if (repertoireText[repertoireText.length - 1] === NEW_LINE) {
    repertoireText += NEW_LINE
  }
  return repertoireText
}
