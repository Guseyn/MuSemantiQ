import opentype from '#msq/drawer/lib/opentype/opentype.js'
import parsedLanguage from '#msq/language/parser/parsedLanguage.js'
import validatedPageSchema from '#msq/language/schema/validatedPageSchema.js'
import generatedStyles from '#msq/drawer/generatedStyles.js'
import svgAsString from '#msq/drawer/elements/basic/svgAsString.js'
import svg from '#msq/drawer/elements/basic/svg.js'
import page from '#msq/drawer/elements/page/page.js'
import midi from '#msq/midi/midi.js'

const NEW_LINE = '\n'

/**
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *                1. setupFonts
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 * /
/**
 *
 * Load and initialize fonts for MuSemantiQ (music, text, and chord-letter fonts),
 * suitable both for **Node.js** and **browser** environments.
 *
 * This function guarantees:
 * - deterministic load order
 * - reproducibility across environments
 * - loads fonts for future consistent SVG & MIDI rendering
 *
 * -----------------------------------------------------------------------------------------------
 * @function setupFonts
 * @async
 * @param {Object} fontConfig
 *        User-provided font configuration. Required in browser, optional in Node.
 *
 * -----------------------------------------------------------------------------------------------
 * @overview ENVIRONMENT BEHAVIOR
 * -----------------------------------------------------------------------------------------------
 * **Node.js**
 * - Local filesystem paths are supported.
 * - Default font paths are automatically included.
 * - User `fontConfig` may override the defaults.
 *
 * **Browser**
 * - Local paths (./src/...) do NOT work.
 * - User MUST provide full URLs for every font.
 * - Default Node paths are completely ignored.
 * - JS glyph schemas must be valid ESM modules.
 *
 * -----------------------------------------------------------------------------------------------
 * @typedef {Object} FontConfig
 * @property {Object.<string,string>} chord-letters
 *        Map: fontName → path/URL to `.ttf` font.
 *
 * @property {Object.<string,TextFontEntry>} text
 *        Map: fontFamily → { regular, bold } paths.
 *
 * @property {Object.<string,MusicFontEntry>} music
 *        Map: musicFont → { font, js } where `js` is an ESM module path.
 *
 * -----------------------------------------------------------------------------------------------
 * @typedef {Object} TextFontEntry
 * @property {string} regular  Path/URL to regular `.ttf`.
 * @property {string} bold     Path/URL to bold `.ttf`.
 *
 * -----------------------------------------------------------------------------------------------
 * @typedef {Object} MusicFontEntry
 * @property {string} font  Path/URL to `.otf` SMuFL music font.
 * @property {string} js    Path/URL to music JS schema (ESM).
 *
 * -----------------------------------------------------------------------------------------------
 * @example Node.js fontConfig
 * {
 *   "chord-letters": {
 *     "gentium plus": "./src/drawer/font/chord-letters/GentiumPlus-Regular.ttf",
 *     "gothic a1":    "./src/drawer/font/chord-letters/GothicA1-Regular.ttf"
 *   },
 *   "text": {
 *     "noto-serif": {
 *       "regular": "./src/drawer/font/text/NotoSerif-Regular.ttf",
 *       "bold":    "./src/drawer/font/text/NotoSerif-Bold.ttf"
 *     }
 *   },
 *   "music": {
 *     "bravura": {
 *       "font": "./src/drawer/font/music/Bravura.otf",
 *       "js":   "#msq/drawer/font/music-js/bravura.js"
 *     },
 *     "leland": {
 *       "font": "./src/drawer/font/music/Leland.otf",
 *       "js":   "#msq/drawer/font/music-js/leland.js"
 *     }
 *   }
 * }
 *
 * -----------------------------------------------------------------------------------------------
 * @example Browser fontConfig
 * {
 *   "chord-letters": {
 *     "gentium plus": "https://cdn.example.com/fonts/GentiumPlus-Regular.ttf"
 *   },
 *   "text": {
 *     "noto-serif": {
 *       "regular": "https://cdn.example.com/fonts/NotoSerif-Regular.ttf",
 *       "bold":    "https://cdn.example.com/fonts/NotoSerif-Bold.ttf"
 *     }
 *   },
 *   "music": {
 *     "bravura": {
 *       "font": "https://example.com/music/Bravura.otf",
 *       "js":   "#msq/drawer/font/music-js/bravura.js"
 *     }
 *     "leland": {
 *       "font": "https://example.com/music/Leland.otf",
 *       "js":   "#msq/drawer/font/music-js/leland.js"
 *     }
 *   }
 * }
 *
 * -----------------------------------------------------------------------------------------------
 * @returns {Promise<SupportedFonts>}
 * A fully resolved, deterministic font structure used by the MuSemantiQ renderer.
 *
 * -----------------------------------------------------------------------------------------------
 * @typedef {Object} SupportedFonts
 * @property {Object.<string,OpentypeFont>} chord-letters
 * @property {Object} text
 * @property {Object.<string,OpentypeFont>} text.regular
 * @property {Object.<string,OpentypeFont>} text.bold
 * @property {Object.<string,OpentypeFont>} music
 * @property {Object.<string,Object>} music-js Parsed JS glyph schema modules
 *
 * -----------------------------------------------------------------------------------------------
 * @description
 * Loading order is strictly enforced:
 *
 * 1. chord-letter fonts
 * 2. text regular fonts
 * 3. text bold fonts
 * 4. music fonts (OpenType)
 * 5. music JS schemas
 *
 * This ensures:
 * - stable font indexing
 * - reproducible SVG/MIDI output
 * - deterministic hash-based tests across environments
 *
 * -----------------------------------------------------------------------------------------------
 */
