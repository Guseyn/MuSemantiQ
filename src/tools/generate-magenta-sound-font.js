#!/usr/bin/env node

/**
 * Magenta SoundFont builder.
 *
 * Renders every note of the requested General MIDI programs from an .sf2
 * soundbank into the sample layout that `@magenta/music`'s SoundFont player
 * expects:
 *
 *   <output dir>/<instrument_key>/instrument.json
 *   <output dir>/<instrument_key>/p<pitch>_v<velocity>.mp3
 *
 * Ported from the MIDI.js soundfont builder by 0xFE <mohit@muthanna.com>,
 * edited by Valentijn Nieman <valentijnnieman@gmail.com>.
 *
 * Requires FluidSynth and Lame on PATH:
 *
 *   $ brew install fluidsynth lame (on macOS)
 *
 * Usage:
 *
 *   node src/tools/generate-magenta-sound-font.js <soundfont.sf2> [instruments] [output dir] [--yes]
 *
 * where `instruments` is a combination of ranges and individual GM program
 * numbers, like '0-10,15,20,30-40' (default: '0-127'; the numbers are the ones
 * commented next to MIDIJS_PATCH_NAMES below), and `output dir` defaults to
 * examples/browser/web-app/static/magenta-sf/<soundfont name>.
 */

import fs from 'fs'
import os from 'os'
import path from 'path'
import readline from 'readline/promises'
import { execFile } from 'child_process'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import { writeMidi } from '#msq/midi/lib/midi-file/index.js'

const execFileAsync = promisify(execFile)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../..')

const DEFAULT_INSTRUMENTS = '0-127'
const DEFAULT_BUILD_DIR = path.join(
  projectRoot, 'examples/browser/web-app/static/magenta-sf'
)

