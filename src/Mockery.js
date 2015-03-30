import {FakeHttpRequest} from './FakeHttpRequest';


var GlobalXMLHttpRequest = global.XMLHttpRequest,
    GlobalActiveXObject = global.ActiveXObject,
    supportsActiveX = typeof GlobalActiveXObject != "undefined",
    supportsXHR = typeof GlobalXMLHttpRequest != "undefined";



export class Mockery {
	constructor(){
		throw new Error('Mockery is a static class and can not be instantiated.')
	}

	static imitate(path, action, fn){
		//function(request,response)

	}

	static setup(){
	    if (supportsXHR) {
            global.XMLHttpRequest = FakeHttpRequest;
        }

        if (supportsActiveX) {
            global.ActiveXObject = function ActiveXObject(objId) {
                if (objId == "Microsoft.XMLHTTP" || /^Msxml2\.XMLHTTP/i.test(objId)) {
                    return new FakeHttpRequest();
                }
                return new GlobalActiveXObject(objId);
            };
        }
	}

	static restore(){
		global.XMLHttpRequest = GlobalXMLHttpRequest;
		global.ActiveXObject = GlobalActiveXObject;
	}

}