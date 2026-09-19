import MSQTemplateElement from '#msq/web-components/msq-template.js'
import downloadContent from '#msq/web-components/utils/downloadContent.js'
import copyText from '#msq/web-components/utils/copyText.js'
import attachHighlighterToMidiPlayer from '#msq/web-components/utils/attachHighlighterToMidiPlayer.js'
import overrideMidiPlayerStyles from '#msq/web-components/utils/overrideMidiPlayerStyles.js'
import addUtilsToMidiPlayerControlPanel from '#msq/web-components/utils/addUtilsToMidiPlayerControlPanel.js'
import { fontNames } from '#msq/web-components/utils/fontNames.js'
import loadFontFace from '#msq/web-components/utils/loadFontFace.js'
import initializeEditor from '#msq/web-components/editor/initializeEditor.js'
import refreshDivUnderneathTextareaWithNewHtml from '#msq/web-components/editor/refreshDivUnderneathTextareaWithNewHtml.js'
import parsedHighlights from '#msq/web-components/editor/parsedHighlights.js'
import '#msq/web-components/lib/html-midi-player/player.js'

import utilsPanel from '#msq/web-components/css/utilsPanel.js'
import { svgWithTopRadius } from '#msq/web-components/css/svgSurface.js'
import highlights from '#msq/web-components/css/highlights.js'
import editorCss from '#msq/web-components/css/editor.js'

import previewIcon from '#msq/web-components/icons/previewIcon.js'
import readIcon from '#msq/web-components/icons/readIcon.js'
import downloadIcon from '#msq/web-components/icons/downloadIcon.js'
import copyIcon from '#msq/web-components/icons/copyIcon.js'
import settingsIcon from '#msq/web-components/icons/settingsIcon.js'
import doneIcon from '#msq/web-components/icons/doneIcon.js'

const layout = /*css*/`
  div[data-inner-wrapper] {
    --player-top-radius: 0;
    --player-bottom-radius: var(--border-radius);
    --player-top-border: 1px solid var(--border-color);
  }
  /* midi-player sets its own display, so [hidden] alone would not hide it. */
  [hidden] {
    display: none !important;
  }
`

/**
 * The score and the text are two views of one document, and you see one at a
 * time: readIcon shows the text, previewIcon shows the score and player.
 *
 * previewIcon means something different here than in msq-svg-midi, where it
 * opens the SVG in a new tab.
 */
class MuSemantiQEditor extends MSQTemplateElement {
  // Which view the settings were opened from, so closing them goes back to it.
  #wasShowing = 'score'
  // The room the score takes, measured while it is showing.
  #viewSize = null

  async render() {
    this.fontSourcesReference = this.requiredFontSourcesReference()
    this.msqText = this.inputText
    this.#buildView(await this.#generate(this.msqText))
  }

