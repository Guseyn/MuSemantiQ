/**
 * The usage text, for --help and for a flag the CLI cannot make sense of.
 */
export const helpText = `MuSemantiQ's OMR command line — a picture of a score in, MSQ text out.

  node omr-cli-app/omr.js --weights <candidate-weights.json> [--input <image.png>] [--output <out.msq>]

  -i, --input <image.png>   the score image to read (PNG)
  -o, --output <out.msq>    where the MSQ text is written
  -w, --weights <file.json> the trained candidate artifact (required)
      --diagnostics         print staves, barlines and candidate counts
  -h, --help                this text

Whatever you leave out is asked for; with no --output the image's name
with .msq is suggested. The same flags work either way:

  node omr-cli-app/omr.js -w candidate-weights.json -i score.png -o score.msq`
