/**
 * Implementation of a memory table in Javascript
 */
define(["inheritance", "../shared/dictionary"], function(Inheritance, Dictionary){


  //Defining an 'inner class' here-- tuple isn't returned from this chunk, so it's only visible to the MemoTable.
  var Tuple = Class.extend({
    init : function(arguments){
      this.data = arguments;
    },

    equals : function(t){
      if(t == null || t.data.length != this.data.length){
        return false;
      }else{
        for(index = 0, len = t.data.length; index < len; ++index){
          if(!t.data[index].equals(this.data[i])){
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
      this.cache = new Dictionary(true);
    },

    memorize : function(functionName, funct, arguments){
      var tuple = new Tuple(arguments);
      var table = this.cache.get(functionName);
      if(table){
        var memorizedValue = table.get(tuple);
        if(memorizedValue){
          return memorizedValue;
        }
      }else{
        table = new Dictionary(true);
        this.cache.put(functionName, table);
        table.put(tuple, funct);
        return funct;
      }
    }
  });

  return MemoTable;
});
