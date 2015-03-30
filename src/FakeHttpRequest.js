/**
 * FakeHttpRequest - adapted from the Sinonjs framework
 *
 * @author Brian Kimball 
 */

import { MockEvent, MockProgressEvent, MockCustomEvent, EventTarget } from './Events';
        
let UNSAFE_HEADERS = {
    "Accept-Charset": true,
    "Accept-Encoding": true,
    Connection: true,
    "Content-Length": true,
    Cookie: true,
    Cookie2: true,
    "Content-Transfer-Encoding": true,
    Date: true,
    Expect: true,
    Host: true,
    "Keep-Alive": true,
    Referer: true,
    TE: true,
    Trailer: true,
    "Transfer-Encoding": true,
    Upgrade: true,
    "User-Agent": true,
    Via: true
};

let STATUS_CODES = {
    100: "Continue",
    101: "Switching Protocols",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    300: "Multiple Choice",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Request Entity Too Large",
    414: "Request-URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    422: "Unprocessable Entity",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported"
};

function verifyState(xhr) {
    if (xhr.readyState !== FakeXMLHttpRequest.OPENED) {
        throw new Error("INVALID_STATE_ERR");
    }

    if (xhr.sendFlag) {
        throw new Error("INVALID_STATE_ERR");
    }
}

function getHeader(headers, header) {
    header = header.toLowerCase();

    for (var h in headers) {
        if (h.toLowerCase() == header) {
            return h;
        }
    }

    return null;
}

// filtering to enable a white-list version of Sinon FakeXhr,
// where whitelisted requests are passed through to real XHR
function each(collection, callback) {
    if (!collection) {
        return;
    }

    for (var i = 0, l = collection.length; i < l; i += 1) {
        callback(collection[i]);
    }
}
function some(collection, callback) {
    for (var index = 0; index < collection.length; index++) {
        if (callback(collection[index]) === true) {
            return true;
        }
    }
    return false;
}
// largest arity in XHR is 5 - XHR#open
var apply = function (obj, method, args) {
    switch (args.length) {
    case 0: return obj[method]();
    case 1: return obj[method](args[0]);
    case 2: return obj[method](args[0], args[1]);
    case 3: return obj[method](args[0], args[1], args[2]);
    case 4: return obj[method](args[0], args[1], args[2], args[3]);
    case 5: return obj[method](args[0], args[1], args[2], args[3], args[4]);
    }
};



function verifyRequestOpened(xhr) {
    if (xhr.readyState != FakeXMLHttpRequest.OPENED) {
        throw new Error("INVALID_STATE_ERR - " + xhr.readyState);
    }
}

function verifyRequestSent(xhr) {
    if (xhr.readyState == FakeXMLHttpRequest.DONE) {
        throw new Error("Request done");
    }
}

function verifyHeadersReceived(xhr) {
    if (xhr.async && xhr.readyState != FakeXMLHttpRequest.HEADERS_RECEIVED) {
        throw new Error("No headers received");
    }
}

function verifyResponseBodyType(body) {
    if (typeof body != "string") {
        var error = new Error("Attempted to respond to fake XMLHttpRequest with " +
                             body + ", which is not a string.");
        error.name = "InvalidBodyException";
        throw error;
    }
}

class UploadProgress() {
	constructor(){
		this.eventListeners = {
            progress: [],
            load: [],
            abort: [],
            error: []
        }
	}
        
    addEventListener(event, listener) {
        this.eventListeners[event].push(listener);
    }

    removeEventListener(event, listener) {
        var listeners = this.eventListeners[event] || [];
        for (var i = 0, l = listeners.length; i < l; ++i) {
            if (listeners[i] == listener) {
                return listeners.splice(i, 1);
            }
        }
    }

    dispatchEvent(event) {
        var listeners = this.eventListeners[event.type] || [];
        for (var i = 0, listener; (listener = listeners[i]) != null; i++) {
            listener(event);
        }
    }
}


export class FakeHttpRequest extends EventTarget {
	constructor(){
		this.readyState = FakeXMLHttpRequest.UNSENT;
        this.requestHeaders = {};
        this.requestBody = null;
        this.async: true;
        this.status = 0;
        this.statusText = "";
        this.supportsCORS = true;
		this.withCredentials = true;
		this.useFilters = false;

        var xhr = this;
        var events = ["loadstart", "load", "abort", "loadend"];

        function addEventListener(eventName) {
            xhr.addEventListener(eventName, function (event) {
                var listener = xhr["on" + eventName];

                if (listener && typeof listener == "function") {
                    listener.call(this, event);
                }
            });
        }

        for (var i = events.length - 1; i >= 0; i--) {
            addEventListener(events[i]);
        }

	}

