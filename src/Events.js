export class MockEvent {
	
	constructor(type, bubbles, cancelable, target){
		this.initEvent(type, bubbles, cancelable, target);
	}

	initEvent(type, bubbles, cancelable, target) {
        this.type = type;
        this.bubbles = bubbles;
        this.cancelable = cancelable;
        this.target = target;
    }

    stopPropagation() {

    }

    preventDefault() {
        this.defaultPrevented = true;
    }
}


export class MockProgressEvent extends MockEvent {
	constructor(type, progressEventRaw, target){
		this.initEvent(type, false, false, target);
        this.loaded = progressEventRaw.loaded || null;
        this.total = progressEventRaw.total || null;
        this.lengthComputable = !!progressEventRaw.total;
	}

}

export class MockCustomEvent extends MockEvent{
	constructor(type, customData, target) {
	    this.initEvent(type, false, false, target);
	    this.detail = customData.detail || null;
	}
};

export class EventTarget{
	constructor(){
	}

	get push(){
		if(!this._push) this._push = [].push;
		return this._push;
	}

	addEventListener(event, listener) {
	    this.eventListeners = this.eventListeners || {};
	    this.eventListeners[event] = this.eventListeners[event] || [];
	    this.push.call(this.eventListeners[event], listener);
	}

    removeEventListener(event, listener) {
        var listeners = this.eventListeners && this.eventListeners[event] || [];

        for (var i = 0, l = listeners.length; i < l; ++i) {
            if (listeners[i] == listener) {
                return listeners.splice(i, 1);
            }
        }
    }

    dispatchEvent(event) {
        var type = event.type;
        var listeners = this.eventListeners && this.eventListeners[type] || [];

        for (var i = 0; i < listeners.length; i++) {
            if (typeof listeners[i] == "function") {
                listeners[i].call(this, event);
            } else {
                listeners[i].handleEvent(event);
            }
        }

        return !!event.defaultPrevented;
    }
}
