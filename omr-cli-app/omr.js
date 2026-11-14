#!/usr/bin/env node
/**
 * MuSemantiQ's OMR command line.
 *
 * Two ways in — two questions, or flags — both ending in the same call to
 * translateImageToMsq. A PNG of a score is read, the MSQ text is written,
 * and what the classifier was unsure of is printed rather than decided.
 */
import fs from 'node:fs'
import { parseArgs } from './args.js'
import { helpText } from './help.js'
import { askForImagePlan } from './interactive.js'
import { decodeImageToGrayscale, translateImageToMsq } from '#msq/api.js'

function summarizeReport(report) {
  const lines = []
  if (report.uncertain.length) {
    const shown = report.uncertain.slice(0, 5)
    lines.push(`${report.uncertain.length} symbol(s) the classifier was unsure of:`)
    for (const item of shown) {
      const where = item.msqLine ? `msq line ${item.msqLine}` : 'no line in the text'
      lines.push(`  ${item.className} (${item.confidence.toFixed(2)}) — ${where}`)
    }
    const rest = report.uncertain.length - shown.length
    if (rest > 0) {
      lines.push(`  …and ${rest} more`)
    }
  }
  if (report.ignored.length) {
    lines.push(`${report.ignored.length} mark(s) ignored`)
  }
  return lines
}

async function main() {
  let plan
  try {
    plan = parseArgs(process.argv.slice(2))
  } catch (error) {
    process.stderr.write(error.message + '\n\n' + helpText + '\n')
    process.exitCode = 2
    return
  }
  if (plan.help) {
    process.stdout.write(helpText + '\n')
    return
  }
  try {
    const { input, output } = await askForImagePlan(plan)
    const bitmap = decodeImageToGrayscale(fs.readFileSync(input))
    const { msqText, report } = translateImageToMsq(bitmap)
    fs.writeFileSync(output, msqText)
    const written = msqText.split('\n').filter((line) => /^\d/.test(line)).length
    process.stdout.write(`wrote ${output} (${written} line(s) of MSQ)\n`)
    const summary = summarizeReport(report)
    if (summary.length) {
      process.stdout.write(summary.join('\n') + '\n')
    }
  } catch (error) {
    process.stderr.write(error.message + '\n')
    process.exitCode = 1
  }
}

main()
