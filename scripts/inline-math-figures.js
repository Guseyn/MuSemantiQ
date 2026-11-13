// Inlines dev-docs/math-figures/*.svg into dev-docs/omr-math.html, so the page
// carries its figures as markup and renders anywhere without extra requests.
// Every figure keeps its file names in data-figs, so re-running this after
// npm run docs:math-figures refreshes the markup instead of stacking copies.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const pagePath = path.join(root, 'dev-docs/omr-math.html')
const figuresDir = path.join(root, 'dev-docs/math-figures')

function svgOf(name, alt) {
  return fs.readFileSync(path.join(figuresDir, name + '.svg'), 'utf8')
    .replace(/^<\?xml[^>]*>\s*/, '')
    .replace('<svg ', '<svg role="img" aria-label="' + alt + '" ')
    .trim()
}

let page = fs.readFileSync(pagePath, 'utf8')
let count = 0
page = page.replace(/<figure([^>]*)>\n([\s\S]*?)<\/figure>/g, (block, attrs, inner) => {
  const caption = (inner.match(/<figcaption>[\s\S]*?<\/figcaption>/) || [''])[0]
  const imgs = [...inner.matchAll(/<img src="math-figures\/([^"]+)\.svg" alt="([^"]*)">/g)]
  const names = imgs.length
    ? imgs.map(m => m[1])
    : (attrs.match(/data-figs="([^"]*)"/) || ['', ''])[1].split(',').filter(Boolean)
  if (!names.length) return block
  const base = imgs.length
    ? imgs[0][2].replace(/ — frame \d+$/, '')
    : (attrs.match(/data-alt="([^"]*)"/) || ['', ''])[1]
  const svgs = names.map((name, i) =>
    svgOf(name, names.length === 1 ? base : base + ' — frame ' + (i + 1)))
  const body = svgs.length === 1 ? svgs[0] : '<div class="frames">\n' + svgs.join('\n') + '\n</div>'
  count++
  return '<figure data-figs="' + names.join(',') + '" data-alt="' + base + '">\n'
    + body + '\n' + caption + '\n</figure>'
})
fs.writeFileSync(pagePath, page)
console.log('figures inlined:', count)
