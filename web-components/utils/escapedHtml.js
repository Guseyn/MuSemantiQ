/**
 * Parser errors quote the offending source verbatim, so they must be escaped
 * before going anywhere near innerHTML.
 */
export default function escapedHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
