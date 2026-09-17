import { insert } from '#msq/lib/@tonejs/BinarySearch.js'
import { ControlChange } from '#msq/lib/@tonejs/ControlChange.js'
import { createControlChanges } from '#msq/lib/@tonejs/ControlChanges.js'
import { PitchBend } from '#msq/lib/@tonejs/PitchBend.js'
import { Instrument } from '#msq/lib/@tonejs/Instrument.js'
import { Note } from '#msq/lib/@tonejs/Note.js'

const privateHeaderMap = new WeakMap()

/**
 * A Track is a collection of 'notes' and 'controlChanges'.
 */
export class Track {
	constructor(trackData, header) {
		privateHeaderMap.set(this, header)

		this.name = ''
		this.instrument = new Instrument(trackData, this)
		this.notes = []
		this.channel = 0
		this.controlChanges = createControlChanges()
		this.pitchBends = []
		this.endOfTrackTicks = undefined

		if (trackData) {
			const nameEvent = trackData.find(e => e.type === 'trackName')
			this.name = nameEvent ? nameEvent.text : ''

			const noteOns = trackData.filter(e => e.type === 'noteOn')
			const noteOffs = trackData.filter(e => e.type === 'noteOff')

			while (noteOns.length) {
				const currentNote = noteOns.shift()
				this.channel = currentNote.channel

				const offIndex = noteOffs.findIndex(
					note =>
						note.noteNumber === currentNote.noteNumber &&
						note.absoluteTime >= currentNote.absoluteTime
				)

				if (offIndex !== -1) {
					const noteOff = noteOffs.splice(offIndex, 1)[0]
					this.addNote({
						durationTicks: noteOff.absoluteTime - currentNote.absoluteTime,
						midi: currentNote.noteNumber,
						noteOffVelocity: noteOff.velocity / 127,
						ticks: currentNote.absoluteTime,
						velocity: currentNote.velocity / 127,
					})
				}
			}

			const controlChanges = trackData.filter(e => e.type === 'controller')
			controlChanges.forEach(event => {
				this.addCC({
					number: event.controllerType,
					ticks: event.absoluteTime,
					value: event.value / 127,
				})
			})

			const pitchBends = trackData.filter(e => e.type === 'pitchBend')
			pitchBends.forEach(event => {
				this.addPitchBend({
					ticks: event.absoluteTime,
					value: event.value / Math.pow(2, 13),
				})
			})

			const endOfTrackEvent = trackData.find(e => e.type === 'endOfTrack')
			this.endOfTrackTicks = endOfTrackEvent ? endOfTrackEvent.absoluteTime : undefined
		}
	}

	addNote(props) {
		const header = privateHeaderMap.get(this)
		const note = new Note(
			{ midi: 0, ticks: 0, velocity: 1 },
			{ ticks: 0, velocity: 0 },
			header
		)
		Object.assign(note, props)
		insert(this.notes, note, 'ticks')
		return this
	}

	addCC(props) {
		const header = privateHeaderMap.get(this)
		const cc = new ControlChange({ controllerType: props.number }, header)
		delete props.number
		Object.assign(cc, props)
		if (!Array.isArray(this.controlChanges[cc.number])) {
			this.controlChanges[cc.number] = []
		}
		insert(this.controlChanges[cc.number], cc, 'ticks')
		return this
	}

	addPitchBend(props) {
		const header = privateHeaderMap.get(this)
		const pb = new PitchBend({}, header)
		Object.assign(pb, props)
		insert(this.pitchBends, pb, 'ticks')
		return this
	}

	get duration() {
		if (!this.notes.length) return 0
		let maxDuration =
			this.notes[this.notes.length - 1].time +
			this.notes[this.notes.length - 1].duration

		for (let i = 0; i < this.notes.length - 1; i++) {
			const duration = this.notes[i].time + this.notes[i].duration
			if (maxDuration < duration) maxDuration = duration
		}
		return maxDuration
	}

	get durationTicks() {
		if (!this.notes.length) return 0
		let maxDuration =
			this.notes[this.notes.length - 1].ticks +
			this.notes[this.notes.length - 1].durationTicks
		for (let i = 0; i < this.notes.length - 1; i++) {
			const duration = this.notes[i].ticks + this.notes[i].durationTicks
			if (maxDuration < duration) maxDuration = duration
		}
		return maxDuration
	}

	fromJSON(json) {
		this.name = json.name
		this.channel = json.channel
		this.instrument = new Instrument(undefined, this)
		this.instrument.fromJSON(json.instrument)

		if (json.endOfTrackTicks !== undefined) {
			this.endOfTrackTicks = json.endOfTrackTicks
		}

		for (const number in json.controlChanges) {
			if (json.controlChanges[number]) {
				json.controlChanges[number].forEach(cc => {
					this.addCC({
						number: cc.number,
						ticks: cc.ticks,
						value: cc.value,
					})
				})
			}
		}

		json.notes.forEach(n => {
			this.addNote({
				durationTicks: n.durationTicks,
				midi: n.midi,
				ticks: n.ticks,
				velocity: n.velocity,
			})
		})
	}

	toJSON() {
		const controlChanges = {}
		for (let i = 0; i < 127; i++) {
			if (Object.prototype.hasOwnProperty.call(this.controlChanges, i)) {
				controlChanges[i] = this.controlChanges[i].map(c => c.toJSON())
			}
		}

		const json = {
			channel: this.channel,
			controlChanges,
			pitchBends: this.pitchBends.map(pb => pb.toJSON()),
			instrument: this.instrument.toJSON(),
			name: this.name,
			notes: this.notes.map(n => n.toJSON()),
		}

		if (this.endOfTrackTicks !== undefined) {
			json.endOfTrackTicks = this.endOfTrackTicks
		}

		return json
	}
}
