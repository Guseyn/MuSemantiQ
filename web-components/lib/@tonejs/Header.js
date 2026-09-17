import { search } from '#msq/lib/@tonejs/BinarySearch.js'

const privatePPQMap = new WeakMap()

/**
 * @hidden
 */
export const keySignatureKeys = [
	'Cb', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C',
	'G', 'D', 'A', 'E', 'B', 'F#', 'C#',
];

/**
 * The parsed MIDI file header.
 */
export class Header {
	constructor(midiData) {
		this.tempos = []
		this.timeSignatures = []
		this.keySignatures = []
		this.meta = []
		this.name = ''

		// Default PPQ
		privatePPQMap.set(this, 480)

		if (midiData) {
			privatePPQMap.set(this, midiData.header.ticksPerBeat)

			// Check time signature and tempo events from all of the tracks.
			midiData.tracks.forEach(track => {
				track.forEach(event => {
					if (event.meta) {
						if (event.type === 'timeSignature') {
							this.timeSignatures.push({
								ticks: event.absoluteTime,
								timeSignature: [event.numerator, event.denominator]
							});
						} else if (event.type === 'setTempo') {
							this.tempos.push({
								bpm: 60000000 / event.microsecondsPerBeat,
								ticks: event.absoluteTime
							})
						} else if (event.type === 'keySignature') {
							this.keySignatures.push({
								key: keySignatureKeys[event.key + 7],
								scale: event.scale === 0 ? 'major' : 'minor',
								ticks: event.absoluteTime
							})
						}
					}
				})
			})

			// Check the first track for other relevant data.
			let firstTrackCurrentTicks = 0
			midiData.tracks[0].forEach(event => {
				firstTrackCurrentTicks += event.deltaTime

				if (event.meta) {
					if (event.type === 'trackName') {
						this.name = event.text
					} else if (
						event.type === 'text' ||
						event.type === 'cuePoint' ||
						event.type === 'marker' ||
						event.type === 'lyrics'
					) {
						this.meta.push({
							text: event.text,
							ticks: firstTrackCurrentTicks,
							type: event.type
						})
					}
				}
			})

			this.update()
		}
	}

	update() {
		let currentTime = 0
		let lastEventBeats = 0

		this.tempos.sort((a, b) => a.ticks - b.ticks)
		this.tempos.forEach((event, index) => {
			const lastBPM = index > 0 ? this.tempos[index - 1].bpm : this.tempos[0].bpm
			const beats = event.ticks / this.ppq - lastEventBeats
			const elapsedSeconds = (60 / lastBPM) * beats

			event.time = elapsedSeconds + currentTime
			currentTime = event.time
			lastEventBeats += beats
		})

		this.timeSignatures.sort((a, b) => a.ticks - b.ticks)
		this.timeSignatures.forEach((event, index) => {
			const lastEvent = index > 0 ? this.timeSignatures[index - 1] : this.timeSignatures[0]
			const elapsedBeats = (event.ticks - lastEvent.ticks) / this.ppq
			const elapsedMeasures =
				elapsedBeats / lastEvent.timeSignature[0] / (lastEvent.timeSignature[1] / 4)

			lastEvent.measures = lastEvent.measures || 0
			event.measures = elapsedMeasures + lastEvent.measures
		})
	}

	ticksToSeconds(ticks) {
		const index = search(this.tempos, ticks)

		if (index !== -1) {
			const tempo = this.tempos[index]
			const tempoTime = tempo.time
			const elapsedBeats = (ticks - tempo.ticks) / this.ppq
			return tempoTime + (60 / tempo.bpm) * elapsedBeats
		} else {
			const beats = ticks / this.ppq
			return (60 / 120) * beats
		}
	}

	ticksToMeasures(ticks) {
		const index = search(this.timeSignatures, ticks)

		if (index !== -1) {
			const timeSigEvent = this.timeSignatures[index]
			const elapsedBeats = (ticks - timeSigEvent.ticks) / this.ppq
			return (
				timeSigEvent.measures +
				elapsedBeats /
					(timeSigEvent.timeSignature[0] / timeSigEvent.timeSignature[1]) /
					4
			)
		} else {
			return ticks / this.ppq / 4
		}
	}

	get ppq() {
		return privatePPQMap.get(this)
	}

	secondsToTicks(seconds) {
		const index = search(this.tempos, seconds, 'time')

		if (index !== -1) {
			const tempo = this.tempos[index]
			const tempoTime = tempo.time
			const elapsedTime = seconds - tempoTime
			const elapsedBeats = elapsedTime / (60 / tempo.bpm)

			return Math.round(tempo.ticks + elapsedBeats * this.ppq)
		} else {
			const beats = seconds / (60 / 120)
			return Math.round(beats * this.ppq)
		}
	}

	toJSON() {
		return {
			keySignatures: this.keySignatures,
			meta: this.meta,
			name: this.name,
			ppq: this.ppq,
			tempos: this.tempos.map(t => ({
				bpm: t.bpm,
				ticks: t.ticks,
			})),
			timeSignatures: this.timeSignatures,
		}
	}

	fromJSON(json) {
		this.name = json.name

		this.tempos = json.tempos.map(t => Object.assign({}, t))
		this.timeSignatures = json.timeSignatures.map(t => Object.assign({}, t))
		this.keySignatures = json.keySignatures.map(t => Object.assign({}, t))
		this.meta = json.meta.map(t => Object.assign({}, t))

		privatePPQMap.set(this, json.ppq)
		this.update()
	}

	setTempo(bpm) {
		this.tempos = [{ bpm, ticks: 0 }]
		this.update()
	}
}