// It was found that midilib uses names that are incompatible with MIDI.js
// For example, midilib uses "SynthBrass 1" -> https://github.com/jimm/midilib/blob/6c8e481ae72cd9f00a38eb3700ddfca6b549f153/lib/midilib/consts.rb#L280
// and the MIDI association uses "SynthBrass 1" -> https://www.midi.org/specifications-old/item/gm-level-1-sound-set
// but the MIDI.js calls this "Synth Brass 1" -> https://github.com/mudcube/MIDI.js/blob/a8a84257afa70721ae462448048a87301fc1554a/js/midi/gm.js#L44
// there are others like "Bag pipe" vs "Bagpipe", etc.
// here, we use the MIDI.js definitions because that is how most users will
// interact with the generated soundfonts.
// The number next to each name is its GM program: the value to pass in the
// `instruments` argument.
const MIDIJS_PATCH_NAMES = [
  'Acoustic Grand Piano',    // 0
  'Bright Acoustic Piano',   // 1
  'Electric Grand Piano',    // 2
  'Honky-tonk Piano',        // 3
  'Electric Piano 1',        // 4
  'Electric Piano 2',        // 5
  'Harpsichord',             // 6
  'Clavinet',                // 7
  'Celesta',                 // 8
  'Glockenspiel',            // 9
  'Music Box',               // 10
  'Vibraphone',              // 11
  'Marimba',                 // 12
  'Xylophone',               // 13
  'Tubular Bells',           // 14
  'Dulcimer',                // 15
  'Drawbar Organ',           // 16
  'Percussive Organ',        // 17
  'Rock Organ',              // 18
  'Church Organ',            // 19
  'Reed Organ',              // 20
  'Accordion',               // 21
  'Harmonica',               // 22
  'Tango Accordion',         // 23
  'Acoustic Guitar (nylon)', // 24
  'Acoustic Guitar (steel)', // 25
  'Electric Guitar (jazz)',  // 26
  'Electric Guitar (clean)', // 27
  'Electric Guitar (muted)', // 28
  'Overdriven Guitar',       // 29
  'Distortion Guitar',       // 30
  'Guitar Harmonics',        // 31
  'Acoustic Bass',           // 32
  'Electric Bass (finger)',  // 33
  'Electric Bass (pick)',    // 34
  'Fretless Bass',           // 35
  'Slap Bass 1',             // 36
  'Slap Bass 2',             // 37
  'Synth Bass 1',            // 38
  'Synth Bass 2',            // 39
  'Violin',                  // 40
  'Viola',                   // 41
  'Cello',                   // 42
  'Contrabass',              // 43
  'Tremolo Strings',         // 44
  'Pizzicato Strings',       // 45
  'Orchestral Harp',         // 46
  'Timpani',                 // 47
  'String Ensemble 1',       // 48
  'String Ensemble 2',       // 49
  'Synth Strings 1',         // 50
  'Synth Strings 2',         // 51
  'Choir Aahs',              // 52
  'Voice Oohs',              // 53
  'Synth Choir',             // 54
  'Orchestra Hit',           // 55
  'Trumpet',                 // 56
  'Trombone',                // 57
  'Tuba',                    // 58
  'Muted Trumpet',           // 59
  'French Horn',             // 60
  'Brass Section',           // 61
  'Synth Brass 1',           // 62
  'Synth Brass 2',           // 63
  'Soprano Sax',             // 64
  'Alto Sax',                // 65
  'Tenor Sax',               // 66
  'Baritone Sax',            // 67
  'Oboe',                    // 68
  'English Horn',            // 69
  'Bassoon',                 // 70
  'Clarinet',                // 71
  'Piccolo',                 // 72
  'Flute',                   // 73
  'Recorder',                // 74
  'Pan Flute',               // 75
  'Blown Bottle',            // 76
  'Shakuhachi',              // 77
  'Whistle',                 // 78
  'Ocarina',                 // 79
  'Lead 1 (square)',         // 80
  'Lead 2 (sawtooth)',       // 81
  'Lead 3 (calliope)',       // 82
  'Lead 4 (chiff)',          // 83
  'Lead 5 (charang)',        // 84
  'Lead 6 (voice)',          // 85
  'Lead 7 (fifths)',         // 86
  'Lead 8 (bass + lead)',    // 87
  'Pad 1 (new age)',         // 88
  'Pad 2 (warm)',            // 89
  'Pad 3 (polysynth)',       // 90
  'Pad 4 (choir)',           // 91
  'Pad 5 (bowed)',           // 92
  'Pad 6 (metallic)',        // 93
  'Pad 7 (halo)',            // 94
  'Pad 8 (sweep)',           // 95
  'FX 1 (rain)',             // 96
  'FX 2 (soundtrack)',       // 97
  'FX 3 (crystal)',          // 98
  'FX 4 (atmosphere)',       // 99
  'FX 5 (brightness)',       // 100
  'FX 6 (goblins)',          // 101
  'FX 7 (echoes)',           // 102
  'FX 8 (sci-fi)',           // 103
  'Sitar',                   // 104
  'Banjo',                   // 105
  'Shamisen',                // 106
  'Koto',                    // 107
  'Kalimba',                 // 108
  'Bagpipe',                 // 109
  'Fiddle',                  // 110
  'Shanai',                  // 111
  'Tinkle Bell',             // 112
  'Agogo',                   // 113
  'Steel Drums',             // 114
  'Woodblock',               // 115
  'Taiko Drum',              // 116
  'Melodic Tom',             // 117
  'Synth Drum',              // 118
  'Reverse Cymbal',          // 119
  'Guitar Fret Noise',       // 120
  'Breath Noise',            // 121
  'Seashore',                // 122
  'Bird Tweet',              // 123
  'Telephone Ring',          // 124
  'Helicopter',              // 125
  'Applause',                // 126
  'Gunshot'                  // 127
]

const NOTES = {
  'C': 0,
  'Db': 1,
  'D': 2,
  'Eb': 3,
  'E': 4,
  'F': 5,
  'Gb': 6,
  'G': 7,
  'Ab': 8,
  'A': 9,
  'Bb': 10,
  'B': 11
}

const MIDI_C0 = 12

