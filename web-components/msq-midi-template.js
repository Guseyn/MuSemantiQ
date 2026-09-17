import MSQTemplateElement from '#msq/msq-template.js'
import copyText from '#msq/utils/copyText.js'
import downloadContent from '#msq/utils/downloadContent.js'
import overrideMidiPlayerStyles from '#msq/utils/overrideMidiPlayerStyles.js'
import addUtilsToMidiPlayerControlPanel from '#msq/utils/addUtilsToMidiPlayerControlPanel.js'
import '#msq/lib/html-midi-player/player.js'

import downloadIcon from '#msq/icons/downloadIcon.js'
import copyIcon from '#msq/icons/copyIcon.js'
import doneIcon from '#msq/icons/doneIcon.js'

/* The player is the only thing in the surface, so it carries the full radius. */
const playerRadius = /*css*/`
  div[data-inner-wrapper] {
    --player-top-radius: var(--border-radius);
    --player-bottom-radius: var(--border-radius);
  }
`

class MuSemantiQMIDI extends MSQTemplateElement {
  async render() {
    const inputText = this.inputText

    const { midiDataSrc, errors } = await this.requestFromWorker({
      name: 'midi.generate',
      inputText
    })

    this.#buildMidiPlayer({ midiDataSrc, inputText, errors })
  }

  #buildMidiPlayer({ midiDataSrc, inputText, errors }) {
    const soundFont = this.getAttribute('data-sound-font')

    const elm = this.createShadowHost({
      renderedBy: 'msq-midi',
      label: 'MIDI player',
      styles: [ playerRadius ],
      html: /*html*/`
        <div data-inner-wrapper>
          <div data-scroll>
            <midi-player
              data-sound-font="${soundFont || ''}"
              data-src="${midiDataSrc}"
            ></midi-player>
          </div>
        </div>
      `
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

    this.updateErrors(elm.shadowRoot, errors)
    this.replaceSelf(elm)
  }
}

customElements.define('msq-midi', MuSemantiQMIDI, { extends: 'template' })