  #generate(inputText) {
    return this.requestFromWorker({
      name: 'svg.midi.text.generate',
      fontSourcesReference: this.fontSourcesReference,
      inputText
    })
  }

  #buildView(generated) {
    const elm = this.createShadowHost({
      renderedBy: 'msq-editor',
      label: 'Music score editor',
      styles: [ utilsPanel, svgWithTopRadius, highlights, editorCss, layout ],
      html: /*html*/`
        <div data-inner-wrapper>
          <div data-utils role="toolbar" aria-label="Editor actions">
            <button type="button" data-download-svg aria-label="Download the score as SVG">${downloadIcon}</button>
            <button type="button" data-read-msq aria-label="Edit the MuSemantiQ source">${readIcon}</button>
            <button type="button" data-view-preview hidden aria-label="Render the score">${previewIcon}</button>
            <button type="button" data-copy-msq aria-label="Copy the MuSemantiQ source">${copyIcon}</button>
            <button type="button" data-settings aria-label="Settings">${settingsIcon}</button>
          </div>
          <div data-svg-container data-scroll tabindex="0" role="group" aria-label="Score"></div>
          <div data-text-container hidden></div>
          <div data-settings-container hidden role="group" aria-label="Settings">
            <label>
              <input type="checkbox" data-setting="autocomplete" checked>
              <span>Suggest commands as I type</span>
            </label>
            <label>
              <input type="checkbox" data-setting="highlighting" checked>
              <span>Colour the source</span>
            </label>
            <label>
              <input type="color" data-setting="played-colour">
              <span>Colour of a note as it sounds</span>
            </label>
            <label>
              <input type="color" data-setting="reference-colour">
              <span>Colour of the box that links a word to its glyph</span>
            </label>
            <label>
              <span>Sound Font URL</span>
              <input type="text" data-setting="sound-font" spellcheck="false"
                placeholder="leave empty for the default soundfont">
            </label>
          </div>
        </div>
      `
    })

    this.host = elm
    this.wrapper = elm.shadowRoot.querySelector('div[data-inner-wrapper]')
    this.svgContainer = elm.shadowRoot.querySelector('div[data-svg-container]')
    this.textContainer = elm.shadowRoot.querySelector('div[data-text-container]')
    this.readButton = elm.shadowRoot.querySelector('button[data-read-msq]')
    this.previewButton = elm.shadowRoot.querySelector('button[data-view-preview]')
    this.settingsButton = elm.shadowRoot.querySelector('button[data-settings]')
    this.settingsContainer = elm.shadowRoot.querySelector('div[data-settings-container]')

    this.#applyEditorAppearance()

    elm.shadowRoot.querySelector('button[data-download-svg]').addEventListener('click', () => {
      downloadContent({
        fileName: this.getAttribute('data-file-name') || this.id,
        dataSrc: this.svgDataSrc,
        extenstion: 'svg'
      })
    })
    elm.shadowRoot.querySelector('button[data-copy-msq]').addEventListener('click', (event) => {
      copyText({
        event,
        text: this.msqText,
        onCopyInnerHTML: doneIcon
      })
    })
    this.readButton.addEventListener('click', () => this.#showTextView())
    this.previewButton.addEventListener('click', () => this.#showPreviewView())
    this.settingsButton.addEventListener('click', () => this.#toggleSettingsView())

    this.#mountGenerated(generated)
    this.replaceSelf(elm)

    // Only meaningful once we are in the document: the modules observe the
    // rendered SVG and measure the textarea against real layout.
    this.editor = initializeEditor({
      shadowHost: elm,
      container: this.textContainer,
      inputText: this.msqText,
      supportedFontNames: fontNames(this.fontSourcesReference),
      previewButton: this.previewButton,
      readButton: this.readButton
    })
    this.editor.textarea.isRenderedWithLatestInputText = true
    // The settings act on the editor, so they can only be wired once it exists.
    this.#wireSettings()
    // The first #mountGenerated ran before the editor existed, so the layer
    // still holds the ref-id-less highlights initializeEditor produced.
    this.#applyRenderedHighlights()
  }

  /**
   * Editor appearance comes from custom properties rather than the stylesheet,
   * so a page can set it per element:
   *
   *   data-editor-height       e.g. "420px"
   *   data-editor-font-family  a CSS stack; must be monospace, or the highlight
   *                            layer stops lining up with the textarea above it
   *   data-editor-font-size    e.g. "0.9em"
   *   data-editor-font-src     URL of a font file for the first family in the
   *                            stack, registered on the document
   *   data-navigation-highlight-color
   *                            colour of the Cmd/Ctrl-click link between a word
   *                            and its glyph; distinct from
   *                            data-highlight-color, which marks playing notes
   *
   * The same properties can be set from the page on the rendered host element,
   * which wins over the :host defaults.
   */
  #applyEditorAppearance() {
    const appearance = {
      '--editor-height': this.getAttribute('data-editor-height'),
      '--editor-font-family': this.getAttribute('data-editor-font-family'),
      '--editor-font-size': this.getAttribute('data-editor-font-size'),
      '--navigation-highlight-color': this.getAttribute('data-navigation-highlight-color')
    }
    Object.entries(appearance).forEach(([ property, value ]) => {
      if (value) {
        this.wrapper.style.setProperty(property, value)
      }
    })

    const fontFamily = this.getAttribute('data-editor-font-family')
    const fontSrc = this.getAttribute('data-editor-font-src')
    if (fontFamily && fontSrc) {
      // Text is measured against the rendered font, so re-measure once it lands.
      loadFontFace(fontFamily, fontSrc).then(() => {
        if (this.editor && this.textContainer.hidden === false) {
          this.editor.adjustForScreen()
        }
      })
    }
  }

  /**
   * Replaces the SVG and the player outright rather than mutating them, so the
   * highlighter's listeners go away with the old nodes instead of stacking up
   * on every re-render.
   */
  #mountGenerated({
    svg,
    svgDataSrc,
    midiDataSrc,
    timeStampsMappedWithRefsOn,
    refsOnMappedWithTimeStamps,
    customStyles,
    highlightsHtmlBuffer,
    errors
  }) {
    this.svgDataSrc = svgDataSrc
    this.renderedHighlightsHtml = (highlightsHtmlBuffer || []).join('')
    this.svgContainer.innerHTML = svg
    this.labelScore(this.svgContainer, 'Engraved music score')

    const previousPlayer = this.wrapper.querySelector('midi-player')
    if (previousPlayer) {
      previousPlayer.remove()
    }
    const soundFont = this.getAttribute('data-sound-font')
    const midiPlayer = document.createElement('midi-player')
    midiPlayer.setAttribute('data-sound-font', soundFont || '')
    midiPlayer.setAttribute('data-src', midiDataSrc)
    this.svgContainer.after(midiPlayer)

    overrideMidiPlayerStyles(midiPlayer)
    addUtilsToMidiPlayerControlPanel(midiPlayer, [
      {
        innerHTML: downloadIcon,
        onClick: () => downloadContent({
          fileName: this.getAttribute('data-file-name') || this.id,
          dataSrc: midiDataSrc,
          extenstion: 'midi'
        })
      },
      {
        innerHTML: copyIcon,
        onClick: (event) => copyText({
          event,
          text: this.msqText,
          onCopyInnerHTML: doneIcon
        })
      }
    ])
    midiPlayer.timeStampsMappedWithRefsOn = timeStampsMappedWithRefsOn
    midiPlayer.refsOnMappedWithTimeStamps = refsOnMappedWithTimeStamps
    this.midiPlayer = midiPlayer

    this.customStyles = customStyles
    this.#attachHighlighter()

    this.updateErrors(this.host.shadowRoot, errors)
    this.#applyRenderedHighlights()
  }

  /**
   * Paint the notes as they sound, and seek by clicking one.
   *
   * Separate because the colour is taken once, when the highlighter attaches —
   * so changing it in the settings means attaching again over the same player.
   */
  #attachHighlighter() {
    attachHighlighterToMidiPlayer({
      midiPlayer: this.midiPlayer,
      svgParent: this.svgContainer,
      customStyles: this.customStyles,
      customHighlightColor: this.getAttribute('data-highlight-color')
    })
  }

  /**
   * Swaps the highlight layer for the one the worker produced.
   *
   * The typing path parses with `applyOnlyHighlightingWithoutRefIds`, which
   * emits no `ref-id` attributes — deliberately, since dropping them is part of
   * what makes it cheap enough to run per keystroke. The worker's full parse
   * does emit them, and they are what the Cmd/Ctrl-click navigation matches
   * against the SVG's `ref-ids`.
   *
   * So navigation works on a freshly rendered document and degrades as soon as
   * you type, which is why the editor shows "You have to re-render preview to
   * match the changes in the text to be able to navigate."
   */
  #applyRenderedHighlights() {
    if (!this.editor || !this.renderedHighlightsHtml) {
      return
    }
    refreshDivUnderneathTextareaWithNewHtml(
      this.editor.divUnderneathTextarea,
      this.renderedHighlightsHtml
    )
  }

  /*
  The settings sit in a view of their own rather than a panel over the score:
  the wrapper is sized to whatever is showing, so anything laid on top of it
  would either be clipped or would stretch the element.
  */
  #toggleSettingsView() {
    if (!this.settingsContainer.hidden) {
      this.settingsContainer.hidden = true
      this.#wasShowing === 'text' ? this.#showTextView() : this.#showPreviewView()
      return
    }

    this.#wasShowing = this.textContainer.hidden ? 'score' : 'text'
    this.#sizeLikeTheScore(this.settingsContainer)
    this.svgContainer.hidden = true
    this.textContainer.hidden = true
    if (this.midiPlayer) {
      this.midiPlayer.hidden = true
    }
    this.settingsContainer.hidden = false
    this.#fillSettings()
  }

  /*
  The controls say what is true now, which for the two colours means reading back
  what the element was given rather than what a picker happens to default to.
  */
  #fillSettings() {
    const at = (name) => this.settingsContainer.querySelector(`[data-setting="${name}"]`)
    at('autocomplete').checked = !this.editor.textarea.autocompleteIsOff
    at('highlighting').checked = !this.editor.divUnderneathTextarea.highlightingIsOff
    at('played-colour').value = this.#playedColour()
    at('reference-colour').value =
      getComputedStyle(this.host).getPropertyValue('--navigation-highlight-color').trim() || '#f5cd79'
    at('sound-font').value = this.getAttribute('data-sound-font') || ''
  }

  #playedColour() {
    return this.getAttribute('data-highlight-color') || '#C40233'
  }

  #wireSettings() {
    const at = (name) => this.settingsContainer.querySelector(`[data-setting="${name}"]`)

    at('autocomplete').addEventListener('change', (event) => {
      this.editor.textarea.autocompleteIsOff = !event.target.checked
    })

    at('highlighting').addEventListener('change', (event) => {
      this.editor.divUnderneathTextarea.highlightingIsOff = !event.target.checked
      // Rewrite the layer now, so the change shows without waiting for a keystroke.
      refreshDivUnderneathTextareaWithNewHtml(
        this.editor.divUnderneathTextarea,
        parsedHighlights(this.editor.textarea.value, [], this.editor.textarea.supportedFontNames).html
      )
    })

    at('played-colour').addEventListener('change', (event) => {
      /*
      The highlighter takes its colour when it is attached and keeps it, so a new
      colour means attaching again over the same player.
      */
      this.setAttribute('data-highlight-color', event.target.value)
      this.#attachHighlighter()
    })

    at('reference-colour').addEventListener('change', (event) => {
      // Live: everything that draws the box reads this property.
      this.host.style.setProperty('--navigation-highlight-color', event.target.value)
    })

    at('sound-font').addEventListener('change', (event) => {
      const soundFont = event.target.value.trim()
      this.setAttribute('data-sound-font', soundFont)
      /*
      The player lists data-sound-font among the attributes it observes, so it
      reloads its samples itself. Nothing here has to rebuild the score.
      */
      if (this.midiPlayer) {
        this.midiPlayer.setAttribute('data-sound-font', soundFont)
      }
    })
  }

  /**
   * How much room the score and its player are taking.
   *
   * Measured while they are still showing and then remembered: once they are
   * hidden they measure zero, and a view opened from another view would have
   * nothing to size itself against.
   */
  #rememberScoreSize() {
    const width = this.svgContainer.offsetWidth
    if (width > 0) {
      this.#viewSize = {
        width,
        height: this.svgContainer.offsetHeight +
          (this.midiPlayer && !this.midiPlayer.hidden ? this.midiPlayer.offsetHeight : 0)
      }
    }
    return this.#viewSize
  }

  /**
   * Give a view the size the score has, so switching between them does not
   * change the height of the element or make the page jump.
   */
  #sizeLikeTheScore(container) {
    const size = this.#rememberScoreSize()
    if (!size) {
      return
    }
    container.style.width = `${size.width}px`
    container.style.height = `${size.height}px`
  }

  #showTextView() {
    // The wrapper is width:max-content and the text view has no intrinsic
    // width, so without this it collapses the moment the score is hidden.
    this.#sizeLikeTheScore(this.textContainer)
    this.settingsContainer.hidden = true
    this.svgContainer.hidden = true
    this.midiPlayer.hidden = true
    this.textContainer.hidden = false
    this.readButton.hidden = true
    this.previewButton.hidden = false
    // The textarea was laid out while hidden, so it measured zero width.
    this.editor.adjustForScreen()
    this.editor.textarea.focus()
  }

  async #showPreviewView() {
    const textarea = this.editor.textarea
    if (textarea.isRenderedWithLatestInputText !== true) {
      this.msqText = textarea.value
      this.wrapper.style.opacity = '0.5'
      try {
        this.#mountGenerated(await this.#generate(this.msqText))
        textarea.isRenderedWithLatestInputText = true
      } catch (error) {
        this.updateErrors(this.host.shadowRoot, [ error.message ])
      } finally {
        this.wrapper.style.removeProperty('opacity')
      }
    }
    // Hiding the button that was just activated would drop focus to the body
    // and restart Tab from the top of the page, so hand it to the button that
    // takes its place.
    const focusWasInside = this.host.shadowRoot.activeElement !== null

    // Either of the other two buttons puts the settings away: they are a view,
    // not a panel, and only one view shows at a time.
    this.settingsContainer.hidden = true
    this.textContainer.hidden = true
    this.svgContainer.hidden = false
    this.midiPlayer.hidden = false
    this.previewButton.hidden = true
    this.readButton.hidden = false

    if (focusWasInside) {
      this.readButton.focus()
    }
  }
}

customElements.define('msq-editor', MuSemantiQEditor, { extends: 'template' })
