// opentype.js
// https://github.com/opentypejs/opentype.js
// (c) 2015 Frederik De Bleser
// opentype.js may be freely distributed under the MIT license.

import inflate from '#msq/drawer/lib/opentype/tiny-inflate.js'
import Font from '#msq/drawer/lib/opentype/font.js'
import Glyph from '#msq/drawer/lib/opentype/glyph.js'
import { CmapEncoding, GlyphNames, addGlyphNames } from '#msq/drawer/lib/opentype/encoding.js'
import { Parser, getULong, getTag, getUShort, getCard16 } from '#msq/drawer/lib/opentype/parse.js'
import BoundingBox from '#msq/drawer/lib/opentype/bbox.js'
import Path from '#msq/drawer/lib/opentype/path.js'
import { nodeBufferToArrayBuffer } from '#msq/drawer/lib/opentype/util.js'
import cmap from '#msq/drawer/lib/opentype/tables/cmap.js'
import cff from '#msq/drawer/lib/opentype/tables/cff.js'
import fvar from '#msq/drawer/lib/opentype/tables/fvar.js'
import glyf from '#msq/drawer/lib/opentype/tables/glyf.js'
import gpos from '#msq/drawer/lib/opentype/tables/gpos.js'
import gsub from '#msq/drawer/lib/opentype/tables/gsub.js'
import head from '#msq/drawer/lib/opentype/tables/head.js'
import hhea from '#msq/drawer/lib/opentype/tables/hhea.js'
import hmtx from '#msq/drawer/lib/opentype/tables/hmtx.js'
import kern from '#msq/drawer/lib/opentype/tables/kern.js'
import ltag from '#msq/drawer/lib/opentype/tables/ltag.js'
import loca from '#msq/drawer/lib/opentype/tables/loca.js'
import maxp from '#msq/drawer/lib/opentype/tables/maxp.js'
import _name from '#msq/drawer/lib/opentype/tables/name.js'
import os2 from '#msq/drawer/lib/opentype/tables/os2.js'
import post from '#msq/drawer/lib/opentype/tables/post.js'
import meta from '#msq/drawer/lib/opentype/tables/meta.js'

import * as parse from '#msq/drawer/lib/opentype/parse.js'

/**
 * The opentype library.
 * @namespace opentype
 */

// File loaders /////////////////////////////////////////////////////////
/**
 * Loads a font from a file.
 * @param  {string} path - The path of the file
 */
async function loadFromFile (path, callback) {
  const fs = await import('fs')
  const buffer = await fs.promises.readFile(path)
  return nodeBufferToArrayBuffer(buffer)
}

/**
 * Loads a font from a URL.
 * @param  {string} url - The URL of the font file.
 */
export async function loadFromUrl (url) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('get', url, true)
    request.responseType = 'arraybuffer'

    request.onload = function () {
      if (request.status >= 200 && request.status < 300 && request.response) {
        resolve(request.response)
      } else {
        reject(new Error(`Font could not be loaded: ${request.statusText}`))
      }
    }

    request.onerror = function () {
      reject(new Error('Font could not be loaded'))
    }

    request.send()
  })
}

// Table Directory Entries //////////////////////////////////////////////
/**
 * Parses OpenType table entries.
 * @param  {DataView}
 * @param  {Number}
 * @return {Object[]}
 */
function parseOpenTypeTableEntries (data, numTables) {
  const tableEntries = []
  let p = 12
  for (let i = 0; i < numTables; i += 1) {
    const tag = getTag(data, p)
    const checksum = getULong(data, p + 4)
    const offset = getULong(data, p + 8)
    const length = getULong(data, p + 12)
    tableEntries.push({ tag, checksum, offset, length, compression: false })
    p += 16
  }

  return tableEntries
}

/**
 * Parses WOFF table entries.
 * @param  {DataView}
 * @param  {Number}
 * @return {Object[]}
 */
function parseWOFFTableEntries (data, numTables) {
  const tableEntries = []
  let p = 44 // offset to the first table directory entry.
  for (let i = 0; i < numTables; i += 1) {
    const tag = getTag(data, p)
    const offset = getULong(data, p + 4)
    const compLength = getULong(data, p + 8)
    const origLength = getULong(data, p + 12)
    let compression
    if (compLength < origLength) {
      compression = 'WOFF'
    } else {
      compression = false
    }

    tableEntries.push({
      tag,
      offset,
      compression,
      compressedLength: compLength,
      length: origLength
    })
    p += 20
  }

  return tableEntries
}

/**
 * @typedef TableData
 * @type Object
 * @property {DataView} data - The DataView
 * @property {number} offset - The data offset.
 */

/**
 * @param  {DataView}
 * @param  {Object}
 * @return {TableData}
 */
