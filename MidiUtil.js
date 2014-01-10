//@ sourceURL=MidiUtil.js

var MidiUtil = (function() {
    
    var LC = {
        BYTE : "00000000",
        MAP_EN : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(''),
        MAP_DE : {}
    };
    
    // initialize map for base64.
    for(var i=0; i<64; i++)
        LC.MAP_DE[LC.MAP_EN[i]] = i;
    
    var self;
    
    var util = {
        mergeByte : function(s, byteFormat) {
            var _lc = LC,
                sLen = s.length,
                format = byteFormat || _lc.BYTE,
                formatLength = format.length,
                len = Math.max(formatLength, sLen);
            len = Math.ceil(len / formatLength) * formatLength - sLen;
            
            return (byteFormat || _lc.BYTE).substr(0, len).concat(s);
        },
        
        // be aware on extendable bit data.
        mergeTick : function(s) {
            
            var _lc = LC,
                sLen = s.length,
                result = [];
            
            for (var i = 0, byteCount = Math.ceil(sLen / 7); i < byteCount; ++i) {
                if (i == 0) {
                    result.push(util.mergeByte(s.slice(-7)));
                } else {
                    result.push(util.mergeByte(s.slice(-7 * (i + 1), -7 * i), "10000000"));
                }
            }
            
            return result.reverse();
        }
    };
    
    return self = {
        
        ascii2ByteString : function(s, join) {
            
            var result = [],
                _u = util,
                length = 0,
                buf,
                result = [];
            
            for (var i = 0; i < s.length; ++i) {
                buf = _u.mergeByte((s.charCodeAt(i)).toString(2));
                length += buf.length;
                result.push(buf);
            }
            
            return result;
        },
        
        /**
         *@param s string or array
         */
        ascii2ByteArray : function(s) {
            
            if (!s) return 0;
            var result = [];
            [].map.call(s, function(c) {
                result = result.concat(self.int2ByteArray((typeof(c)).toLowerCase() == "number" ? c : c.charCodeAt(0)));
            });
            return result;
        },
        
        int2ByteString : function(i) {
            return util.mergeByte((i).toString(2));
        },
        
        int2ByteArray : function(i, minByteCount) {
            var result = [],
                buf = code = +i,
                offsetCount = 0;
            while ((buf = code>>(8 * offsetCount)) || offsetCount < minByteCount) {
                buf = buf & 0xFF;
                ++offsetCount;
                result.push(buf);
            }
            return result.reverse();
        },
        
        int2TickString : function(i) {
            return util.mergeTick((i).toString(2));
        },
        
        int2TickArray : function(i, minByteCount) {
            
            if (!i) return [0];
            
            var result = [],
                buf = code = +i,
                offsetCount = 0;
            while ((buf = code>>(7 * offsetCount) ) || offsetCount < minByteCount) {
                buf = buf & 0x7F;
                ++offsetCount;
                result.push(offsetCount == 1 ? buf : buf | 0x80);
            }
            return result.reverse();
        },
        
        getMetaString : function(tick, metaType, metaData) {
            
            var data = self.ascii2ByteString(metaData);
            return self.int2TickString(+tick)
                .concat(parseInt(255).toString(2))
                .concat(self.int2ByteString(+metaType))
                .concat(self.int2TickString(data.length))
                .concat(data);
        },
        
        /**
         *@param midiType: 0/1(recommanded)/2
         *@param frames: how many tickes would be exist in 1 second. at least 1.
         */
        getHeaderChunk : function(midiType, trackCount, frames, useUint8) {
            
            // MThd, length :6, 
            var result = [77, 84, 104, 100, 0, 0, 0, 6, 0];
            frames = frames || 1;
            result.push(+midiType);
            result.push(+trackCount >> 8 & 0xFF);
            result.push(+trackCount & 0xFF);
            result.push(+frames >> 8 & 0xFF);
            result.push(+frames & 0xFF);
            
            return useUint8 ? new Uint8Array(result) : result;
        },
        
        bse64Encode : function(data) {
            var buf = [],
                map = LC.MAP_EN,
                n = data.length,
                val,
                i = 0;

            while(i < n) {
                val = (data[ i ] << 16) |
                    (data[i+1] << 8) |
                    (data[i+2]);
                
                buf.push(map[val>>18],
                    map[val>>12 & 63],
                    map[val>>6 & 63],
                    map[val & 63]);
                i += 3;
            }

            if(n%3 == 1) buf.pop(),buf.pop(),buf.push('=', '=');
            else buf.pop(),buf.push('=');

            return buf.join('');
        },

        base64Decode : function(str) {
            var buf = [],
                arr = str.split(''),
                map = LC.MAP_DE,
                n = arr.length,
                val,
                i=0;

            if(n % 4) return false;

            while(i < n) {
                val = (map[arr[ i ]] << 18) |
                    (map[arr[i+1]] << 12) |
                    (map[arr[i+2]] << 6)  |
                    (map[arr[i+3]]);

                buf.push(val>>16, val>>8 & 0xFF, val & 0xFF);
                i += 4;
            }

            while(arr[--n] == '=')
                buf.pop();

            return buf;
        }
    }
    
})();