Midi-in-javascript
==================

Creating midi files, soundbanks, sequences with pure javascript and soundAPI based on html5. 

Public API
------------------

### Midi

###### class FlashPlayer
    Unused;
    
###### class Player
    Undergoing;
    
###### public function get(url, callback, async)
    Simple Ajax get;
    
###### public function post(url, callback, async)
    Simple Ajax post;
    
###### public function requireClass(classRoot, forceReload)
    /**
     * @param classRoot {String} class name with directory. For example "swf/player" will result in swf/player.js loaded synchronously;
     * @param forceReload {boolean} all scripts that was loaded would be cached. Set this flag to 1 if you want to load and execute it again.;
     */
    Include another javascript file synchronously, this would be used when the current file is based on the included one.

