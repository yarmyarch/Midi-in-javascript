//@ sourceURL=TrackChunk.js

Midi.requireClass("MidiUtil");
Midi.requireClass("Track");

Midi.TrackChunk; // extends Track
(function() {
    
Midi.TrackChunk = function(channel) {
    
    var self = this,
        _super = {};
    
    var init = function() {            
        // extends Chunk.
        self.__proto__ = self.prototype = _super = new Midi.Track(channel);
        self.__proto__.constructor = self.prototype.constructor = Midi.Track;
    };
    
    // overwrite the exsiting function to ByteArray, that add header info.
    self.toByteArray = function() {
        
        var result = [];
        // MTrk
        result = result.concat([77, 84, 114, 107]);
        var data = _super.toByteArray();
        result = result.concat(MidiUtil.int2ByteArray(data.length));
        return result.concat(data);
    };
    
    init();
    return self;
};
    
})();