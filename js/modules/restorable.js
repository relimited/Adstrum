/**
*implementation of a Restorable.  Whatever that is.
*/

define(["inheritance"], function(Inheritance){
  var Restorable = Class.extend({
    init : function(stack, initialValue){
      this.realValue = initialValue;
      this.lastSaveFrame = -1;
      this.undoStack = stack;
    },

    setInitialValue : function(value){
      if(this.lastSaveFrame != -1){
        throw new Exception("Attempted to set initial value of a restorable after it had already been saved on the undo stack");
      }else{
        this.realValue = value;
      }
    },

    set : function(value){
      this.undoStack.maybeSave(this);
      this.realValue = value;
    },

    get : function(){
      return this.realValue;
    }
  });

  return Restorable;
});
