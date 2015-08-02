/**
 * Hold on to your butts, I'm writing a constraint solver in JavaScript.
 * I know.
 */
define(["inheritance", "undoStack"], function(Inheritance, UndoStack){
	//hidden helper methods go hereish
	function strFormat(string, args){
    return string.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
	}

	function randomInteger(low, high){
		return (Math.random() % (high - low)) + low; //does this even?
	}
	var CSP = Class.extend({
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
      		try{
          		this.clearPendingQueue();
          		//trying to eke out speed wherever we can, see
          		//http://stackoverflow.com/questions/9329446/for-each-over-an-array-in-javascript
          		for (index = 0, len = this.constraints.length; index < len; ++index){
          			this.pending.push(c);
          		}

          		var fail = false;
          		this.makeConsistent(fail);

          		if (fail){
          			throw new Exception("Initial configuration is unsatisfiable.");
        		}

          		//trying to eke out speed wherever we can, see
          		//http://stackoverflow.com/questions/9329446/for-each-over-an-array-in-javascript
          		for(index = 0, len = this.canonicalVariables.length; index < len; ++index){
          			this.canonicalVariables[index].initializeStartingWidth();
          		}

				var solutionGen = this.solutions();
          		if (!solutionGen.next().value){
          			throw new Exception("No solution found");
          		}
			}catch (e){
      			var retMsg = [];
        		for(index = 0, len = choiceStack.length; index < len; ++index){
        			retMsg.push(choiceStack[index]);
          			retMsg.push("\n");
        		}
        		throw new Exception(retMsg.join(""), e);
    		}
		},

		solutions : function*(){
			if (this.choiceStack.length > 200){
      			throw new Exception("Size is too big for Craft to handle!");
			}

      		if (this.solverSteps++ > MaxSteps){
        		throw new Exception("The Craft solver ran for too many steps");
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
				for(index = 0, len = v.tryNarrowing().length; index < len; ++index){
					//#pragma warning restore 168
        			var fail = false;
          			this.makeConsistent(fail);
          			if (!fail){
						//#pragma warning disable 168
						for (let ignore2 of this.solutions()) {
							// ReSharper restore UnusedVariable
							//#pragma warning restore 168
							yield false;
						}

          				this.popChoiceStack();
            			this.intervalUndoStack.restore(mark);
          			}
      			}
			}
		},

		pushChoice : function(format, args){
			//this uses a String.format function.  Doing so in Javascript is messsssssy
			//see the helper function at the top of this Class
			var choice = strFormat(format, args);
			console.log(choice);
			this.choiceStack.push(choice);

			/**
			if (choiceStack.Count>10)
                Debugger.Break();
			*/
		},

		choseVariable : function(){
			//there is a conditional compilation step here.  Javascript doesn't do that noise, so fuck em.
			//This is the randomized variable choice option
			this.nonUniqueVariables.length = 0; //if I can ensure that nothing else will reference this, setting it equal to [] is faster
			for(index = 0, len = this.canonicalVariables.length; index < len; ++index){
				if(!this.canonicalVariables[index].isUnique()){
					this.nonUniqueVariables.push(this.canonicalVariables[index]);
				}
			}
			if(this.nonUniqueVariables.length > 0){
				//probably want to not have a random number function as a property of this object
				return this.nonUniqueVariables(this.randomInteger(0, this.nonUniqueVariables.length));
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
			for(index = 0, len = this.constraints.length; index < len; ++index){
				this.pending.push(this.constraints[index]);
			}
			var fail = false;
			this.makeConsistent(fail);
			if(fail){
				throw new Exception("No solution");
			}
		},

		makeConsistent : function(fail){
			while(this.pending.length > 0){
				var constraint = this.pending.pop();
				constraint.queued = false;
				this.currentConstraint = constraint;

				console.log("Propigate " + constraint);
				constraint.propigate(fail);
				currentConstraint = null;
				if(fail){
					this.clearPendingQueue();
					return; //not entirely sure why this is here, Ian.
				}
			}
		},

		currentlyPropagating : function(c){
			return this.currentConstraint == c;
		},

		queuedConstraint : function(c){
			this.pending.push(c);
		},

		//Ian does some weird C# magic here.

		startSolutionPhase : function(){
			if(this.configurationPhase){
				this.configurationPhase = false;

				for(index = 0, len = this.constraints.length; index < len; ++index){
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
				throw new Exception("Operation can only be performed before solving.");
			}
		},

		assertSolvingPhase : function(){
			if(this.configurationPhase){
				throw new Exception("Operation can only be performed during solving.");
			}
		},

		memorize : function(functionName, function, arguments){
			return this.memoTable.memorize(fucntionName, functoin, arguments);
		}
	});

	return CSP;
});
