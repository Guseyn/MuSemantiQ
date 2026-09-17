import parsedError from '#msq/utils/parsedError.js'
import escapedHtml from '#msq/utils/escapedHtml.js'

/**
 * Returns '' when there is nothing to report, so the caller renders no panel at
 * all rather than an empty one.
 */
export default function errorsHtml(errors) {
  if (!errors || errors.length === 0) {
    return ''
  }
  const rows = errors.map((error, index) => {
    const { line, message } = parsedError(error)
    return /*html*/`
      <tr>
        <td data-index>${index + 1}</td>
        <td data-line>${line === null ? '&mdash;' : line}</td>
        <td data-message>${escapedHtml(message)}</td>
      </tr>
    `
  }).join('')

  return /*html*/`
    <header>
      <span data-count>${errors.length}</span>
      <span>${errors.length === 1 ? 'error' : 'errors'}</span>
    </header>
    <table>
      <thead>
        <tr>
          <th data-index scope="col">#</th>
          <th data-line scope="col">Line</th>
          <th data-message scope="col">Message</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `
}
