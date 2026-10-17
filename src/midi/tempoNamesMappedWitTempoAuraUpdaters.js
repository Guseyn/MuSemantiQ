'use strict'

import durationsValuesInTempoExpressedInQuarters from '#msq/midi/durationsValuesInTempoExpressedInQuarters.js'

export default {
  default: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      }
    }
  },
  larghissimo: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 20
      }
    }
  },
  grave: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 20
      }
    }
  },
  solenne: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 25
      }
    }
  },
  lento: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 40
      }
    }
  },
  lentissimo: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 48
      }
    }
  },
  largo: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 40
      }
    }
  },
  larghetto: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 60
      }
    }
  },
  adagio: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 66
      }
    }
  },
  adagietto: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 70
      }
    }
  },
  tranquillo: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 80
      }
    }
  },
  'andante moderato': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 92
      }
    }
  },
  andante: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 72
      }
    }
  },
  andantino: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 73
      }
    }
  },
  moderato: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 108
      }
    }
  },
  allegretto: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 110
      }
    }
  },
  'allegro moderato': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 116
      }
    }
  },
  allegro: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 120
      }
    }
  },
  vivace: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 156
      }
    }
  },
  vivacissimo: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 172
      }
    }
  },
  allegrissimo: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 172
      }
    }
  },
  'allegro vivace': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 172
      }
    }
  },
  presto: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 168
      }
    }
  },
  prestissimo: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 200
      }
    }
  },
  accelerando: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    const accelerandoStepPerQuarter = 20
    if (thisIsFirstUnitInMeasure) {
      let aimingToQuartersPerMinute = tempoAura.quartersPerMinute + 100
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        aimingToQuartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      }
      if (aimingToQuartersPerMinute > tempoAura.quartersPerMinute) {
        tempoAura.aimingToQuartersPerMinute = aimingToQuartersPerMinute
      }
    }
    if (tempoAura.quartersPerMinute < tempoAura.aimingToQuartersPerMinute && unitDurationInQuarters) {
      tempoAura.quartersPerMinute += accelerandoStepPerQuarter * unitDurationInQuarters
    }
  },
  allargando: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    const allargandoStepPerQuarter = 20
    if (thisIsFirstUnitInMeasure) {
      let aimingToQuartersPerMinute = tempoAura.quartersPerMinute - 100
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        aimingToQuartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      }
      if (aimingToQuartersPerMinute < tempoAura.quartersPerMinute) {
        tempoAura.aimingToQuartersPerMinute = aimingToQuartersPerMinute
      }
    }
    if (tempoAura.quartersPerMinute > tempoAura.aimingToQuartersPerMinute && unitDurationInQuarters) {
      tempoAura.quartersPerMinute -= allargandoStepPerQuarter * unitDurationInQuarters
    }
  },
  calando: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute -= 50
      }
    }
  },
  'doppio movimento': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute *= 2
      }
    }
  },
  'doppio piu mosso': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute *= 2
      }
    }
  },
  'doppio piu lento': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute /= 2
      }
    }
  },
  lentando: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    const lentandoStepPerQuarter = 20
    if (thisIsFirstUnitInMeasure) {
      let aimingToQuartersPerMinute = tempoAura.quartersPerMinute - 80
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        aimingToQuartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      }
      if (aimingToQuartersPerMinute < tempoAura.quartersPerMinute) {
        tempoAura.aimingToQuartersPerMinute = aimingToQuartersPerMinute
      }
    }
    if (tempoAura.quartersPerMinute > tempoAura.aimingToQuartersPerMinute && unitDurationInQuarters) {
      tempoAura.quartersPerMinute -= lentandoStepPerQuarter * unitDurationInQuarters
    }
  },
  'meno mosso': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute -= 40
      }
    }
  },
  'meno moto': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute -= 40
      }
    }
  },
  'piu mosso': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute += 70
      }
    }
  },
  mosso: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute += 40
      }
    }
  },
  precipitando: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute += 80
      }
    }
  },
  rallentando: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    const rallentandoStepPerQuarter = 20
    if (thisIsFirstUnitInMeasure) {
      let aimingToQuartersPerMinute = tempoAura.quartersPerMinute - 80
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        aimingToQuartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      }
      if (aimingToQuartersPerMinute < tempoAura.quartersPerMinute) {
        tempoAura.aimingToQuartersPerMinute = aimingToQuartersPerMinute
      }
    }
    if (tempoAura.quartersPerMinute > tempoAura.aimingToQuartersPerMinute && unitDurationInQuarters) {
      tempoAura.quartersPerMinute -= rallentandoStepPerQuarter * unitDurationInQuarters
    }
  },
  'rall.': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    const rallentandoStepPerQuarter = 20
    if (thisIsFirstUnitInMeasure) {
      let aimingToQuartersPerMinute = tempoAura.quartersPerMinute - 80
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        aimingToQuartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      }
      if (aimingToQuartersPerMinute < tempoAura.quartersPerMinute) {
        tempoAura.aimingToQuartersPerMinute = aimingToQuartersPerMinute
      }
    }
    if (tempoAura.quartersPerMinute > tempoAura.aimingToQuartersPerMinute && unitDurationInQuarters) {
      tempoAura.quartersPerMinute -= rallentandoStepPerQuarter * unitDurationInQuarters
    }
  },
  ritardando: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    const ritardandoStepPerQuarter = 20
    if (thisIsFirstUnitInMeasure) {
      let aimingToQuartersPerMinute = tempoAura.quartersPerMinute - 80
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        aimingToQuartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      }
      if (aimingToQuartersPerMinute < tempoAura.quartersPerMinute) {
        tempoAura.aimingToQuartersPerMinute = aimingToQuartersPerMinute
      }
    }
    if (tempoAura.quartersPerMinute > tempoAura.aimingToQuartersPerMinute && unitDurationInQuarters) {
      tempoAura.quartersPerMinute -= ritardandoStepPerQuarter * unitDurationInQuarters
    }
  },
  'rit.': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    const ritardandoStepPerQuarter = 20
    if (thisIsFirstUnitInMeasure) {
      let aimingToQuartersPerMinute = tempoAura.quartersPerMinute - 80
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        aimingToQuartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      }
      if (aimingToQuartersPerMinute < tempoAura.quartersPerMinute) {
        tempoAura.aimingToQuartersPerMinute = aimingToQuartersPerMinute
      }
    }
    if (tempoAura.quartersPerMinute > tempoAura.aimingToQuartersPerMinute && unitDurationInQuarters) {
      tempoAura.quartersPerMinute -= ritardandoStepPerQuarter * unitDurationInQuarters
    }
  },
  ritenuto: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    const ritenutoStepPerQuarter = 40
    if (thisIsFirstUnitInMeasure) {
      let aimingToQuartersPerMinute = tempoAura.quartersPerMinute - 120
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        aimingToQuartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      }
      if (aimingToQuartersPerMinute < tempoAura.quartersPerMinute) {
        tempoAura.aimingToQuartersPerMinute = aimingToQuartersPerMinute
      }
    }
    if (tempoAura.quartersPerMinute > tempoAura.aimingToQuartersPerMinute && unitDurationInQuarters) {
      tempoAura.quartersPerMinute -= ritenutoStepPerQuarter * unitDurationInQuarters
    }
  },
  stringendo: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute += 60
      }
    }
  },
  tardando: (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    const tardandoStepPerQuarter = 20
    if (thisIsFirstUnitInMeasure) {
      let aimingToQuartersPerMinute = tempoAura.quartersPerMinute - 80
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        aimingToQuartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      }
      if (aimingToQuartersPerMinute < tempoAura.quartersPerMinute) {
        tempoAura.aimingToQuartersPerMinute = aimingToQuartersPerMinute
      }
    }
    if (tempoAura.quartersPerMinute > tempoAura.aimingToQuartersPerMinute && unitDurationInQuarters) {
      tempoAura.quartersPerMinute -= tardandoStepPerQuarter * unitDurationInQuarters
    }
  },
  'tempo giusto': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = 130
      }
    }
  },
  'tempo primo': (tempoValuePartWhereCertaintTempoDurationIsSpecified, tempoValuePartWhereCertainTempoNumberIsSpecified, tempoAura, unitDurationInQuarters, thisIsFirstUnitInMeasure) => {
    if (thisIsFirstUnitInMeasure) {
      if (tempoValuePartWhereCertaintTempoDurationIsSpecified && tempoValuePartWhereCertainTempoNumberIsSpecified) {
        tempoAura.quartersPerMinute = durationsValuesInTempoExpressedInQuarters[tempoValuePartWhereCertaintTempoDurationIsSpecified] * tempoValuePartWhereCertainTempoNumberIsSpecified
      } else {
        tempoAura.quartersPerMinute = tempoAura.initialQuartersPerMinute || 120
      }
    }
  }
}
