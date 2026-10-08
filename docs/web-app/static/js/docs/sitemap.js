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

A section lists its `pages`, or, when it is long, `groups` of them: { title,
pages }, each a collapsible heading in the sidebar. A page is { slug, title }.
Its markdown lives at /md/<section.slug>/<page.slug>.md and its URL is
/docs/<section.slug>/<page.slug>. The nesting is there because the sidebar is
an e-for-each over this list, and a template can only follow a shape, not work
one out.

A section of exactly one page is that page: the sidebar shows it as a single
link, with the section's icon and title, rather than a heading to open. Its page
keeps a slug, so its URL is still /docs/<section.slug>/<page.slug>.

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
      { slug: 'full-setup', title: 'Full setup' },
      { slug: 'where-to-go-next', title: 'Where to go next' }
    ]
  },
  {
    slug: 'language',
    title: 'MSQ language',
    groups: [
      {
        title: 'Notes on a page',
        pages: [
          { slug: 'first-notes', title: 'Your first notes' },
          { slug: 'octaves', title: 'Octaves' },
          { slug: 'durations', title: 'Durations' },
          { slug: 'dots', title: 'Dots' },
          { slug: 'rests', title: 'Rests' },
          { slug: 'accidentals', title: 'Accidentals' },
          { slug: 'comments', title: 'Comments' }
        ]
      },
      {
        title: 'Grouping notes',
        pages: [
          { slug: 'chords', title: 'Chords' },
          { slug: 'beams', title: 'Beams' },
          { slug: 'stems', title: 'Stems' },
          { slug: 'ties', title: 'Ties' },
          { slug: 'tuplets', title: 'Tuplets' }
        ]
      },
      {
        title: 'The page',
        pages: [
          { slug: 'measures', title: 'Measures' },
          { slug: 'clefs', title: 'Clefs' },
          { slug: 'key-signatures', title: 'Key signatures' },
          { slug: 'time-signatures', title: 'Time signatures' },
          { slug: 'staves', title: 'Staves' },
          { slug: 'voices', title: 'Voices' },
          { slug: 'page-lines', title: 'Page lines' },
          { slug: 'titles-and-page-meta', title: 'Titles and page meta' }
        ]
      },
      {
        title: 'Marks on units',
        pages: [
          { slug: 'articulations', title: 'Articulations' },
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
          { slug: 'adjusting-units', title: 'Adjusting units' }
        ]
      },
      {
        title: 'Spans',
        pages: [
          { slug: 'slurs', title: 'Slurs' },
          { slug: 'crescendo-and-diminuendo', title: 'Crescendo and diminuendo' },
          { slug: 'octave-signs', title: 'Octave signs' },
          { slug: 'glissando', title: 'Glissando' },
          { slug: 'tremolo', title: 'Tremolo' },
          { slug: 'pedal-marks', title: 'Pedal marks' }
        ]
      },
      {
        title: 'Measure furniture',
        pages: [
          { slug: 'barlines', title: 'Barlines' },
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
          { slug: 'similes', title: 'Similes' }
        ]
      },
      {
        title: 'Layout and styles',
        pages: [
          { slug: 'unit-spacing', title: 'Unit spacing' },
          { slug: 'colours', title: 'Colours' },
          { slug: 'fonts', title: 'Fonts' },
          { slug: 'page-format', title: 'Page format' },
          { slug: 'style-reference', title: 'The full style reference' }
        ]
      },
      {
        title: 'Operational',
        pages: [
          { slug: 'handling-errors', title: 'Handling errors' },
          { slug: 'midi-settings', title: 'MIDI settings' }
        ]
      },
      {
        title: 'Reference',
        pages: [
          { slug: 'command-index', title: 'Command index' }
        ]
      }
    ]
  },
  {
    slug: 'api',
    title: 'Low-Level API',
    pages: [
      { slug: 'overview', title: 'Low-Level API' }
    ]
  },
  {
    slug: 'worker',
    title: 'Worker',
    pages: [
      { slug: 'overview', title: 'Worker' }
    ]
  },
  {
    slug: 'components',
    title: 'Web Components',
    pages: [
      { slug: 'overview', title: 'Web Components' }
    ]
  },
  {
    slug: 'showdown',
    title: 'Showdown Extensions',
    pages: [
      { slug: 'overview', title: 'Showdown Extensions' }
    ]
  },
  {
    slug: 'ehtml',
    title: 'With EHTML',
    pages: [
      { slug: 'overview', title: 'With EHTML' }
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
    const groups = section.groups || [{ title: null, pages: section.pages }]
    for (const group of groups) for (const page of group.pages) {
      flat.push({
        ...page,
        group: group.title,
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
