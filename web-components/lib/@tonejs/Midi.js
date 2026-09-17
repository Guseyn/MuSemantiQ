import { parseMidi } from '#msq/lib/midi-file/index.js'
import { Header } from '#msq/lib/@tonejs/Header.js'
import { Track } from '#msq/lib/@tonejs/Track.js'
import { encode } from '#msq/lib/@tonejs/Encode.js'

/**
 * The main midi parsing class.
 */
export class Midi {
	static async fromUrl(url) {
		const response = await fetch(url)
		if (response.ok) {
			const arrayBuffer = await response.arrayBuffer()
			return new Midi(arrayBuffer)
		} else {
			throw new Error(`Could not load '${url}'`)
		}
	}

	constructor(midiArray) {
		let midiData = null

		if (midiArray) {
			const midiArrayLike = midiArray instanceof ArrayBuffer
				? new Uint8Array(midiArray)
				: midiArray

			midiData = parseMidi(midiArrayLike)

			// Add absolute times to each track
			midiData.tracks.forEach(track => {
				let currentTicks = 0;
				track.forEach(event => {
					currentTicks += event.deltaTime;
					event.absoluteTime = currentTicks;
				})
			})

			// Ensure at most one instrument per track
			midiData.tracks = splitTracks(midiData.tracks)
		}

		this.header = new Header(midiData)
		this.tracks = []

		if (midiArray) {
			this.tracks = midiData.tracks.map(trackData => new Track(trackData, this.header))

			// If it's format 1 and there are no notes on the first track, remove it
			if (midiData.header.format === 1 && this.tracks[0].duration === 0) {
				this.tracks.shift()
			}
		}
	}

	get name() {
		return this.header.name
	}

	set name(n) {
		this.header.name = n
	}

	get duration() {
		const durations = this.tracks.map(t => t.duration)
		return Math.max(...durations)
	}

	get durationTicks() {
		const durationTicks = this.tracks.map(t => t.durationTicks)
		return Math.max(...durationTicks)
	}

	addTrack() {
		const track = new Track(undefined, this.header)
		this.tracks.push(track)
		return track
	}

	toArray() {
		return encode(this)
	}

	toJSON() {
		return {
			header: this.header.toJSON(),
			tracks: this.tracks.map(track => track.toJSON()),
		}
	}

	fromJSON(json) {
		this.header = new Header()
		this.header.fromJSON(json.header)
		this.tracks = json.tracks.map(trackJSON => {
			const track = new Track(undefined, this.header)
			track.fromJSON(trackJSON)
			return track
		})
	}

	clone() {
		const midi = new Midi()
		midi.fromJSON(this.toJSON())
		return midi
	}
}

export { Track } from '#msq/lib/@tonejs/Track.js'
export { Header } from '#msq/lib/@tonejs/Header.js'

/**
 * Given a list of MIDI tracks, make sure that each channel corresponds to at
 * most one channel and at most one instrument. This means splitting up tracks
 * that contain more than one channel or instrument.
 */
function splitTracks(tracks) {
	const newTracks = []

	for (let i = 0; i < tracks.length; i++) {
		const defaultTrack = newTracks.length
		const trackMap = new Map()
		const currentProgram = Array(16).fill(0)

		for (const event of tracks[i]) {
			let targetTrack = defaultTrack
			const channel = event.channel

			if (channel !== undefined) {
				if (event.type === 'programChange') {
					currentProgram[channel] = event.programNumber
				}

				const program = currentProgram[channel]
				const trackKey = `${program} ${channel}`

				if (trackMap.has(trackKey)) {
					targetTrack = trackMap.get(trackKey)
				} else {
					targetTrack = defaultTrack + trackMap.size
					trackMap.set(trackKey, targetTrack)
				}
			}

			if (!newTracks[targetTrack]) {
				newTracks.push([])
			}

			newTracks[targetTrack].push(event)
		}
	}

	return newTracks
}
