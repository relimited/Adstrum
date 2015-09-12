/**
*Definition of an undoStack form Craft
*/
define(["inheritance"], function(Inheritance){
  //private things up here
  var initialStackSize = 128;

  //private inner structure.  Using a constructor to give initial values to things
  var StackBlock = function(vari){
    this.oldFrame = vari.lastSaveFrame;
    this.savedValue = vari.realValue;
    this.variable = vari;
  }

  var UndoStack = Class.extend({
    init : function(vari){
      this.undoDataStack = []; //This needs to be of type StackBlock (these elements are stack blocks)
      this.undoStackPointer = 0;
      this.framePointer = 0;
    },

    markStack : function(){
        this.framePointer = this.undoStackPointer;
        return this.framePointer;
    },

    restore : function(frame){
        while(this.undoStackPointer > frame){
            this.undoStackPointer = this.undoStackPointer - 1;
            var popped = this.undoDataStack[this.undoStackPointer];
            var v = popped.variable;
            v.realValue = popped.savedValue;
            v.lastSaveFrame = popped.oldFrame;
        }
        this.framePointer = frame;
    },

    //this really needs to be private
    //this also doesn't make sense to exist, given that this is Javascript
    ensureSpace : function(){
      console.log("EnsureSpace doesn't do anything in JavaScript, because that's how JavaScript rolls.");
    },

    maybeSave : function(rest){
      if(rest.lastSaveFrame != this.framePointer){
        console.log("Save " + this.undoStackPointer + " <- " + rest.realValue);
        this.undoDataStack[this.undoStackPointer] = new StackBlock(rest);
        this.undoStackPointer = this.undoStackPointer + 1;
        rest.lastSaveFrame = this.framePointer;
      }
    }
  });

  return UndoStack;
});
