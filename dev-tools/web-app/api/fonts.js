/**
 * What faces this repository has, and taking delivery of new ones.
 *
 * Three families are engraved from: the SMuFL music fonts, the text faces that
 * set titles and lyrics, and the chord-letter faces. Each lives in its own
 * folder under src/drawer/font, and until now every page that wanted to name
 * them carried its own copy of the list — which went stale the moment a font
 * was added.
 *
 * So the list is read off the disk instead, under the names the language
 * actually accepts. Those names are a convention rather than a declaration:
 * `NotoSerif-Regular.ttf` is `noto-serif` to `text font is …`, and
 * `GentiumPlus-Regular.ttf` is `gentium plus` to `chord letters font is …`.
 * Both are derived here, in one place, from the file names themselves.
 */

import fs from 'fs/promises'
import path from 'path'

import endpoint from '#dev-nodes/endpoint.js'
import body from '#dev-nodes/body.js'

import { REPOSITORY_ROOT, respondWith, resolveInside } from './shared.js'

const FONT_ROOT = path.join(REPOSITORY_ROOT, 'src/drawer/font')

export const FAMILIES = {
  music: { directory: path.join(FONT_ROOT, 'music'), extension: '.otf' },
  text: { directory: path.join(FONT_ROOT, 'text'), extension: '.ttf' },
  'chord-letters': { directory: path.join(FONT_ROOT, 'chord-letters'), extension: '.ttf' }
}

const MUSIC_JS_DIRECTORY = path.join(FONT_ROOT, 'music-js')

const listed = async (directory, extension) => {
  try {
    return (await fs.readdir(directory))
      .filter((file) => file.toLowerCase().endsWith(extension))
      .sort()
  } catch {
    return []
  }
}

/**
 * The words in a file's name: `NotoSerif` is two, `GothicA1` is two, and the
 * weight is not one of them.
 */
const wordsIn = (fileName) =>
  path.basename(fileName, path.extname(fileName))
    .replace(/-(Regular|Bold|Italic|Medium|Book)$/i, '')
    .split(/[-_\s]+/)
    .flatMap((part) => part.split(/(?<=[a-z0-9])(?=[A-Z])/))
    .filter(Boolean)

/*
The two families spell their names differently, and both spellings are what the
parser already accepts — `text font is noto-sans`, `chord letters font is
gentium plus` — so each is derived the way its own family writes it.
*/
const textNameOf = (fileName) => wordsIn(fileName).join('-').toLowerCase()
const chordNameOf = (fileName) => wordsIn(fileName).join(' ').toLowerCase()
const musicNameOf = (fileName) =>
  path.basename(fileName, path.extname(fileName)).toLowerCase().replace(/[^a-z0-9]+/g, '-')

const weightOf = (fileName) => /-Bold\./i.test(fileName) ? 'bold' : 'regular'

/**
 * The music fonts: a `.otf` to trace from and a music-js table to draw with.
 * A font needs both before anything can be engraved in it, so which half is
 * missing is part of the answer.
 */
async function musicFonts() {
  const traced = new Set(
    (await listed(MUSIC_JS_DIRECTORY, '.js')).map((file) => path.basename(file, '.js'))
  )
  const fonts = (await listed(FAMILIES.music.directory, '.otf')).map((file) => {
    const name = musicNameOf(file)
    return {
      name,
      file,
      url: `/font/music/${file}`,
      js: traced.has(name) ? `/js/msq/worker/drawer/font/music-js/${name}.js` : null,
      usable: traced.has(name),
      says: traced.has(name) ? `traced into ${name}.js` : 'not traced yet'
    }
  })

  /*
  A table with no font file beside it can still be drawn with — the tracing is
  already done — so it is listed too rather than quietly dropped.
  */
  for (const name of traced) {
    if (!fonts.some((one) => one.name === name)) {
      fonts.push({
        name,
        file: null,
        url: null,
        js: `/js/msq/worker/drawer/font/music-js/${name}.js`,
        usable: false,
        says: 'traced, but its .otf is missing'
      })
    }
  }

  return fonts.sort((one, other) => one.name.localeCompare(other.name))
}

/**
 * The text faces, gathered by family: each needs a regular and a bold.
 */
async function textFonts() {
  const families = new Map()
  for (const file of await listed(FAMILIES.text.directory, '.ttf')) {
    const name = textNameOf(file)
    const family = families.get(name) || { name, regular: null, bold: null }
    family[weightOf(file)] = file
    families.set(name, family)
  }

  return [ ...families.values() ].map((family) => {
    /*
    A face with no bold is still worth testing: the regular one stands in, and
    the page says so rather than the family going missing until someone finds
    the second file.
    */
    const standingIn = !family.bold && !!family.regular
    return {
      name: family.name,
      regular: family.regular,
      bold: family.bold || family.regular,
      url: {
        regular: `/font/text/${family.regular || family.bold}`,
        bold: `/font/text/${family.bold || family.regular}`
      },
      usable: !!(family.regular || family.bold),
      boldStandsIn: standingIn,
      says: standingIn ? 'no bold face — the regular one stands in for it' : 'regular and bold'
    }
  }).sort((one, other) => one.name.localeCompare(other.name))
}

