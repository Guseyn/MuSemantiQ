/**
 * The usage text, for --help and for a flag the CLI cannot make sense of.
 */
export const helpText = `MuSemantiQ's OMR command line — a picture of a score in, MSQ text out.

  node omr-cli-app/omr.js [--input <image.png>] [--output <out.msq>]

  -i, --input <image.png>   the score image to read (PNG)
  -o, --output <out.msq>    where the MSQ text is written
  -h, --help                this text

Whatever you leave out is asked for; with no --output the image's name
with .msq is suggested. The same flags work either way:

  node omr-cli-app/omr.js -i score.png -o score.msq`