export async function setupFonts(fontConfig) {

  /*
  --------------------------------------------------------------------------------------------------
  ENVIRONMENT DETECTION
  --------------------------------------------------------------------------------------------------
  Node.js: no 'window' object
  Browser: window + document exist

  This ensures we do not accidentally use filesystem paths in browser.
  --------------------------------------------------------------------------------------------------
  */
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

  /*
  --------------------------------------------------------------------------------------------------
  DEFAULT FONT CONFIG (NODE.JS ONLY)
  --------------------------------------------------------------------------------------------------
  These local paths only work in Node.js. They must not be used in browser,
  because browsers cannot load './src/.../*.ttf' via opentype.js.
  --------------------------------------------------------------------------------------------------
  */
  const defaultNodeFontConfig = {
    'chord-letters': {
      'gentium plus': './src/drawer/font/chord-letters/GentiumPlus-Regular.ttf',
      'gothic a1': './src/drawer/font/chord-letters/GothicA1-Regular.ttf'
    },
    'text': {
      'noto-serif': {
        'regular': './src/drawer/font/text/NotoSerif-Regular.ttf',
        'bold': './src/drawer/font/text/NotoSerif-Bold.ttf'
      },
      'noto-sans': {
        'regular': './src/drawer/font/text/NotoSans-Regular.ttf',
        'bold': './src/drawer/font/text/NotoSans-Bold.ttf'
      }
    },
    'music': {
      'bravura': {
        'font': './src/drawer/font/music/Bravura.otf',
        'js': '#msq/drawer/font/music-js/bravura.js'
      },
      'leland': {
        'font': './src/drawer/font/music/Leland.otf',
        'js': '#msq/drawer/font/music-js/leland.js'
      },
      'petaluma': {
        'font': './src/drawer/font/music/Petaluma.otf',
        'js': '#msq/drawer/font/music-js/petaluma.js'
      }
    }
  }

  /*
  --------------------------------------------------------------------------------------------------
  BUILD THE BASE CONFIG ACCORDING TO ENVIRONMENT
  --------------------------------------------------------------------------------------------------

  - In Node.js:
      Start with defaultNodeFontConfig and then apply user overrides.

  - In Browser:
      User MUST provide full `fontConfig`.
      We start with empty categories because defaults do not apply.
  --------------------------------------------------------------------------------------------------
  */
  let finalFontConfig

  if (isBrowser) {
    // Browser cannot use default local paths
    if (!fontConfig) {
      throw new Error(`
In browser environment you MUST provide a full 'fontConfig'.
Local relative paths such as "./src/drawer/font/*.ttf" cannot be loaded by the browser.

Provide a complete configuration with absolute or server-hosted URLs.
A full example:

{
  "chord-letters": {
    "gentium plus": "https://cdn.example.com/fonts/GentiumPlus-Regular.ttf",
    "gothic a1":    "https://cdn.example.com/fonts/GothicA1-Regular.ttf"
  },

  "text": {
    "noto-serif": {
      "regular": "https://cdn.example.com/fonts/NotoSerif-Regular.ttf",
      "bold":    "https://cdn.example.com/fonts/NotoSerif-Bold.ttf"
    },
    "noto-sans": {
      "regular": "https://cdn.example.com/fonts/NotoSans-Regular.ttf",
      "bold":    "https://cdn.example.com/fonts/NotoSans-Bold.ttf"
    }
  },

  "music": {
    "bravura": {
      "font": "https://cdn.example.com/music-fonts/Bravura.otf",
      "js":   "#msq/drawer/font/music-js/bravura.js"
    },
    "leland": {
      "font": "https://cdn.example.com/music-fonts/Leland.otf",
      "js":   "#msq/drawer/font/music-js/leland.js"
    }
  }
}

Every path must be a valid URL, not a local filesystem path.
`)
    }

    // Start with completely empty config (browser requires explicit definitions)
    finalFontConfig = {
      'chord-letters': {},
      'text': {},
      'music': {}
    }

  } else {
    // Node.js — initialize with fully working default config
    finalFontConfig = structuredClone(defaultNodeFontConfig)
  }

  /*
  --------------------------------------------------------------------------------------------------
  VALIDATE & APPLY USER CONFIG (if present)
  --------------------------------------------------------------------------------------------------

  The user can override:
    - chord-letters (simple name → path)
    - text (name → {regular, bold})
    - music (name → {font, js})

  Browser: this step fills the empty config.
  Node.js: this merges with defaults.
  --------------------------------------------------------------------------------------------------
  */

  // chord-letters override
  if (fontConfig && fontConfig['chord-letters']) {
    assert(
      isPlainObject(fontConfig['chord-letters']),
      "fontConfig['chord-letters'] must map fontName → URL/path"
    )
    finalFontConfig['chord-letters'] = fontConfig['chord-letters']
  }

  // text override
  if (fontConfig && fontConfig['text']) {
    assert(
      isPlainObject(fontConfig['text']),
      "fontConfig['text'] must map name → {regular, bold}"
    )

    for (const [fontName, fontPaths] of Object.entries(fontConfig['text'])) {
      assert(isPlainObject(fontPaths),
        `fontConfig['text']['${fontName}'] must be {regular, bold}`)
      assert(fontPaths['regular'], `"regular" missing for text font '${fontName}'`)
      assert(fontPaths['bold'], `"bold" missing for text font '${fontName}'`)
    }

    finalFontConfig['text'] = fontConfig['text']
  }

  // music override
  if (fontConfig && fontConfig['music']) {
    assert(
      isPlainObject(fontConfig['music']),
      "fontConfig['music'] must map name → {font, js}"
    )

    for (const [fontName, fontPaths] of Object.entries(fontConfig['music'])) {
      assert(isPlainObject(fontPaths),
        `fontConfig['music']['${fontName}'] must contain {font, js}`)
      assert(fontPaths['font'], `"font" missing for music font '${fontName}'`)
      assert(fontPaths['js'], `"js" missing for music font '${fontName}'`)
    }

    finalFontConfig['music'] = fontConfig['music']
  }

  /*
  --------------------------------------------------------------------------------------------------
  EXTRACT FILE PATHS IN DETERMINISTIC ORDER
  --------------------------------------------------------------------------------------------------
  The loading order is extremely important for deterministic output:

      1. chord-letter fonts
      2. text regular fonts
      3. text bold fonts
      4. music fonts (OpenType)
      5. music JS schemas (loaded separately)

  This guarantees:
  - same font indexes across environments
  - reproducible SVG + MIDI tests
  --------------------------------------------------------------------------------------------------
  */

  const chordLetterFontPaths = Object.values(finalFontConfig['chord-letters'])
  const textRegularFontPaths = Object.values(finalFontConfig['text']).map(f => f['regular'])
  const textBoldFontPaths = Object.values(finalFontConfig['text']).map(f => f['bold'])
  const musicFontPaths = Object.values(finalFontConfig['music']).map(f => f['font'])
  const jsMusicFonts = Object.values(finalFontConfig['music']).map(f => f['js'])

  /*
  --------------------------------------------------------------------------------------------------
  LOAD ALL FONT FILES WITH OPENTYPE.JS +
  LOAD MUSIC JS FONT SCHEMA MODULES
  --------------------------------------------------------------------------------------------------
  opentype.load(pathOrUrl) works in both:
    - Node.js (filesystem)
    - Browser (URLs)
  jsMusicFonts modules contain the glyph definition tables used by MuSemantiQ's
  engraving engine. They must align 1:1 with musicFontPaths.

  We load fonts exactly in the order defined above.
  --------------------------------------------------------------------------------------------------
  */

  const fontSources = await Promise.all(
    [
      ...chordLetterFontPaths,
      ...textRegularFontPaths,
      ...textBoldFontPaths,
      ...musicFontPaths,
      ...jsMusicFonts
    ].map(f => {
      if (jsMusicFonts.indexOf(f) !== -1) {
        return import(f)
      }
      return opentype.load(f)
    })
  )

  /*
  --------------------------------------------------------------------------------------------------
  BUILD FINAL FONT SOURCE TREE (OUTPUT STRUCTURE)
  --------------------------------------------------------------------------------------------------
  Shape of return value:

  {
    "chord-letters": { fontName: opentypeFontObject },
    "text": {
       "regular": { familyName: opentypeFontObject },
       "bold":    { familyName: opentypeFontObject }
    },
    "music": { fontName: opentypeFontObject },
    "music-js": { fontName: glyphSchemaObject }
  }

  This structure is what the MuSemantiQ drawer/renderer consumes.
  --------------------------------------------------------------------------------------------------
  */

  const supportedFontSources = {
    'chord-letters': {},
    'music': {},
    'music-js': {},
    'text': { 'regular': {}, 'bold': {} }
  }

  const chordLetterFontNames = Object.keys(finalFontConfig['chord-letters'])
  const textFontNames = Object.keys(finalFontConfig['text'])
  const musicFontNames = Object.keys(finalFontConfig['music'])

  let fontSourcesAssignCount = 0

  // Assign chord-letter fonts
  for (let name of chordLetterFontNames) {
    supportedFontSources['chord-letters'][name] =
      fontSources[fontSourcesAssignCount++]
  }

  // Assign text regular
  for (let name of textFontNames) {
    supportedFontSources['text']['regular'][name] =
      fontSources[fontSourcesAssignCount++]
  }

  // Assign text bold
  for (let name of textFontNames) {
    supportedFontSources['text']['bold'][name] =
      fontSources[fontSourcesAssignCount++]
  }

  for (let name of musicFontNames) {
    supportedFontSources['music'][name] =
      fontSources[fontSourcesAssignCount++]
  }

  for (let name of musicFontNames) {
    supportedFontSources['music-js'][name] =
      fontSources[fontSourcesAssignCount++].default
  }

  return supportedFontSources
}

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
 * @param {string} params.repertoirePageText
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
  repertoirePageText,
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
      repertoirePageText
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
 *                  3. generateStylesForSinglePage
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 * /
/**
 * Build the complete engraving style environment for a MuSemantiQ page.
 *
 * This function is **synchronous**.
 *
 * It takes the `customStyles` produced earlier by `generateIntermediateStructuresForSinglePage()`  
 * and merges them with the resolved font sources returned by `setupFonts()`.  
 *
 * The result is a deterministic, renderer-ready style configuration.
 *
 * ----------------------------------------------------------------------------
 * @function generateStylesForSinglePage
 *
 * @param {Object} params
 * @param {Object} params.customStyles
 *        Style block generated inside `generateIntermediateStructuresForSinglePage()`.
 *        Typically contains:
 *        - chosen font names
 *        - page layout values
 *        - spacing multipliers
 *        - color overrides
 *        - engraving preferences
 *
 * @param {SupportedFonts} params.supportedFontSources
 *        Fully loaded font source tree returned by `setupFonts()`.
 *        Required structure:
 *        {
 *          music:      { fontName: opentypeFont },
 *          "music-js": { fontName: glyphSchemaModule },
 *          text: {
 *            regular:  { familyName: opentypeFont },
 *            bold:     { familyName: opentypeFont }
 *          },
 *          "chord-letters": {
 *            fontName: opentypeFont
 *          }
 *        }
 *
 * ----------------------------------------------------------------------------
 * @returns {Object} PageStyles
 *
 * A fully constructed engraving style dictionary containing:
 * - spacing constants
 * - stroke options
 * - text/chord/dynamic font settings
 * - engraving rules for ties, beams, slurs, tuplets, octave marks
 * - all distances derived proportionally from stave-line spacing
 * - glyph metrics from the selected SMuFL font
 *
 * This object is consumed directly by:
 *   - the SVG drawer (`page()`, `svg()`)
 *   - the MIDI module (tempo/dynamic rules)
 *
 * ----------------------------------------------------------------------------
 * @example Node.js usage with generateIntermediateStructuresForSinglePage()
 *
 * const fonts = await setupFonts()
 *
 * const { customStyles } = await generateIntermediateStructuresForSinglePage({
 *   repertoirePageText
 * })
 *
 * const pageStyles = generateStylesForSinglePage({
 *   customStyles,
 *   supportedFontSources: fonts
 * })
 *
 * ----------------------------------------------------------------------------
 * @example Browser usage with generateIntermediateStructuresForSinglePage()
 *
 * const fonts = await setupFonts({
 *   music: {
 *     leland: {
 *       font: "https://cdn/fonts/Leland.otf",
 *       js:   "#msq/drawer/font/music-js/leland.js"
 *     }
 *   },
 *   text: {
 *     "noto-serif": {
 *       regular: "https://cdn/fonts/NotoSerif-Regular.ttf",
 *       bold:    "https://cdn/fonts/NotoSerif-Bold.ttf"
 *     }
 *   },
 *   "chord-letters": {
 *     "gentium plus": "https://cdn/fonts/GentiumPlus-Regular.ttf"
 *   }
 * })
 *
 * const { customStyles } = await generateIntermediateStructuresForSinglePage({
 *   repertoirePageText
 * })
 *
 * const pageStyles = generateStylesForSinglePage({
 *   customStyles,
 *   supportedFontSources: fonts
 * })
 *
 * ----------------------------------------------------------------------------
 * @description
 *
 * `generateStylesForSinglePage()` is **Stage 3** of the high-level MuSemantiQ API.
 * It transforms the `customStyles` produced by `generateIntermediateStructuresForSinglePage()`
 * into the complete engraving style environment using the font sources
 * loaded by `setupFonts()`.
 *
 * The high-level pipeline is:
 *
 *   1. **Font setup → `setupFonts()`**  
 *      Loads fonts and returns a fully resolved
 *      `supportedFontSources`.
 *
 *   2. **Model generation → `generateIntermediateStructuresForSinglePage()`**  
 *      Parses MuSemantiQ text and produces:
 *      - `pageSchema`
 *      - `customStyles`
 *      - `midiSettings`
 *      - `highlightsHtmlBuffer`
 *      - `errors`
 *
 *   3. **Style generation → `generateStylesForSinglePage()` (this function)**  
 *      Combines:
 *      - `customStyles` from Stage 2  
 *      - `supportedFontSources` from Stage 1  
 *      to produce the final engraving style object containing spacing rules,
 *      font assignments, stroke options, text sizes, offsets, and all
 *      rendering-related measurements.
 *
 *   4. **Rendering (SVG)**  
 *      See the rendering functions in the next section.
 *
 *   5. **MIDI generation**  
 *      See MIDI output functions further in the documentation.
 *
 * In short:  
 *   `setupFonts()` prepares fonts →  
 *   `generateIntermediateStructuresForSinglePage()` prepares content →  
 *   `generateStylesForSinglePage()` prepares engraving.
 *
 * It does not perform rendering.  
 * It only consolidates layout, typographic, and engraving rules into one object.
 * 
 * ### Purpose
 * 
 * While `generateIntermediateStructuresForSinglePage()` defines *what* to draw,  
 * `generateStylesForSinglePage()` defines *how* it should look.
 *
 * ----------------------------------------------------------------------------
 */
