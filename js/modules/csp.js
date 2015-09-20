/**
 * Hold on to your butts, I'm writing a constraint solver in JavaScript.
 * I know.
 */
define(["inheritance", "js/modules/undoStack", "js/modules/memoTable"], function(Inheritance, UndoStack, MemoTable){'use strict';
	//hidden helper methods go hereish
	function strFormat(string, args){
    	return string.replace(/{(\d+)}/g, function(match, number) {
      		return typeof args[number] != 'undefined'
        		? args[number]
        		: match
      		;
    	});
	};

	var csp = Class.extend({
		init : function(){
			this.configurationPhase = true;
			this.variables = [];
			this.canonicalVariables = [];
			this.constraints = [];
			this.intervalUndoStack = new UndoStack();
			this.choiceStack = [];
			this.memoTable = new MemoTable();
			this.nonUniqueVariables = [];
			this.pending = [];

			this.maxSteps = 1000;
			//TODO: this should probably be private
			this.currentConstraint = null; //doesn't look like this should get initialized
		},

		variableCount : function(){
			this.variables.length;
		},

		constraintCount : function(){
			this.constraintCount.length;
		},

		newSolution : function(){
			console.log("New Solution");

			this.startSolutionPhase();
      		this.choiceStack.length = 0; //NOTE: if we can ensure that nothing else references choiceStack, then choiceStack = [] is far superior
      		this.solverSteps = 0;

      		this.intervalUndoStack.restore(0);
      		//	try{
          		this.clearPendingQueue();
          		//trying to eke out speed wherever we can, see
          		//http://stackoverflow.com/questions/9329446/for-each-over-an-array-in-javascript
          		for (var index = 0, len = this.constraints.length; index < len; ++index){
          			this.pending.push(this.constraints[index]);
          		}

          		var fail = [false];
          		this.makeConsistent(fail);
          		if (fail[0]){
          			throw "Initial configuration is unsatisfiable.";
        		}

          		//trying to eke out speed wherever we can, see
          		//http://stackoverflow.com/questions/9329446/for-each-over-an-array-in-javascript
          		for(var index = 0, len = this.canonicalVariables.length; index < len; ++index){
          			this.canonicalVariables[index].initializeStartingWidth();
          		}

				var solutionGen = this.solutions();
          		if (solutionGen.next().done){
          			throw "No solution found";
          		}
			//}catch (e){
      			//var retMsg = [];
        		//for(var index = 0, len = this.choiceStack.length; index < len; ++index){
        			//retMsg.push(this.choiceStack[index]);
          			//retMsg.push("\n");
        		//}
				//retMsg.push(e);
        		//throw retMsg.join("");
    		//}
		},

		solutions : function*(){
			if (this.choiceStack.length > 200){
      			throw "Size is too big for Craft to handle!";
			}

			this.solverSteps = this.solverSteps + 1;
      		if (this.solverSteps > this.maxSteps){
        		throw "The Craft solver ran for too many steps";
			}

			/* DEBUG CODE
      		foreach (var iv in Variables){
                var i = (FloatVariable)iv;
                Debug.Assert(!i.Value.Empty, "Variable "+iv.Name+" is empty on entry to Solutions()");
      		}
			*/

			var v = this.chooseVariable();
      		if (v == null){
      			yield true;
      		}else{
        		var mark = this.intervalUndoStack.markStack();
				//#pragma warning disable 168
        		// ReSharper disable UnusedVariable
				//this may need to be changed
				var ignore;
				var varNarrower = v.tryNarrowing();
				while(!(varNarrower.next().done)){
					//#pragma warning restore 168
        			var fail = [false];
          			this.makeConsistent(fail);
          			if (!fail[0]){
						//#pragma warning disable 168
						var solutionGen = this.solutions();
						while (!(solutionGen.next().done)) {
							// ReSharper restore UnusedVariable
							//#pragma warning restore 168
							yield false;
						}
          			}
					this.popChoiceStack();
					this.intervalUndoStack.restore(mark);
      			}
			}
		},

		pushChoice : function(format, args){
			//this uses a String.format function.  Doing so in Javascript is messsssssy
			//see the helper function at the top of this Class
			var choice = strFormat(format, args);
			console.log(choice);
			this.choiceStack.unshift(choice);

			/**
			if (choiceStack.Count>10)
                Debugger.Break();
			*/
		},

		popChoiceStack : function(){
			console.log("Fail: " + this.choiceStack[0]);
			this.choiceStack.shift();
		},

		chooseVariable : function(){
			//there is a conditional compilation step here.  Javascript doesn't do that noise, so fuck em.
			//This is the randomized variable choice option
			this.nonUniqueVariables.length = 0; //if I can ensure that nothing else will reference this, setting it equal to [] is faster
			for(var index = 0, len = this.canonicalVariables.length; index < len; ++index){
				if(!this.canonicalVariables[index].isUnique()){
					this.nonUniqueVariables.push(this.canonicalVariables[index]);
				}
			}
			if(this.nonUniqueVariables.length > 0){
				//probably want to not have a random number function as a property of this object
				return this.nonUniqueVariables[Math.floor(Math.random()*this.nonUniqueVariables.length)];
			}else{
				return null;
			}

			/**
			This is the non-randomized variable choice option
			var best = null;
      		var maxMeasure = 0;
      		for(index = 0, len = this.canonicalVariables.length; index < len; ++index){
      			var relativeMeasure = v.relativeMeasure;
        		if (relativeMeasure > maxMeasure){
        			maxMeasure = relativeMeasure;
          			best = v;
        		}
      		}
      		return best;
			*/
		},

		testConsistency : function(){
	  		this.startSolutionPhase();
	    	this.pending.length = 0; //USUAL LINES ABOUT CLEARING ARRAYS
			for(var index = 0, len = this.constraints.length; index < len; ++index){
				this.pending.push(this.constraints[index]);
			}
			var fail = [false];
			this.makeConsistent(fail);
			if(fail[0]){
				throw "No solution";
			}
		},

		makeConsistent : function(fail){
			while(this.pending.length > 0){
				var constraint = this.pending.shift();
				constraint.queued = false;
				this.currentConstraint = constraint;

				console.log("Propagate " + constraint);
				constraint.propagate(fail);
				this.currentConstraint = null;
				if(fail[0]){
					this.clearPendingQueue();
					return; //not entirely sure why this is here, Ian.
				}
			}
		},

		currentlyPropagating : function(c){
			return this.currentConstraint == c;
		},

		queueConstraint : function(c){
			this.pending.push(c);
		},

		clearPendingQueue : function(){
			this.currentConstraint = null;
			while(this.pending.length > 0){
				this.pending.shift();
				this.pending[0].queued = false;
			}
		},
		//Ian does some weird C# magic here.

		startSolutionPhase : function(){
			if(this.configurationPhase){
				this.configurationPhase = false;

				for(var index = 0, len = this.constraints.length; index < len; ++index){
					this.constraints[index].canonicalizeVariables();
				}

				for(index = 0, len = this.variables.length; index < len; ++index){
					if(this.variables[index].isCanonical()){
						this.canonicalVariables.push(this.variables[index]);
					}
				}
			}
		},

		//Some asserts to throw errors if we're not in the correct phase for the stunt
		assertConfigurationPhase : function(){
			if(!this.configurationPhase){
				throw "Operation can only be performed before solving.";
			}
		},

		assertSolvingPhase : function(){
			if(this.configurationPhase){
				throw "Operation can only be performed during solving.";
			}
		},

		memorize : function(functionName, func, args){
			return this.memoTable.memorize(functionName, func, args);
		}
	});

	return csp;
});
