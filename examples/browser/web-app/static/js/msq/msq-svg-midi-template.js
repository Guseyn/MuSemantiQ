import MSQTemplateElement from '#msq/msq-template.js'
import openContent from '#msq/utils/openContent.js'
import downloadContent from '#msq/utils/downloadContent.js'
import copyText from '#msq/utils/copyText.js'
import attachHighlighterToMidiPlayer from '#msq/utils/attachHighlighterToMidiPlayer.js'
import overrideMidiPlayerStyles from '#msq/utils/overrideMidiPlayerStyles.js'
import addUtilsToMidiPlayerControlPanel from '#msq/utils/addUtilsToMidiPlayerControlPanel.js'
import '#msq/lib/html-midi-player/player.js'

import utilsPanel from '#msq/css/utilsPanel.js'
import { svgWithTopRadius } from '#msq/css/svgSurface.js'

import previewIcon from '#msq/icons/previewIcon.js'
import downloadIcon from '#msq/icons/downloadIcon.js'
import copyIcon from '#msq/icons/copyIcon.js'
import doneIcon from '#msq/icons/doneIcon.js'

/* The score sits above the player, so only the player's bottom corners round. */
const playerRadius = /*css*/`
  div[data-inner-wrapper] {
    --player-top-radius: 0;
    --player-bottom-radius: var(--border-radius);
    --player-top-border: 1px solid var(--border-color);
  }
`

class MuSemantiQSVGMIDI extends MSQTemplateElement {
  async render() {
    const fontSourcesReference = this.requiredFontSourcesReference()
    const inputText = this.inputText

    const {
      svg,
      svgDataSrc,
      midiDataSrc,
      timeStampsMappedWithRefsOn,
      refsOnMappedWithTimeStamps,
      customStyles,
      errors
    } = await this.requestFromWorker({
      name: 'svg.midi.generate',
      fontSourcesReference,
      inputText
    })

    this.#buildView({
      svgString: svg,
      svgDataSrc,
      midiDataSrc,
      timeStampsMappedWithRefsOn,
      refsOnMappedWithTimeStamps,
      customStyles,
      inputText,
      errors
    })
  }

  #buildView({
    svgString,
    svgDataSrc,
    midiDataSrc,
    timeStampsMappedWithRefsOn,
    refsOnMappedWithTimeStamps,
    customStyles,
    inputText,
    errors
  }) {
    const soundFont = this.getAttribute('data-sound-font')

    const elm = this.createShadowHost({
      renderedBy: 'msq-svg-midi',
      label: 'Music score with MIDI player',
      styles: [ utilsPanel, svgWithTopRadius, playerRadius ],
      html: /*html*/`
        <div data-inner-wrapper>
          <div data-utils role="toolbar" aria-label="Score actions">
            <button type="button" data-download-svg aria-label="Download the score as SVG">${downloadIcon}</button>
            <button type="button" data-view-svg aria-label="Open the score in a new tab">${previewIcon}</button>
            <button type="button" data-copy-msq aria-label="Copy the MuSemantiQ source">${copyIcon}</button>
          </div>
          <div data-svg-container data-scroll tabindex="0" role="group" aria-label="Score">
            ${svgString}
          </div>
          <midi-player
            data-sound-font="${soundFont || ''}"
            data-src="${midiDataSrc}"
          ></midi-player>
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

    const midiPlayer = elm.shadowRoot.querySelector('midi-player')
    overrideMidiPlayerStyles(midiPlayer)
    addUtilsToMidiPlayerControlPanel(midiPlayer, [
      {
        label: 'Download the MIDI file',
        innerHTML: downloadIcon,
        onClick: () => downloadContent({
          fileName: this.getAttribute('data-file-name') || this.id,
          dataSrc: midiDataSrc,
          extenstion: 'midi'
        })
      },
      {
        label: 'Copy the MuSemantiQ source',
        innerHTML: copyIcon,
        onClick: (event) => copyText({
          event,
          text: inputText,
          onCopyInnerHTML: doneIcon
        })
      }
    ])
    midiPlayer.timeStampsMappedWithRefsOn = timeStampsMappedWithRefsOn
    midiPlayer.refsOnMappedWithTimeStamps = refsOnMappedWithTimeStamps

    this.updateErrors(elm.shadowRoot, errors)
    this.replaceSelf(elm)

    const svgParent = elm.shadowRoot.querySelector('[data-svg-container]')
    attachHighlighterToMidiPlayer({
      midiPlayer,
      svgParent,
      customStyles,
      customHighlightColor: this.getAttribute('data-highlight-color')
    })
  }
}

customElements.define('msq-svg-midi', MuSemantiQSVGMIDI, { extends: 'template' })
