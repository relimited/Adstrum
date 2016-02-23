/**
 * Hold on to your butts, its a constraint solver in JavaScript.
 *
 * CSP is the constraint satisfaction problem class-- this holds the machinery
 * for actually solving itself, but also all the bookkeeping.
 * See readme.md for usage details.
 */
define(["inheritance", "undoStack", "memoTable"], function(Inheritance, UndoStack, MemoTable){'use strict';
	/**
	 * A function to replicate the common string.format() methods in other languages.
	 * Cribbed from:
	 * http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
	 * @param  {String} string The format string to use
	 * @param  {Array} args   An array of the arguments to use for the format string
	 * @return {String}        The format string, where format symbols have been replaced by args.
	 */
	function strFormat(string, args){
    	return string.replace(/{(\d+)}/g, function(match, number) {
      		return typeof args[number] != 'undefined' ? args[number] : match;
    	});
	}

	var csp = Class.extend({
		/**
		 * Constructor for the CSP class.
		 * @return {CSP} A new constraint satisifaction problem, ready to add
		 *                 variables and constraints to it.
		 */
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
			this.currentConstraint = null; //start currentConstraint uninitialized
		},

		/**
		 * Returns the number of variables currently in the CSP
		 * @return {Number} The number of variables currently in the CSP
		 */
		variableCount : function(){
			return this.variables.length;
		},

		/**
		 * Returns the number of constraints currently in the CSP
		 * @return {Number} The number of constraints currently in the CSP
		 */
		constraintCount : function(){
			return this.constraintCount.length;
		},

		/**
		 * Get a new solution to the CSP.  Note that the solution isn't returned--
		 * instead, all the various objects that the CSP points to have been modified such that
		 * all the required constraints hold true.
		 *
		 */
		newSolution : function(){
			console.log("New Solution");

			this.startSolutionPhase();
      this.choiceStack.length = 0; //NOTE: if we can ensure that nothing else references choiceStack, then choiceStack = [] is faster
      this.solverSteps = 0;

      this.intervalUndoStack.restore(0);
      //try{
      	this.clearPendingQueue();
        //trying to eke out speed wherever we can, see
        //http://stackoverflow.com/questions/9329446/for-each-over-an-array-in-javascript
        for (var index = 0, len = this.constraints.length; index < len; ++index){
        	this.pending.push(this.constraints[index]);
        }

        var fail = [false]; //pass by ref assurence.  TODO: optimize
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
			/* }catch (e){
      			var retMsg = [];
        		for(var index = 0, len = this.choiceStack.length; index < len; ++index){
        			retMsg.push(this.choiceStack[index]);
          			retMsg.push("\n");
        		}
				retMsg.push(e);
        throw retMsg.join("");
    	} */
		},

		/**
		 * Generator that actually does the work of picking a variable, narrowing it, and checking CSP consistency.
		 * This is the core loop of solving the CSP.
		 * As with other methods, nothing is returned from solutions, only the objects that the CSP references are modified.
		 */
		solutions : function*(){
			if (this.choiceStack.length > 200){
      			throw "Size is too big for Craft to handle!";
			}

			this.solverSteps = this.solverSteps + 1;
      		if (this.solverSteps > this.maxSteps){
        		throw "The Craft solver ran for too many steps";
			}

			var v = this.chooseVariable();
      		if (v === null){
      			yield true;
      		}else{
        		var mark = this.intervalUndoStack.markStack();
				var varNarrower = v.tryNarrowing();

				//use the generator's .done property to see when a particular variable
				//can't be narrowed anymore.
				while(!(varNarrower.next().done)){
        			var fail = [false]; //boolean pass by ref
          			this.makeConsistent(fail);
          			if (!fail[0]){
						//recursively continue to search for a solution to the CSP.
						var solutionGen = this.solutions();
						while (!(solutionGen.next().done)) {
							yield false;
						}
          			}
					this.popChoiceStack();
					this.intervalUndoStack.restore(mark);
      			}
			}
		},

		/**
		 * Push a choice on the CSP's choice stack.
		 * @param  {String} format format string
		 * @param  {List} args   arguments to the format string
		 */
		pushChoice : function(format, args){
			//this uses a String.format function.  Doing so in Javascript is messsssssy
			//see the helper function at the top of this Class
			var choice = strFormat(format, args);
			console.log(choice);
			this.choiceStack.unshift(choice);
		},

		/**
		 * Pop a choice off of the choice stack.
		 */
		popChoiceStack : function(){
			console.log("Fail: " + this.choiceStack[0]);
			this.choiceStack.shift();
		},

		/**
		 * Pick the next variable to consider in the CSP.  This can be done two ways:
		 * 		1) Randomly
		 * 		2) By heurisitic
		 * 	NOTE: Pre-alpha 0.11 uses the random version.
		 * 	Craft proper has a conditional compilation step, but that's not a thing
		 * 	in Javascript.
		 */
		chooseVariable : function(){
			//This is the randomized variable choice option
			this.nonUniqueVariables.length = 0; //NOTE: if I can ensure that nothing else will reference this, setting it equal to [] is faster
			for(var index = 0, len = this.canonicalVariables.length; index < len; ++index){
				if(!this.canonicalVariables[index].isUnique()){
					this.nonUniqueVariables.push(this.canonicalVariables[index]);
				}
			}
			if(this.nonUniqueVariables.length > 0){
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

		/**
		 * Check the consistency of the CSP.  This is a method mostly used for testing--
		 * as when makeConsistent fails it throws an error.
		 */
		testConsistency : function(){
	  		this.startSolutionPhase();
	    	this.pending.length = 0; //USUAL LINES ABOUT CLEARING ARRAYS
			//trying to eke out speed wherever we can, see
			//http://stackoverflow.com/questions/9329446/for-each-over-an-array-in-javascript
			for(var index = 0, len = this.constraints.length; index < len; ++index){
				this.pending.push(this.constraints[index]);
			}
			var fail = [false];
			this.makeConsistent(fail);
			if(fail[0]){
				throw "No solution";
			}
		},

		/**
		 * Propigate each constraint through the CSP to ensure that all the correct
		 * properties still hold.
		 * @param  {[boolean]} fail A boolean wrapped in an array so we can pass-by-ref for a primative
		 */
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
					return;
				}
			}
		},

		/**
		 * Check to see if a constraint is currently being propigated
		 * @param  {Constraint} c The constraint to check against
		 * @return {boolean}   true if c is currently being propigated, false otherwise
		 */
		currentlyPropagating : function(c){
			return this.currentConstraint == c;
		},

		/**
		 * Add a constraint to the pending constraint queue
		 * @param  {Constraint} c the constraint to add
		 */
		queueConstraint : function(c){
			this.pending.push(c);
		},

		/**
		 * Clear out all constraints from the pending cosntraint queue, and also
		 * clear the currently propigating constraint.
		 */
		clearPendingQueue : function(){
			this.currentConstraint = null;
			while(this.pending.length > 0){
				this.pending[0].queued = false;
				this.pending.shift();
			}
		},

		/**
		 * Move the CSP from the configuration phase to the solution phase.  Have
		 * constraints register all required canonical variables (and also canonicalize all variables)
		 */
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

			//FIXME: there is currently a bug somewhere where constraint.narrowedVariable is getting
			//held over from problem to problem.  This is a stopgap fix for now.
			for(var index = 0, len = this.constraints.length; index < len; ++index){
				this.constraints[index].narrowedVariable = null;
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

		/**
		 * Add a function to this CSP's memo table.  Function memorization maps
		 * a function name & args to a function value, so the function only needs
		 * to be computed once.
		 * Only the first value is memorized, so if a function could return something different with the same args,
		 * it will not be memorized correctly.
		 * @param  {String} functionName The function name
		 * @param  {Function} func         The function to memorize
		 * @param  {List} args         A list of arguments to pass to the function
		 * @return {Object}				The memorized value of the function with the provided params
		 */
		memorize : function(functionName, func, args){
			return this.memoTable.memorize(functionName, func, args);
		}
	});

	return csp;
});
