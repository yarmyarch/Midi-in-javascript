var seq = new Midi.Sequence(1, 24),
    track = seq.getTrack(0);

track.addEvent(0, new Midi.MidiMessage(0xc0, 0x11));
track.addEvent(0, new Midi.MidiMessage(0xB0, [124,0])); // omni on
track.addEvent(0, new Midi.MidiMessage(0xB0, [126,1])); // mono on & omni on
track.addEvent(0, new Midi.MidiMessage(0x90, [60,127]));
track.addEvent(120, new Midi.MidiMessage(0xB0, [1,127]));
track.addEvent(240, new Midi.MidiMessage(0x80, [60,127]));

for (var i = 1; i <= 240; ++i) {
    track.addEvent(i, new Midi.MidiMessage(0xB0, [11, 127 - ~~((127 / 240) * i)]));
    track.addEvent(96 + i, new Midi.MidiMessage(0xE0, [0, 64 + ~~((63 / 144) * i)]));
}

var blob = new Blob([seq.toByteArray(1)], {type:"audio/midi"});
var url = URL.createObjectURL(blob);
document.body.onclick = function() {
    window.open(url);
    document.body.onclick = "";
}