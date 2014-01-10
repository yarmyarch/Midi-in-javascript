//@ sourceURL=MidiMessage.js

Midi.requireClass("MidiUtil");

Midi.MidiMessage;
(function() {

Midi.MidiMessage = function(type, data) {
    
    var self = this;
    
    var LC = {
        // hasp map for checking.
        H_META_TYPE : {
            0xFF : 1
        },
        H_SYSEX_TYPE : {
            0xF0 : 1,
            0xF7 : 1
        },
        H_SHORT_TYPE : {
            0x80 : 1,   // note off
            0x90 : 1,   // note on
            0xa0 : 1,   // Polyphonic Key Pressure
            0xb0 : 1,   // Control Change
            0xc0 : 1,   // Program Change
            0xd0 : 1,   // Channel Pressure
            0xe0 : 1    // Pitch Wheel Change
        }
    };
    
    var midiUtil = MidiUtil;
    
    var buf = {
        type : false,
        data : false
    };
    
    var init = function(type, data) {
        self.setType(type);
        self.setData(data);
    };
    
    /**
     * @param newType {int} 
     *  supported type list:
     *  H_META_TYPE : [ 0xFF : 1 ],
     *  H_SYSEX_TYPE : [ 0xF0 : 1, 0xF7 : 1],
     *  H_SHORT_TYPE : [
     *      0x80 : 1,   // note off
     *      0x90 : 1,   // note on
     *      0xa0 : 1,   // Polyphonic Key Pressure
     *      0xb0 : 1,   // Control Change
     *      0xc0 : 1,   // Program Change
     *      0xd0 : 1,   // Channel Pressure
     *      0xe0 : 1    // Pitch Wheel Change
     *  ]
     *  short message noteOn: 10010000 01111111 01111111
     *       = setType(0x90); 
     *       = setType(144); 
     *  meta message text "Hello World!": 11111111 00000001 00001100 01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100 00100001
     *       = setType(65281);
     *       = setType(0xFF01);
     */
    self.setType = function(newType) {
        var _lc = LC,
            testType = +newType & 0xFF;
        if (!_lc[H_META_TYPE][testType] && !_lc[H_SYSEX_TYPE][testType] && !_lc[H_SHORT_TYPE][testType]) return;
        buf.type = +newType;
    };
    
    /**
     * @newData {int/Array/string}
     *  short message noteOn: 10010000 01111111 01111111
     *      = setData(32639);
     *      = setData([0x7F, 0x7F]);
     *      = setData([127, 127]);
     *  meta message text "Hello World!": 11111111 00000001 00001100 01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100 00100001
     *      = setData([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]);
     *      = setData("Hello World!");
     *  specially for the ending message FF 2F 00
     *       = setData(0);
     *  string would always be count as char code.
     */
    self.setData = function(newData) {
        buf.data = newData;
    };
    
    self.toByteArray = function(useUint8) {
        
        var _buf = buf;
        if (!_buf.type || _buf.data === false) return [];
        
        var result = [],
            _lc = LC,
            data = self.getDataArray();
        
        result = midiUtil.int2ByteArray(_buf.type)
            // no length required if it's a short message.
            .concat(_lc.H_SHORT_TYPE[_buf.type &0xF0] ? [] : self.int2TickArray(data.length));
        
        result = result.concat(data);
        return useUint8 ? new Uint8Array(result) : result;
    };
    
    self.getType = function() {
        return buf.type;
    };
    
    self.getData = function() {
        return buf.data;
    };
    
    /**
     * @return data in array.
     */
    self.getDataArray = function(useUint8) {
        var _buf = buf,
            data = _buf.data;
        
        if (_buf.data === false) return [];
        
        var _lc = LC,
            handler = (typeof(data)).toLowerCase() == "string" ? midiUtil.ascii2ByteArray : midiUtil.int2ByteArray;
        
        // if data is something like an array but not a string, count it as an array. Otherwise it's a string or a number.
        data = data.length && handler != self.ascii2ByteArray ? data : handler(data);
        return return useUint8 ? new Uint8Array(data) : data;
    };
    
    init(type, data);
    return self;
}

})();