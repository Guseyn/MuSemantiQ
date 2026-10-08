'use strict'

const DYNAMICS_MAPPED_WITH_MIDI_VELOCITIES = {
  'pppppp': 20,
  'ppppp': 25,
  'pppp': 30,
  'ppp': 35,
  'pp': 45,
  'p': 50,
  'mp': 55,
  'm': 60,
  'mf': 70,
  'pf': 75,
  'f': 80,
  'ff': 90,
  'fff': 110,
  'ffff': 115,
  'fffff': 120,
  'ffffff': 125,
  'fp': 55,
  'fz': 65,
  'sf': 85,
  'sfp': 95,
  'sfpp': 105,
  'sfz': 112,
  'sfzp': 117,
  's': 120,
  'sffz': 122,
  'r': 100,
  'rf': 47,
  'rfz': 57,
  'z': 127,
}

const ORDERED_DYNAMIC_VALUES = [
  20, 25, 30, 35, 40, 45, 47, 50,
  55, 57, 60, 65, 70, 75, 80, 85,
  90, 95, 100, 105, 110, 112, 115,
  117, 120, 122, 125, 127
]

const DEFAULT_DELTA_DYNAMIC_IN_INDEXES = 7

const calculateEndingVelocityInCrescendoIfItIsNotSpeicified = (startVelocity) => {
  return ORDERED_DYNAMIC_VALUES[ORDERED_DYNAMIC_VALUES.indexOf(startVelocity) + DEFAULT_DELTA_DYNAMIC_IN_INDEXES] || 127
}

const calculateEndingVelocityInDiminuendoIfItIsNotSpeicified = (startVelocity) => {
  return ORDERED_DYNAMIC_VALUES[ORDERED_DYNAMIC_VALUES.indexOf(startVelocity) - DEFAULT_DELTA_DYNAMIC_IN_INDEXES] || 20
}

const DEFAULT_MIN_DYNAMIC_LETTER = 'p'

