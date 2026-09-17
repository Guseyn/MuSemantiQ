import {
	DrumKitByPatchID,
	instrumentByPatchID,
	InstrumentFamilyByID
} from '#msq/lib/@tonejs/InstrumentMaps.js'

/**
 * @hidden
 */
const privateTrackMap = new WeakMap()

/**
 * Describes the MIDI instrument of a track.
 */
export class Instrument {
	constructor(trackData, track) {
		privateTrackMap.set(this, track)
		this.number = 0

		if (trackData) {
			const programChange = trackData.find(e => e.type === 'programChange')
			if (programChange) {
				this.number = programChange.programNumber
			}
		}
	}

	get name() {
		if (this.percussion) {
			return DrumKitByPatchID[this.number]
		} else {
			return instrumentByPatchID[this.number]
		}
	}

	set name(n) {
		const patchNumber = instrumentByPatchID.indexOf(n)
		if (patchNumber !== -1) {
			this.number = patchNumber
		}
	}

	get family() {
		if (this.percussion) {
			return 'drums';
		} else {
			return InstrumentFamilyByID[Math.floor(this.number / 8)]
		}
	}

	get percussion() {
		const track = privateTrackMap.get(this)
		return track.channel === 9
	}

	toJSON() {
		return {
			family: this.family,
			number: this.number,
			name: this.name,
		}
	}

	fromJSON(json) {
		this.number = json.number
	}
}
