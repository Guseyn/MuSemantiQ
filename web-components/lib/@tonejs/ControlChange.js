/**
 * A map of values to control change names
 * @hidden
 */
export const controlChangeNames = {
	1: "modulationWheel",
	2: "breath",
	4: "footController",
	5: "portamentoTime",
	7: "volume",
	8: "balance",
	10: "pan",
	64: "sustain",
	65: "portamentoTime",
	66: "sostenuto",
	67: "softPedal",
	68: "legatoFootswitch",
	84: "portamentoControl",
};

/**
 * swap the keys and values
 * @hidden
 */
export const controlChangeIds = Object.keys(controlChangeNames).reduce((obj, key) => {
	obj[controlChangeNames[key]] = key;
	return obj;
}, {});

const privateHeaderMap = new WeakMap();
const privateCCNumberMap = new WeakMap();

/**
 * Represents a control change event
 */
export class ControlChange {
	constructor(event, header) {
		privateHeaderMap.set(this, header);
		privateCCNumberMap.set(this, event.controllerType);

		this.ticks = event.absoluteTime;
		this.value = event.value;
	}

	get number() {
		return privateCCNumberMap.get(this);
	}

	get name() {
		if (controlChangeNames[this.number]) {
			return controlChangeNames[this.number];
		} else {
			return null;
		}
	}

	get time() {
		const header = privateHeaderMap.get(this);
		return header.ticksToSeconds(this.ticks);
	}

	set time(t) {
		const header = privateHeaderMap.get(this);
		this.ticks = header.secondsToTicks(t);
	}

	toJSON() {
		return {
			number: this.number,
			ticks: this.ticks,
			time: this.time,
			value: this.value,
		};
	}
}
