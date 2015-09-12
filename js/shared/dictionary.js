/**
* Lightweight dictionary shamelessly cribbed from
* http://stackoverflow.com/questions/3559070/are-there-dictionaries-in-javascript-like-python
* becuse I needed to be able to use objects (Tuples)
* as keys
*/

define(function(){
var dict = function Dictionary(overwrite){
	this.overwrite = overwrite === true;
	var __k = [];
	var __v = [];

	findKey = function(key){
		if (key.__proto__.hasOwnProperty('equals')){
			for(var i = 0; i < __k.length; i++){
				if(key.equals(__k[i])){
					return i;
				}
			}
			return -1;
		}else{
			return __k.indexOf(key)
		}
	}

	this.put = function(key, value){
		idx = findKey(key);
		if(!this.overwrite || idx === -1){
			__k.push(key);
			__v.push(value);
		}
	};

	this.get = function(key){
        var idx = findKey(key);
		if(idx >= 0){
            return __v[idx];
		}
        return null;
	};


	this.remove = function(key){
		var i = __k.indexOf(key);
		if(i != -1){
			__k.splice(i,1);
			__v.splice(i,1);
		}
  };

	this.clearAll = function(value){
	   for(var i = 0; i < __v.length; i++){
			   if(__v[i] == value){
				    __k.splice(i,1);
				    __v.splice(i,1);
			   }
		  }
	 };

	 this.iterate = function(func){
		  for(var i = 0; i < __k.length; i++){
			   func(__k[i], __v[i]);
		  }
	 };
  }

return dict;
});
