import { generateIntermediateStructuresForSinglePage } from '#msq/api.js'

/*
 * Parser benchmark for MuSemantiQ.
 *
 * Generates a synthetic (but valid) MSQ page and times how long the parser
 * takes to build its intermediate structures. Two modes are measured:
 *
 *   - render-only:  `applyHighlighting: false` (what the SVG/MIDI path uses)
 *   - highlighting: the default (what the editor uses)
 *
 * Usage:
 *
 *   node scripts/benchmark.js
 *   node scripts/benchmark.js --profile=varied --size=2000 --runs=20
 *
 * Options:
 *   --profile=notes|chords|varied   which synthetic score to use (default: varied)
 *   --size=N                        number of measures (default: 1000)
 *   --runs=N                        timed runs per measurement (default: 10)
 */

const parseArg = (name, fallback) => {
  const value = process.argv.find((argument) => argument.startsWith(`--${name}=`))
  return value ? value.slice(name.length + 3) : fallback
}

const profile = parseArg('profile', 'varied')
const size = Number(parseArg('size', 1000))
const runs = Number(parseArg('runs', 10))

// --- score generators (valid MSQ, syntax taken from the test corpus) ---------

const noteScore = (measures) => {
  const lines = [ 'page line width is 400' ]
  for (let measureIndex = 0; measureIndex < measures; measureIndex++) {
    lines.push('measure', 'treble clef')
    for (let bar = 0; bar < 4; bar++) {
      lines.push('1/16 c d e f g a b c5 with stem down')
    }
  }
  return lines.join('\n') + '\n'
}

const chordScore = (measures) => {
  const lines = [ 'page line width is 400' ]
  for (let measureIndex = 0; measureIndex < measures; measureIndex++) {
    lines.push('measure', 'treble clef')
    for (let chordIndex = 0; chordIndex < 6; chordIndex++) {
      lines.push('1/4 chord', 'e g c5')
    }
  }
  return lines.join('\n') + '\n'
}

const variedScore = (measures) => {
  const lines = [ 'page line width is 400' ]
  for (let measureIndex = 0; measureIndex < measures; measureIndex++) {
    lines.push('measure', 'treble clef')
    if (measureIndex % 3 === 0) {
      lines.push('key signature is f major')
    }
    if (measureIndex % 4 === 0) {
      lines.push('time signature is 4:4')
    }
    // beamed notes with a stem direction, plus a few plain notes
    lines.push('1/16 a beamed and stem up, b, c5, f not beamed,')
    lines.push('1/8 g, a, b with stem down')
    // dynamics
    lines.push('1/4 a with dynamic "fp", b with dynamic "fz", c5 with dynamic "sf"')
    // lyrics
    lines.push('1/4 d with lyrics "la", e with lyrics "li", f with lyrics "lu"')
    // a chord
    lines.push('1/4 chord', 'c e g')
    // every few measures, a slur
    if (measureIndex % 5 === 4) {
      lines.push('slur', 'starts from 1st note', 'finishes at 4th note')
    }
  }
  return lines.join('\n') + '\n'
}

const generators = {
  notes: noteScore,
  chords: chordScore,
  varied: variedScore
}

// --- measurement ------------------------------------------------------------

const measure = (fn, options) => {
  // warmup so the JIT isn't cold, then time `runs` iterations
  fn({ pageText: text, ...options })
  const samples = []
  for (let run = 0; run < runs; run++) {
    const start = process.hrtime.bigint()
    fn({ pageText: text, ...options })
    const end = process.hrtime.bigint()
    samples.push(Number(end - start) / 1e6)
  }
  const average = samples.reduce((sum, sample) => sum + sample, 0) / samples.length
  const minimum = Math.min(...samples)
  return { average, minimum }
}

const report = (label, { average, minimum }) => {
  const throughput = Math.round(text.length / 1000 / (average / 1000))
  console.log(
    `  ${label.padEnd(22)} ` +
    `avg ${average.toFixed(2).padStart(8)} ms   ` +
    `min ${minimum.toFixed(2).padStart(8)} ms   ` +
    `${throughput.toLocaleString('en-US')} chars/s`
  )
}

if (!generators[profile]) {
  console.error(`unknown profile '${profile}'; use one of: ${Object.keys(generators).join(', ')}`)
  process.exit(1)
}

const text = generators[profile](size)

console.log('\nMuSemantiQ parser benchmark')
console.log(`  profile: ${profile}   measures: ${size}   runs: ${runs}`)
console.log(`  input: ${text.length.toLocaleString('en-US')} characters\n`)

// sanity check: report how the input parses (errors should be 0 for valid input)
const renderResult = generateIntermediateStructuresForSinglePage({
  pageText: text,
  applyHighlighting: false
})
console.log(`  sanity: ${renderResult.errors.length} error(s), ${renderResult.pageSchema.measuresParams?.length ?? 0} measure(s)\n`)

console.log('  mode')
report('render-only', measure(generateIntermediateStructuresForSinglePage, { applyHighlighting: false }))
report('highlighting', measure(generateIntermediateStructuresForSinglePage, {}))
console.log('')