export function generateStylesForSinglePage({
  customStyles,
  supportedFontSources
}) {
  const cofiguratedStyles = generatedStyles({
    ...customStyles,
    fontSources: supportedFontSources
  })
  return cofiguratedStyles
}

/**
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *                        4. generateSvgForSinglePage
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 **/
/**
 * @function generateSvgForSinglePage
 *
 * @description
 * `generateSvgForSinglePage()` is **Stage 4** of the high-level MuSemantiQ API.
 * It takes the logical page structure from `generateIntermediateStructuresForSinglePage()` (Stage 2)
 * and the engraving styles from `generateStylesForSinglePage()` (Stage 3), and
 * produces a **fully rendered SVG page**.
 *
 * This is the main entry point for turning MuSemantiQ page data
 * into a final, display-ready SVG string.
 *
 * Pipeline context:
 *
 *   1. Fonts → `setupFonts()`
 *   2. Models → `generateIntermediateStructuresForSinglePage()`
 *   3. Styles → `generateStylesForSinglePage()`
 *   4. **SVG Rendering → `generateSvgForSinglePage()` ← this function**
 *   5. MIDI Rendering → see MIDI API section
 *
 *
 * @param {Object} params
 * @param {Object} params.pageSchema
 *        The structured musical layout produced by `generateIntermediateStructuresForSinglePage()`.
 *        Contains all page lines, measures, units, symbol coordinates, etc.
 *
 * @param {Object} params.pageStyles
 *        The engraving style object returned by `generateStylesForSinglePage()`,
 *        containing spacing rules, font sources, stroke rules, offsets,
 *        line thicknesses, and all geometry required for drawing.
 *
 * @param {number} [params.top=0]
 *        Top offset (in SVG units). Useful when positioning multiple pages
 *        inside a larger SVG or a combined score.
 *
 * @param {number} [params.left=0]
 *        Left offset (in SVG units).
 *
 *
 * @returns {string}
 *          A complete SVG string representing the fully engraved page.
 *
 *
 * @example
 * // High-level rendering pipeline:
 *
 * const fonts = await setupFonts()
 *
 * const {
 *   pageSchema,
 *   customStyles
 * } = generateIntermediateStructuresForSinglePage({ repertoirePageText, supportedFontNames: fonts })
 *
 * const pageStyles = generateStylesForSinglePage({
 *   customStyles,
 *   supportedFontSources: fonts
 * })
 *
 * const svgPage = generateSvgForSinglePage({
 *   pageSchema,
 *   pageStyles,
 *   top: 0,
 *   left: 0
 * })
 *
 * // svgPage now contains a full SVG of the rendered score page.
 */
