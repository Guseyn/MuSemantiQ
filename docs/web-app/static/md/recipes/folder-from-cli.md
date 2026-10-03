# Render a folder from the CLI

This recipe engraves and performs a whole folder of scores with the [CLI](/docs/examples/cli), one score per file, and stops at the first one that fails.

## 1. A folder of scores is not a folder of pages

The CLI can already take a folder, but it reads it as **one document**: `--input pages/` makes every `.txt` and `.msq` file in it one page of the same score, with one continuous MIDI for all of them. That is right for a score you keep a page per file.

A folder of separate pieces is different. Each file is its own score, with its own MIDI, and possibly several pages of its own separated by `====next page====`. For that you run the CLI once per file, and a shell loop does it.

## 2. The loop

Save this as `render-folder.sh` in the root of your clone:

```bash
#!/bin/sh
# Engrave and perform every score in a folder, one score per file.
#   sh render-folder.sh scores build
in=${1:?give the folder of scores}
out=${2:-build}

for file in "$in"/*.txt; do
  node cli-app/msq.js --input "$file" --out "$out" --svg --midi --quiet
  code=$?
  if [ "$code" -ne 0 ]; then
    echo "stopped at $file: exit code $code" >&2
    exit "$code"
  fi
done
```

And run it:

```bash
sh render-folder.sh scores build
```

It runs `cli-app/msq.js` by a path relative to the root of the clone, so run it from there. The CLI itself finds its fonts by absolute paths, so the scores and the output can be anywhere.

## 3. Naming the outputs

The loop gives the CLI no `--name`, so every output is named after its input, and they all go into the one folder without colliding. For this folder:

```text
scores/
  prelude.txt     two pages
  study.txt       one page
```

you get:

```text
build/
  prelude.page-1.svg
  prelude.page-2.svg
  prelude.mid
  study.svg
  study.mid
```

A one-page score is `<name>.svg`. A score with several pages is `<name>.page-N.svg`, one per page, zero-padded when there are ten or more so a listing sorts them in order. The MIDI is always one file, `<name>.mid`, because the performance does not stop at a page boundary. So every output starts with the name of the file it came from, and you can always tell which input made it.

If you would rather have a folder per score, give each run its own `--out`:

```bash
node cli-app/msq.js --input "$file" --out "$out/$(basename "$file" .txt)" --svg --midi --quiet
```

## 4. Checking exit codes

The CLI's exit code says how a run went, and the loop stops on anything but **0**:

| Code | Meaning | What the loop should do |
| --- | --- | --- |
| **0** | done | carry on |
| **1** | finished, but the source had parse errors | stop: the output was written, from less than the file says |
| **2** | bad usage | stop: the command itself is wrong |
| **3** | a file could not be read or written, or the fonts failed to load | stop |
| **130** | cancelled with Ctrl-C | stop |

Code **1** is the one to think about. The parser skips what it cannot read and the CLI still writes the output, so a run with errors leaves files behind that look finished. The loop treats it as a failure, and the errors are printed to stderr with the line each one came from:

```text
3 errors while parsing:
    11  measure after command 'to ' is not found
    13  command 'at ' is not recognizable or applicable
    13  measure position after command 'starts ' is not specified

Output was still written — the parser skips what it cannot read.
stopped at scores/broken.txt: exit code 1
```

If you would rather collect every broken score and look at them together, remember the code instead of exiting, and exit with it after the loop.

**Side note:** a folder with no `.txt` files in it does not make the loop run zero times. The shell hands the pattern itself, `scores/*.txt`, to the CLI, which cannot read it and exits with **3**. That is a failure worth stopping on anyway.

## 5. Quiet and without colour, for CI

`--quiet`, or `-q`, prints only problems. Without it, every run prints what it is about to generate and every file it wrote, which in a loop over a hundred scores buries the one line that matters. Errors still go to stderr either way.

The colour is decided by the output itself: when stdout is not a terminal, which is the case in CI and whenever you pipe or redirect it, the CLI writes no colour codes at all. To turn colour off on a terminal too, set `NO_COLOR`:

```bash
NO_COLOR=1 sh render-folder.sh scores build
```

`--no-color` is accepted as a flag as well, but at the moment it does not change anything: it is `NO_COLOR`, or a stdout that is not a terminal, that turns the colour off. `FORCE_COLOR` does the opposite, and wins over both.

Read next: [Embed a playable score](/docs/recipes/embed-playable-score)
