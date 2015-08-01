/**
*Definition of an undoStack form Craft
*/
define(["inheritance"], function(Inheritance){
  //private things up here
  var initialStackSize = 128;

  //private inner structure.  Using a constructor to give initial values to things
  var StackBlock = function(vari){
    oldFrame : vari.lastSaveFrame,
    savedValue : vari.realValue,
    variable : vari
  }

  var UndoStack = Class.extend({
    init : function(vari){
      this.undoDataStack = []; //This needs to be of type StackBlock (these elements are stack blocks)
      this.undoStackPointer;
      this.framePointer;
    },

    //this really needs to be private
    //this also doesn't make sense to exist, given that this is Javascript
    ensureSpace : function(){
      console.log("EnsureSpace doesn't do anything in JavaScript, because that's how JavaScript rolls.");
    },

    maybeSave : function(rest){
      if(rest.lastSaveFrame != this.framePointer){
        consoe.log("Save " + this.undoStackPointer + " <- " + rest.realValue);
        this.undoDataStack[this.undoStackPointer] = new StackBlock(rest);
        this.undoStackPointer = this.undoStackPointer + 1;
        rest.lastSaveFrame = this.framePointer;
      }
    }
  });
});
