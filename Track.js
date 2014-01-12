//@ sourceURL=Track.js

Midi.requireClass("MidiUtil");

Midi.Track;
(function() {

Midi.Track = function() {
    
    /**
     * An event contains the tick(as the key) and the message (as the value).
     * A messsage ccontains control type (as the key) and the data (as the value).
     * Example, note on channel 1 at a tone of 0x3F(max value 127) with the volum of 0x7F(max value 127) at tick 0, and note it off at tick 120:
        events = {
            0 : [
                0x903F7F,
                // other messages in tick 0
            ],
            120 : [
                0x803F7F,
                // other messages in tick 120
            ]
        }
     */
    var buf = {
            events : {},
            maxTick : 0,
            channel : false,
            trackId : false
        },
        self = this;
      
    // construction
    var init = function() {
        
    };
    
    self.toByteArray = function(useUint8) {
        var result = [],
            _e = buf.events,
            messages;
        
        // append the "ending" event.
        if (!_e[buf.maxTick]) _e[buf.maxTick] = {};
        _e[buf.maxTick][0xFF2F] = 0;
        
        var lastTick = 0;
        for (var tick in _e) {
            // a single message
            messages = _e[tick];
            for (var type in messages) {
                result = result.concat(MidiUtil.getStandardArray(+tick - lastTick, type, messages[type]));
            }
            lastTick = +tick;
        }
        
        return useUint8 ? new Uint8Array(result) : result;
    };
    
    /**
     * Add event.
     * Dulplicates allowed.
     * @param tick {int} delta tick count from the start of the sequence.
     * @param message {Midi.MidiMessage} message to be added.
     * @see class Midi.MidiMessage
     */
    self.addEvent = function(tick, message) {
        
        if (!message instanceof Midi.MidiMessage) {
            throw(new Error(message + " is not a valid Midi.MidiMessage."));
        }
        if (isNaN(tick = +tick)) {
            throw(new Error("Invalid tick number: " + tick));
        }
        
        var _e = buf.events,
            type = message.getType();
        
        // it could not be an "end" event. The "end" would be added to the track automatically when generating the ByteArray.
        if (+type == 0xFF2F) return false;
        
        !_e[tick] && (_e[tick] = []);
        _e[tick].push(message);
        
        
        buf.maxTick = Math.max(buf.maxTick, tick);
        return true;
    };
    
    self.setChannel = function(newChannel) {
        if (isNaN(newChannel = +newChannel)) {
            throw(new Error("Invalid channel number: " + newChannel));
        }
        buf.channel = newChannel & 0xF;
        self.setEvent(0, 0xFF22, buf.channel);
    };
    
    self.getChannel = function() {
        return buf.channel;
    };
    
    /**
     * Optional.
     */
    self.setTrackId = function(trackId) {
        if (isNaN(trackId = +trackId)) {
            throw(new Error("Invalid trackId id: " + trackId));
        }
        buf.trackId = trackId;
        self.setEvent(0, 0xFF00, MidiUtil.int2ByteArray(+trackId, 2));
    };
    
    /**
     * Optional.
     */
    self.getTrackId = function() {
        return buf.trackId;
    };
    
    self.getMessagesByTick = function(tick) {
        return buf.events[tick];
    };
    
    init();
    return self;
};
})();

/**
M        T        h        d          length: 6                             midi type: 1      Tracks count: 1   division: Mode 0, 1 tick for each 1/4 beat which lasts for 1 seconds.
01001101 01010100 01101000 01100100 | 00000000 00000000 00000000 00000110 | 00000000 00000001 00000000 00000001 00000000 00000001
M        T        r        k          length: 0
01001101 01010100 01110010 01101011 | 00000000 00000000 00000000 00000000

NoteOn:
0        90       45       5A
tick: 0  Note on  Tone     Voice    
00000000 10010000 01000101 01011010

Meta:
tick:0   Meta     
00000000 11111111 00000001

End Tag:
tick:0   Meta     
XXXXXXXX 11111111 00101111 00000000

*/