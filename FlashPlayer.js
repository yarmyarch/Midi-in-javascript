Midi.requireClass("Player");

// Static class, no new required.
Midi.FlashPlayer;
(function() {
    
Midi.FlashPlayer = (function() {
    
    var self = {},
        _super;
    
    var buf = {
        randCallback : "c" + parseInt((Math.random() + "").substr(2, 8), 10).toString(36),
        randId : "ri" + parseInt((Math.random() + "").substr(2, 8), 10).toString(36),
        // if allow playing
        ready : false,
        // the flash player element.
        player : false
    };
    
    var init = function() {
        // implement.
        _super = self.__proto__ = self.prototype = new Midi.Player();
        self.__proto__.constructor = self.prototype.constructor = Midi.Player;
        
        // create flash player.
        var elem = document.createElement("div"),
            _buf = buf;
        elem.innerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=11,8,0,0" width="2" height="2" id="' + _buf.randId + '">\
              <param name="movie" value="swf/Player.swf?ready=1" />\
              <param name="flashvars" value="ready=' + _buf.randCallback + '" />\
              <param name="quality" value="high" />\
              <param name="wmode" value="transparent" />\
              <embed src="swf/Player.swf" width="2" height="2" quality="high" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" wmode="transparent" flashvars="ready=' + _buf.randCallback + '" id="e_' + _buf.randId + '"></embed>\
            </object>';
        
        // set css for the elem.
        elem.style.cssText = "opacity:0.01;position:fixed;filter:alpha(opacity=1);height:2px;width:2px;left:2px;top:2px;border:0;";
        document.body.appendChild(elem);
        
        // register callback
        window[_buf.randCallback] = flashReady;
    };
    
    var flashReady = function() {
        
        var _buf = buf;
        delete window[_buf.randCallback];
        _buf.ready = true;
        _buf.player = document.getElementById(_buf.randId);
        !_buf.player.play && (_buf.player = document.getElementById("e_" + _buf.randId));
    };
    
    self.play = function(url) {
        if (buf.player) return buf.player.play(url);
    };
    
    self.stop = function() {
        if (buf.player) return buf.player.stop();
    };
    
    init();
    return self;
})();
    
})();