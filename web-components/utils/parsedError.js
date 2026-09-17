/**
 * Parser errors arrive as plain strings with the line number embedded in prose,
 * and the parser phrases it two ways:
 *
 *   command 'leeland\n' is not recognizable or applicable on the line 1
 *   unit position after command 'from ' is not specified on the line number 17
 *
 * There is no column information. Pull the trailing line clause off so it can
 * live in its own column, and leave the line null when nothing matches rather
 * than guessing.
 */
const LINE_CLAUSE = /\s+on the line (?:number )?(\d+)\s*$/

export default function parsedError(error) {
  const message = typeof error === 'string' ? error : String(error)
  const match = message.match(LINE_CLAUSE)
  if (!match) {
    return { line: null, message }
  }
  return {
    line: match[1] * 1,
    message: message.slice(0, match.index)
  }
}
