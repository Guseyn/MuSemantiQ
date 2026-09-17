import MSQTemplateElement from '#msq/msq-template.js'
import { registerFontNames } from '#msq/utils/fontNames.js'

/**
 * Loads fonts into the worker, then unwraps its own content.
 *
 * The unwrapping is load-bearing: the msq elements inside only become connected
 * — and so only start asking the worker to engrave — once the fonts are ready.
 */
class MuSemantiQFontLoader extends MSQTemplateElement {
  async render() {
    if (this.hasAttribute('data-font-config') && this.hasAttribute('data-font-config-src')) {
      throw new Error('msq-font-loader cannot have both "data-font-config-src" and "data-font-config" attributes to avoid confusion.')
    }

    if (!this.hasAttribute('data-font-config') && !this.hasAttribute('data-font-config-src')) {
      throw new Error('msq-font-loader must have attribute "data-font-config-src" or "data-font-config"')
    }

    const fontSourcesReference = this.getAttribute('data-font-sources-reference')
    if (!fontSourcesReference) {
      throw new Error(`msq-font-loader must have "data-font-sources-reference" attribute, so that other msq elements can use it`)
    }

    const fontConfigSrc = this.getAttribute('data-font-config-src')
    let fontConfig

    if (fontConfigSrc) {
      const fontConfigResponse = await fetch(fontConfigSrc)
      if (!fontConfigResponse.ok) {
        throw new Error(`Font config could not be loaded: ${fontConfigResponse.status}`)
      }
      fontConfig = await fontConfigResponse.json()
    } else {
      fontConfig = JSON.parse(
        this.getAttribute('data-font-config')
      )
    }

    await this.requestFromWorker({
      name: 'fonts.setup',
      fontConfig,
      fontSourcesReference
    })

    registerFontNames(fontSourcesReference, fontConfig)

    const contentNode = document.importNode(this.content, true)
    this.parentNode.replaceChild(contentNode, this)
  }
}

customElements.define('msq-font-loader', MuSemantiQFontLoader, { extends: 'template' })
