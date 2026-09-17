/**
 * Running the two build tools from a page.
 *
 * Both take a file you have on disk and turn it into something the library
 * loads: a SMuFL `.otf` into a music-js font, an `.sf2` soundbank into the
 * sample set the player reads. Both are `tools/` scripts with a command line,
 * and nothing here reimplements them — these endpoints put the file where the
 * script expects it, run the script, and report what it said.
 *
 * They differ in how long they take, and that decides their shape. Tracing a
 * font is seconds, so it answers the request. Rendering a soundbank is hours,
 * so it is started in the background and watched through a second endpoint.
 */

import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'
import { spawn } from 'child_process'

import endpoint from '#dev-nodes/endpoint.js'
import body from '#dev-nodes/body.js'

import { REPOSITORY_ROOT, respondWith, resolveInside } from './shared.js'

const MUSIC_FONT_DIRECTORY = path.join(REPOSITORY_ROOT, 'src/drawer/font/music')
const MUSIC_JS_DIRECTORY = path.join(REPOSITORY_ROOT, 'src/drawer/font/music-js')
const SOUND_BANK_DIRECTORY = path.join(REPOSITORY_ROOT, 'src/midi/sound-banks')
const SAMPLE_SET_DIRECTORY = path.join(REPOSITORY_ROOT, 'src/midi/magenta-sound-font')
const LOG_DIRECTORY = path.join(REPOSITORY_ROOT, '.generator-logs')

/**
 * A file name that is a name and nothing else — no directory, no climbing.
 */
const isSafeFileName = (name) =>
  typeof name === 'string' &&
  /^[A-Za-z0-9][A-Za-z0-9 ._-]*$/.test(name) &&
  !name.includes('..')

const decoded = (value) => {
  try {
    return decodeURIComponent(value || '')
  } catch {
    return ''
  }
}

/**
 * What a generated font is called: the file's own name, lowercased, which is
 * the convention the four committed fonts already follow (Bravura.otf →
 * bravura.js) and what `music font is <name>` then accepts.
 */
const fontNameOf = (fileName) =>
  path.basename(fileName, path.extname(fileName)).toLowerCase().replace(/[^a-z0-9]+/g, '-')

/**
 * Run a script and collect what it said. Used for the work that finishes while
 * the request is open.
 */
function ran(script, args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [ script, ...args ], { cwd: REPOSITORY_ROOT })
    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { output += chunk })
    child.on('error', (error) => resolve({ code: -1, output: `${output}${error.message}` }))
    child.on('close', (code) => resolve({ code, output }))
  })
}

// --- the font generator -----------------------------------------------------

/**
 * What an `<input type="file">` becomes in an EHTML form: the file read as a
 * data URL. The bytes are what we want out of it.
 */
function bytesOfDataUrl(content) {
  const comma = typeof content === 'string' ? content.indexOf(',') : -1
  if (comma === -1 || !/^data:[^,]*;base64$/.test(content.slice(0, comma))) {
    return null
  }
  return Buffer.from(content.slice(comma + 1), 'base64')
}

/**
 * A SMuFL font in, a music-js font out.
 *
 * The request is the one an EHTML form sends: the chosen file arrives under the
 * name the upload was given, as `[ { name, size, type, content } ]` with the
 * content a data URL. That is why the page needs no script of its own — and it
 * is only workable because a font file is a few hundred kilobytes. The `.sf2`
 * next door is a thousand times that, and is streamed instead.
 *
 * The `.otf` is kept in src/drawer/font/music beside the others: the generated
 * font is a starting point, and re-tracing it later needs the source that made
 * it.
 */
