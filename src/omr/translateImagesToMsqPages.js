'use strict'

import { translatePage } from '#msq/omr/translateImageToMsq.js'

/**
 * A project's pages, one image each, in order.
 *
 * Each image becomes its own MSQ text — a Unison project is a folder of page
 * files. What page 1 declares (key, meter, styles) is written again where it
 * applies and not contradicted, because every page's text parses alone. The
 * reports stay one per page.
 */

export function translateImagesToMsqPages (bitmaps, options = {}) {
  const pagesText = []
  const report = []
  let carried = {}
  for (const bitmap of bitmaps) {
    const page = translatePage(bitmap, options, carried)
    pagesText.push(page.result.msqText)
    report.push(page.result.report)
    carried = page.carried
  }
  return { pagesText, report }
}

export default translateImagesToMsqPages
