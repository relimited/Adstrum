/**
 * Implementation of the variable class in JavaScript from Craft
 *
 * This is gonna be kinda gnarly, because of how abstract this is in Craft.
 */

define(["inheritance", "restorable"], function(Inheritance, Restorable){

	var Variable = Class.extend({
		init : function(name, p){
			//name: string, p: CSP
			this.name = name;
			p.variables.push(this);
			this.csp = p;

			this.constraints = [];
		},

		 addConstraint: function(constraint){
			this.csp.assertSolvingPhase();
			if(!this.isCanonical()){
				throw{"message" : "non-canon variable!"};
			}
			this.constraints.push(constraint);
		},

		//there is some other stuff here, but pish.  This is JavaScript.  We don't need to define abstract functions
	});

	//now for the really weird part
	//but javascript doesn't have types! you exclaim against the void
	//and you're not wrong.  This mirrors the Craft implmentation pretty strictly, which is good for a first pass
	//TODO: extra object creation here, Javascript is terrible at that
	var typedVariable = Variable.extend({
		init : function(name, p, stack, initialValue){
			this._super(name, p);
			this.currentValue = new Restorable(stack, initialValue);
			this.forwardingPointer = this;
		},

		value : function(){
			if(this.forwardingPointer == this){
				return this.currentValue.get();
			}else{
				return this.canonicalVariable().currentValue.get();
			}
		},

		mustEqual : function(v){
			this.csp.assertConfigurationPhase();
      //still don't get this line
      this.forwardingPointer = v.canonicalVariable();
      this.currentValue = null;  // To make sure any further attempt to use CurrentValue will fail.s
		},

		isCanonical : function(){
		 	return this.forwardingPointer == this;
    },

    canonicalVariable : function(){
    	var v = this;
      while (v != v.forwardingPointer){
      	v = v.forwardingPointer;
			}
			
			return v;
    }
	});

	//If I need things to extend from the generic variable, I'll shift it into a new class
	return typedVariable;
});