    open(method, url, async, username, password) {
        this.method = method;
        this.url = url;
        this.async = typeof async == "boolean" ? async : true;
        this.username = username;
        this.password = password;
        this.responseText = null;
        this.responseXML = null;
        this.requestHeaders = {};
        this.sendFlag = false;

        if (FakeXMLHttpRequest.useFilters === true) {
            var xhrArgs = arguments;
            var defake = some(FakeXMLHttpRequest.filters, function (filter) {
                return filter.apply(this, xhrArgs)
            });
            if (defake) {
                return FakeXMLHttpRequest.defake(this, arguments);
            }
        }
        this.readyStateChange(FakeXMLHttpRequest.OPENED);
    }

    readyStateChange(state) {
        this.readyState = state;

        if (typeof this.onreadystatechange == "function") {
            try {
                this.onreadystatechange();
            } catch (e) {
                sinon.logError("Fake XHR onreadystatechange handler", e);
            }
        }

        this.dispatchEvent(new MockEvent("readystatechange"));

        switch (this.readyState) {
            case FakeXMLHttpRequest.DONE:
                this.dispatchEvent(new MockEvent("load", false, false, this));
                this.dispatchEvent(new MockEvent("loadend", false, false, this));
                this.upload.dispatchEvent(new MockEvent("load", false, false, this));
                if (supportsProgress) {
                    this.upload.dispatchEvent(new MockProgressEvent("progress", {loaded: 100, total: 100}));
                    this.dispatchEvent(new MockProgressEvent("progress", {loaded: 100, total: 100}));
                }
                break;
        }
    }

    setRequestHeader(header, value) {
        verifyState(this);

        if (UNSAFE_HEADERS[header] || /^(Sec-|Proxy-)/.test(header)) {
            throw new Error("Refused to set unsafe header \"" + header + "\"");
        }

        if (this.requestHeaders[header]) {
            this.requestHeaders[header] += "," + value;
        } else {
            this.requestHeaders[header] = value;
        }
    }

    // Helps testing
    setResponseHeaders(headers) {
        verifyRequestOpened(this);
        this.responseHeaders = {};

        for (var header in headers) {
            if (headers.hasOwnProperty(header)) {
                this.responseHeaders[header] = headers[header];
            }
        }

        if (this.async) {
            this.readyStateChange(FakeXMLHttpRequest.HEADERS_RECEIVED);
        } else {
            this.readyState = FakeXMLHttpRequest.HEADERS_RECEIVED;
        }
    }

    // Currently treats ALL data as a DOMString (i.e. no Document)
    send(data) {
        verifyState(this);

        if (!/^(get|head)$/i.test(this.method)) {
            var contentType = getHeader(this.requestHeaders, "Content-Type");
            if (this.requestHeaders[contentType]) {
                var value = this.requestHeaders[contentType].split(";");
                this.requestHeaders[contentType] = value[0] + ";charset=utf-8";
            } else if (!(data instanceof FormData)) {
                this.requestHeaders["Content-Type"] = "text/plain;charset=utf-8";
            }

            this.requestBody = data;
        }

        this.errorFlag = false;
        this.sendFlag = this.async;
        this.readyStateChange(FakeXMLHttpRequest.OPENED);

        if (typeof this.onSend == "function") {
            this.onSend(this);
        }

        this.dispatchEvent(new MockEvent("loadstart", false, false, this));
    }

    abort() {
        this.aborted = true;
        this.responseText = null;
        this.errorFlag = true;
        this.requestHeaders = {};

        if (this.readyState > FakeXMLHttpRequest.UNSENT && this.sendFlag) {
            this.readyStateChange(FakeXMLHttpRequest.DONE);
            this.sendFlag = false;
        }

        this.readyState = FakeXMLHttpRequest.UNSENT;

        this.dispatchEvent(new MockEvent("abort", false, false, this));

        this.upload.dispatchEvent(new MockEvent("abort", false, false, this));

        if (typeof this.onerror === "function") {
            this.onerror();
        }
    }

    getResponseHeader(header) {
        if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
            return null;
        }

        if (/^Set-Cookie2?$/i.test(header)) {
            return null;
        }

        header = getHeader(this.responseHeaders, header);

