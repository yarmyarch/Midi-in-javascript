//@ sourceURL=Sequence.js

Midi.requireClass("SoundTrack");
Midi.requireClass("MidiUtil");
// ### FlashPlayer NOT USED! Should define player with AudioAPI instead.
//~ Midi.requireClass("FlashPlayer");

Midi.Sequence;
(function() {
 
G_LC = {
    COPY_RIGHT : "(c)2013 by yarmyarch@live.cn"
};

/**
 * midiType:0/1/2
 * frames : how much ticks in a second. 120 recommanded.
 */
Midi.Sequence = function(midiType, frames) {
    
    var self = this,
        _lc = G_LC;
    
    // private attributes.
    var buf = {
        tracks : [],
        name : "",
        // 1 for the default
        midiType : 1,
        // 120 for the default.
        frames : Math.max(+frames, 24) || 120,
    }
    
    var init = function() {
        
        !isNaN(midiType % 3) && (buf.midiType = midiType % 3);
        
        var track = new Midi.SoundTrack();
        buf.tracks.push(track);
        
        // set default info for the sequence, into the first track.
        // mainly about the copyright, and some other messags that might be required in future.
        // No channel info set in the first track.
        track.setEvent(0, 0xFF02, _lc.COPY_RIGHT);
    };
    
    self.setCopyRight = function(text) {
        
        buf.tracks[0].setEvent(0, 0xFF02, text);
    };
    
    self.setName = function(text) {
        buf.name = text;
        buf.tracks[0].setEvent(0, 0xFF03, text);
    };
    
    self.getName = function() {
        return buf.name;
    };
    
    self.setMidiType = function(newType) {
        !isNaN(newType % 3) && (buf.midiType = newType % 3);
    };
    
    self.getMidiType = function() {
        return buf.midiType;
    };
    
    /**
     * min 24, 120 for default.
     */
    self.setFrames = function(newFrames) {
        buf.frames = Math.max(+newFrames, 24) || 120;
    };
    
    self.getFrames = function() {
        return buf.frames;
    };
    
    self.toByteArray = function(useUint8) {
        
        var result = [],
            _buf = buf,
            tracks = buf.tracks;
        // generate header first. Related attributes required.
        result = result.concat(MidiUtil.getHeaderChunk(_buf.midiType, _buf.tracks.length, _buf.frames, useUint8));
        
        for (var i in tracks) {
            result = result.concat(tracks[i].toByteArray(useUint8));
        }
        return result;
    };
    
    /**
     * @param channel channel number for the new track.
     *  the channel number starts from 0.
     *  if this param is not given, a default channel number tat equals the number of currently added tracks will be used.
     *  if channel number is bigger than 15, channel number & 0xF will always be used instead.
     *  do nothing for type 0 sequence.
     * @return track added.
     */
    self.addTrack = function(channel) {
        if (!buf.midiType) return;
        buf.tracks.push(new Midi.SoundTrack((+channel || buf.tracks.length - 1) & 0xF));
        return buf.tracks[buf.tracks.length - 1];
    };
    
    /**
     * @return track by id. return undefined if no tracks found.
     *  note: id starts from 0, while 0 means the the track added automatically for static meta messages.
     */
    self.getTrack = function(id) {
        return buf.tracks[id];
    };
    
    /**
     * @throw "Not a valid Midi.SoundTrack"
     * @param id {int} track id.
     * @param newTrack {Midi.SoundTrack} instanceof Midi.SoundTrack.
     */
    self.replaceTrack = function(id, newTrack) {
        if (!newTrack instanceof Midi.SoundTrack) throw(new Error(newTrack + " is not a valid Midi.SoundTrack."));
        buf.tracks[id] = newTrack;
    };
    
    self.removeTrack = function(id) {
        var tracks = buf.tracks, tmp;
        if (!tracks[id]) throw(new Error("Invalid index: " + id));
        tmp = tracks[id];
        tracks[id] = tracks[tracks.length - 1];
        tracks[tracks.length - 1] = tmp;
        tracks.length -= 1;
        return tmp;
    };
    
    self.getNumberOfTracks = function() {
        return buf.tracks.length;
    };
    
    init();
    return self;
};
    
})();