'use strict'

/**
 * Reading and rewriting one entry's yCorrection in a music-js font, as text.
 *
 * The font viewer engraves through the editor, which engraves in the worker off
 * the font module the worker imported — so a value typed into the page cannot
 * reach the score by any other route than giving the worker a different module.
 * Patching the source here lets that happen without writing anything to disk.
 *
 * These files are generated, so their formatting is regular enough to walk by
 * line: one property per line, objects opened by `<name>: {` and closed by `}`
 * at the same indent.
 */

/**
 * Walk the file, calling back with the line index of the entry's yCorrection.
 */
function locate(lines, entryPath) {
  const stack = []
  let inside = false

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]

    const closing = line.match(/^(\s*)\}/)
    if (closing) {
      while (stack.length && stack[stack.length - 1].indent >= closing[1].length) {
        stack.pop()
      }
      inside = stack.map((frame) => frame.name).join('.') === entryPath
    }

    const opening = line.match(/^(\s*)(?:'([^']*)'|([A-Za-z0-9_]+)): \{\s*$/)
    if (opening) {
      const indent = opening[1].length
      while (stack.length && stack[stack.length - 1].indent >= indent) {
        stack.pop()
      }
      stack.push({ indent, name: opening[2] === undefined ? opening[3] : opening[2] })
      inside = stack.map((frame) => frame.name).join('.') === entryPath
      continue
    }

    if (!inside) {
      continue
    }

    const correction = line.match(
      /^(\s*)yCorrection: (-?[\d.]+) \* intervalBetweenStaveLines(,?)\s*$/
    )
    if (correction) {
      return {
        line: index,
        indent: correction[1].length,
        value: Number(correction[2]),
        comma: correction[3] === ','
      }
    }
  }
  return null
}

/**
 * The yCorrection an entry currently carries, in stave-line intervals, or null
 * when it has none — most glyphs are positioned by yOffset or not at all.
 */
export function readYCorrection(source, entryPath) {
  const found = locate(source.split('\n'), entryPath)
  return found ? found.value : null
}

/**
 * The same font with one entry's yCorrection replaced. Every other line is
 * returned untouched.
 */
export function patchYCorrection(source, entryPath, value) {
  const lines = source.split('\n')
  const found = locate(lines, entryPath)
  if (!found) {
    return source
  }
  lines[found.line] =
    `${' '.repeat(found.indent)}yCorrection: ${Number(value.toFixed(4))}` +
    ` * intervalBetweenStaveLines${found.comma ? ',' : ''}`
  return lines.join('\n')
}

export default patchYCorrection
