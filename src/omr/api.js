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
 *   decodeImageToGrayscale   png bytes → { width, height, grayscale }
 *   readBitmapFromImage      image pixels → { width, height, grayscale }
 *   analyzeImage             the image → staves, systems, text blocks, styles
 *   translateImageToMsq      the image → { msqText, report }
 *   translateImagesToMsqPages   one image per page → { pagesText, report }
 */

export { decodeImageToGrayscale } from '#msq/omr/analysis/decodeImageToGrayscale.js'
export { readBitmapFromImage } from '#msq/omr/analysis/readBitmapFromImage.js'
export { analyzeImage } from '#msq/omr/analysis/analyzeImage.js'
export { translateImageToMsq } from '#msq/omr/translateImageToMsq.js'
export { translateImagesToMsqPages } from '#msq/omr/translateImagesToMsqPages.js'
