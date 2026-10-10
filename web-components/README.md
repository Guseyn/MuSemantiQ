# web-components

`npm run web-components:update` copies this folder into every app, and
`npm run msq:apps:update` copies `src/` next to it. Edit only this folder.

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="importmap">
      {
        "imports": {
          "#msq/web-components/": "/js/msq/web-components/",
          "#msq/language/": "/js/msq/language/"
        }
      }
    </script>
    <script type="module">
      import '#msq/web-components/msq-font-loader-template.js'
      import '#msq/web-components/msq-svg-template.js'
      import '#msq/web-components/msq-midi-template.js'
      import '#msq/web-components/msq-svg-midi-template.js'
      import '#msq/web-components/msq-editor-template.js'
    </script>
  </head>
  <body>
    <template
      is="msq-font-loader"
      data-font-sources-reference="msqFontSources"
      data-font-config='{
        "chord-letters": {
          "gentium plus": "/font/chord-letters/GentiumPlus-Regular.ttf"
        },
        "text": {
          "noto-serif": {
            "regular": "/font/text/NotoSerif-Regular.ttf",
            "bold": "/font/text/NotoSerif-Bold.ttf"
          }
        },
        "music": {
          "bravura": {
            "font": "/font/music/Bravura.otf",
            "js": "/js/msq/worker/drawer/font/music-js/bravura.js"
          },
          "leland": {
            "font": "/font/music/Leland.otf",
            "js": "/js/msq/worker/drawer/font/music-js/leland.js"
          }
        }
      }'
    >
      <template is="msq-svg" data-font-sources="msqFontSources" data-file-name="score">
        measure
        treble clef
        1/4 c d e f
      </template>

      <template is="msq-midi" data-file-name="melody">
        measure
        treble clef
        1/4 c d e f
      </template>

      <template is="msq-svg-midi" data-font-sources="msqFontSources" data-highlight-color="#C40233">
        measure
        treble clef
        1/4 c d e f
      </template>

      <template
        is="msq-editor"
        data-font-sources="msqFontSources"
        data-opens-with="text"
        data-editor-height="420px"
        data-editor-font-size="14px"
        data-navigation-highlight-color="#C40233"
      >
        music font is leland
        measure
        treble clef
        1/4 c d e f
      </template>
    </template>
  </body>
</html>
```