/**
 * The chord-letter faces. One file each; a weight in the name is not part of it.
 */
async function chordLetterFonts() {
  return (await listed(FAMILIES['chord-letters'].directory, '.ttf')).map((file) => ({
    name: chordNameOf(file),
    file,
    url: `/font/chord-letters/${file}`,
    usable: true,
    says: file
  })).sort((one, other) => one.name.localeCompare(other.name))
}

/**
 * Every face there is, and the config that registers them.
 *
 * The config is given in the shape `setupFonts` takes, so a page can hand it
 * straight over instead of assembling one and getting the spelling wrong.
 */
const listFonts = endpoint('/dev/fonts', 'GET', async ({ stream }) => {
  const music = await musicFonts()
  const text = await textFonts()
  const chordLetters = await chordLetterFonts()

  const config = {
    'chord-letters': Object.fromEntries(
      chordLetters.map((font) => [ font.name, font.url ])
    ),
    'text': Object.fromEntries(
      text.filter((font) => font.usable).map((font) => [ font.name, font.url ])
    ),
    'music': Object.fromEntries(
      music.filter((font) => font.usable).map((font) => [ font.name, { font: font.url, js: font.js } ])
    )
  }

  respondWith(stream, 200, { music, text, 'chord-letters': chordLetters, config })
})

/**
 * Take in a text or chord-letter face.
 *
 * Both are `.ttf` files that the engine reads directly, so there is nothing to
 * generate: dropping the file in its folder is the whole of it, and the face is
 * usable as soon as the page registers the fonts again. A music font is not
 * like this — it has to be traced first — so it goes through the font
 * generator instead.
 *
 * The request is the one an EHTML form sends: files under the name the upload
 * was given, each as `{ name, content }` with the content a data URL.
 */
const uploadFont = endpoint('/dev/fonts/upload', 'POST', async ({ stream }) => {
  let request
  try {
    request = JSON.parse((await body(stream, { maxSize: 64 })).toString('utf-8'))
  } catch (error) {
    return respondWith(stream, 400, { error: `Could not read the request: ${error.message}` })
  }

  const family = request.family
  if (family !== 'text' && family !== 'chord-letters') {
    return respondWith(stream, 400, {
      error: 'Only text and chord-letter faces are taken in here. A music font has' +
        ' to be traced, which the font generator does.'
    })
  }

  const chosen = (Array.isArray(request.face) ? request.face : []).filter(Boolean)
  if (!chosen.length) {
    return respondWith(stream, 400, { error: 'Choose a .ttf first.' })
  }

  const written = []
  for (const file of chosen) {
    if (!file.name || !/^[A-Za-z0-9][A-Za-z0-9 ._-]*\.ttf$/i.test(file.name)) {
      return respondWith(stream, 400, {
        error: `"${file.name || 'that file'}" is not a .ttf with a plain name.`
      })
    }
    const at = resolveInside(FAMILIES[family].directory, file.name)
    if (!at) {
      return respondWith(stream, 400, { error: 'That name does not stay in the font folder.' })
    }

    const comma = typeof file.content === 'string' ? file.content.indexOf(',') : -1
    if (comma === -1) {
      return respondWith(stream, 400, { error: `${file.name} did not arrive.` })
    }
    const bytes = Buffer.from(file.content.slice(comma + 1), 'base64')

    /*
    TrueType starts with 0x00010000, and an OpenType wrapper with 'OTTO' or
    'true'. Checking it here means a file that is not a font is refused now
    rather than breaking every engraving on the page later.
    */
    const tag = bytes.subarray(0, 4)
    const looksLikeAFont =
      [ 'OTTO', 'true', 'ttcf' ].includes(tag.toString('latin1')) ||
      tag.equals(Buffer.from([ 0x00, 0x01, 0x00, 0x00 ]))
    if (!looksLikeAFont) {
      return respondWith(stream, 400, { error: `${file.name} does not look like a font.` })
    }

    await fs.mkdir(FAMILIES[family].directory, { recursive: true })
    await fs.writeFile(at, bytes)
    written.push(file.name)
  }

  respondWith(stream, 200, {
    family,
    wrote: written,
    name: family === 'text' ? textNameOf(written[0]) : chordNameOf(written[0])
  })
})

export default [ listFonts, uploadFont ]
