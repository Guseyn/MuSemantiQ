/**
 * The questions. Only what the flags left out is asked; an empty answer for
 * the output falls back to the image's name with .msq.
 *
 * Answers are read from a queue of lines rather than one question at a time:
 * piped input delivers its lines before anyone is listening, and a question
 * asked late would lose its answer. A session that runs out of input before
 * answering says so instead of drifting to a quiet exit.
 */
import readline from 'node:readline'

export async function askForImagePlan({ input, output }) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const waiting = []
  const answered = []
  let ended = false
  rl.on('line', (line) => {
    const next = waiting.shift()
    if (next) next(line)
    else answered.push(line)
  })
  rl.on('close', () => {
    ended = true
    while (waiting.length) waiting.shift()(null)
  })
  const ask = (question) => {
    process.stdout.write(question)
    if (answered.length) return Promise.resolve(answered.shift())
    if (ended) return Promise.resolve(null)
    return new Promise((resolve) => waiting.push(resolve))
  }
  try {
    if (!input) {
      input = ((await ask('Which image should be read? (PNG) ')) || '').trim()
    }
    if (!input) {
      throw new Error('no image to read')
    }
    if (!output) {
      const suggestion = input.replace(/\.[^.]+$/, '') + '.msq'
      output = ((await ask(`Where should the MSQ be written? (${suggestion}) `)) || '').trim() || suggestion
    }
  } finally {
    rl.close()
  }
  return { input, output }
}
