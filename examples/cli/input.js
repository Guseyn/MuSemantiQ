/**
 * Turning what the user gave us into a list of page texts.
 *
 * The API splits nothing itself: both multi-page entry points take an array of
 * page texts and say so explicitly. Two things therefore happen here — a single
 * document is split on the page delimiter, and a folder is read as one file per
 * page.
 */
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { InputOutputError } from './lib/errors.js'

/*
 * The same delimiter the visual and audio test scripts use. It is a convention
 * of the tooling rather than part of the language, so keeping it identical
 * means CLI input and test fixtures stay interchangeable.
 */
export const DEFAULT_PAGE_DELIMITER = '====next page===='

const PAGE_EXTENSIONS = new Set([ '.txt', '.msq' ])

/**
 * @typedef {Object} Source
 * @property {string[]} pages    page texts, never empty, never blank
 * @property {string} name       basename for the generated files
 * @property {string[]} [pageNames]  per-page basenames, when pages came from files
 */

/** Split one document into pages, dropping blank ones. */
export function splitPages(text, delimiter = DEFAULT_PAGE_DELIMITER) {
  return text
    .split(delimiter)
    /*
     * A trailing delimiter, or two in a row, yields an empty page whose schema
     * has no measures — and MIDI generation throws on exactly that.
     */
    .filter((page) => page.trim() !== '')
}

/** Text typed or pasted directly. */
export function sourceFromText(text, { delimiter = DEFAULT_PAGE_DELIMITER, name = 'score' } = {}) {
  const pages = splitPages(text, delimiter)
  if (pages.length === 0) {
    throw new InputOutputError('the input text is empty')
  }
  return { pages, name }
}

/** A file, or a folder holding one file per page. */
export async function sourceFromPath(inputPath, { delimiter = DEFAULT_PAGE_DELIMITER } = {}) {
  let info
  try {
    info = await stat(inputPath)
  } catch (error) {
    throw new InputOutputError(`cannot read "${inputPath}": ${error.message}`, error)
  }
  return info.isDirectory()
    ? sourceFromDirectory(inputPath, delimiter)
    : sourceFromFile(inputPath, delimiter)
}

async function sourceFromFile(filePath, delimiter) {
  let text
  try {
    text = await readFile(filePath, 'utf8')
  } catch (error) {
    throw new InputOutputError(`cannot read "${filePath}": ${error.message}`, error)
  }
  const pages = splitPages(text, delimiter)
  if (pages.length === 0) {
    throw new InputOutputError(`"${filePath}" contains no music`)
  }
  return { pages, name: path.basename(filePath, path.extname(filePath)) }
}

async function sourceFromDirectory(dirPath, delimiter) {
  let entries
  try {
    entries = await readdir(dirPath, { withFileTypes: true })
  } catch (error) {
    throw new InputOutputError(`cannot read folder "${dirPath}": ${error.message}`, error)
  }

  const files = entries
    .filter((entry) => entry.isFile() && PAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    /* Numeric ordering, so page-10 sorts after page-2 rather than after page-1. */
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }))

  if (files.length === 0) {
    throw new InputOutputError(`folder "${dirPath}" contains no .txt or .msq files`)
  }

  const pages = []
  const pageNames = []
  for (const file of files) {
    const text = await readFile(path.join(dirPath, file), 'utf8')
    /*
     * A file may itself hold several pages. Its own name is kept for the first
     * page and suffixed for the rest, so output names stay traceable.
     */
    const filePages = splitPages(text, delimiter)
    const base = path.basename(file, path.extname(file))
    filePages.forEach((page, index) => {
      pages.push(page)
      pageNames.push(index === 0 ? base : `${base}.page-${index + 1}`)
    })
  }

  if (pages.length === 0) {
    throw new InputOutputError(`folder "${dirPath}" contains no music`)
  }

  return { pages, name: path.basename(path.resolve(dirPath)), pageNames }
}