const generateFont = endpoint('/dev/font/generate', 'POST', async ({ stream }) => {
  let request
  try {
    request = JSON.parse((await body(stream, { maxSize: 96 })).toString('utf-8'))
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }

  const chosen = (Array.isArray(request.font) ? request.font : [])[0]
  if (!chosen || !chosen.name) {
    return respondWith(stream, 400, { error: 'Choose a font file first.' })
  }

  const fileName = chosen.name
  if (!isSafeFileName(fileName) || !/\.otf$/i.test(fileName)) {
    return respondWith(stream, 400, { error: 'That is not an .otf with a plain name.' })
  }

  const fontName = fontNameOf(fileName)
  const otfAt = resolveInside(MUSIC_FONT_DIRECTORY, fileName)
  const musicJsAt = resolveInside(MUSIC_JS_DIRECTORY, `${fontName}.js`)
  if (!otfAt || !musicJsAt) {
    return respondWith(stream, 400, { error: 'That name does not stay in the font folder.' })
  }

  /*
  A music-js font that already exists has been tuned by hand — every yCorrection
  in it was set in the font viewer, and the generator knows none of them. So it
  is never replaced unless the page says to, which it only does after asking.
  */
  const replacing = fs.existsSync(musicJsAt)
  // A form field arrives as text, so both spellings of yes count.
  const overwriting = request.overwrite === true || request.overwrite === 'true'
  if (replacing && !overwriting) {
    return respondWith(stream, 409, {
      error: `${fontName}.js already exists, with corrections tuned into it by hand.` +
        ' Generating it again starts those over.',
      font: fontName,
      exists: true
    })
  }

  const uploaded = bytesOfDataUrl(chosen.content)
  if (!uploaded || !uploaded.length) {
    return respondWith(stream, 400, { error: 'The file did not arrive.' })
  }

  /*
  A font file starts with one of a few known tags — 'OTTO' for the CFF outlines
  every SMuFL font here carries, and the version tags for the glyf flavours.
  Checking it means a file that is not a font is refused here rather than
  failing somewhere deep inside the tracer.
  */
  const tag = uploaded.subarray(0, 4)
  const looksLikeAFont =
    [ 'OTTO', 'true', 'ttcf' ].includes(tag.toString('latin1')) ||
    tag.equals(Buffer.from([ 0x00, 0x01, 0x00, 0x00 ]))
  if (!looksLikeAFont) {
    return respondWith(stream, 400, { error: 'That file does not look like an OpenType font.' })
  }

  await fsp.mkdir(MUSIC_FONT_DIRECTORY, { recursive: true })
  await fsp.writeFile(otfAt, uploaded)

  const generated = await ran(
    path.join(REPOSITORY_ROOT, 'tools/smufl/generate-smufl-js-font.js'),
    [ otfAt, musicJsAt ]
  )

  if (generated.code !== 0) {
    return respondWith(stream, 500, {
      error: 'The generator did not finish.',
      font: fontName,
      otf: path.relative(REPOSITORY_ROOT, otfAt),
      output: generated.output
    })
  }

  respondWith(stream, 200, {
    font: fontName,
    replaced: replacing,
    otf: path.relative(REPOSITORY_ROOT, otfAt),
    musicJs: path.relative(REPOSITORY_ROOT, musicJsAt),
    output: generated.output
  })
})

// --- the sound font generator -----------------------------------------------

/*
One render at a time, and it outlives the request that started it. What it is
doing is read back out of its log, which is also what is left behind to look at
when it fails.

It outlives this server too. The child is detached so that stopping it can take
FluidSynth with it, which means restarting the dev server — something you do
after every edit — leaves the render going while this module forgets all about
it. So what it needs to pick the render back up is written down beside the log,
and read back when nothing is in hand.
*/
let rendering = null

const NOTE_OF_A_RENDER = path.join(LOG_DIRECTORY, 'rendering.json')

const stillAlive = (pid) => {
  try {
    // Signal 0 asks after a process without touching it.
    process.kill(pid, 0)
    return true
  } catch (error) {
    return error.code === 'EPERM'
  }
}

function rememberRender() {
  try {
    fs.mkdirSync(LOG_DIRECTORY, { recursive: true })
    fs.writeFileSync(NOTE_OF_A_RENDER, JSON.stringify(rendering))
  } catch {
    // Not being able to write the note is no reason to stop rendering.
  }
}

/**
 * Pick up a render this process did not start.
 *
 * Only what is still running is adopted: a finished one is somebody else's
 * history, and reporting it as though this server had run it would be a lie
 * about what the page is looking at.
 */
function adoptRenderIfAny() {
  if (rendering) {
    return
  }
  let noted
  try {
    noted = JSON.parse(fs.readFileSync(NOTE_OF_A_RENDER, 'utf-8'))
  } catch {
    return
  }
  if (!noted || !noted.running || !noted.pid || !stillAlive(noted.pid)) {
    return
  }
  rendering = { ...noted, adopted: true }
}

/**
 * Everything that has to happen once a render is over, however it ended.
 *
 * It is separate because there are two ways to get here: the child's own `close`
 * event, and — for a render adopted from a previous server, which has no child
 * object behind it — noticing that its process is gone.
 */
