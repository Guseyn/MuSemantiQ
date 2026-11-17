# omr-cli-app

A picture of a score in, MSQ text out. A trained candidate artifact is always
required; there is no fallback model.

    node omr-cli-app/omr.js --weights training-data/candidates/combined.json

The CLI asks which PNG to read and where the MSQ should go. The flags answer
the same two questions ahead of time:

    node omr-cli-app/omr.js --weights training-data/candidates/combined.json --input score.png --output score.msq

`--help` prints the usage. With no `--output`, the image's name with `.msq`
is suggested. The result is `accepted` or `draft`; unresolved content is
reported in a draft. A `rejected` conversion is not written. Add
`--diagnostics` to print local stave spacing and line thickness, local stave
and page-line intervals, systems, barlines, stem and blob counts, the class
histogram, and OCR results.

## The candidate artifact

A complete candidate contains symbol weights at the top level and text OCR
weights under `ocr`. Build it from the two remote training outputs:

    npm run omr:combine-artifacts -- \
      --symbols=training-data/candidates/symbols.json \
      --ocr=training-data/text-runs/candidate-ocr/best-weights.json \
      --out=training-data/candidates/combined.json

The OCR alphabet covers English, French, German, Italian, Spanish and Russian.
The text path also attaches exact dynamic marks and chord letters to their
units. A symbol-only artifact is accepted, but visible text is reported as
unresolved instead of being guessed.

Verify the combined candidate on complete canonical pages before using its
results as an accuracy claim:

    npm run omr:verify -- \
      --weights=training-data/candidates/combined.json \
      --all \
      --out=training-data/verification-failures

The legacy OMR tests require the same explicit choice through `OMR_WEIGHTS`:

    OMR_WEIGHTS=training-data/candidates/combined.json npm run test:omr:all

The implementation and training commands are in place, but weight-based
accuracy is not claimed until a named candidate has been verified. Real-book
evaluation is deferred.

The translation is `translateImageToMsq` from the main API — the same call
the verifier makes. What the classifiers were unsure of is printed with the
line it became in the text; nothing uncertain is silently decided.
