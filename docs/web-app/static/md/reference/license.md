# License

MuSemantiQ is released under the **Credited Source License (CSL) v1.0**. The short version, from the license itself: build whatever you want, just don't erase where it came from.

## 1. What it permits

You can use, copy, modify and distribute MuSemantiQ for any purpose, including commercial use. You can fork it and keep private modifications. You can sell a product built on it.

## 2. What it requires

In exchange, you have to remember the following rules:

1. **Attribution.** Any redistributed or modified copy must clearly say that it is **Based on MuSemantiQ** and include a visible link to https://github.com/Guseyn/MuSemantiQ.
2. **Commercial use.** A commercial product that uses MuSemantiQ, or substantial parts of it, must show a visible **Powered by MuSemantiQ** credit on its website, landing page or a similar public place, or give a clear link to the repository.
3. **The credit is passed on.** If you fork it, or use its code, language design or API to build something similar, your users and your forks must credit the original project too. The requirement applies to every generation of forks, and a license modelled on this one must keep the acknowledgment rather than claim the origin for itself.
4. **No endorsement.** My name cannot be used to imply that I endorse or promote a derivative work without my written permission.
5. **Automated use and AI training.** Bots, crawlers and AI models, and datasets for training, fine-tuning, embedding or retrieval, may not scan, scrape or incorporate any part of the project without prominent attribution and a link to the repository. An AI-powered product or service that uses it must acknowledge the source visibly in its output or its documentation.

It is provided **as is**, without warranty of any kind, and I am not liable for anything that comes from using it.

**Side note:** pull requests and direct contributions to the repository are not accepted, and that is part of the license too. Issues, suggestions and discussions are welcome.

## 3. What attribution looks like

It's really easy to comply. A line in your footer, your about page or your documentation is enough:

```html
Powered by <a href="https://github.com/Guseyn/MuSemantiQ">MuSemantiQ</a>
```

A fork or a modified copy says the same thing in its README:

```text
Based on MuSemantiQ — https://github.com/Guseyn/MuSemantiQ
```

What matters is that the credit is visible and the link goes to the original repository.

## 4. Code that is not under this license

The repository carries third-party code and fonts that keep their own licenses:

| Where | What | License |
| --- | --- | --- |
| `src/drawer/lib/opentype` | opentype.js | MIT |
| `src/drawer/lib/svgpath` | svgpath | MIT |
| `src/midi/lib/@tonejs`, `web-components/lib/@tonejs` | @tonejs/midi | MIT |
| `src/midi/lib/midi-file`, `web-components/lib/midi-file` | midi-file | MIT |
| `web-components/lib/@magenta/music` | parts of magenta-js | Apache-2.0 |
| `web-components/lib/html-midi-player` | html-midi-player | BSD-2-Clause |
| `web-components/lib/custom-elements-polyfill.js` | the custom elements polyfill by Andrea Giammarchi | ISC |
| `src/drawer/font/music` | Bravura, Leland, Petaluma | SIL Open Font License |
| `src/drawer/font/text` | Noto Serif, Noto Sans | SIL Open Font License |
| `src/drawer/font/chord-letters` | Gentium Plus, Gothic A1 | SIL Open Font License |

> **TO WRITE**
> - the license MuSemantiQ ships `src/drawer/font/music/MuseJazz.otf` under

The dev tools and this documentation also copy in my own libraries nodes, EHTML and e-ui, which are under the MIT license. The only copies of them committed to the repository are the browser example's nodes and its `e-ui.css`.

The custom elements polyfill by Andrea Giammarchi (WebReflection) is under the ISC license. EHTML carries it, and a copy of it is also in `web-components/lib/custom-elements-polyfill.js`, so it is shipped to every app together with the components, which load it themselves when the browser needs it.

## 5. The full text

The full text is the [LICENSE](https://github.com/Guseyn/MuSemantiQ/blob/main/LICENSE) file in the repository. If anything here reads differently from it, the file is what counts.

Read next: [Changelog](/docs/reference/changelog)
