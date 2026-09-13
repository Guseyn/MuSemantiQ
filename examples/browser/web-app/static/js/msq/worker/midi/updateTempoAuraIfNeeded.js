'use strict'

import durationsValuesInTempoExpressedInQuarters from '/js/msq/worker/midi/durationsValuesInTempoExpressedInQuarters.js'
import tempoNamesMappedWitTempoAuraUpdaters from '/js/msq/worker/midi/tempoNamesMappedWitTempoAuraUpdaters.js'

/*
The tempo names become one alternation, and two things about them matter.

Some are abbreviations carrying a dot — `rit.`, `rall.` — so the names have to
be escaped: unescaped, `rit.` matches the `rite` of `ritenuto`, and the lookup
that follows is handed a name the table does not hold.

And an alternation takes the first branch that matches, not the longest, so the
names are tried longest first. Otherwise `rit.` would answer for `ritardando`
and `ritenuto` alike.
*/
const TEMPO_NAMES_LONGEST_FIRST = Object.keys(tempoNamesMappedWitTempoAuraUpdaters)
  .sort((one, another) => another.length - one.length)
  .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))

const REGEXPS_WITH_GROUPED_LIST_OF_TEMPO_NAMES = new RegExp(`(${TEMPO_NAMES_LONGEST_FIRST.join('|')})`)
const REGXEPS_WITH_TEMPO_NUMBER = /= {0,}(\d+)/

export default function (tempoMark, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure, label) {
  if (tempoMark) {
    let tempoName = 'default'
    let tempoDuration
    let tempoNumber
    for (let index = 0; index < tempoMark.textValueParts.length; index++) {
      const tempoNameMatch = tempoMark.textValueParts[index].toLowerCase().match(REGEXPS_WITH_GROUPED_LIST_OF_TEMPO_NAMES)
      if (tempoNameMatch) {
        tempoName = tempoNameMatch[1]
      }
      if (durationsValuesInTempoExpressedInQuarters[tempoMark.textValueParts[index]]) {
        tempoDuration = tempoMark.textValueParts[index]
      }
      const tempoNumberMatch = tempoMark.textValueParts[index].toLowerCase().match(REGXEPS_WITH_TEMPO_NUMBER)
      if (tempoNumberMatch) {
        tempoNumber = tempoNumberMatch[1] * 1
      }
    }
    tempoNamesMappedWitTempoAuraUpdaters[tempoName](tempoDuration, tempoNumber, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure)
  }
}
