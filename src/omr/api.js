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
 *
 * Coming with the next milestones: translateImageToMsq and
 * translateImagesToMsqPages (the music model and the MSQ text).
 */

export { readBitmapFromImage } from './analysis/readBitmapFromImage.js'
export { analyzeImage } from './analysis/analyzeImage.js'
