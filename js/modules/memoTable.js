/**
 * Implementation of a memory table in Javascript
 */
define(["inheritance", "../shared/dictionary"], function(Inheritance, Dictionary){'use strict';


  //Defining an 'inner class' here-- tuple isn't returned from this chunk, so it's only visible to the MemoTable.
  var Tuple = Class.extend({
    init : function(args){
        var compiled = []
        for (var i = 0; i < args.length; i++){
            compiled.push(args[i])
        }
        this.data = compiled;
    },

    equals : function(t){
      if(t == null || t.data.length != this.data.length){
        return false;
      }else{
        for(var index = 0, len = t.data.length; index < len; ++index){
          if(!(t.data[index] == this.data[index])){         //yes, this means that it won't work for objects.  I get it.
            return false;
          }
        }
        return true;
      }
    },

    /**
    * Javascript doesn't use hash codes?
    */
    getHashCode : function(){
      console.log("GetHashCode is not implemented...");
    }
  });

  var MemoTable = Class.extend({
    init : function(){
      this.cache = {};
    },

    memorize : function(functionName, funct, args){
      var tuple = new Tuple(args);
      var table = this.cache[functionName];
      if(table){
          var memorizedValue = table.get(tuple);
          if(memorizedValue){
              return memorizedValue;
          }
      }else{
          table = new Dictionary();
          this.cache[functionName] = table;
      }
      memorizedValue = funct();
      table.put(tuple, memorizedValue);
      return memorizedValue;
    }
  });

  return MemoTable;
});