export function generateSvgForSinglePage({
  pageSchema,
  pageStyles,
  left,
  top
}) {
  return svgAsString(
    svg(
      page(
        pageSchema
      )(pageStyles, left || 0, top || 0)
    )
  )
}

/**
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *                          5. generateMidiForSinglePage
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 */
/*
 * @function generateMidiForSinglePage
 *
 * @description
 * `generateMidiForSinglePage()` is **Stage 5** of the high-level MuSemantiQ rendering API.
 * It receives the musical structure (`pageSchema`) created by
 * `generateIntermediateStructuresForSinglePage()` along with per-page MIDI configuration
 * (`midiSettings`) and converts them into a **MIDI playback object**.
 *
 * This is the final step in the MuSemantiQ pipeline that produces
 * machine-readable audio data suitable for playback, exporting, syncing with
 * notation, or feeding into other applications.
 *
 * High-level API pipeline:
 *
 *   1. Fonts → `setupFonts()`
 *   2. Models → `generateIntermediateStructuresForSinglePage()`
 *   3. Styles → `generateStylesForSinglePage()`
 *   4. SVG Rendering → `generateSvgForSinglePage()` (see SVG docs)
 *   5. **MIDI Rendering → `generateMidiForSinglePage()` ← this function**
 *
 *
 * @param {Object} params
 *
 * @param {Object} params.pageSchema
 *        The structured musical model for the page — measures, voices, units,
 *        durations, articulations, and all temporal information needed to
 *        compute final audio playback. Produced by `generateIntermediateStructuresForSinglePage()`.
 *
 * @param {Object} params.midiSettings
 *        MIDI metadata extracted during `generateIntermediateStructuresForSinglePage()`: tempo defaults,
 *        pedal behavior, articulation overrides, playback options, and
 *        per-page MIDI parameters.
 *
 *
 * @returns {Object}
 *          A MIDI result object produced by the low-level internal `midi()`
 *          engine. It provides raw MIDI bytes **plus lookup maps** for audio ↔
 *          engraving synchronization.
 *
 *          Properties:
 *
 *          - **data**  
 *            A `Uint8Array` (browser) or `Buffer` (Node.js) containing the raw
 *            MIDI binary. This is the actual audio payload that can be saved
 *            as `.mid`, streamed, or passed directly to a MIDI player.
 *
 *          - **timeStampsMappedWithRefsOn**  
 *            A forward-lookup map:  
 *            `{ [timestampInSeconds]: string[] }`  
 *            For each playback timestamp, lists all MuSemantiQ reference IDs
 *            (note heads) that *become active* at that
 *            moment.  
 *            Used for:
 *            - cursor-following  
 *            - real-time highlighting  
 *            - synchronizing SVG engraving with audio
 *
 *          - **refsOnMappedWithTimeStamps**  
 *            A reverse-lookup map:  
 *            `{ [refId: string]: timestampInSeconds }`  
 *            For any engraved element (notehead, articulation, slur), tells you
 *            precisely *when* it starts sounding.  
 *            Used for:
 *            - clicking notation → jumping audio  
 *            - selecting a note in UI and auto-scrolling the player  
 *            - building interactive practice tools
 *
 *          Both maps allow the UI to maintain **perfect bidirectional sync**
 *          between SVG engraving and the generated MIDI playback.
 *
 *
 * @example
 * // High-level pipeline example
 *
 * const fonts = await setupFonts();
 *
 * const {
 *   pageSchema,
 *   midiSettings,
 *   customStyles
 * } = generateIntermediateStructuresForSinglePage({ repertoirePageText, supportedFontNames: fonts });
 *
 * const pageStyles = generateStylesForSinglePage({
 *   customStyles,
 *   supportedFontSources: fonts
 * });
 *
 * const svgPage = generateSvgForSinglePage({
 *   pageSchema,
 *   pageStyles
 * });
 *
 * const midiPage = generateMidiForSinglePage({
 *   pageSchema,
 *   midiSettings
 * });
 *
 * // midiPage.data → raw MIDI bytes (Uint8Array/Buffer)
 * // midiPage.timeStampsMappedWithRefsOn → audio → engraving sync
 * // midiPage.refsOnMappedWithTimeStamps → engraving → audio sync
 */
