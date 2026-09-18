/* c8 ignore start -- unreachable today; see the note below */
'use strict'

/*
Not reached today, and kept anyway.

Every octave clef draws its own numeral — octaveEightUpClef.js and its siblings
place the "8" or "15" themselves — so nothing imports this. It is the general
form of that numeral, the one an octave sign or a clef variant would use rather
than repeating the placement, and the styles it reads
(octaveTextFontOptions, the two top-offset margins) are still part of the style
sheet. Marked so it neither counts against coverage nor disappears from the
report.
*/
/* c8 ignore start */

import text from '#msq/drawer/elements/basic/text.js'
import group from '#msq/drawer/elements/basic/group.js'

export default function (octaveNumber, direction) {
  return (styles, leftOffset, topOffset) => {
    const { octaveTextFontOptions, leftOffsetMarginForOctaveText, topOffsetMarginForDownOctaveText, topOffsetMarginForUpOctaveText } = styles
    return group(
      'octaveText',
      [
        text(
          octaveNumber + '',
          octaveTextFontOptions
        )(
          styles,
          leftOffset + leftOffsetMarginForOctaveText,
          topOffset +
          (
            direction === 'down'
              ? topOffsetMarginForDownOctaveText
              : topOffsetMarginForUpOctaveText
          )
        )
      ]
    )
  }
}
/* c8 ignore stop */
