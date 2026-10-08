'use strict'

import drawQuadrupleWholeRest from '#msq/drawer/elements/notes-on-a-page/rests/drawQuadrupleWholeRest.js'
import drawDoubleWholeRest from '#msq/drawer/elements/notes-on-a-page/rests/drawDoubleWholeRest.js'
import drawWholeRest from '#msq/drawer/elements/notes-on-a-page/rests/drawWholeRest.js'
import drawHalfRest from '#msq/drawer/elements/notes-on-a-page/rests/drawHalfRest.js'
import drawQuarterRest from '#msq/drawer/elements/notes-on-a-page/rests/drawQuarterRest.js'
import drawEighthRest from '#msq/drawer/elements/notes-on-a-page/rests/drawEighthRest.js'
import drawSixteenthRest from '#msq/drawer/elements/notes-on-a-page/rests/drawSixteenthRest.js'
import drawThirtySecondRest from '#msq/drawer/elements/notes-on-a-page/rests/drawThirtySecondRest.js'
import drawSixtyFourthRest from '#msq/drawer/elements/notes-on-a-page/rests/drawSixtyFourthRest.js'
import drawHundredTwentyEighthRest from '#msq/drawer/elements/notes-on-a-page/rests/drawHundredTwentyEighthRest.js'
import drawTwoHundredFiftySixthRest from '#msq/drawer/elements/notes-on-a-page/rests/drawTwoHundredFiftySixthRest.js'

const rests = {
  '4': drawQuadrupleWholeRest,
  '2': drawDoubleWholeRest,
  '1': drawWholeRest,
  '0.5': drawHalfRest,
  '0.25': drawQuarterRest,
  '0.125': drawEighthRest,
  '0.0625': drawSixteenthRest,
  '0.03125': drawThirtySecondRest,
  '0.015625': drawSixtyFourthRest,
  '0.0078125': drawHundredTwentyEighthRest,
  '0.00390625': drawTwoHundredFiftySixthRest
}

export default function (duration, restPositionNumber) {
  return rests[`${duration}`](restPositionNumber)
}
