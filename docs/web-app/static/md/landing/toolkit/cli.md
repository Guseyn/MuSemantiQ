```bash
# A file, or a folder with one file per page
npm run cli-app -- --input piece.msq --svg --midi --out build

# The text itself, or piped in
npm run cli-app -- --text "treble clef
c d e f g" --svg
cat piece.msq | node cli-app/msq.js --page-schema --highlights

# Or answer a few questions
npm run cli-app
```
