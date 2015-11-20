import {MockHttpRequest} from './MockHttpRequest';

let global = window || global || this;
let GlobalXMLHttpRequest = global.XMLHttpRequest,
	GlobalActiveXObject = global.ActiveXObject,
	supportsActiveX = typeof GlobalActiveXObject != "undefined",
	supportsXHR = typeof GlobalXMLHttpRequest != "undefined";

global.RealXMLHttpRequest = GlobalXMLHttpRequest;

export class Mockery {
	constructor() {
		throw new Error('Mockery is a static class and can not be instantiated.');
	}

	static imitate(path, action, fn) {
		MockHttpRequest.addResponder(path, action, fn);
	}
    
    static imitating(path, action) {
		return MockHttpRequest.hasResponder(path, action);
	}

	static setup(xhr='XMLHttpRequest') {
		if (supportsXHR) {
			global[xhr] = MockHttpRequest;
		} 
         
		if (supportsActiveX) {
			global.ActiveXObject = function ActiveXObject(objId) {
				if (objId == "Microsoft.XMLHTTP" || /^Msxml2\.XMLHTTP/i.test(objId)) {
					return new MockHttpRequest();
				}
				return new GlobalActiveXObject(objId);
			};
		}
	}

	static restore() {
		global.XMLHttpRequest = GlobalXMLHttpRequest;
		global.ActiveXObject = GlobalActiveXObject;
	}
}