export function generateMidiForSinglePage({
  pageSchema,
  midiSettings
}) {
  return midi(
    pageSchema,
    [ midiSettings ]
  )
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
      repertoirePageText: textForCurrentPage,
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


/**
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *                  7. generateStylesForMultiplePages
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 */
/**
 * Build the complete engraving style environments for a **multi-page MuSemantiQ document**.
 *
 * This function is **synchronous**.
 *
 * It is a thin, deterministic wrapper around `generateStylesForSinglePage()`:
 * it applies the same font source configuration to **each page’s `customStyles`**
 * and produces a **page-aligned array of fully resolved engraving style objects**.
 *
 * No cross-page mutation or merging is performed — each page remains
 * stylistically isolated, which is critical for:
 *   - predictable rendering
 *   - page-by-page testing
 *   - independent SVG/MIDI generation
 *
 * ----------------------------------------------------------------------------
 * @function generateStylesForMultiplePages
 *
 * @param {Object} params
 *
 * @param {Object[]} params.customStylesForEachPage
 *        An array of `customStyles` objects, one per page, produced by
 *        `generateIntermediateStructuresForMultiplePages()`.
 *
 *        Each entry typically contains:
 *          - font family selections
 *          - spacing multipliers
 *          - page-level engraving overrides
 *          - color and layout directives
 *
 *        The order of this array **must match page order**.
 *
 * @param {SupportedFonts} params.supportedFontSources
 *        Fully loaded font source tree returned by `setupFonts()`.
 *
 *        The same font source configuration is reused for all pages to ensure:
 *          - visual consistency
 *          - deterministic glyph metrics
 *          - stable spacing calculations
 *
 * ----------------------------------------------------------------------------
 * @returns {Object[]} PagesStyles
 *
 * An array of fully constructed engraving style dictionaries,
 * one per page, in the same order as `customStylesForEachPage`.
 *
 * Each entry contains:
 *   - resolved spacing constants
 *   - text / chord / music font assignments
 *   - engraving rules for beams, slurs, ties, tuplets, octave marks
 *   - proportional distances derived from stave-line spacing
 *   - SMuFL glyph metrics from the selected music font
 *
 * These objects are consumed directly by:
 *   - multi-page SVG rendering pipelines
 *   - per-page or stitched MIDI generation
 *
 * ----------------------------------------------------------------------------
 * @example Node.js usage with multi-page pipeline
 *
 * const fonts = await setupFonts()
 *
 * const { customStylesForEachPage } =
 *   await generateIntermediateStructuresForMultiplePages({
 *     multiplePagesText
 *   })
 *
 * const pagesStyles = generateStylesForMultiplePages({
 *   customStylesForEachPage,
 *   supportedFontSources: fonts
 * })
 *
 * ----------------------------------------------------------------------------
 * @description
 *
 * `generateStylesForMultiplePages()` is the **multi-page equivalent** of
 * `generateStylesForSinglePage()`.
 *
 * It represents MuSemantiQ document pipeline and
 * performs a pure transformation:
 *
 *   - input: page-level `customStyles`
 *   - input: shared font source configuration
 *   - output: renderer-ready engraving styles per page
 *
 * The multi-page pipeline looks like:
 *
 *   1. **Font setup → `setupFonts()`**
 *   2. **Content parsing → `generateIntermediateStructuresForMultiplePages()`**
 *   3. **Style generation → `generateStylesForMultiplePages()` (this function)**
 *   4. **Rendering (SVG, multiple pages)**
 *   5. **MIDI generation (for multiple pages)**
 *
 * This function does **not**:
 *   - merge styles across pages
 *   - normalize values between pages
 *   - apply document-wide engraving heuristics
 *
 * Its responsibility is strictly:
 *   **“given page styles + fonts → produce final engraving styles per page.”**
 *
 * ----------------------------------------------------------------------------
 */
export function generateStylesForMultiplePages({
  customStylesForEachPage,
  supportedFontSources
}) {
  return customStylesForEachPage.map(customStyles => {
    return generatedStyles({
      ...customStyles,
      fontSources: supportedFontSources
    })
  })
}

/**
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *                        8. generateSvgForMultiplePages
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 */
/**
 * @function generateSvgForMultiplePages
 *
 * @description
 * `generateSvgForMultiplePages()` is the **multi-page counterpart** of
 * `generateSvgForSinglePage()` in high-level MuSemantiQ document API.
 *
 * It takes **page-aligned schemas and styles** produced earlier in the pipeline
 * and renders **all pages into a single SVG document**, positioning them
 * sequentially with configurable spacing.
 *
 * Each page is rendered independently using the same low-level rendering
 * primitives (`page()`, `svg()`), ensuring that:
 *   - page geometry remains isolated
 *   - engraving rules stay deterministic
 *   - rendering order matches logical page order
 *
 * This function is the main entry point for producing **paginated SVG scores**
 * from multi-page MuSemantiQ input.
 *
 * Pipeline context:
 *
 *   1. Fonts → `setupFonts()`
 *   2. Models → `generateIntermediateStructuresForMultiplePages()`
 *   3. Styles → `generateStylesForMultiplePages()`
 *   4. **SVG Rendering → `generateSvgForMultiplePages()` ← this function**
 *   5. MIDI Rendering → see MIDI API section
 *
 *
 * @param {Object} params
 *
 * @param {Object[]} params.pageSchemaForEachPage
 *        An array of page schemas produced by
 *        `generateIntermediateStructuresForMultiplePages()`.
 *
 *        Each entry represents a fully laid-out logical page:
 *          - staves and systems
 *          - measures and symbols
 *          - coordinates and spacing indexes
 *
 *        Order is significant and defines render order.
 *
 * @param {Object[]} params.pageStylesForEachPage
 *        An array of engraving style objects produced by
 *        `generateStylesForMultiplePages()`.
 *
 *        Each style entry corresponds **by index** to a page schema.
 *
 * @param {number} [params.top=0]
 *        Initial top offset (in SVG units) for the first page.
 *        Useful when embedding the score into a larger SVG context.
 *
 * @param {number} [params.left=0]
 *        Initial left offset (in SVG units).
 *
 * @param {number} [params.intervalBetweenPages=15]
 *        Vertical distance (in SVG units) inserted between consecutive pages.
 *
 *        This spacing:
 *          - does NOT affect internal page layout
 *          - only controls page-to-page separation
 *
 *
 * @returns {string}
 *          A single SVG string containing **all rendered pages**
 *          laid out vertically in order.
 *
 *
 * @example
 * // High-level multi-page rendering pipeline:
 *
 * const fonts = await setupFonts()
 *
 * const {
 *   pageSchemaForEachPage,
 *   customStylesForEachPage
 * } = generateIntermediateStructuresForMultiplePages({
 *   multiplePagesText
 * })
 *
 * const pageStylesForEachPage = generateStylesForMultiplePages({
 *   customStylesForEachPage,
 *   supportedFontSources: fonts
 * })
 *
 * const svgDocument = generateSvgForMultiplePages({
 *   pageSchemaForEachPage,
 *   pageStylesForEachPage,
 *   top: 0,
 *   left: 0,
 *   intervalBetweenPages: 20
 * })
 *
 * // svgDocument now contains a single SVG with all pages stacked vertically.
 */
export function generateSvgForMultiplePages({
  pageSchemaForEachPage,
  pageStylesForEachPage,
  left,
  top,
  intervalBetweenPages
}) {
  const allSvgPages = []
  let currentPageLeftOffset = left || 0
  let currentPageTopOffset = top || 0
  intervalBetweenPages = intervalBetweenPages || 15

  pageSchemaForEachPage.forEach((pageSchema, pageIndex) => {
    const svgPage = page(
      pageSchema
    )(pageStylesForEachPage[pageIndex], currentPageLeftOffset, currentPageTopOffset)
    svgPage.bottom
    allSvgPages.push(svgPage)
    currentPageTopOffset = svgPage.bottom + intervalBetweenPages
  })
  return svgAsString(
    svg(...allSvgPages)
  )
}

/**
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *                       9. generateMidiForMultiplePages
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 */
/*
 * @function generateMidiForMultiplePages
 *
 * @description
 * `generateMidiForMultiplePages()` is the **multi-page counterpart** of
 * `generateMidiForSinglePage()` of the high-level MuSemantiQ rendering API.
 *
 * It converts a **multi-page musical document** into a **single, continuous MIDI
 * playback stream**, preserving correct temporal order across page boundaries.
 *
 * Unlike SVG rendering (which remains page-isolated), MIDI rendering is
 * inherently **linear in time**. This function therefore:
 *
 *   - flattens all page-level musical structures into one continuous sequence
 *   - preserves original measure order
 *   - applies page-specific MIDI settings in sequence
 *
 * The result is a MIDI object suitable for:
 *   - uninterrupted playback of full scores
 *   - exporting complete compositions
 *   - precise audio ↔ engraving synchronization across pages
 *
 * High-level API pipeline:
 *
 *   1. Fonts → `setupFonts()`
 *   2. Models → `generateIntermediateStructuresForMultiplePages()`
 *   3. Styles → `generateStylesForMultiplePages()`
 *   4. SVG Rendering → `generateSvgForMultiplePages()` (see SVG docs)
 *   5. **MIDI Rendering → `generateMidiForMultiplePages()` ← this function**
 *
 *
 * @param {Object} params
 *
 * @param {Object[]} params.pageSchemaForEachPage
 *        An array of page schemas produced by
 *        `generateIntermediateStructuresForMultiplePages()`.
 *
 *        Each page schema contains musical layout and timing data, including
 *        `measureParams`, which define durations, tempo changes, articulations,
 *        and structural playback information.
 *
 *        Page order defines **temporal order**.
 *
 * @param {Object[]} params.midiSettingsForEachPage
 *        An array of MIDI configuration objects, one per page, extracted during
 *        `generateIntermediateStructuresForMultiplePages()`.
 *
 *        Each entry may include:
 *          - tempo changes
 *          - articulation rules
 *          - pedal behavior
 *          - per-page playback modifiers
 *
 *        The index of each settings object **must correspond** to the index of
 *        the page schema it applies to.
 *
 *
 * @returns {Object}
 *          A MIDI result object produced by the low-level internal `midi()` engine.
 *
 *          The returned object contains:
 *
 *          - **data**  
 *            A `Uint8Array` (browser) or `Buffer` (Node.js) containing the raw
 *            MIDI binary for the **entire document**.
 *
 *          - **timeStampsMappedWithRefsOn**  
 *            A forward-lookup map:  
 *            `{ [timestampInSeconds]: string[] }`  
 *            Mapping playback timestamps to all reference IDs that become active
 *            at that moment — across all pages.
 *
 *          - **refsOnMappedWithTimeStamps**  
 *            A reverse-lookup map:  
 *            `{ [refId: string]: timestampInSeconds }`  
 *            Mapping any engraved element (from any page) to its exact playback
 *            start time in the global MIDI timeline.
 *
 *          These mappings allow **seamless synchronization** between:
 *            - multi-page SVG engraving
 *            - continuous audio playback
 *            - interactive editors and practice tools
 *
 *
 * @example
 * // High-level multi-page MIDI pipeline example
 *
 * const {
 *   pageSchemaForEachPage,
 *   midiSettingsForEachPage
 * } = generateIntermediateStructuresForMultiplePages({
 *   multiplePagesText
 * })
 *
 * const midiDocument = generateMidiForMultiplePages({
 *   pageSchemaForEachPage,
 *   midiSettingsForEachPage
 * })
 *
 * // midiDocument.data → raw MIDI bytes for the full document
 * // midiDocument.timeStampsMappedWithRefsOn → audio → engraving sync (global)
 * // midiDocument.refsOnMappedWithTimeStamps → engraving → audio sync (global)
 *
 *
 * @notes
 * - Page boundaries are ignored in the MIDI output — playback is continuous.
 * - No silence or padding is inserted between pages unless explicitly encoded
 *   in the MuSemantiQ input.
 * - Visual pagination and audio sequencing are intentionally decoupled.
 */
export function generateMidiForMultiplePages({
  pageSchemaForEachPage,
  midiSettingsForEachPage
}) {
  const measureParamsForAllPages = []
  pageSchemaForEachPage.forEach(pageSchema => {
    measureParamsForAllPages.push(
      ...pageSchema.measuresParams
    )
  })
  return midi(
    {
      measuresParams: measureParamsForAllPages
    },
    midiSettingsForEachPage
  )
}

/**
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *                           10. isPageSchemaValid
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 */
/**
 * Optional structural consistency check for MuSemantiQ **Page Schema** objects.
 *
 * This function is primarily intended for **internal tooling and tests** as an
 * additional safety layer to assert that a page schema is structurally valid.
 *
 * Under normal circumstances, page schemas produced by
 * `generateIntermediateStructuresForSinglePage()` are expected to already be
 * valid. This function does **not** replace that guarantee.
 *
 * Instead, it exists to let developers explicitly verify that assumption when:
 *   - writing integration or regression tests
 *   - asserting invariants across pipeline stages
 *   - debugging schema transformations or refactors
 *
 * Calling this function is **explicitly opt-in**. It is up to the consumer to
 * decide whether additional validation is necessary for their use case.
 *
 * ---------------------------------------------------------------------------
 * @function isPageSchemaValid
 *
 * @param {unknown} pageSchema
 *        A page schema object to be checked for structural validity.
 *
 * ---------------------------------------------------------------------------
 * @returns {boolean}
 *
 *   - `true`  → the schema conforms to the canonical MuSemantiQ Page Schema contract
 *   - `false` → one or more structural constraints are violated
 *
 * ---------------------------------------------------------------------------
 * @description
 *
 * ### Why this exists
 * This function provides a clear, explicit checkpoint for developers who want
 * to **assert correctness rather than assume it**.
 *
 * It is intentionally lightweight, side-effect free, and non-invasive, making
 * it suitable for:
 *   - test suites
 *   - CI assertions
 *   - schema evolution safety checks
 *
 * It is **not** required for normal rendering or playback flows.
 *
 * ---------------------------------------------------------------------------
 */
export function isPageSchemaValid(pageSchema) {
  return validatedPageSchema(pageSchema)
}

/**
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *                       11. areAllPageSchemasValid
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 */
/**
 * Optional structural consistency check for **multiple MuSemantiQ Page Schemas**.
 *
 * This function extends `isPageSchemaValid()` to operate on a collection of
 * page schemas, allowing developers to assert that **every page** in a
 * multi-page pipeline satisfies the canonical MuSemantiQ Page Schema contract.
 *
 * Like its single-page counterpart, this function is primarily intended for
 * **internal tooling and test environments**, not for mandatory runtime
 * validation.
 *
 * Under normal circumstances, page schemas produced by higher-level generation
 * APIs (e.g. multi-page orchestration built on top of
 * `generateIntermediateStructuresForSinglePage()`) are expected to already be
 * valid.
 *
 * This function exists to explicitly verify that assumption when working with:
 *   - multi-page rendering pipelines
 *   - batch processing or transformations
 *   - test fixtures covering multiple pages
 *   - refactors affecting page schema aggregation
 *
 * Invocation is **explicitly opt-in** and left entirely to the consumer.
 *
 * ---------------------------------------------------------------------------
 * @function areAllPageSchemasValid
 *
 * @param {unknown} pageSchemas
 *        A collection (typically an array) of page schema objects to be checked
 *        for structural validity.
 *
 * ---------------------------------------------------------------------------
 * @returns {boolean}
 *
 *   - `true`  → all page schemas conform to the canonical MuSemantiQ Page Schema
 *               contract
 *   - `false` → at least one page schema violates structural constraints
 *
 * ---------------------------------------------------------------------------
 * @description
 *
 * ### Why this exists
 * This function provides a **single, explicit checkpoint** for asserting
 * correctness across **multiple pages**, rather than validating them
 * individually or relying on implicit guarantees.
 *
 * It is intentionally:
 *   - lightweight
 *   - side-effect free
 *   - short-circuiting (fails fast on first invalid schema)
 *
 * Making it suitable for:
 *   - test suites
 *   - CI validation steps
 *   - multi-page schema invariants
 *
 * It is **not required** for normal rendering, SVG generation, or MIDI flows.
 *
 * ---------------------------------------------------------------------------
 */
export function areAllPageSchemasValid(pageSchemas) {
  return pageSchemas.every(pageSchema => validatedPageSchema(pageSchema))
}

// ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
//               HELPERS
// ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆

function isPlainObject(o) {
  return o !== null && typeof o === 'object' && o.constructor === Object
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed")
}

function normalizeMuSemantiQText(repertoireText) {
  if (repertoireText[repertoireText.length - 1] === NEW_LINE) {
    repertoireText += NEW_LINE
  }
  return repertoireText
}
