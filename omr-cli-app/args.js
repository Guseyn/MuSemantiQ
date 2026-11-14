/**
 * The flags: what to read, where to write. Whatever a flag leaves out, the
 * CLI asks about instead.
 */
export function parseArgs(argv) {
  const plan = { input: null, output: null, help: false }
  const takeValue = (flag, index) => {
    const value = argv[index + 1]
    if (value === undefined || value.startsWith('-')) {
      throw new Error(`${flag} needs a value`)
    }
    return value
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') {
      plan.help = true
    } else if (arg === '--input' || arg === '-i') {
      plan.input = takeValue(arg, i)
      i++
    } else if (arg === '--output' || arg === '-o') {
      plan.output = takeValue(arg, i)
      i++
    } else if (arg.startsWith('--input=')) {
      plan.input = arg.slice('--input='.length)
    } else if (arg.startsWith('--output=')) {
      plan.output = arg.slice('--output='.length)
    } else {
      throw new Error(`unknown flag: ${arg}`)
    }
  }
  return plan
}