const VELOCITIES = [
  0,
  20, 25, 30, 35, 40, 45, 47, 50,
  55, 57, 60, 65, 70, 75, 80, 85,
  90, 95, 100, 105, 110, 112, 115,
  117, 120, 122, 125, 127
]

// Each sample holds the note for this long, plus whatever tail FluidSynth
// renders after the note off. It is also what instrument.json advertises.
const DURATION_SECONDS = 4.5
const RELEASE_SECONDS = 1.0

// The generated MIDI carries no tempo event, so it plays at the default
// 120 BPM: one beat lasts half a second.
const TICKS_PER_BEAT = 480
const BEATS_PER_SECOND = 2
const DURATION_TICKS = DURATION_SECONDS * BEATS_PER_SECOND * TICKS_PER_BEAT

/**
 * Convert a note name and an octave into its MIDI pitch number.
 */
function noteToInt(note, octave) {
  return MIDI_C0 + (12 * octave) + NOTES[note]
}

// Magenta's SoundFont player asks for `p<pitch>_v<velocity>.mp3` by real MIDI
// pitch, so we sample the 88 keys of a piano: A0 (21) up to C8 (108).
const FIRST_NOTE = noteToInt('A', 0)
const LAST_NOTE = noteToInt('C', 8)

/**
 * Parse a combination of ranges and individual GM program numbers, like
 * '0-10,15,20,30-40', into a sorted list of unique programs.
 */
function parseInstruments(spec) {
  const programs = new Set()

  for (const part of spec.split(',')) {
    const range = part.trim()

    if (range === '') {
      continue
    }

    const match = range.match(/^(\d+)(?:-(\d+))?$/)
    if (!match) {
      throw new Error(`Invalid instruments range: '${range}'`)
    }

    const from = Number(match[1])
    const to = match[2] === undefined ? from : Number(match[2])

    if (from > to) {
      throw new Error(`Invalid instruments range: '${range}'`)
    }
    if (to >= MIDIJS_PATCH_NAMES.length) {
      throw new Error(
        `Instrument ${to} is out of range: programs are 0-${MIDIJS_PATCH_NAMES.length - 1}`
      )
    }

    for (let program = from; program <= to; program++) {
      programs.add(program)
    }
  }

  if (programs.size === 0) {
    throw new Error(`No instruments in: '${spec}'`)
  }

  return [ ...programs ].sort((one, another) => one - another)
}

/**
 * Locate an executable, the way `which` does.
 */
async function which(command) {
  try {
    const { stdout } = await execFileAsync('which', [ command ])
    return stdout.trim()
  } catch {
    return ''
  }
}

/**
 * Turn an instrument name into the folder name used for its samples.
 */
function instrumentKeyForName(instrument) {
  return instrument.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/ /g, '_')
}

/**
 * Write a single note MIDI file: pick the program, hold the note, release it.
 */
function generateMidi(program, noteValue, velocity, file) {
  const bytes = writeMidi({
    header: {
      format: 1,
      numTracks: 1,
      ticksPerBeat: TICKS_PER_BEAT
    },
    tracks: [
      [
        { deltaTime: 0, type: 'programChange', channel: 0, programNumber: program },
        { deltaTime: 0, type: 'noteOn', channel: 0, noteNumber: noteValue, velocity },
        { deltaTime: DURATION_TICKS, type: 'noteOff', channel: 0, noteNumber: noteValue, velocity },
        { deltaTime: 0, type: 'endOfTrack' }
      ]
    ]
  })

  fs.writeFileSync(file, Buffer.from(bytes))
}

/**
 * Render a MIDI file through FluidSynth, then encode the result as MP3.
 */
async function midiToAudio(tools, source, wavTarget, mp3Target) {
  await execFileAsync(tools.fluidsynth, [
    '-C', 'no',
    '-R', 'no',
    '-g', '0.8',
    '-q',
    '-F', wavTarget,
    tools.soundfont,
    source
  ])
  await execFileAsync(tools.lame, [ '-v', '-b', '8', '-B', '64', wavTarget, mp3Target ])
  fs.rmSync(wavTarget, { force: true })
}

