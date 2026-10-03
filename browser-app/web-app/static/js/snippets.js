/*
Fills every <code data-snippet-of="…"> with the markup of the element beside
it, so the code on this page is always exactly what runs next to it.

Classic, not a module, and loaded last: it runs while the page is still being
read, before the components (modules) upgrade anything, when every element is
still the <template> that was written. The examples sit inside the font
loader, which is a <template> too, so they are found in its content.
*/
(function fillTheSnippets() {
  var loader = document.querySelector('template[is="msq-font-loader"]')
  var roots = [ document ]
  if (loader) {
    roots.push(loader.content)
  }

  /*
  The markup as written, without the page's indentation around it. The first
  line is the opening tag and starts at once; every line after it, the closing
  tag included, carries the element's own indentation, so the smallest of those
  is what to cut.
  */
  function dedented(html) {
    var lines = html.split('\n')
    var indents = lines.slice(1)
      .filter(function (line) { return line.trim() !== '' })
      .map(function (line) { return line.match(/^ */)[0].length })
    var cut = indents.length ? Math.min.apply(null, indents) : 0
    return [ lines[0] ].concat(lines.slice(1).map(function (line) { return line.slice(cut) })).join('\n')
  }

  roots.forEach(function (root) {
    root.querySelectorAll('code[data-snippet-of]').forEach(function (code) {
      var name = code.getAttribute('data-snippet-of')
      if (name === 'msq-font-loader') {
        if (!loader) {
          return
        }
        /*
        The loader holds the whole page, so only its tags are shown, built from
        its attributes: its font config is JSON, full of double quotes, which
        outerHTML would print as &quot;. Each value gets the quote it does not
        contain, as it was written.
        */
        var attributes = Array.prototype.map.call(loader.attributes, function (attribute) {
          var quote = attribute.value.indexOf('"') === -1 ? '"' : "'"
          return '\n  ' + attribute.name + '=' + quote + dedented(attribute.value).trim().replace(/\n/g, '\n    ') + quote
        }).join('')
        code.textContent = '<template' + attributes + '\n>\n  <!-- the elements -->\n</template>'
        return
      }
      var split = code.closest('[data-split]')
      var element = split && split.querySelector('[data-live] > template[is="' + name + '"]')
      if (element) {
        code.textContent = dedented(element.outerHTML)
      }
    })
  })
})()
