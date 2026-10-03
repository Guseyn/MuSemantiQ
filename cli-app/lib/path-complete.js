/**
 * Filesystem completion for a path field.
 *
 * Pure apart from reading directories, so it can be tested without a terminal.
 *
 * The field holds one path and nothing else, so there is no shell-style
 * tokenization: splitting on whitespace is what makes completion break on
 * `/Users/me/My Scores/`, and doing it here would be a bug rather than a
 * feature. Only the last separator matters.
 */
import { homedir } from 'node:os'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const CASE_INSENSITIVE = process.platform === 'darwin' || process.platform === 'win32'

/** Resolve a leading `~`; anything else is returned untouched. */
export function expandTilde(input) {
  if (input === '~') {
    return homedir()
  }
  if (input.startsWith('~/') || (path.sep === '\\' && input.startsWith('~\\'))) {
    return path.join(homedir(), input.slice(2))
  }
  return input
}

/** Split into the directory part (with its trailing separator) and the prefix. */
export function splitPath(input) {
  let index = input.lastIndexOf('/')
  if (path.sep === '\\') {
    index = Math.max(index, input.lastIndexOf('\\'))
  }
  if (index === -1) {
    return { dir: '', base: input }
  }
  return { dir: input.slice(0, index + 1), base: input.slice(index + 1) }
}

function fold(text) {
  return CASE_INSENSITIVE ? text.toLowerCase() : text
}

function longestCommonPrefix(names) {
  if (names.length === 0) {
    return ''
  }
  let prefix = names[0]
  for (const name of names.slice(1)) {
    let i = 0
    while (i < prefix.length && i < name.length && fold(prefix[i]) === fold(name[i])) {
      i++
    }
    prefix = prefix.slice(0, i)
    if (prefix === '') {
      break
    }
  }
  return prefix
}

async function isDirectory(parent, dirent) {
  if (dirent.isDirectory()) {
    return true
  }
  if (!dirent.isSymbolicLink()) {
    return false
  }
  try {
    return (await stat(path.join(parent, dirent.name))).isDirectory()
  } catch {
    return false
  }
}

/**
 * @param {string} input the current field contents
 * @returns {Promise<{completed: string, candidates: string[], atPrefix: boolean}>}
 *   `completed` is the new field contents (unchanged when nothing matched);
 *   `candidates` is non-empty only when the choice is ambiguous;
 *   `atPrefix` means completion cannot extend further without a decision.
 */
export async function completePath(input, { cwd = process.cwd() } = {}) {
  if (input === '~') {
    return { completed: '~/', candidates: [], atPrefix: false }
  }

  const { dir, base } = splitPath(input)
  const lookup = path.resolve(cwd, expandTilde(dir) || '.')

  let entries
  try {
    entries = await readdir(lookup, { withFileTypes: true })
  } catch {
    // A path that does not exist yet, or one we may not read: stay silent.
    return { completed: input, candidates: [], atPrefix: false }
  }

  let matches = entries.filter((entry) => fold(entry.name).startsWith(fold(base)))
  if (!base.startsWith('.')) {
    matches = matches.filter((entry) => !entry.name.startsWith('.'))
  }
  if (matches.length === 0) {
    return { completed: input, candidates: [], atPrefix: false }
  }

  if (matches.length === 1) {
    const only = matches[0]
    const suffix = (await isDirectory(lookup, only)) ? path.sep : ''
    return { completed: dir + only.name + suffix, candidates: [], atPrefix: false }
  }

  const prefix = longestCommonPrefix(matches.map((entry) => entry.name))
  const decorated = await Promise.all(
    matches.slice(0, 200).map(async (entry) => {
      return entry.name + ((await isDirectory(lookup, entry)) ? path.sep : '')
    })
  )
  return {
    completed: dir + prefix,
    candidates: decorated,
    atPrefix: fold(prefix) === fold(base)
  }
}

/**
 * The literal text turned into a usable path at submit time.
 *
 * Dragging a file into a terminal yields shell-escaped text, and copying one
 * often brings quotes along; both are undone here rather than while typing,
 * because a backslash is a legal character in a filename.
 */
export function resolveTypedPath(input) {
  const trimmed = input.trim()
  const unquoted = trimmed.length > 1 &&
    ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
     (trimmed.startsWith('"') && trimmed.endsWith('"')))
    ? trimmed.slice(1, -1)
    : trimmed
  return expandTilde(unquoted.replace(/\\ /g, ' '))
}