function finishRender() {
  const outputAt = rendering.outputAt
  if (!outputAt) {
    return
  }

  /*
  The renderer writes each note's .midi and .wav beside the instrument folders
  and removes them as it goes. Stopping it interrupts that, so the two files of
  the note it was on are swept up here — a set folder should hold instruments
  and nothing else.
  */
  try {
    for (const file of fs.readdirSync(outputAt)) {
      if (file.endsWith('.temp.midi') || file.endsWith('.wav')) {
        fs.rmSync(path.join(outputAt, file), { force: true })
      }
    }
  } catch {
    // Nothing was written, which is its own answer.
  }

  /*
  A set is of no use to either app until its static folder has a link to it, and
  that is the one thing the tool does that the script does not. A stopped render
  is worth linking too: every instrument it did finish is complete.
  */
  if (fs.existsSync(outputAt)) {
    spawn(process.execPath, [ path.join(REPOSITORY_ROOT, 'scripts/setup-symlinks.js') ], {
      cwd: REPOSITORY_ROOT, stdio: 'ignore'
    }).on('close', () => {
      rendering.linked = true
      rememberRender()
    })
  }
}

/*
The renderer walks the 88 keys of a piano for each instrument — A0 up to C8 —
and writes one line when it has finished a note at every velocity. So the lines
it has written, against that count, is real progress rather than a guess.
*/
const NOTES_PER_INSTRUMENT = 88
const A_NOTE_WAS_FINISHED = /finished for note \d+/

/**
 * How many GM programs a spec like '0-10,15,20-40' asks for.
 */
function programsIn(spec) {
  const programs = new Set()
  for (const part of spec.split(',')) {
    const [ from, to ] = part.trim().split('-').map(Number)
    for (let program = from; program <= (to === undefined ? from : to); program++) {
      programs.add(program)
    }
  }
  return programs.size
}

const uploadSoundBank = endpoint('/dev/magenta/upload?name', 'POST', async ({ stream, queries }) => {
  const fileName = decoded(queries.name)
  if (!isSafeFileName(fileName) || !/\.sf2$/i.test(fileName)) {
    return respondWith(stream, 400, { error: 'Expected ?name=<something>.sf2' })
  }
  const at = resolveInside(SOUND_BANK_DIRECTORY, fileName)
  if (!at) {
    return respondWith(stream, 400, { error: 'That name does not stay in the sound bank folder' })
  }

  await fsp.mkdir(SOUND_BANK_DIRECTORY, { recursive: true })

  /*
  Written straight through to disk rather than collected first: a General MIDI
  soundbank is commonly 300 MB and more, which is not a thing to hold in memory
  on the way past.
  */
  try {
    await new Promise((resolve, reject) => {
      const file = fs.createWriteStream(at)
      stream.pipe(file)
      file.on('finish', resolve)
      file.on('error', reject)
      stream.on('error', reject)
    })
  } catch (error) {
    return respondWith(stream, 500, { error: `Could not save it: ${error.message}` })
  }

  const { size } = await fsp.stat(at)
  respondWith(stream, 200, {
    file: fileName,
    bytes: size,
    at: path.relative(REPOSITORY_ROOT, at)
  })
})

const startRender = endpoint('/dev/magenta/generate', 'POST', async ({ stream }) => {
  adoptRenderIfAny()
  if (rendering && rendering.running) {
    return respondWith(stream, 409, { error: 'A render is already going.', job: report() })
  }

  let request
  try {
    request = JSON.parse((await body(stream, { maxSize: 1 })).toString('utf-8'))
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }

  const fileName = request.file
  if (!isSafeFileName(fileName) || !/\.sf2$/i.test(fileName)) {
    return respondWith(stream, 400, { error: 'Expected { file } naming an uploaded .sf2' })
  }
  const soundBankAt = resolveInside(SOUND_BANK_DIRECTORY, fileName)
  if (!soundBankAt || !fs.existsSync(soundBankAt)) {
    return respondWith(stream, 404, { error: `No ${fileName} has been uploaded` })
  }

  const instruments = typeof request.instruments === 'string' && request.instruments.trim()
    ? request.instruments.trim()
    : '0-127'
  if (!/^[0-9]+(-[0-9]+)?(,[0-9]+(-[0-9]+)?)*$/.test(instruments)) {
    return respondWith(stream, 400, {
      error: "Instruments must be numbers and ranges, like '0-10,15,20-40'"
    })
  }

  const setName = path.basename(fileName, path.extname(fileName))
  const outputAt = path.join(SAMPLE_SET_DIRECTORY, setName)

  await fsp.mkdir(LOG_DIRECTORY, { recursive: true })
  const logAt = path.join(LOG_DIRECTORY, `magenta-${setName}.log`)
  const log = fs.openSync(logAt, 'w')

  const child = spawn(
    process.execPath,
    [
      path.join(REPOSITORY_ROOT, 'tools/magenta/generate-magenta-sound-font.js'),
      soundBankAt, instruments, outputAt, '--yes'
    ],
    {
      cwd: REPOSITORY_ROOT,
      stdio: [ 'ignore', log, log ],
      /*
      Its own process group. Stopping a render has to take FluidSynth and Lame
      with it — they are what the time is actually spent in, and killing only
      the script would leave one of them running and the note half written.
      */
      detached: true
    }
  )

  rendering = {
    set: setName,
    instruments,
    expectedNotes: programsIn(instruments) * NOTES_PER_INSTRUMENT,
    logAt,
    outputAt,
    pid: child.pid,
    startedAt: Date.now(),
    running: true,
    code: null,
    stopped: false,
    linked: false
  }
  rememberRender()

  child.on('close', (code, signal) => {
    rendering.running = false
    rendering.code = code
    rendering.signal = signal
    rendering.finishedAt = Date.now()
    fs.closeSync(log)
    rememberRender()
    finishRender()
  })

  respondWith(stream, 200, { started: true, job: report() })
})

