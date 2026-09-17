// One promise per family+src, so several editors on a page fetch the file once.
const loadingByKey = new Map()

/**
 * Registers a webfont for use inside the elements' shadow roots.
 *
 * `@font-face` declared inside a shadow root is ignored — font faces resolve
 * against the document — so this goes through document.fonts instead.
 *
 * @param {string} fontFamily a CSS font stack; the first entry names the face
 * @param {string} src        URL of the font file
 * @returns {Promise} resolves once the face is usable (or failed)
 */
export default function loadFontFace(fontFamily, src) {
  const family = fontFamily.split(',')[0].trim().replace(/^['"]|['"]$/g, '')
  const key = `${family}|${src}`
  if (loadingByKey.has(key)) {
    return loadingByKey.get(key)
  }
  const loading = new FontFace(family, `url(${src})`)
    .load()
    .then((loadedFace) => {
      document.fonts.add(loadedFace)
      return loadedFace
    })
    .catch((error) => {
      // Not fatal: the stack falls through to the next family.
      console.error(`msq: could not load font "${family}" from ${src}`, error)
    })
  loadingByKey.set(key, loading)
  return loading
}
