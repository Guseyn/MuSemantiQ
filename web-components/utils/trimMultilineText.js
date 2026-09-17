/**
 * The MSQ source is authored as indented HTML, so every line carries the
 * markup's indentation. The language is line-oriented and leading whitespace is
 * meaningful to it, so strip it before parsing.
 */
export default function trimMultilineText(text) {
  return text.trim()
    .split('\n')
    .map(line => line.trim())
    .join('\n')
}