/**
 * Render every note/velocity pair of one program, and describe the result in
 * an instrument.json next to the samples.
 */
async function generateAudio(program, tools) {
  const instrument = MIDIJS_PATCH_NAMES[program]
  const instrumentKey = instrumentKeyForName(instrument)
  const instrumentDir = path.join(tools.buildDir, instrumentKey)

  fs.mkdirSync(instrumentDir, { recursive: true })

  for (let noteValue = FIRST_NOTE; noteValue <= LAST_NOTE; noteValue++) {
    for (const velocity of VELOCITIES) {
      const outputName = `p${noteValue}_v${velocity}`
      const midiFile = path.join(
        tools.buildDir, `${instrumentKey}-${outputName}.temp.midi`
      )
      const wavFile = path.join(
        tools.buildDir, `${instrumentKey}-${outputName}.wav`
      )

      generateMidi(program, noteValue, velocity, midiFile)

      try {
        await midiToAudio(
          tools, midiFile, wavFile, path.join(instrumentDir, `${outputName}.mp3`)
        )
      } finally {
        fs.rmSync(midiFile, { force: true })
      }
    }

    console.log(
      `instrument: ${instrumentKey} finished for note ${noteValue} for all velocities`
    )
  }

  fs.writeFileSync(
    path.join(instrumentDir, 'instrument.json'),
    JSON.stringify({
      name: instrumentKey,
      minPitch: FIRST_NOTE,
      maxPitch: LAST_NOTE,
      durationSeconds: DURATION_SECONDS,
      releaseSeconds: RELEASE_SECONDS,
      percussive: false,
      velocities: VELOCITIES
    })
  )
}

/**
 * Run `worker` over `items`, keeping at most `limit` of them in flight.
 */
async function inParallel(items, limit, worker) {
  let next = 0

  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        await worker(items[next++])
      }
    }
  )

  await Promise.all(runners)
}

/**
 * Ask for a confirmation before the (long) build starts.
 */
async function confirm() {
  if (process.argv.includes('--yes') || !process.stdin.isTTY) {
    return
  }

  const rl = readline.createInterface({
    input: process.stdin, output: process.stdout
  })
  await rl.question('Hit return to begin.')
  rl.close()
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== '--yes')
  const [ soundfontArg, instrumentsArg, buildDirArg ] = args

  if (!soundfontArg) {
    throw new Error(
      'Usage: node src/tools/generate-magenta-sound-font.js ' +
      '<soundfont.sf2> [instruments] [output dir] [--yes]'
    )
  }

  const soundfont = path.resolve(soundfontArg)
  const instruments = parseInstruments(instrumentsArg || DEFAULT_INSTRUMENTS)
  const buildDir = buildDirArg
    ? path.resolve(buildDirArg)
    : path.join(DEFAULT_BUILD_DIR, path.basename(soundfont, path.extname(soundfont)))

  // The encoders are expected in your PATH.
  const lame = await which('lame')
  const fluidsynth = await which('fluidsynth')

  console.log('Building the following instruments using font: ' + soundfont)

  // Display instrument names.
  for (const program of instruments) {
    console.log(`    ${program}: ` + MIDIJS_PATCH_NAMES[program])
  }

  console.log()
  console.log('Using MP3 encoder: ' + lame)
  console.log('Using FluidSynth encoder: ' + fluidsynth)
  console.log()
  console.log('Sending output to: ' + buildDir)
  console.log()

  if (!fs.existsSync(soundfont)) {
    throw new Error(`Can't find soundfont: ${soundfont}`)
  }
  if (!lame) {
    throw new Error("Can't find 'lame' command")
  }
  if (!fluidsynth) {
    throw new Error("Can't find 'fluidsynth' command")
  }

  fs.mkdirSync(buildDir, { recursive: true })

  await confirm()

  await inParallel(
    instruments,
    os.availableParallelism(),
    (program) => generateAudio(program, { soundfont, buildDir, lame, fluidsynth })
  )
}

main().catch((error) => {
  console.error('[generate-magenta-sound-font] Error:', error.message)
  process.exit(1)
})
