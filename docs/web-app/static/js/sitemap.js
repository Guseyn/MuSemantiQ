/*
The documentation, as data. One list, read by three things:

  the sidebar   — renders sections, groups and pages in this order
  the router    — turns /docs/<section>/<page> into a markdown URL
  the lint      — derives, from this order, which concepts an example on a
                  given page is allowed to use (see docs/concepts.js)

Order is meaning here. The language section is deliberately NOT in the order of
the reference material it came from: it is in the order the language is learnt,
because every example is gradual — no page shows a concept an earlier page has
not introduced. Moving a page up or down re-checks every example under it.

A page is { slug, title }, optionally opening a new `group` heading in the
sidebar. Its markdown lives at /md/<section.slug>/<page.slug>.md and its URL is
/docs/<section.slug>/<page.slug>.

A section may also carry `links`: { title, href, icon } entries the sidebar
lists after its pages. They leave the site, so they are not pages — allPages
never sees them, and neither do the router and the lint.

Each section's sidebar icon is /images/sidebar/<section.slug>.svg.
*/

export const sitemap = [
  {
    slug: 'getting-started',
    title: 'Getting started',
    pages: [
      { slug: 'what-it-is', title: 'What MuSemantiQ is' },
      { slug: 'install-and-run', title: 'Install and run' },
      { slug: 'your-first-page', title: 'Your first page' },
      { slug: 'where-to-go-next', title: 'Where to go next' }
    ]
  },
  {
    slug: 'language',
    title: 'MSQ language',
    pages: [
      { group: 'Notes on a page', slug: 'first-notes', title: 'Your first notes' },
      { slug: 'octaves', title: 'Octaves' },
      { slug: 'durations', title: 'Durations' },
      { slug: 'dots', title: 'Dots' },
      { slug: 'rests', title: 'Rests' },
      { slug: 'accidentals', title: 'Accidentals' },
      { slug: 'comments', title: 'Comments' },

      { group: 'Grouping notes', slug: 'chords', title: 'Chords' },
      { slug: 'beams', title: 'Beams' },
      { slug: 'stems', title: 'Stems' },
      { slug: 'ties', title: 'Ties' },
      { slug: 'tuplets', title: 'Tuplets' },

      { group: 'The page', slug: 'measures', title: 'Measures' },
      { slug: 'clefs', title: 'Clefs' },
      { slug: 'key-signatures', title: 'Key signatures' },
      { slug: 'time-signatures', title: 'Time signatures' },
      { slug: 'staves', title: 'Staves' },
      { slug: 'voices', title: 'Voices' },
      { slug: 'page-lines', title: 'Page lines' },
      { slug: 'titles-and-page-meta', title: 'Titles and page meta' },

      { group: 'Marks on units', slug: 'articulations', title: 'Articulations' },
      { slug: 'ornaments', title: 'Ornaments' },
      { slug: 'dynamics', title: 'Dynamics' },
      { slug: 'text-labels', title: 'Text labels' },
      { slug: 'grace-units', title: 'Grace units' },
      { slug: 'ghost-units', title: 'Ghost units' },
      { slug: 'parentheses', title: 'Parentheses' },
      { slug: 'breath-marks', title: 'Breath marks' },
      { slug: 'arpeggiated-chords', title: 'Arpeggiated chords' },
      { slug: 'chord-letters', title: 'Chord letters' },
      { slug: 'lyrics', title: 'Lyrics' },
      { slug: 'mid-measure-clefs', title: 'Mid-measure clefs' },
      { slug: 'mid-measure-key-signatures', title: 'Mid-measure key signatures' },
      { slug: 'centralized-units', title: 'Centralized units' },
      { slug: 'adjusting-units', title: 'Adjusting units' },

      { group: 'Spans', slug: 'slurs', title: 'Slurs' },
      { slug: 'crescendo-and-diminuendo', title: 'Crescendo and diminuendo' },
      { slug: 'octave-signs', title: 'Octave signs' },
      { slug: 'glissando', title: 'Glissando' },
      { slug: 'tremolo', title: 'Tremolo' },
      { slug: 'pedal-marks', title: 'Pedal marks' },

      { group: 'Measure furniture', slug: 'barlines', title: 'Barlines' },
      { slug: 'repeat-signs', title: 'Repeat signs' },
      { slug: 'volta-brackets', title: 'Volta brackets' },
      { slug: 'sign', title: 'Sign (segno)' },
      { slug: 'coda', title: 'Coda' },
      { slug: 'repetition-instructions', title: 'Repetition instructions' },
      { slug: 'fermata-over-barline', title: 'Fermata over barline' },
      { slug: 'tempo-and-metronome-marks', title: 'Tempo and metronome marks' },
      { slug: 'measure-numbers', title: 'Measure numbers' },
      { slug: 'instrument-titles', title: 'Instrument titles' },
      { slug: 'cross-stave-connections', title: 'Cross-stave connections' },
      { slug: 'cross-stave-chords', title: 'Cross-stave chords' },
      { slug: 'similes', title: 'Similes' },

      { group: 'Layout and styles', slug: 'unit-spacing', title: 'Unit spacing' },
      { slug: 'colours', title: 'Colours' },
      { slug: 'fonts', title: 'Fonts' },
      { slug: 'page-format', title: 'Page format' },
      { slug: 'style-reference', title: 'The full style reference' },

      { group: 'Operational', slug: 'handling-errors', title: 'Handling errors' },
      { slug: 'midi-settings', title: 'MIDI settings' },

      { group: 'Reference', slug: 'command-index', title: 'Command index' }
    ]
  },
  {
    slug: 'api',
    title: 'Low-level API',
    pages: [
      { slug: 'overview', title: 'Overview' },
      { slug: 'setup-fonts', title: 'setupFonts' },
      { slug: 'single-page', title: 'A single page' },
      { slug: 'multiple-pages', title: 'Multiple pages' },
      { slug: 'validation', title: 'Validation' },
      { slug: 'page-schema', title: 'The page schema' },
      { slug: 'language-only', title: 'Using the language alone' }
    ]
  },
  {
    slug: 'architecture',
    title: 'Architecture',
    pages: [
      { slug: 'the-worker', title: 'The worker' },
      { slug: 'no-build', title: 'No build' },
      { slug: 'import-maps', title: 'Import maps and specifiers' },
      { slug: 'generated-vs-hand-written', title: 'Generated versus hand-written' },
      { slug: 'repository-layout', title: 'Repository layout' },
      { slug: 'vendoring', title: 'Vendoring' }
    ]
  },
  {
    slug: 'components',
    title: 'Web components',
    pages: [
      { slug: 'overview', title: 'Overview' },
      { slug: 'msq-font-loader', title: 'msq-font-loader' },
      { slug: 'msq-svg', title: 'msq-svg' },
      { slug: 'msq-midi', title: 'msq-midi' },
      { slug: 'msq-svg-midi', title: 'msq-svg-midi' },
      { slug: 'msq-editor', title: 'msq-editor' },
      { slug: 'fonts-and-config', title: 'Fonts and font config' },
      { slug: 'errors', title: 'Errors and troubleshooting' },
      { slug: 'browser-support', title: 'Browser support' }
    ]
  },
  {
    slug: 'examples',
    title: 'Example apps',
    pages: [
      { slug: 'browser-app', title: 'Browser app' },
      { slug: 'cli', title: 'CLI' },
      { slug: 'embedding', title: 'Embedding in your own app' }
    ]
  },
  {
    slug: 'dev-tools',
    title: 'Dev tools',
    pages: [
      { slug: 'overview', title: 'Overview' },
      { slug: 'font-viewer', title: 'Font viewer' },
      { slug: 'font-generator', title: 'Font generator' },
      { slug: 'soundfont-generator', title: 'Magenta soundfont generator' },
      { slug: 'musicxml-tool', title: 'MusicXML tool' },
      { slug: 'test-viewer', title: 'Test viewer' }
    ]
  },
  {
    slug: 'tools',
    title: 'Tools, natively',
    pages: [
      { slug: 'smufl-font-generator', title: 'SMuFL to music-js font' },
      { slug: 'magenta-soundfont-builder', title: 'Magenta soundfont builder' },
      { slug: 'musicxml-import', title: 'MusicXML import' },
      { slug: 'musicxml-export', title: 'MusicXML export' }
    ]
  },
  {
    slug: 'testing',
    title: 'Testing',
    pages: [
      { slug: 'the-suites', title: 'The three suites' },
      { slug: 'baselines', title: 'Baselines' },
      { slug: 'coverage', title: 'Coverage' }
    ]
  },
  {
    slug: 'recipes',
    title: 'Recipes',
    pages: [
      { slug: 'svg-in-node', title: 'Engrave to SVG in Node' },
      { slug: 'folder-from-cli', title: 'Render a folder from the CLI' },
      { slug: 'embed-playable-score', title: 'Embed a playable score' },
      { slug: 'ship-your-own-font', title: 'Ship your own music font' },
      { slug: 'convert-musicxml-library', title: 'Convert a MusicXML library' }
    ]
  },
  {
    slug: 'reference',
    title: 'Reference',
    pages: [
      { slug: 'glossary', title: 'Glossary' },
      { slug: 'faq', title: 'FAQ and limitations' },
      { slug: 'license', title: 'License' },
      { slug: 'changelog', title: 'Changelog' }
    ],
    links: [
      { title: 'GitHub', href: 'https://github.com/Guseyn/MuSemantiQ', icon: '/images/sidebar/github.svg' }
    ]
  }
]

/** Every page, flattened, in reading order. The lint's page index is this order. */
export function allPages() {
  const flat = []
  for (const section of sitemap) {
    for (const page of section.pages) {
      flat.push({
        ...page,
        section: section.slug,
        sectionTitle: section.title,
        url: `/docs/${section.slug}/${page.slug}`,
        md: `/md/${section.slug}/${page.slug}.md`,
        ref: `${section.slug}/${page.slug}`
      })
    }
  }
  return flat
}

/** The page a /docs/... pathname names, or null. */
export function pageByPath(pathname) {
  const parts = pathname.split('/').filter((part) => part !== '')
  if (parts[0] !== 'docs') {
    return null
  }
  if (parts.length < 3) {
    return allPages()[0]
  }
  return allPages().find(
    (page) => page.section === parts[1] && page.slug === parts[2]
  ) || null
}
