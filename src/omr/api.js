'use strict'

/**
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *                          src/omr — image → MSQ
 * ⟅━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⟆
 *
 * The image translator. A score image in, an MSQ draft and a report out.
 * One small model classifies ink blobs; everything else is measurement.
 *
 * The public surface, and nothing else:
 *
 *   readBitmapFromImage   image pixels → { width, height, grayscale }
 *   analyzeImage          the image → staves, systems, text blocks, styles
 *   translateImageToMsq   the image → { msqText, report }
 *
 * Coming with the next milestones: translateImagesToMsqPages (projects, one
 * image per page, with measure numbers and keys carried across).
 */

export { readBitmapFromImage } from './analysis/readBitmapFromImage.js'
export { analyzeImage } from './analysis/analyzeImage.js'
export { translateImageToMsq } from './translateImageToMsq.js'
