import { writeMidi } from '#msq/lib/midi-file/index.js'

import { keySignatureKeys } from '#msq/lib/@tonejs/Header.js'

/**
 * Flatten an array indefinitely.
 */
function flatten(array) {
  let result = []
  $flatten(array, result)
  return result
}
/**
 * Internal flatten function recursively passes `result`.
 */
function $flatten(array, result) {
  for (let i = 0; i < array.length; i++) {
    let value = array[i]
    if (Array.isArray(value)) {
			$flatten(value, result)
    } else {
    	result.push(value)
    }
  }
}

/** Used to add `absoluteTime` property. */
function encodeNote(note, channel) {
	return [{
		absoluteTime: note.ticks,
		channel,
		deltaTime: 0,
		noteNumber: note.midi,
		type: 'noteOn',
		velocity: Math.floor(note.velocity * 127),
	},
	{
		absoluteTime: note.ticks + note.durationTicks,
		channel,
		deltaTime: 0,
		noteNumber: note.midi,
		type: 'noteOff',
		velocity: Math.floor(note.noteOffVelocity * 127),
	}];
}

function encodeNotes(track) {
	return flatten(track.notes.map(note => encodeNote(note, track.channel)));
}

function encodeControlChange(cc, channel) {
	return {
		absoluteTime: cc.ticks,
		channel,
		controllerType: cc.number,
		deltaTime: 0,
		type: 'controller',
		value: Math.floor(cc.value * 127),
	};
}

function encodeControlChanges(track) {
	const controlChanges = [];
	for (let i = 0; i < 127; i++) {
		if (Object.prototype.hasOwnProperty.call(track.controlChanges, i)) {
			track.controlChanges[i].forEach(cc => {
				controlChanges.push(encodeControlChange(cc, track.channel));
			});
		}
	}
	return controlChanges;
}

function encodePitchBend(pb, channel) {
	return {
		absoluteTime: pb.ticks,
		channel,
		deltaTime: 0,
		type: 'pitchBend',
		value: pb.value,
	};
}

function encodePitchBends(track) {
	const pitchBends = [];
	track.pitchBends.forEach(pb => {
		pitchBends.push(encodePitchBend(pb, track.channel));
	});
	return pitchBends;
}

function encodeInstrument(track) {
	return {
		absoluteTime: 0,
		channel: track.channel,
		deltaTime: 0,
		programNumber: track.instrument.number,
		type: 'programChange',
	};
}

function encodeTrackName(name) {
	return {
		absoluteTime: 0,
		deltaTime: 0,
		meta: true,
		text: name,
		type: 'trackName',
	};
}

function encodeTempo(tempo) {
	return {
		absoluteTime: tempo.ticks,
		deltaTime: 0,
		meta: true,
		microsecondsPerBeat: Math.floor(60000000 / tempo.bpm),
		type: 'setTempo',
	};
}

function encodeTimeSignature(timeSig) {
	return {
		absoluteTime: timeSig.ticks,
		deltaTime: 0,
		denominator: timeSig.timeSignature[1],
		meta: true,
		metronome: 24,
		numerator: timeSig.timeSignature[0],
		thirtyseconds: 8,
		type: 'timeSignature',
	};
}

function encodeKeySignature(keySig) {
	const keyIndex = keySignatureKeys.indexOf(keySig.key);
	return {
		absoluteTime: keySig.ticks,
		deltaTime: 0,
		key: keyIndex + 7,
		meta: true,
		scale: keySig.scale === 'major' ? 0 : 1,
		type: 'keySignature',
	};
}

function encodeText(textEvent) {
	return {
		absoluteTime: textEvent.ticks,
		deltaTime: 0,
		meta: true,
		text: textEvent.text,
		type: textEvent.type,
	};
}

/**
 * Convert the MIDI object to an array.
 */
export function encode(midi) {
	const midiData = {
		header: {
			format: 1,
			numTracks: midi.tracks.length + 1,
			ticksPerBeat: midi.header.ppq,
		},
		tracks: [
			[
				{
					absoluteTime: 0,
					deltaTime: 0,
					meta: true,
					text: midi.header.name,
					type: 'trackName',
				},
				...midi.header.keySignatures.map(keySig => encodeKeySignature(keySig)),
				...midi.header.meta.map(e => encodeText(e)),
				...midi.header.tempos.map(tempo => encodeTempo(tempo)),
				...midi.header.timeSignatures.map(timeSig => encodeTimeSignature(timeSig)),
			],
			...midi.tracks.map(track => {
				return [
					encodeTrackName(track.name),
					encodeInstrument(track),
					...encodeNotes(track),
					...encodeControlChanges(track),
					...encodePitchBends(track),
				];
			}),
		],
	};

	// Sort and compute deltaTime
	midiData.tracks = midiData.tracks.map(track => {
		track = track.sort((a, b) => a.absoluteTime - b.absoluteTime);

		let lastTime = 0;
		track.forEach(note => {
			note.deltaTime = note.absoluteTime - lastTime;
			lastTime = note.absoluteTime;
			delete note.absoluteTime;
		});

		track.push({
			deltaTime: 0,
			meta: true,
			type: 'endOfTrack',
		});
		return track;
	});

	return new Uint8Array(writeMidi(midiData));
}