/**
 * What the render is doing.
 *
 * All of it comes out of the log, because that is the only thing the render
 * tells anyone. One line per finished note, against the notes the job asked
 * for, is a fraction that means something — unlike elapsed time, which says
 * nothing about how much is left.
 */
function report(lines = 0) {
  adoptRenderIfAny()
  if (!rendering) {
    return null
  }

  /*
  A render adopted from a previous server has no child object behind it, so
  nothing will tell us when it ends. The system is asked instead.
  */
  if (rendering.adopted && rendering.running && !stillAlive(rendering.pid)) {
    rendering.running = false
    rendering.finishedAt = Date.now()
    rememberRender()
    finishRender()
  }

  let written = []
  try {
    written = fs.readFileSync(rendering.logAt, 'utf-8').split('\n').filter(Boolean)
  } catch {
    // It may not have written anything yet.
  }

  const done = written.filter((line) => A_NOTE_WAS_FINISHED.test(line)).length
  const expected = rendering.expectedNotes
  const seconds = Math.round(((rendering.finishedAt || Date.now()) - rendering.startedAt) / 1000)

  const job = {
    set: rendering.set,
    instruments: rendering.instruments,
    running: rendering.running,
    stopped: rendering.stopped,
    code: rendering.code,
    linked: rendering.linked,
    seconds,
    notesDone: done,
    notesExpected: expected,
    percent: expected ? Math.min(100, Math.round((done / expected) * 100)) : 0,
    log: path.relative(REPOSITORY_ROOT, rendering.logAt)
  }

  /*
  What is left, from what the render has managed so far. Only worth saying once
  there is enough of it to mean anything — a guess off two notes is noise.
  */
  if (rendering.running && done > 4 && done < expected) {
    const perNote = seconds / done
    job.secondsLeft = Math.round(perNote * (expected - done))
  }

  // Which instrument it is on, which is what the log line actually names.
  const last = [ ...written ].reverse().find((line) => A_NOTE_WAS_FINISHED.test(line))
  const named = last && last.match(/^instrument: (\S+)/)
  if (named) {
    job.instrument = named[1]
  }

  job.wrote = written.length
  if (lines) {
    job.lines = written.slice(-lines)
  }
  return job
}

/**
 * Stop the render.
 *
 * The whole group goes, not just the script: FluidSynth and Lame are where the
 * time is spent, and killing the script alone would leave one of them running.
 * What has already been rendered is kept — every instrument it finished is
 * complete, and is linked into the apps the same way a finished set is.
 */
const stopRender = endpoint('/dev/magenta/stop', 'POST', async ({ stream }) => {
  adoptRenderIfAny()
  if (!rendering || !rendering.running) {
    return respondWith(stream, 409, { error: 'Nothing is rendering.', job: report() })
  }

  rendering.stopped = true
  try {
    process.kill(-rendering.pid, 'SIGTERM')
  } catch (error) {
    /*
    The group may be gone already — it finishes between the page asking and this
    running often enough to be worth expecting rather than reporting.
    */
    if (error.code !== 'ESRCH') {
      rendering.stopped = false
      return respondWith(stream, 500, { error: `Could not stop it: ${error.message}` })
    }
  }

  if (rendering.adopted) {
    rendering.running = false
    rendering.finishedAt = Date.now()
    rememberRender()
    finishRender()
  }

  respondWith(stream, 200, { stopped: true, job: report() })
})

