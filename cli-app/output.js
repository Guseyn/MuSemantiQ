/**
 * Deciding where generated files go, and writing them.
 */
import { writeFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { InputOutputError, UsageError } from './lib/errors.js'

/**
 * Names for every file a run will produce.
 *
 * One page gives `<name>.svg`. Several give `<name>.page-1.svg`, zero-padded so
 * a directory listing sorts them correctly — unless the pages came from
 * individual files, in which case each keeps its own name, which is far more
 * useful than a renumbering.
 *
 * MIDI is always a single file: the score is split into pages but the
 * performance is continuous.
 */
export function planOutputs({ name, pageCount, pageNames, formats }) {
  const files = []

  if (formats.svg) {
    if (pageCount === 1) {
      files.push({ kind: 'svg', pageIndex: 0, fileName: `${pageNames?.[0] || name}.svg` })
    } else {
      const width = String(pageCount).length
      for (let index = 0; index < pageCount; index++) {
        const fileName = pageNames
          ? `${pageNames[index]}.svg`
          : `${name}.page-${String(index + 1).padStart(width, '0')}.svg`
        files.push({ kind: 'svg', pageIndex: index, fileName })
      }
    }
  }
  if (formats.midi) {
    files.push({ kind: 'midi', fileName: `${name}.mid` })
  }
  if (formats.pageSchema) {
    files.push({ kind: 'page-schema', fileName: `${name}.schema.json` })
  }
  if (formats.highlights) {
    files.push({ kind: 'highlights', fileName: `${name}.highlights.html` })
  }

  return files
}

/**
 * Work out the destination directory.
 *
 * A path that names a file is accepted only when exactly one file will be
 * written; otherwise every page would be written over the same name, so it is
 * rejected with an explanation instead.
 */
export async function resolveDestination(outPath, plannedCount) {
  const target = outPath || '.'
  const looksLikeDirectory = target.endsWith(path.sep) || target.endsWith('/') ||
    path.extname(target) === '' || await isExistingDirectory(target)

  if (looksLikeDirectory) {
    return { directory: path.resolve(target), fileNameOverride: null }
  }

  if (plannedCount > 1) {
    throw new UsageError(
      `--out "${target}" names a single file, but this run produces ${plannedCount} files. ` +
      'Give a folder instead, or request one format for a one-page document.'
    )
  }
  return {
    directory: path.resolve(path.dirname(target)),
    fileNameOverride: path.basename(target)
  }
}

async function isExistingDirectory(target) {
  try {
    return (await stat(target)).isDirectory()
  } catch {
    return false
  }
}

/**
 * Write everything at once.
 *
 * All writes are awaited together: settling on the first one would let the
 * process finish with the rest still unflushed.
 */
export async function writeOutputs({ directory, files }) {
  try {
    await mkdir(directory, { recursive: true })
  } catch (error) {
    throw new InputOutputError(`cannot create folder "${directory}": ${error.message}`, error)
  }

  try {
    await Promise.all(files.map((file) => writeFile(path.join(directory, file.fileName), file.content)))
  } catch (error) {
    throw new InputOutputError(`cannot write output: ${error.message}`, error)
  }

  return files.map((file) => path.join(directory, file.fileName))
}
