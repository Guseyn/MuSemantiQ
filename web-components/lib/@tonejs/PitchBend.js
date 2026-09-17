const privateHeaderMap = new WeakMap()

/**
 * Represents a pitch bend event.
 */
export class PitchBend {
	constructor(event, header) {
		privateHeaderMap.set(this, header)
		this.ticks = event.absoluteTime
		this.value = event.value
	}

	get time() {
		const header = privateHeaderMap.get(this)
		return header.ticksToSeconds(this.ticks)
	}

	set time(t) {
		const header = privateHeaderMap.get(this)
		this.ticks = header.secondsToTicks(t)
	}

	toJSON() {
		return {
			ticks: this.ticks,
			time: this.time,
			value: this.value,
		}
	}
}
