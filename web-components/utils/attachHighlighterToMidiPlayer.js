// How far either side of a note's start time we still consider "this note".
const PERCEPTION_TIME = 0.005
// Timestamps are quantised to 4 decimals, so this is one step of the scan and
// also the nudge that makes a seeked note actually re-fire.
const PRECISION = 0.0001

function refElementsById(svgParent, refId) {
  // ref-ids is a comma-separated list, so a substring match would let
  // "note-1-1-1-1-1" also select "note-1-1-1-1-11".
  return [ ...svgParent.querySelectorAll('[ref-ids]') ].filter((refElm) => {
    return refElm.getAttribute('ref-ids').split(',').indexOf(refId) !== -1
  })
}

/**
 * Keeps the engraving and the audio in sync, in both directions.
 *
 * Playing → notation: on each `note` event, look up the refIds sounding at that
 * timestamp and repaint their glyphs, reverting after the note's duration.
 * Notation → audio: clicking a notehead or rest seeks the player to it.
 *
 * The bridge is the `ref-ids` attribute the drawer puts on SVG groups, which
 * shares a namespace with the maps the MIDI generator returns.
 */
export default function attachHighlighterToMidiPlayer({
  midiPlayer,
  svgParent,
  customStyles,
  customHighlightColor
}) {
  const highlightColor = customHighlightColor || '#C40233'
  const midiProgressBar = midiPlayer.shadowRoot.querySelector('[data-seek-bar]')
  const currentTimeLabel = midiPlayer.shadowRoot.querySelector('[data-current-time]')
  const totalTimeLabel = midiPlayer.shadowRoot.querySelector('[data-total-time]')
  const playButton = midiPlayer.shadowRoot.querySelector('[data-play-button]')

  const progressChangeEvent = (event) => {
    const originalFontColor = customStyles.fontColor || '#121212'
    if (event.type === 'input' || event.type === 'change' || event.type === 'stop') {
      const refElms = svgParent.querySelectorAll(`[fill="${highlightColor}"]`)
      refElms.forEach((refElm) => {
        refElm.setAttribute('fill', originalFontColor)
      })
      midiPlayer.progressInterruptedFlowOfNoteEvents = true
      return
    }

    if (event.type === 'note' && midiPlayer.progressInterruptedFlowOfNoteEvents) {
      midiPlayer.progressInterruptedFlowOfNoteEvents = false
    }

    const closestTimeStampMappedWithRefsOnForCurrentNote = []
    for (let error = -PERCEPTION_TIME; error <= PERCEPTION_TIME; error += PRECISION) {
      const closestTimeStampMappedWithRefsOnForCurrentNoteForCurrentError = midiPlayer.timeStampsMappedWithRefsOn[(event.detail.note.startTime + error).toFixed(4) * 1]
      if (closestTimeStampMappedWithRefsOnForCurrentNoteForCurrentError !== undefined) {
        closestTimeStampMappedWithRefsOnForCurrentNote.push(
          ...closestTimeStampMappedWithRefsOnForCurrentNoteForCurrentError
        )
      }
    }

    closestTimeStampMappedWithRefsOnForCurrentNote.forEach((refToHighlight) => {
      const refElms = refElementsById(svgParent, refToHighlight.refId)
      refElms.forEach((refElm) => {
        refElm.querySelectorAll('path').forEach((pathElm) => {
          pathElm.setAttribute('fill', highlightColor)
        })
      })
      const unhighlightNoteTimeout = setTimeout(() => {
        refElms.forEach((refElm) => {
          refElm.querySelectorAll('path').forEach((pathElm) => {
            pathElm.setAttribute('fill', originalFontColor)
          })
        })
        clearTimeout(unhighlightNoteTimeout)
        const midiProgressBarMaxValue = midiProgressBar.getAttribute('max') * 1
        if ((event.detail.note.startTime + refToHighlight.duration) >= midiProgressBarMaxValue) {
          midiProgressBar.value = midiProgressBarMaxValue
          if (playButton.parentElement.classList.contains('playing')) {
            currentTimeLabel.innerText = totalTimeLabel.innerText
            playButton.click()
          }
        }
      }, refToHighlight.duration * 1000)
    })
  }

  midiPlayer.addEventListener('note', progressChangeEvent)
  midiPlayer.addEventListener('stop', progressChangeEvent)
  midiProgressBar.addEventListener('change', progressChangeEvent)
  midiProgressBar.addEventListener('input', progressChangeEvent)

  // Seeking mid-playback: stop and start again so the player re-arms from the
  // new position.
  midiProgressBar.addEventListener('change', () => {
    if (playButton.parentElement.classList.contains('playing')) {
      playButton.click()
      playButton.click()
    }
  })

  svgParent.addEventListener('click', (event) => {
    if (event.target.tagName !== 'path') {
      return
    }
    if (!event.target.parentNode) {
      return
    }
    let refIds
    const refDataName = event.target.parentNode.getAttribute('data-name')

    if (refDataName === 'noteBody') {
      refIds = event.target.parentNode.getAttribute('ref-ids')
    }
    if (refDataName === 'rest') {
      refIds = event.target.parentNode.getAttribute('ref-ids')
    }
    if (refDataName === 'simileStrokes') {
      refIds = event.target.parentNode.parentNode.parentNode.getAttribute('ref-ids')
    }
    if (!refIds) {
      return
    }
    const splittedRefIds = refIds.split(',')
    const theOnlyPageIndex = 0
    if (midiPlayer.refsOnMappedWithTimeStamps[theOnlyPageIndex] === undefined) {
      return
    }
    for (const refIdIndex in splittedRefIds) {
      const refId = splittedRefIds[refIdIndex]
      if (midiPlayer.refsOnMappedWithTimeStamps[theOnlyPageIndex][refId] !== undefined) {
        midiProgressBar.value = midiPlayer.refsOnMappedWithTimeStamps[theOnlyPageIndex][refId] - PRECISION
        midiProgressBar.dispatchEvent(new CustomEvent('change'))
        break
      }
    }
  })
}
