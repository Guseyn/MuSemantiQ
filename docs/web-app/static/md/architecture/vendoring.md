# Vendoring

MuSemantiQ installs nothing. All the code it runs that someone else wrote, or that I wrote in another repository, is copied into this one. That is what lets `package.json` have no dependencies at all.

## 1. What is vendored

There are two kinds, and they are kept in different ways.

**My own libraries** live in sibling repositories and are copied in by a script:

| Library | What it is | Where it lands |
| --- | --- | --- |
| **nodes** | the HTTP/2 server every app runs on | `browser-app/nodes/`, `dev-tools/nodes/`, `docs/nodes/` |
| **EHTML** | custom elements for fetching, templating and actions, plus showdown, the markdown converter these docs render with | `dev-tools/web-app/static/js/ehtml/`, `docs/web-app/static/js/ehtml/` |
| **e-ui** | the design system: `e-ui.css` and elements like `e-tabs` and `e-dialog` | `static/js/e-ui/` and `static/css/e-ui.css` of the dev tools and the docs, and `browser-app/web-app/static/css/e-ui.css` |

**Third-party libraries** were copied in once, by hand, and are committed:

| Library | Where | Used for |
| --- | --- | --- |
| opentype.js | `src/drawer/lib/opentype/` | reading the `.otf` and `.ttf` fonts |
| svgpath | `src/drawer/lib/svgpath/` | transforming SVG paths |
| @tonejs/midi, midi-file | `src/midi/lib/` | writing the MIDI file |
| a JSON schema validator | `src/language/lib/` | [validating](/docs/api/validation) page schemas |
| @magenta/music, html-midi-player, @tonejs/midi, midi-file | `web-components/lib/` | playing the MIDI in the browser |

These are not copied as they were published. They were rewritten into the style of the repository: ES modules, imports through `#msq/…` specifiers, so they resolve like every other file in Node, on the page and in the worker. The validator lives in `src/language/lib/` rather than beside the others because the language may not import anything outside `src/language`.

## 2. The scripts

Each sibling library has one npm script per app that uses it:

| Script | Command |
| --- | --- |
| `nodes:update` | `rsync -a --delete ../../my-projects/nodes.js/nodes/ browser-app/nodes/` |
| `dev-tools:nodes:update` | `rsync -a --delete ../../my-projects/nodes.js/nodes/ dev-tools/nodes/` |
| `docs:nodes:update` | `rsync -a --delete ../../my-projects/nodes.js/nodes/ docs/nodes/` |
| `dev-tools:ehtml:update` | `rsync -a --delete ../../my-projects/EHTML/src/ dev-tools/web-app/static/js/ehtml/` |
| `docs:ehtml:update` | `rsync -a --delete ../../my-projects/EHTML/src/ docs/web-app/static/js/ehtml/` |
| `eui:update`, `dev-tools:eui:update`, `docs:eui:update` | `rsync -a --delete` of `../../my-projects/e-ui/static/js/e-ui/`, then `cp -rf` of `e-ui.css` |

`dev-tools:vendor` and `docs:vendor` run all three for their app, and `npm run dev-tools` and `npm run docs` run those before starting. So both of those apps need the sibling checkouts, `nodes.js`, `EHTML` and `e-ui`, in the same parent folder as this repository, and fail to start without them. The paths are written as `../../my-projects/…`, so at the moment that parent folder also has to be called `my-projects`. The examples app does not: its copies are committed, and `npm run browser-app` never vendors anything.

It's important to mention that `rsync --delete` makes the copy an exact mirror of the source: anything in the target that the source does not have is deleted. That is on purpose, because a file removed upstream would otherwise stay importable here, and the copy would quietly stop being the same code. But it also means that a change made to a vendored copy is wiped on the next run.

## 3. Why vendored and not installed

I prefer to have the code I depend on in the repository, and for this project there are concrete reasons:

1. **The browser needs the files anyway.** Without a bundler, a library has to be a file under `static/` that the server can send. An npm package in `node_modules` would have to be copied there regardless.
2. **Nothing to install.** A clone runs the tests with no `npm install`, and it will keep running them even if a package disappears from the registry.
3. **One style.** The third-party code was rewritten into ES modules with `#msq/…` imports, and it is only that way because it is a copy.
4. **The output must not change by itself.** The tests compare every SVG byte for byte, and the SVG depends on how opentype.js reads a font. A library that can only change when I change it is one less reason for a golden file to break.
5. **nodes, EHTML and e-ui are mine.** I develop them next to MuSemantiQ, and a script that copies the working tree is simpler than publishing a version every time.

## 4. How to update one

For **a sibling library**, make the change in its own repository first, never in the copy. Then:

1. for the dev tools and the docs, just start the app, `npm run dev-tools` or `npm run docs`, which vendors again before starting, or run `npm run dev-tools:vendor` or `npm run docs:vendor` on its own;
2. for the examples app, run `npm run nodes:update` or `npm run eui:update` yourself, and commit the result, because those copies are tracked.

For **a third-party library**, there is no script. You replace the files in its `lib/` folder by hand and convert the imports to `#msq/…` specifiers the way the existing files are.

And what to check afterwards:

1. `git status`, to see what actually changed in the committed copies;
2. that every app still starts, after a change to **nodes**;
3. `npm run docs:check`, after a change to **EHTML**, because the check renders every page with the showdown that EHTML ships;
4. the pages that use e-ui, in the dev tools and the docs shell, after a change to **e-ui**;
5. `npm run test:all`, after a change to any library under `src/`, because a different opentype.js or MIDI writer can change the output, and the golden files are compared byte for byte.

Read next: [Web components](/docs/components/overview)
