//@ sourceURL=SoundTrack.js

Midi.requireClass("MidiUtil");
Midi.requireClass("Track");

Midi.SoundTrack; // extends Track
(function() {
    
Midi.SoundTrack = function(channel) {
    
    var self = this,
        _super;
    _super = Midi.Track.apply({}, arguments);
    
    for (var i in _super) {
        self[i] = _super[i];
    }
    
    self.toByteArray = function() {
        var result = [];
        // MTrk
        result = result.concat([77, 84, 114, 107]);
        var data = _super.toByteArray();
        result = result.concat(MidiUtil.int2ByteArray(data.length, 4).slice(-4));
        return result.concat(data);
    };
    
    return self;
};

Midi.SoundTrack.prototype = new Midi.Track();
Midi.SoundTrack.prototype.constructor = Midi.SoundTrack;

})();