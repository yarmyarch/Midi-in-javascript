//@ sourceURL=Track.js

Midi.requireClass("MidiMessage");
Midi.requireClass("MidiUtil");

Midi.Track;
(function() {

/**
 * @param channel {int} optional, 0-15.
 *  if any channel set for the track, when trying to generate byte array,
 *  all channel related events would be bind to the set channel.
 *  but that only happens when calling function toByteArray, the message won't be changed itself.
 */
Midi.Track = function(channel) {
    
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
            trackId : false,
            eventCount : 0
        },
        self = this;
    
    var midiUtil = MidiUtil;
    
    // construction
    var init = function(channel) {
        if (channel) self.setChannel(channel);
    };
    
    self.toByteArray = function(useUint8) {
        var result = [],
            _buf = buf,
            _e = _buf.events,
            messages,
            message,
            tmpMsg,
            endingMessage = new Midi.MidiMessage(0xFF2F, 0),
            lastTick = 0;
        
        var i;
        // append the "ending" event.
        for (var tick in _e) {
            // a single message
            messages = _e[tick];
            tick = +tick;
            for (i = 0, message; message = messages[i]; ++i) {
                tmpMsg = message;
                // prevent changing original data
                if (message.isShortMessage() && _buf.channel) {
                    // force turn short messages into given channel.
                    tmpMsg = new MidiMessage((tmpMsg.getType() & 0xF0) + _buf.channel, tmpMsg.getData());
                }
                result = result.concat(midiUtil.int2TickArray(tick - lastTick)).concat(tmpMsg.toByteArray());
            }
            lastTick = tick;
        }
        // append ending message at tick 0.
        result = result.concat(midiUtil.int2TickArray(0)).concat(endingMessage.toByteArray());
        
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
        
        var _buf = buf,
            _e = _buf.events,
            type = message.getType();
        
        // it could not be an "end" event. The "end" would be added to the track automatically when generating the ByteArray.
        if (type == 0xFF2F) return false;
        
        !_e[tick] && (_e[tick] = []);
        _e[tick].push(message);
        
        ++_buf.eventCount;
        _buf.maxTick = Math.max(_buf.maxTick, tick);
        return true;
    };
    
    /**
     * find a specific message that is bytely the same as the given one at a certain tick.
     * @return {MidiMessage} null if nothing found.
     */
    self.getMessage = function(tick, message) {
        
        if (!message instanceof Midi.MidiMessage) {
            throw(new Error(message + " is not a valid Midi.MidiMessage."));
        }
        var messages = buf.events[tick],
            targetMsg = message.toByteArray().join(" ");
        if (!messages || !messages.length) return null;
        for (var i = 0, innerMsg; innerMsg = messages[i]; ++i) {
            if (innerMsg.toByteArray().join(" ") == targetMsg) return messages[i];
        }
        return null;
    };
    
    self.getMessagesByTick = function(tick) {
        return buf.events[tick];
    };
    
    /**
     * remove a specific message that is bytely the same as the given one in at certain tick.
     * @return {MidiMessage} the removed message, null if nothing found.
     */
    self.removeMessage = function(tick, message) {
        
        if (!message instanceof Midi.MidiMessage) {
            throw(new Error(message + " is not a valid Midi.MidiMessage."));
        }
        var messages = buf.events[tick],
            targetMsg = message.toByteArray().join(" "),
            tmpMsg;
        if (!messages || !messages.length) return null;
        for (var i = 0, innerMsg; innerMsg = messages[i]; ++i) {
            // find it.
            if (innerMsg.toByteArray().join(" ") == targetMsg) {
                tmpMsg = messages[messages.length - 1];
                messages[messages.length - 1] = innerMsg;
                messages[i] = tmpMsg;
                messages.length -= 1;
                --buf.eventCount;
                return innerMsg;
            }
        }
        return null;
    };
    
    self.removeMessagesByTick = function(tick) {
        var _buf = buf;
        _buf.eventCount -= (_buf.events[tick] && _buf.events[tick].length);
        _buf.events[tick] = null;
    };
    
    self.getNumberOfEvents = function() {
        return buf.eventCount;
    };
    
    /**
     *
     */
    self.setChannel = function(newChannel) {
        if (isNaN(newChannel = +newChannel)) {
            throw(new Error("Invalid channel number: " + newChannel));
        }
        buf.channel = newChannel & 0xF;
        self.addEvent(0, 0xFF22, buf.channel);
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
        self.addEvent(0, 0xFF00, midiUtil.int2ByteArray(+trackId, 2));
    };
    
    /**
     * Optional.
     */
    self.getTrackId = function() {
        return buf.trackId;
    };
    
    init(channel);
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