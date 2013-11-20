package {
	import flash.display.Sprite;
    import flash.events.Event;
	import flash.external.ExternalInterface;
	import flash.utils.describeType;
    
	public class Player extends Sprite {
		
        public function Player():void {
			
            if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		}
        
        private function init():void {
            
            // register callback function into javascript environment
            ExternalInterface.call(stage.loaderInfo.parameters["ready"]);
            ExternalInterface.addCallback("play", this.play);
            ExternalInterface.addCallback("stop", this.stop);
        }
        
        public function play(url):String {
            return "Played!";
        }
        
        public function stop():String {
            return "stopt!";
        }
	}
}