function uncompressTable (data, tableEntry) {
  if (tableEntry.compression === 'WOFF') {
    const inBuffer = new Uint8Array(data.buffer, tableEntry.offset + 2, tableEntry.compressedLength - 2)
    const outBuffer = new Uint8Array(tableEntry.length)
    inflate(inBuffer, outBuffer)
    if (outBuffer.byteLength !== tableEntry.length) {
      throw new Error('Decompression error: ' + tableEntry.tag + ' decompressed length doesn\'t match recorded length')
    }

    const view = new DataView(outBuffer.buffer, 0)
    return { data: view, offset: 0 }
  } else {
    return { data, offset: tableEntry.offset }
  }
}

// Public API ///////////////////////////////////////////////////////////

/**
 * Parse the OpenType file data (as an ArrayBuffer) and return a Font object.
 * Throws an error if the font could not be parsed.
 * @param  {ArrayBuffer}
 * @return {opentype.Font}
 */
function parseBuffer (buffer) {
  let indexToLocFormat
  let ltagTable

  // Since the constructor can also be called to create new fonts from scratch, we indicate this
  // should be an empty font that we'll fill with our own data.
  const font = new Font({ empty: true })

  // OpenType fonts use big endian byte ordering.
  // We can't rely on typed array view types, because they operate with the endianness of the host computer.
  // Instead we use DataViews where we can specify endianness.
  const data = new DataView(buffer, 0)
  let numTables
  let tableEntries = []
  const signature = getTag(data, 0)
  if (signature === String.fromCharCode(0, 1, 0, 0) || signature === 'true' || signature === 'typ1') {
    font.outlinesFormat = 'truetype'
    numTables = getUShort(data, 4)
    tableEntries = parseOpenTypeTableEntries(data, numTables)
  } else if (signature === 'OTTO') {
    font.outlinesFormat = 'cff'
    numTables = getUShort(data, 4)
    tableEntries = parseOpenTypeTableEntries(data, numTables)
  } else if (signature === 'wOFF') {
    const flavor = getTag(data, 4)
    if (flavor === String.fromCharCode(0, 1, 0, 0)) {
      font.outlinesFormat = 'truetype'
    } else if (flavor === 'OTTO') {
      font.outlinesFormat = 'cff'
    } else {
      throw new Error('Unsupported OpenType flavor ' + signature)
    }

    numTables = getUShort(data, 12)
    tableEntries = parseWOFFTableEntries(data, numTables)
  } else {
    throw new Error('Unsupported OpenType signature ' + signature)
  }

  let cffTableEntry
  let fvarTableEntry
  let glyfTableEntry
  let gposTableEntry
  let gsubTableEntry
  let hmtxTableEntry
  let kernTableEntry
  let locaTableEntry
  let nameTableEntry
  let metaTableEntry
  let p

  for (let i = 0; i < numTables; i += 1) {
    const tableEntry = tableEntries[i]
    let table
    switch (tableEntry.tag) {
      case 'cmap':
        table = uncompressTable(data, tableEntry)
        font.tables.cmap = cmap.parse(table.data, table.offset)
        font.encoding = new CmapEncoding(font.tables.cmap)
        break
      case 'cvt ' :
        table = uncompressTable(data, tableEntry)
        p = new Parser(table.data, table.offset)
        font.tables.cvt = p.parseShortList(tableEntry.length / 2)
        break
      case 'fvar':
        fvarTableEntry = tableEntry
        break
      case 'fpgm' :
        table = uncompressTable(data, tableEntry)
        p = new Parser(table.data, table.offset)
        font.tables.fpgm = p.parseByteList(tableEntry.length)
        break
      case 'head':
        table = uncompressTable(data, tableEntry)
        font.tables.head = head.parse(table.data, table.offset)
        font.unitsPerEm = font.tables.head.unitsPerEm
        indexToLocFormat = font.tables.head.indexToLocFormat
        break
      case 'hhea':
        table = uncompressTable(data, tableEntry)
        font.tables.hhea = hhea.parse(table.data, table.offset)
        font.ascender = font.tables.hhea.ascender
        font.descender = font.tables.hhea.descender
        font.numberOfHMetrics = font.tables.hhea.numberOfHMetrics
        break
      case 'hmtx':
        hmtxTableEntry = tableEntry
        break
      case 'ltag':
        table = uncompressTable(data, tableEntry)
        ltagTable = ltag.parse(table.data, table.offset)
        break
      case 'maxp':
        table = uncompressTable(data, tableEntry)
        font.tables.maxp = maxp.parse(table.data, table.offset)
        font.numGlyphs = font.tables.maxp.numGlyphs
        break
      case 'name':
        nameTableEntry = tableEntry
        break
      case 'OS/2':
        table = uncompressTable(data, tableEntry)
        font.tables.os2 = os2.parse(table.data, table.offset)
        break
      case 'post':
        table = uncompressTable(data, tableEntry)
        font.tables.post = post.parse(table.data, table.offset)
        font.glyphNames = new GlyphNames(font.tables.post)
        break
      case 'prep' :
        table = uncompressTable(data, tableEntry)
        p = new Parser(table.data, table.offset)
        font.tables.prep = p.parseByteList(tableEntry.length)
        break
      case 'glyf':
        glyfTableEntry = tableEntry
        break
      case 'loca':
        locaTableEntry = tableEntry
        break
      case 'CFF ':
        cffTableEntry = tableEntry
        break
      case 'kern':
        kernTableEntry = tableEntry
        break
      case 'GPOS':
        gposTableEntry = tableEntry
        break
      case 'GSUB':
        gsubTableEntry = tableEntry
        break
      case 'meta':
        metaTableEntry = tableEntry
        break
    }
  }

  const nameTable = uncompressTable(data, nameTableEntry)
  font.tables.name = _name.parse(nameTable.data, nameTable.offset, ltagTable)
  font.names = font.tables.name

  if (glyfTableEntry && locaTableEntry) {
    const shortVersion = indexToLocFormat === 0
    const locaTable = uncompressTable(data, locaTableEntry)
    const locaOffsets = loca.parse(locaTable.data, locaTable.offset, font.numGlyphs, shortVersion)
    const glyfTable = uncompressTable(data, glyfTableEntry)
    font.glyphs = glyf.parse(glyfTable.data, glyfTable.offset, locaOffsets, font)
  } else if (cffTableEntry) {
    const cffTable = uncompressTable(data, cffTableEntry)
    cff.parse(cffTable.data, cffTable.offset, font)
  } else {
    throw new Error('Font doesn\'t contain TrueType or CFF outlines.')
  }

  const hmtxTable = uncompressTable(data, hmtxTableEntry)
  hmtx.parse(hmtxTable.data, hmtxTable.offset, font.numberOfHMetrics, font.numGlyphs, font.glyphs)
  addGlyphNames(font)

  if (kernTableEntry) {
    const kernTable = uncompressTable(data, kernTableEntry)
    font.kerningPairs = kern.parse(kernTable.data, kernTable.offset)
  } else {
    font.kerningPairs = {}
  }

  if (gposTableEntry) {
    const gposTable = uncompressTable(data, gposTableEntry)
    font.tables.gpos = gpos.parse(gposTable.data, gposTable.offset)
    font.position.init()
  }

  if (gsubTableEntry) {
    const gsubTable = uncompressTable(data, gsubTableEntry)
    font.tables.gsub = gsub.parse(gsubTable.data, gsubTable.offset)
  }

  if (fvarTableEntry) {
    const fvarTable = uncompressTable(data, fvarTableEntry)
    font.tables.fvar = fvar.parse(fvarTable.data, fvarTable.offset, font.names)
  }

  if (metaTableEntry) {
    const metaTable = uncompressTable(data, metaTableEntry)
    font.tables.meta = meta.parse(metaTable.data, metaTable.offset)
    font.metas = font.tables.meta
  }

  return font
}