export default function (articulationParams, dynamicChangeMark, dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames, currentDynamicsAuraObjectsForEachVoiceOnEachStave, lastMentionedDynamicsForEachVoiceOnEachStave, unitIsGrace, graceCountersForEachVoiceInEachStaveSplittedInTimeFrames, time, staveVoiceKey, isLastSingleUnitInVoiceOnPageLine) {
  if (dynamicChangeMark) {
    const thisIsStartDynamicChangeMark = !dynamicChangeMark.finish
    if (thisIsStartDynamicChangeMark) {
      const newDynamicAuraObject = {}
      newDynamicAuraObject.startVelocity = DYNAMICS_MAPPED_WITH_MIDI_VELOCITIES[dynamicChangeMark.valueBefore] || lastMentionedDynamicsForEachVoiceOnEachStave[staveVoiceKey] || DYNAMICS_MAPPED_WITH_MIDI_VELOCITIES[DEFAULT_MIN_DYNAMIC_LETTER]
      newDynamicAuraObject.count = 1
      newDynamicAuraObject.graceCount = unitIsGrace ? graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time][staveVoiceKey] : undefined
      newDynamicAuraObject.type = dynamicChangeMark.type
      if (newDynamicAuraObject.type === 'crescendo') {
        if (dynamicChangeMark.valueAfter && DYNAMICS_MAPPED_WITH_MIDI_VELOCITIES[dynamicChangeMark.valueAfter]) {
          newDynamicAuraObject.endVelocity = DYNAMICS_MAPPED_WITH_MIDI_VELOCITIES[dynamicChangeMark.valueAfter]
        } else {
          newDynamicAuraObject.endVelocity = calculateEndingVelocityInCrescendoIfItIsNotSpeicified(newDynamicAuraObject.startVelocity)
        }
      } else {
        if (dynamicChangeMark.valueAfter && DYNAMICS_MAPPED_WITH_MIDI_VELOCITIES[dynamicChangeMark.valueAfter]) {
          newDynamicAuraObject.endVelocity = DYNAMICS_MAPPED_WITH_MIDI_VELOCITIES[dynamicChangeMark.valueAfter]
        } else {
          newDynamicAuraObject.endVelocity = calculateEndingVelocityInDiminuendoIfItIsNotSpeicified(newDynamicAuraObject.startVelocity)
        }
      }
      dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] = dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] || {}
      dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey] = dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey] || []
      dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey].push(newDynamicAuraObject)
      currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey] = [ newDynamicAuraObject ]
    } else {
      const newDynamicAuraObject = {}
      newDynamicAuraObject.graceCount = unitIsGrace ? graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time][staveVoiceKey] : undefined
      newDynamicAuraObject.type = currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey][currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey].length - 1].type
      dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] = dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] || {}
      dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey] = dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey] || []
      dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey].push(newDynamicAuraObject)
      currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey].push(newDynamicAuraObject)
      newDynamicAuraObject.count = currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey].length
      const startVelocity = currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey][0].startVelocity
      const endVelocity = currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey][0].endVelocity
      const dynamicChangeStep = Math.abs(endVelocity  - startVelocity) / newDynamicAuraObject.count
      for (let dynamicIndex = 0; dynamicIndex < currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey].length; dynamicIndex++) {
        const dynamicAuraObject = currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey][dynamicIndex]
        if (newDynamicAuraObject.type === 'crescendo') {
          dynamicAuraObject.velocity = (startVelocity + (dynamicIndex + 1) * dynamicChangeStep)
        } else {
          dynamicAuraObject.velocity = (startVelocity - (dynamicIndex + 1) * dynamicChangeStep)
        }
      }
      lastMentionedDynamicsForEachVoiceOnEachStave[staveVoiceKey] = newDynamicAuraObject.velocity
      delete currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey]
    }
  } else {
    if (currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey]) {
      const newDynamicAuraObject = {}
      newDynamicAuraObject.count = currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey].length
      newDynamicAuraObject.graceCount = unitIsGrace ? graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time][staveVoiceKey] : undefined
      newDynamicAuraObject.type = currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey][currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey].length - 1].type
      dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] = dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] || {}
      dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey] = dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey] || []
      dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey].push(newDynamicAuraObject)
      currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey].push(newDynamicAuraObject)
      lastMentionedDynamicsForEachVoiceOnEachStave[staveVoiceKey] = newDynamicAuraObject.velocity
      if (isLastSingleUnitInVoiceOnPageLine) {
        const startVelocity = currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey][0].startVelocity
        const dynamicChangeStepForCrescendo = (calculateEndingVelocityInCrescendoIfItIsNotSpeicified(startVelocity) - startVelocity) / newDynamicAuraObject.count
        const dynamicChangeStepForDiminuendo = (startVelocity - calculateEndingVelocityInDiminuendoIfItIsNotSpeicified(startVelocity)) / newDynamicAuraObject.count
        for (let dynamicIndex = 0; dynamicIndex < currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey].length; dynamicIndex++) {
          const dynamicAuraObject = currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey][dynamicIndex]
          if (newDynamicAuraObject.type === 'crescendo') {
            dynamicAuraObject.velocity = (startVelocity + (dynamicIndex + 1) * dynamicChangeStepForCrescendo)
          } else {
            dynamicAuraObject.velocity = (startVelocity - (dynamicIndex + 1) * dynamicChangeStepForDiminuendo)
          }
        }
        delete currentDynamicsAuraObjectsForEachVoiceOnEachStave[staveVoiceKey]
      }
    } else if (articulationParams) {
      const dynamicMark = articulationParams.find(articulationParam => articulationParam.name === 'dynamicMark')
      if (dynamicMark && DYNAMICS_MAPPED_WITH_MIDI_VELOCITIES[dynamicMark.textValue]) {
        dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] = dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time] || {}
        const newDynamicAuraObject = {}
        newDynamicAuraObject.graceCount = unitIsGrace ? graceCountersForEachVoiceInEachStaveSplittedInTimeFrames[time][staveVoiceKey] : undefined
        newDynamicAuraObject.velocity = DYNAMICS_MAPPED_WITH_MIDI_VELOCITIES[dynamicMark.textValue]
        dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey] = dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey] || []
        dynamicsAuraForEachVoiceOnEachStaveSplittedInTimeFrames[time][staveVoiceKey].push(newDynamicAuraObject)
        lastMentionedDynamicsForEachVoiceOnEachStave[staveVoiceKey] = newDynamicAuraObject.velocity
      }
    }
  }
}