const renderProgress = endpoint('/dev/magenta/progress', 'GET', async ({ stream }) => {
  const banks = []
  try {
    for (const file of await fsp.readdir(SOUND_BANK_DIRECTORY)) {
      if (file.toLowerCase().endsWith('.sf2')) {
        banks.push({ file, bytes: (await fsp.stat(path.join(SOUND_BANK_DIRECTORY, file))).size })
      }
    }
  } catch {
    // None uploaded yet.
  }

  respondWith(stream, 200, { job: report(40), banks })
})

/**
 * What has been rendered: the sets, and the instruments in each.
 *
 * Its own endpoint rather than a corner of the progress report, because the
 * table that lists them is asked for on its own — after a deletion, say — and
 * has no business waking a render up to find out what is on disk.
 */
const listSets = endpoint('/dev/magenta/sets', 'GET', async ({ stream }) => {
  const sets = []
  try {
    for (const entry of await fsp.readdir(SAMPLE_SET_DIRECTORY, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue
      }
      /*
      An instrument is a directory. The renderer leaves its working .midi and
      .wav beside them while it runs, so counting entries would count those too.
      */
      const at = path.join(SAMPLE_SET_DIRECTORY, entry.name)
      const instruments = []
      for (const one of (await fsp.readdir(at, { withFileTypes: true })).filter((each) => each.isDirectory())) {
        const samples = await fsp.readdir(path.join(at, one.name))
        instruments.push({
          name: one.name,
          samples: samples.filter((file) => file.endsWith('.mp3')).length
        })
      }
      sets.push({
        name: entry.name,
        count: instruments.length,
        instruments: instruments.sort((one, other) => one.name.localeCompare(other.name))
      })
    }
  } catch {
    // Nothing rendered yet.
  }

  respondWith(stream, 200, { sets: sets.sort((one, other) => one.name.localeCompare(other.name)) })
})

/**
 * Remove a rendered set, or one instrument out of one.
 *
 * A set is 184 MB of mp3 and hours of rendering, so this is the one thing here
 * that destroys work — which is why it refuses to touch whatever is being
 * rendered, and why the page asks before calling it. Removing a whole set also
 * takes its links with it, through the same script that made them.
 */
const deleteSet = endpoint('/dev/magenta/delete', 'POST', async ({ stream }) => {
  let request
  try {
    request = JSON.parse((await body(stream, { maxSize: 1 })).toString('utf-8'))
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }

  const set = request.set
  const instrument = request.instrument || null
  if (!isSafeFileName(set) || (instrument !== null && !isSafeFileName(instrument))) {
    return respondWith(stream, 400, { error: 'Expected { set } and optionally { instrument }' })
  }

  const at = instrument
    ? resolveInside(SAMPLE_SET_DIRECTORY, set, instrument)
    : resolveInside(SAMPLE_SET_DIRECTORY, set)
  if (!at) {
    return respondWith(stream, 400, { error: 'That name does not stay in the sound font folder.' })
  }
  if (!fs.existsSync(at)) {
    return respondWith(stream, 404, { error: `There is no ${instrument || set}.` })
  }

  /*
  Deleting under a render would take away files it is in the middle of writing,
  and leave the set half gone and half being made.
  */
  adoptRenderIfAny()
  if (rendering && rendering.running && rendering.set === set) {
    return respondWith(stream, 409, {
      error: `${set} is being rendered. Stop the render first.`
    })
  }

  try {
    await fsp.rm(at, { recursive: true, force: true })
  } catch (error) {
    return respondWith(stream, 500, { error: `Could not delete it: ${error.message}` })
  }

  /*
  A set that is gone leaves a link pointing at nothing in each app's static
  folder; the symlink script is what prunes those, so it is run again.
  */
  if (!instrument) {
    spawn(process.execPath, [ path.join(REPOSITORY_ROOT, 'scripts/setup-symlinks.js') ], {
      cwd: REPOSITORY_ROOT, stdio: 'ignore'
    })
  }

  respondWith(stream, 200, { deleted: instrument || set, set, instrument })
})

export default [
  generateFont,
  uploadSoundBank, startRender, stopRender, renderProgress, listSets, deleteSet
]
