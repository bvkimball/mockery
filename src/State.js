export class State {
	constructor(data){
		this._data = data || {};
	}
	
	get data(){
		return this._data;
	}
	
	set data(value){
		this._data = value;
	}
	
	get(attr){
		return this.data[attr];
	}
	set(attr, value){
		this.data[attr] = value;
	}
}