/**
 * Asynchronously load the font from a URL or a filesystem.
 * @alias opentype.load
 * @param  {string} url - The URL of the font to load.
 */
async function load (url) {
  const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null
  const loadFn = isNode ? loadFromFile : loadFromUrl
  try {
    const arrayBuffer = await loadFn(url)
    return parseBuffer(arrayBuffer)
  } catch (err) {
    throw new Error(`Failed to load font: ${err}`)
  }
}

/**
 * Synchronously load the font from a file.
 * When done, returns the font object or throws an error.
 * @alias opentype.loadSync
 * @param  {string} url - The URL of the font to load.
 * @return {opentype.Font}
 */
async function loadSyncIfOnlyItIsNodeJSEnv (path) {
  const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null
  if (isNode) {
    const fs = await import('fs')
    const buffer = fs.readFileSync(path)
    return parseBuffer(nodeBufferToArrayBuffer(buffer))
  }
  return null
}

function accessPreloadedSourceInBrowser (path, cacheNameWithPreloadedSourcesInBrowser) {
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'
  const isWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope
  const pathParts = path.split('/')
  const fontKey = pathParts[pathParts.length - 1]
  if (isBrowser) {
    return window[cacheNameWithPreloadedSourcesInBrowser][fontKey]
  } else if (isWebWorker) {
    return self[cacheNameWithPreloadedSourcesInBrowser][fontKey]
  }
  return null
}

export default {
  Font,
  Glyph,
  Path,
  BoundingBox,
  _parse: parse,
  parseBuffer: parse,
  load,
  loadSyncIfOnlyItIsNodeJSEnv,
  accessPreloadedSourceInBrowser
}
