let responders = [];

export class FakeRequest {
	constructor(){
	}
	
	open(method, url, async, username, password) {
		var responder = responders.filter(function(res, i){
			return (method == res.method && url)
		});
		
		
		//compare with responders
		var response = {
			status: 200,
			type: 'application/json',
    		json: {}
		}
		fn.call( scope, request, response ); 
	}
	send(data){
		
	}
	
	get onload(){
		return this.loadhandler;
	}
	set onload(value){
		this.loadhandler = value;
	}
	get ontimeout(){
		return this.timeouthandler;
	}
	set ontimeout(value){
		this.timeouthandler = value;
	}
	get onerror(){
		return this.errorhandler;
	}
	set onerror(value){
		this.errorhandler = value;
	}
	get onabort(){
		this.aborthandler;
	}
	set onabort(value){
		this.aborthandler = value;
	}
	get onreadystatechange(){
		return this.readystatechangehandler;
	}
	set onreadystatechange(value){
		this.usingReadStateChange = true;
		this.readystatechangehandler = value;
	}
	
	setRequestHeader(header, value) {
		//ignore
	}
	
	static addResponder(url, method, callback){
		responders.push({url,method,callback})
	}
}