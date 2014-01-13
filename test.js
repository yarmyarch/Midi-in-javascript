var str = "", s1 = 63, s2 = 8192, tmp, tmp1. tmp2;
for (var i = 0; i < 64; ++i) {
    str += "00000001 10100000 01100000 0" + ("00000000" + (++s1).toString(2)).slice(-7) + "\r\n";
    tmp = (s2 += 24).toString(2);
    tmp2 = ("00000000" + tmp.slice(-7)).slice(-8);
    tmp1 = ("00000000" + tmp.substr(0, tmp.length - 7)).slice(-8);
    str += "00000000 11100000 " + tmp1 + " " + tmp2 + "\r\n";
}
str = str.split(/\s+/);
str.length = 512;
for (var i = 0; i < str.length; ++i) {
    str[i] = parseInt(str[i], 2);
}

var seq = new Midi.Sequence(1, 120);
var arr = seq.toByteArray();
arr[13] = 2;

var str = "00000000 10010000 01100000 00111111 00000100 10010000 01100000 00111111 01000000 10010000 01100000 00111111".split(" ");
for (var i = 0; i < str.length; ++i) {
    str[i] = parseInt(str[i], 2);
}
arr.length = arr.length - 4;
arr = arr.concat(str);
arr = arr.concat([64, 255, 47, 0]);
arr = new Uint8Array(arr);

var blob = new Blob([arr], {type:"audio/midi"});
var url = URL.createObjectURL(blob);

var seq = new Midi.Sequence(1, 10);
var track = seq.addTrack(0);
track.setChannelEvent(0, 144, 16511);
track.setChannelEvent(0, 128, 16511);
var blob = new Blob([seq.toByteArray(1)], {type:"audio/midi"});
var url = URL.createObjectURL(blob);
document.body.onclick = function() {
    window.open(url);
    document.body.onclick = "";
}

// XXXXXXXXXXXXXXX
var seq = new Midi.Sequence(1, 24),
    track = seq.getTrack(0);
track.addEvent(0, new Midi.MidiMessage(0xc0, 0x11));
track.addEvent(0, new Midi.MidiMessage(0x90, [63,127]));

//~ for (var i = 0; i < 240; ++i) {
    /*
    MID : 1111 1000000
    inH : 1984
    Translatd : 00001111 01000000
    Translatd : 00000000 01000000
    TranslatdH : 3904
    Total : 32639
    */
    //~ track.addEvent(1, new Midi.MidiMessage(0xE0, 3904 + i * 100));
    track.addEvent(1, new Midi.MidiMessage(0xE0, [127,64]));
//~ }

track.addEvent(240, new Midi.MidiMessage(0x90, [63,127]));
var blob = new Blob([seq.toByteArray(1)], {type:"audio/midi"});
var url = URL.createObjectURL(blob);
document.body.onclick = function() {
    window.open(url);
    document.body.onclick = "";
}