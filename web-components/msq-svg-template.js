import MSQTemplateElement from '#msq/msq-template.js'
import openContent from '#msq/utils/openContent.js'
import downloadContent from '#msq/utils/downloadContent.js'
import copyText from '#msq/utils/copyText.js'

import utilsPanel from '#msq/css/utilsPanel.js'
import { svgWithFullRadius } from '#msq/css/svgSurface.js'

import previewIcon from '#msq/icons/previewIcon.js'
import downloadIcon from '#msq/icons/downloadIcon.js'
import copyIcon from '#msq/icons/copyIcon.js'
import doneIcon from '#msq/icons/doneIcon.js'

class MuSemantiQSVG extends MSQTemplateElement {
  async render() {
    const fontSourcesReference = this.requiredFontSourcesReference()
    const inputText = this.inputText

    const { svg, svgDataSrc, errors } = await this.requestFromWorker({
      name: 'svg.generate',
      fontSourcesReference,
      inputText
    })

    this.#buildView({ svgString: svg, svgDataSrc, inputText, errors })
  }

  #buildView({ svgString, svgDataSrc, inputText, errors }) {
    const elm = this.createShadowHost({
      renderedBy: 'msq-svg',
      label: 'Music score',
      styles: [ utilsPanel, svgWithFullRadius ],
      html: /*html*/`
        <div data-inner-wrapper>
          <div data-utils role="toolbar" aria-label="Score actions">
            <button type="button" data-download-svg aria-label="Download the score as SVG">${downloadIcon}</button>
            <button type="button" data-view-svg aria-label="Open the score in a new tab">${previewIcon}</button>
            <button type="button" data-copy-msq aria-label="Copy the MuSemantiQ source">${copyIcon}</button>
          </div>
          <div data-scroll tabindex="0" role="group" aria-label="Score">
            ${svgString}
          </div>
        </div>
      `
    })

    this.labelScore(elm.shadowRoot, 'Engraved music score')

    elm.shadowRoot.querySelector('button[data-download-svg]').addEventListener('click', () => {
      downloadContent({
        fileName: this.getAttribute('data-file-name') || this.id,
        dataSrc: svgDataSrc,
        extenstion: 'svg'
      })
    })
    elm.shadowRoot.querySelector('button[data-view-svg]').addEventListener('click', () => {
      openContent({ dataSrc: svgDataSrc })
    })
    elm.shadowRoot.querySelector('button[data-copy-msq]').addEventListener('click', (event) => {
      copyText({
        event,
        text: inputText,
        onCopyInnerHTML: doneIcon
      })
    })

    this.updateErrors(elm.shadowRoot, errors)
    this.replaceSelf(elm)
  }
}

customElements.define('msq-svg', MuSemantiQSVG, { extends: 'template' })
