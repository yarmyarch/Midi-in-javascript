//@ sourceURL=Track.js

Midi.requireClass("MidiUtil");

Midi.Track;
(function() {
    
/**
 *@param type MThd/MTrk, header trunk or normal trunk.
 */
Midi.Track = function(channel) {
    
    /**
     * An event contains the tick(as the key) and the message (as the value).
     * A messsage ccontains control type (as the key) and the data (as the value).
     * Example, note on channel 1 at a tone of 0x3F(max value 127) with the volum of 0x7F(max value 127) at tick 0, and note it off at tick 120:
        events = {
            0   : {
                0x90 : 0x3F7F,
                0x90 : [63, 127],
                // other messages in tick 0
            },
            120 : {
                0x80 : 0x3F7F,
                0x80 : [63, 127],
                // other messages in tick 1
            }
        }
     */
    var buf = {
            events : {},
            maxTick : 0,
            channel : false
        },
        self = this;
      
    // construction
    var init = function() {
        // set channel info if defined in the param.
        if (channel != undefined) {
            self.setChannel(channel);
        }
    };
    
    self.toByteArray = function() {
        var result = [],
            _e = buf.events,
            messages;
        
        // append the "ending" event.
        _e[buf.maxTick][0xFF2F] = 0;
        
        for (var tick in _e) {
            // a single message
            messages = _e[tick];
            for (var type in messages) {
                result = result.concat(MidiUtil.getStandardArray(tick, type, messages[type]));
            }
        }
        
        return result;
    };
    
    /**
     * Add and replace, if exist.
     * Events could be departed via their tick and type. if two events holding the same tick & type, we assume them the same event.
     */
    self.setEvent = function(tick, type, data) {
        
        var _e = buf.events;
        // it could not be an "end" event. The "end" would be added to the track automatically when generating the ByteArray.
        if (+type == 0xFF2F) return false;
        
        !_e[tick] && (_e[tick] = {});
        _e[tick][type] = data;
        buf.maxTick = Math.max(buf.maxTick, tick);
        return true;
    };
    
    /**
     * a channel must be set(from the cunstructor or manually using setChannel) before this method could return true.
     * otherwise use #setEvent instead, parsing the channel manually.
     */
    self.setChannelEvent = function(tick, control, data) {
        
        if (buf.channel) return self.setEvent(tick, +control + buf.channel, data);
        else return false;
    };
    
    self.setChannel = function(newChannel) {
        buf.channel = +newChannel & 0xF;
        self.setEvent(0, 0xFF22, buf.channel);
    };
    
    self.getChannel = function() {
        return buf.channel;
    };
    
    /**
     * Optional.
     */
    self.setTrackId = function(trackId) {
        self.setEvent(0, 0xFF00, MidiUtil.int2ByteArray(+trackId, 2));
    };
    
    /**
     * Only 1 instrument allowed for each track.
     * a channel must be set(from the cunstructor or manually using setChannel) before this method could run properly.
     * otherwise use #setEvent instead, parsing required data manually.
     */
    self.setInstrument = function(instrument) {
        if (!buf.channel) return;
        // set meta description at tick 0.
        self.setEvent(0, 0xFF04, instrument);
        self.setEvent(0, 0xC0 + buf.channel, instrument);
    };
    
    self.getInstrument = function() {
        return self.getMessageInChannel(0, 0xC0);
    };
    
    self.getMessagesByTick = function(tick) {
        return buf.events[tick];
    };
    
    self.getMessageInChannel = function(tick, control) {
        return buf.events[tick][control + buf.channel];
    };
    
    self.getMessageByType = function(tick, type) {
        return buf.events[tick][type];
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