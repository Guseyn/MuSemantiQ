# omr-cli-app

A picture of a score in, MSQ text out.

    node omr-cli-app/omr.js

It asks which image to read and where the MSQ should go. The flags answer
the same two questions ahead of time:

    node omr-cli-app/omr.js --input score.png --output score.msq

`--help` prints the usage. With no `--output`, the image's name with `.msq`
is suggested.

The translation is `translateImageToMsq` from the main API — the same call
the tests make. What the classifier was unsure of is printed with the line
it became in the text; nothing uncertain is silently decided.