        return this.responseHeaders[header] || null;
    }

    getAllResponseHeaders() {
        if (this.readyState < FakeXMLHttpRequest.HEADERS_RECEIVED) {
            return "";
        }

        var headers = "";

        for (var header in this.responseHeaders) {
            if (this.responseHeaders.hasOwnProperty(header) &&
                !/^Set-Cookie2?$/i.test(header)) {
                headers += header + ": " + this.responseHeaders[header] + "\r\n";
            }
        }

        return headers;
    }

    setResponseBody(body) {
        verifyRequestSent(this);
        verifyHeadersReceived(this);
        verifyResponseBodyType(body);

        var chunkSize = this.chunkSize || 10;
        var index = 0;
        this.responseText = "";

        do {
            if (this.async) {
                this.readyStateChange(FakeXMLHttpRequest.LOADING);
            }

            this.responseText += body.substring(index, index + chunkSize);
            index += chunkSize;
        } while (index < body.length);

        var type = this.getResponseHeader("Content-Type");

        if (this.responseText &&
            (!type || /(text\/xml)|(application\/xml)|(\+xml)/.test(type))) {
            try {
                this.responseXML = FakeXMLHttpRequest.parseXML(this.responseText);
            } catch (e) {
                // Unable to parse XML - no biggie
            }
        }

        this.readyStateChange(FakeXMLHttpRequest.DONE);
    }

    respond(status, headers, body) {
        this.status = typeof status == "number" ? status : 200;
        this.statusText = STATUS_CODES[this.status];
        this.setResponseHeaders(headers || {});
        this.setResponseBody(body || "");
    }

    uploadProgress(progressEventRaw) {
        if (supportsProgress) {
            this.upload.dispatchEvent(new MockProgressEvent("progress", progressEventRaw));
        }
    }

    downloadProgress(progressEventRaw) {
        if (supportsProgress) {
            this.dispatchEvent(new MockProgressEvent("progress", progressEventRaw));
        }
    }

    uploadError(error) {
        if (supportsCustomEvent) {
            this.upload.dispatchEvent(new MockCustomEvent("error", {detail: error}));
        }
    }

    static parseXML(text) {
        var xmlDoc;

        if (typeof DOMParser != "undefined") {
            var parser = new DOMParser();
            xmlDoc = parser.parseFromString(text, "text/xml");
        } else {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(text);
        }

        return xmlDoc;
    }

    static get filters(){
		if(!this.constructor.filters) this.constructor.filters = [];
		return this.constructor.filters
	}

	static addFilter(fn) {
        this.constructor.filters.push(fn)
    }

    static defake(fakeXhr, xhrArgs) {
        var xhr = new sinonXhr.workingXHR();
        each([
            "open",
            "setRequestHeader",
            "send",
            "abort",
            "getResponseHeader",
            "getAllResponseHeaders",
            "addEventListener",
            "overrideMimeType",
            "removeEventListener"
        ], function (method) {
            fakeXhr[method] = function () {
                return apply(xhr, method, arguments);
            };
        });

        var copyAttrs = function (args) {
            each(args, function (attr) {
                try {
                    fakeXhr[attr] = xhr[attr]
                } catch (e) {
                    if (!IE6Re.test(navigator.userAgent)) {
                        throw e;
                    }
                }
            });
        };

        var stateChange = function stateChange() {
            fakeXhr.readyState = xhr.readyState;
            if (xhr.readyState >= FakeXMLHttpRequest.HEADERS_RECEIVED) {
                copyAttrs(["status", "statusText"]);
            }
            if (xhr.readyState >= FakeXMLHttpRequest.LOADING) {
                copyAttrs(["responseText", "response"]);
            }
            if (xhr.readyState === FakeXMLHttpRequest.DONE) {
                copyAttrs(["responseXML"]);
            }
            if (fakeXhr.onreadystatechange) {
                fakeXhr.onreadystatechange.call(fakeXhr, { target: fakeXhr });
            }
        };

        if (xhr.addEventListener) {
            for (var event in fakeXhr.eventListeners) {
                if (fakeXhr.eventListeners.hasOwnProperty(event)) {
                    each(fakeXhr.eventListeners[event], function (handler) {
                        xhr.addEventListener(event, handler);
                    });
                }
            }
            xhr.addEventListener("readystatechange", stateChange);
        } else {
            xhr.onreadystatechange = stateChange;
        }
        apply(xhr, "open", xhrArgs);
    }
}