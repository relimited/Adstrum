var Craft =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;;;

	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require, exports, module){
	    var CSP = __webpack_require__(1),
	        FloatVariable = __webpack_require__(6),
	        IntegerVariable = __webpack_require__(14);

	    exports.CSP = CSP;
	    exports.FloatVariable = FloatVariable;
	    exports.IntegerVariable = IntegerVariable;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Hold on to your butts, its a constraint solver in JavaScript.
	 *
	 * CSP is the constraint satisfaction problem class-- this holds the machinery
	 * for actually solving itself, but also all the bookkeeping.
	 * See readme.md for usage details.
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(3), __webpack_require__(4)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance, UndoStack, MemoTable){'use strict';
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 2 */
/***/ function(module, exports) {

	/* Simple JavaScript Inheritance
	 * By John Resig http://ejohn.org/
	 * MIT Licensed.
	 */

	function extend(destination, source) {
	    for (var k in source) {
	        if (source.hasOwnProperty(k)) {
	            destination[k] = source[k];
	        }
	    }
	    return destination;
	}

	// Inspired by base2 and Prototype
	(function() {
	    var initializing = false, fnTest = /xyz/.test(function() { xyz;
	    }) ? /\b_super\b/ : /.*/;

	    // The base Class implementation (does nothing)
	    this.Class = function() {
	    };

	    // Create a new Class that inherits from this class
	    Class.extend = function(prop) {
	        var _super = this.prototype;

	        // Instantiate a base class (but only create the instance,
	        // don't run the init constructor)
	        initializing = true;
	        var prototype = new this();
	        initializing = false;

	        // Copy the properties over onto the new prototype
	        for (var name in prop) {
	            // Check if we're overwriting an existing function
	            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? (function(name, fn) {
	                return function() {
	                    var tmp = this._super;

	                    // Add a new ._super() method that is the same method
	                    // but on the super-class
	                    this._super = _super[name];

	                    // The method only need to be bound temporarily, so we
	                    // remove it when we're done executing
	                    var ret = fn.apply(this, arguments);
	                    this._super = tmp;

	                    return ret;
	                };
	            })(name, prop[name]) : prop[name];
	        }

	        // The dummy class constructor
	        function Class() {
	            // All construction is actually done in the init method
	            if (!initializing && this.init)
	                this.init.apply(this, arguments);
	        }

	        // Populate our constructed prototype object
	        Class.prototype = prototype;

	        // Enforce the constructor to be what we expect
	        Class.prototype.constructor = Class;

	        // And make this class extendable
	        Class.extend = arguments.callee;

	        return Class;
	    };
	})();


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	*Definition of an undoStack form Craft
	*/
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance){
	  //private things up here
	  var initialStackSize = 128;

	  //private inner structure.  Using a constructor to give initial values to things
	  var StackBlock = function(vari){
	    this.oldFrame = vari.lastSaveFrame;
	    this.savedValue = vari.realValue;
	    this.variable = vari;
	  };

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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Implementation of a memory table in Javascript
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(5)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance, Dictionary){'use strict';


	  //Defining an 'inner class' here-- tuple isn't returned from this chunk, so it's only visible to the MemoTable.
	  var Tuple = Class.extend({
	    init : function(args){
	        var compiled = [];
	        for (var i = 0; i < args.length; i++){
	            compiled.push(args[i]);
	        }
	        this.data = compiled;
	    },

	    equals : function(t){
	      if(t === null || t.data.length != this.data.length){
	        return false;
	      }else{
	        for(var index = 0, len = t.data.length; index < len; ++index){
	          if(t.data[index] != this.data[index]){         //yes, this means that it won't work for objects.  I get it.
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/**
	* Lightweight 'equals' dictionary.  The diectionary expects its keys to have an
	* equals method.
	*/

	!(__WEBPACK_AMD_DEFINE_RESULT__ = function(){
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
				return __k.indexOf(key);
			}
		};

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
	 };

	return dict;
	}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 *	A floating point variable in Craft
	 *	This class not only creates new Floating Variables for Scalar Arithmatic in Craft, but also
	 *	handles performing common scalar arithmatic operations to floating variables
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(7), __webpack_require__(9), __webpack_require__(11), __webpack_require__(12)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance, Variable, Interval, MathUtil, ScalarArithmaticConstraints){
	    //For ease of reference later, split the properties of the ScalarArithmaticConstraints
	    //module.
	    SumConstraint = ScalarArithmaticConstraints.SumConstraint;
	    DifferenceConstraint = ScalarArithmaticConstraints.DifferenceConstraint;
	    ProductConstraint = ScalarArithmaticConstraints.ProductConstraint;
	    ConstantProductConstraint = ScalarArithmaticConstraints.ConstantProductConstraint;
	    QuotientConstraint = ScalarArithmaticConstraints.QuotientConstraint;
	    PowerConstraint = ScalarArithmaticConstraints.PowerConstraint;

	    //'Static' method constructors for making common variations on a Floating Point Variable.
	    /**
	     * 'Static' method for making a float variable with infinate bounds.
	     * @param  {String} name name of the float var
	     * @param  {CSP} p    constraint satisifaction problem to assoiate this variable
	     *                    with
	     * @return {FloatVariable}      new Float Variable with inf bounds
	     */
	    var makeInfinateFloatVariable = function(name, p){
	        return new FloatVariable(name, p, Interval.allValues);
	    };

	    /**
	     * 'Static' method for making a float variable with two provided bounds
	     * @param  {String} name  Name of the float variable
	     * @param  {CSP} p     Constraint Satisifaction Problem to associate the
	     *                     the float var with
	     * @param  {Number} lower The lower bound of this float variable
	     * @param  {Number} upper The upper bound of this float variable
	     * @return {FloatVariable}       new float variable in range [lower, upper]
	     */
	    var makeFloatVariableWithBounds = function(name, p, lower, upper){
	        return new FloatVariable(name, p, new Interval(lower, upper));
	    };

	    /**
	     * 'Static' method for memorizing a 'make constant' function.
	     *
	     * @TODO: this is currently unused by Craftjs, untested, and mostly still a stub.
	     * @param  {CSP} p The constraint satisifaction problem to associate this constant with
	     * @param  {Number} c The value of the constant to create
	     * @return {FloatVariable}   the memorized value for the 'constant' function in the CSP's memo table.
	     *                           which will be a Float Variable with the correct bounds.
	     */
	    var makeFloatConstant = function(name, p, c){
	        var funct = function(){return makeFloatVariableWithBounds(name, p, c, c);};
	        return p.memorize("constant", funct, [c]);
	    };

	    var FloatVariable = Variable.extend({
	        /**
	         * Create a new Float Varible and register that float variable with a CSP
	         *
	         * @param  {String} name           Name of the float variable
	         * @param  {CSP} p                 Constraint satisfaction problem to associate with this float variable
	         * @param  {Interval} initialValue Initial bounds of this float variable
	         * @return {FloatVariable}         A new float variable to use with the CSP
	         */
	        init : function(name, p, initialValue){
	            this._super(name, p, p.intervalUndoStack, initialValue);

	            this.startingWidth = 0;
	        },

	        /**
	         * Set the starting width of this float variable
	         */
	        initializeStartingWidth : function(){
	            this.startingWidth = this.value().width();
	        },

	        /**
	         * Get a relative measure of how shrunk this floating variable has become,
	         * based on its current width vs its starting width
	         * @return {Number} the relative shrunkenness of this floating variable
	         */
	        relativeMeasure : function(){
	            return this.value().width() / this.startingWidth;
	        },

	        /**
	         * Add a constraint that this float variable must equal the passed in
	         * parameter
	         * @param  {Number or Variable} v the variable/Number that this float var
	         *                    must equal
	         */
	        mustEqual : function(v){
	            if (v instanceof Variable){
	                v.mustBeContainedInInterval(this.value());
	                this._super(v);
	            }else if (v.constructor === Number){
	                //This is our final condition-- also Javascript is awesome
	                this.mustBeContainedInInterval(new Interval(v, v));
	            }
	        },

	        /**
	         * Adds a constraint that this float variable must stay in the range
	         * [lower, upper]
	         * @param  {Number} low  Lower Bound of this float variable
	         * @param  {Number} high Upper Bound of this float variable
	         */
	        mustBeContainedInRange : function(low, high){
	            this.mustBeContainedInInterval(new Interval(low, high));
	        },

	        /**
	         * Adds a constraint that this float variable must be greater than or
	         * equal to the provided parameter
	         * This is equivelent to mustBeContainedInRange(low, Number.POSITIVE_INFINITY)
	         * @param  {Variable or Number} low The lower bound, what we're constraining this variable to equal or be greater than
	         */
	        mustBeGreaterThanOrEqualTo : function(low){
	            if (low instanceof Variable){
	                this.mustBeContainedInRange(low.value().upper, Number.POSITIVE_INFINITY);
	            }else if (low.constructor === Number){
	                this.mustBeContainedInInterval(new Interval(low, Number.POSITIVE_INFINITY));
	            }
	        },

	        /**
	         * Adds a constraint that this float variable must be less than or
	         * equal to the provided parameter
	         * This is equivelent to mustBeContainedInRange(Number.NEGATIVE_INFINITY, high)
	         * @param  {Variable or Number} high the upper bound, we're constraining the float variable to be equal to or less than
	         *                       this number
	         */
	        mustBeLessThanOrEqualTo : function(high){
	            if (high instanceof Variable){
	              this.mustBeContainedInRange(Number.NEGATIVE_INFINITY, high.value().lower);
	            }else if (high.constructor === Number){
	                this.mustBeContainedInInterval(new Interval(Number.NEGATIVE_INFINITY, high));
	            }
	        },
	        /**
	         * Add a constraint that this float variable must be contained by a particular
	         * interval
	         * Although this function can be used externally, is intended to not be.
	         * This keeps Craftjs from ever having to expose the Interval object / class
	         * @param  {Interval} i the bounds that this variable must be in ([i.lower(), i.upper()])
	         */
	        mustBeContainedInInterval : function(i){
	            this.csp.assertConfigurationPhase();
	            var intersection = Interval.intersection(this.value(), i);
	            if(intersection.empty()){
	                throw "Argument out of current range of variable";
	            }
	            this.currentValue.setInitialValue(intersection);
	        },

	        /**
	         * Narrow the range of this float variable to the passed in restriction.
	         * @param  {Interval} restriction The range to narrow this float variable down to
	         * @param  {[boolean]} fail        pass-by-ref failure bool (will be set to true if we can't narrow)
	         */
	        narrowTo : function(restriction, fail){
	        	if(this.value().isUnique()){
	                if(restriction.nearlyContains(this.value(), MathUtil.defaultEpsilon)){
	                    return;
	                }else{
	                    fail[0] = true;
	                    console.log(this.name + ": " + this.value() + " -> Empty          " + restriction);
	                    return;
	                }
	            }
	            var oldValue = this.value();
	            if(!restriction.contains(this.value())){
	                var newValue = Interval.intersection(this.value(), restriction);
	                if(newValue.nearlyUnique()){
	                    var mid = newValue.midpoint();
	                    newValue = new Interval(mid, mid);
	                }
	                console.log(this.name + ": " + oldValue + " -> " + newValue + "         " + restriction +
	                                ", narrowed by " + (100 * (1-newValue.width() /oldValue.width())));

	                if(newValue.empty()){
	                    fail[0] = true;
	                }else{
	                    var propagate = (newValue.width() / this.value().width()) < 0.99;
	                    console.log(this.canonicalVariable());
	                    this.canonicalVariable().currentValue.set(newValue);
	                    if(propagate){
	                        for(var index = 0, len = this.constraints.length; index < len; index++){
	                            this.constraints[index].queuePropigation(this);
	                        }
	                    }
	                }
	            }
	        },

	        /**
	         * Narrow this float var to the union of the intersections of the provided intervals
	         * @param  {Interval} a    The first interval
	         * @param  {Interval} b    The second interval
	         * @param  {[boolean]} fail pass-by-ref failure bool (will be set to true if we can't narrow)
	         */
	        narrowToUnion : function(a, b, fail){
	            this.narrowTo(Interval.unionOfIntersections(this.value(), a, b), fail);
	        },

	        /**
	         * Narrow the current variable down to the quotient of the passed in args.
	         * @param  {Interval} numerator   Range of the numerator
	         * @param  {Interval} denominator Range of the denominator
	         * @param  {[boolean]} fail        pass-by-ref failure bool (will be set to true if we can't narrow)
	         */
	        narrowToQuotient : function(numerator, denominator, fail){
	          if(denominator.isZero()){
	            //Denominator is [0,0], so quotent is the empty set
	            fail[0] = !numerator.containsZero();
	          }else if(numerator.isZero()){
	            if(!denominator.containsZero()){
	              //Quotent is [0,0].
	              this.narrowTo(new Interval(0,0), fail);
	            }
	          }else if(!denominator.containsZero()){
	            this.narrowTo(Interval.multiply(numerator, denominator.reciprocal()), fail);
	          //three cases: crosses zero, [a, 0] and [0, b]
	          }else if(denominator.lower === 0){
	            if (numerator.upper <= 0){
	              this.narrowTo(new Interval(Number.NEGATIVE_INFINITY, numerator.upper / denominator.upper), fail);
	            }else if(numerator.lower >= 0){
	              this.narrowTo(new Interval(numerator.lower / denominator.upper, Number.POSITIVE_INFINITY), fail);
	            }
	          }else if(denominator.upper === 0){
	            if(numerator.upper <= 0){
	              this.narrowTo(new Interval(numerator.upper / denominator.lower, Number.POSITIVE_INFINITY), fail);
	            }else if(numerator.lower >= 0){
	              this.narrowTo(new Interval(Number.NEGATIVE_INFINITY, numerator.lower / denominator.lower), fail);
	            }
	          }else if(numerator.upper < 0){
	            var lowerHalf = new Interval(Number.NEGATIVE_INFINITY, numerator.upper / denominator.upper);
	            var upperHalf = new Interval(numerator.upper / denominator.lower, Number.POSITIVE_INFINITY);
	            this.narrowToUnion(lowerHalf, upperHalf, fail);
	          }else if(numerator.lower > 0){
	            var lowerHalf = new Interval(Number.NEGATIVE_INFINITY, numerator.lower / denominator.lower);
	            var upperHalf = new Interval(numerator.lower / denominator.upper, Number.POSITIVE_INFINITY);
	            this.narrowToUnion(lowerHalf, upperHalf, fail);
	          }
	        },

	        /**
	         * Narrow this float variable to the signed square root of the provided bounds
	         * @param  {Interval} square the range of the square
	         * @param  {[boolean]} fail   pass-by-ref failure bool (will be set to true if we can't narrow)
	         */
	        narrowToSignedSqrt : function(square, fail){
	            var lower = Math.max(0, square.lower);
	            var upper = square.upper;
	            if(upper < 0){
	                fail[0] = true;
	                return;
	            }
	            var sqrt = new Interval(Math.sqrt(lower), Math.sqrt(upper));
	            var restriction;
	            if (this.value().crossesZero()){
	                restriction = Interval.unionOfIntersections(this.value(), sqrt, Interval.invert(sqrt));
	            }else if(this.value().upper <= 0){
	                //current value is strictly negative
	                restriction = Interval.invert(sqrt);
	            }else{
	                //current value is strictly positive
	                restriction = sqrt;
	            }

	            this.narrowTo(restriction, fail);
	        },

	        /**
	         * Generator (because execution pausing) to try and narrow down a float
	         * variable to either a single value, or a range.  This is the core of
	         * Craft's 'optimistic' guessing-- start by narrowing a float variable
	         * to a single value, see if it works.  If it does, awesome.  If not, then
	         * either try again with [var.lower, guessed val] or [guessed val, var.upper]
	         *
	         * If the range picked doesn't work, try the other one.
	         */
	        tryNarrowing : function*(){
	            var fail = [false]; //we need fail to be passed by reference... which means wrapping it in an object.
	                                //TODO: wrap in a null object and not an array to carry less bullshit along for the ride

	            var randElement = this.value().randomElement();
	            this.csp.pushChoice("Guess {0}={1}", [this.name, randElement]);
	            this.narrowTo(new Interval(randElement, randElement), fail);
	            yield false;

	            if(Math.floor(Math.random() * 2) === 0){
	                this.csp.pushChoice("Lower half {0} to {1}", [this.name, this.value().lowerHalf()]);
	                this.narrowTo(this.value().lowerHalf(), fail);
	                yield false;

	                this.csp.pushChoice("Upper half {0} to {1}", [this.name, this.value().upperHalf()]);
	                this.narrowTo(this.value().upperHalf(), fail);
	                yield false;
	            }else{
	                this.csp.pushChoice("Upper half {0} to {1}", [this.name, this.value().upperHalf()]);
	                this.narrowTo(this.value().upperHalf(), fail);
	                yield false;

	                this.csp.pushChoice("Lower half {0} to {1}", [this.name, this.value().lowerHalf()]);
	                this.narrowTo(this.value().lowerHalf(), fail);
	                yield false;
	            }

	            return false; //We're done trying to narrow this particular variable,
	                            // and just need to return something.
	        },

	        /**
	         * check to see if this floating variable references a single number
	         * @return {boolean} true if this floating variable is unique, false if otherwise.
	         */
	        isUnique : function(){
	            return this.value().isUnique();
	        },

	        /**
	         * Get the unique value pointed to by this floating variable.
	         * After we've gotten a new solution to a CSP, this will be the value
	         * that statisfies the CSP.
	         * @return {Number} The unique value of this floating point
	         *                      variable
	         */
	        uniqueValue : function(){
	          return this.canonicalVariable().value().uniqueValue();
	        }
	    });

	    //now time to put in all the 'static' parts of being a float variable.
	    // These are utility methods and ways to add in constraints that use
	    // floating point variables

	    /**
	     * Check the type of the parameters and convert Numbers to FloatVariable
	     * constants.
	     * This function throws an error if provided with two Numbers, as there is
	     * no CSP reference for it to use to promote them to FloatVariables
	     * @param {FloatVariable or Number} a first parameter to check
	     * @param {FloatVariable or Number} b second parameter to check
	     * @return {Object}                   an object containing two properties,
	     *                                    a and b, which contain the sanitized
	     *                                    versions of the input params.
	     */
	    function checkParams(a, b){
	      var sanitizedParams = {};
	      if(typeof(a) == "number"){
	        //a is a Number
	        if(typeof(b) == "number"){
	          //both params are JS numbers-- in this case, we don't have a CSP reference, and can't do much of anything.
	          throw "Two plain javascript numbers we passed to a craft multiply function!";
	        }else if(b.csp !== undefined){
	          //first param is a JS number, the second is a variable.
	          sanitizedParams.a = FloatVariable.makeFloatConstant(a.toString(), b.csp, a);
	          sanitizedParams.b = b;
	        }else{
	          throw "Unable to get a valid type on second argument!";
	        }
	      }else if(a.csp !== undefined){
	        //TODO: not the best way to check if a is a Craft variable, but it does fit the JS way
	        if(typeof(b) == "number"){
	          //first param is a variable, second is a JS Number
	          sanitizedParams.a = a;
	          sanitizedParams.b = FloatVariable.makeFloatConstant(b.toString(), a.csp, b);

	        }else if(b.csp !== undefined){
	          sanitizedParams.a = a;
	          sanitizedParams.b = b;
	        }else{
	          throw "Unable to get valid type on second argument!";
	        }
	      }else{
	        throw "Unable to get valid type on first argument!";
	      }

	      return sanitizedParams;
	    }

	    /**
	     * Internal logic for addition.  Seperating this from the interface.
	     * Adds a new constraint to the CSP.
	     * @param  {FloatVariable} a First operand of addition
	     * @param  {FloatVariable} b Second operand of addition
	     * @return {FloatVariable}   the sum of a and b.
	     */
	    function internalAdd(a, b){
	      var funct = function(){
	          var sum = new FloatVariable("sum", a.csp, Interval.add(a.value(), b.value()));
	          new SumConstraint(sum, a, b);
	          return sum;
	      };
	      return a.csp.memorize("+", funct, [a, b]);
	    }
	    /**
	     * Add two floating point variables together (a + b). Error thrown if both
	     * a and b are of type Number.
	     * @param {FloatVariable or Number} a First operand of addition
	     * @param {FloatVariable or Number} b Second operand of addition
	     * @return {FloatVariable}      the sum of a and b.  This is a set of bounds that
	     *                                  a + b must be in
	     */
	    function add(a, b){
	      var sanitizedParams = checkParams(a, b);
	      return internalAdd(sanitizedParams.a, sanitizedParams.b);
	    }
	    FloatVariable.add = add;

	    /**
	     * Handles the internal logic of subtraction to seperate it from an interface.
	     * Adds a new constraint to the CSP
	     * @param  {floatVariable} a First operand of subtraction
	     * @param  {floatVariable} b Second operand of subtraction
	     * @return {floatVariable}   the difference of a from b.
	     */
	    function internalSubtract(a, b){
	      var funct = function(){
	          var difference = new FloatVariable("difference", a.csp, Interval.subtract(a.value(), b.value()));
	          new DifferenceConstraint(difference, a, b);
	          return difference;
	      };
	      return a.csp.memorize("-", funct, [a, b]);
	    }
	    /**
	     * Subtract two floating point variables together (a - b). Error thrown if
	     * both a and b are of type Number.
	     * @param  {FloatVariable or Number} a First operand to subtraction
	     * @param  {FloatVariable or Number} b Second operand to subtraction
	     * @return {FloatVariable}   the difference of a from b.  This is a set of bounds that
	     *                               a - b must be in
	     */
	    function subtract(a, b){
	      var sanitizedParams = checkParams(a, b);
	      return internalSubtract(sanitizedParams.a, sanitizedParams.b);
	    }
	    FloatVariable.subtract = subtract;

	    /**
	     * Internal logic for multiplcation.  This is wrapped by the multiply function
	     * in the API
	     * @param  {FloatVariable} a First operand in multiplcation
	     * @param  {FloatVariable} b Second operand in multiplcation
	     * @return {FloatVariable}   a variable that holds the result of a * b
	     */
	    function internalMultiply(a, b){
	      var funct = function(){
	        var product = new FloatVariable("product", a.csp, Interval.multiply(a.value(), b.value()));
	        new ProductConstraint(product, a, b);
	        return product;
	      };
	      return a.csp.memorize("*", funct, [a, b]);
	    }
	    /**
	     * Multiply two floating point variables together (a * b). Both operands
	     * can not be numbers, as then Craftjs has no CSP to associate
	     * with the op.
	     * @param  {FloatVariable or Number} a First operand to multipulcation
	     * @param  {FloatVariable or Number} b Second operand to multipulcaiton
	     * @return {FloatVariable}   the product of a and b.  This is the set of bounds that
	     *                               a * b must be in
	     */
	    function multiply(a, b){
	      var sanitizedParams = checkParams(a, b);
	      return internalMultiply(sanitizedParams.a, sanitizedParams.b);
	    }
	    FloatVariable.multiply = multiply;

	    /**
	     * Internal logic for division.  This is wrapped by the divide function in
	     * the interface.  This also adds a constraint to the CSP.
	     * @param  {floatVariable} a first operand in division
	     * @param  {floatVariable} b second operand in division
	     * @return {floatVariable}   a variable that holds the result of a / b.
	     */
	    function internalDivide(a, b){
	      var funct = function(){
	          var quotient = new FloatVariable("quotient", a.csp, Interval.divide(a.value(), b.value()));
	          new QuotientConstraint(quotient, a, b);
	          return quotient;
	      };
	      return a.csp.memorize("/", funct, [a, b]);
	    }
	    /**
	     * Divide two floating point variables (a / b).  Error thrown if both a and b
	     * are of type Number.
	     * @param  {FloatVariable or Number} a the first operand for division
	     * @param  {FloatVariable or Number} b second operand for division
	     * @return {FloatVariable}   the quotient of a / b.  This is the set of bounds that
	     *                               a / b must be in.
	     */
	    function divide(a, b){
	        var sanitizedParams = checkParams(a, b);
	        return internalDivide(sanitizedParams.a, sanitizedParams.b);
	    }
	    FloatVariable.divide = divide;

	    /**
	     * Raise a floating point variable to a power (a ^ exponent).  This also adds a
	     * constraint to the CSP.
	     * @param  {FloatVariable} a The base of the pow equation.
	     * @param  {Number} exponent The exponent of the pow
	     * @return {FloatVariable}   The result of a ^ exponent.  This is the set of bounds that
	     *                                      a ^ exponent must be in.
	     */
	    function pow(a, exponent){
	        var funct = function(){
	            var power = new FloatVariable("power", a.csp, Interval.pow(a.value(), exponent));
	            new PowerConstraint(power, a, exponent);
	            return power;
	        };
	        return a.csp.memorize("^", funct, [a, exponent]);
	    }
	    FloatVariable.pow = pow;

	    //append static constructors.
	    FloatVariable.makeInfinateFloatVariable = makeInfinateFloatVariable;
	    FloatVariable.makeFloatVariableWithBounds =  makeFloatVariableWithBounds;
	    FloatVariable.makeFloatConstant = makeFloatConstant;

	    return FloatVariable;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Implementation of the variable class in JavaScript from Craft
	 *
	 * This is gonna be kinda gnarly, because of how abstract this is in Craft.
	 */

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(8)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance, Restorable){

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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	*implementation of a Restorable.  Whatever that is.
	*/

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance){
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
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Internal implementation of an Interval in Craftjs.
	 * For Craftjs, this is the base level data type-- everything is an interval.
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(10), __webpack_require__(11), __webpack_require__(1)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance, SearchHint, MathUtil, CSP){'use strict';
		var Interval = Class.extend({
			/**
			 * Create a new Interval given a lower and upper bound.  Inteval is
			 * [lower, upper]
			 * @param  {Number} lowerBound lower bound on the interval
			 * @param  {Number} upperBound upper bound on the interval
			 * @return {Interval}            A new Craftjs interval such that [lower, upper]
			 */
			init : function(lowerBound, upperBound){

				if(Number.isNaN(lowerBound)){
					throw "Interval lower bound is not a number";
				}else if(Number.isNaN(upperBound)){
					throw "Interval upper bound is not a number";
				}else if(lowerBound === Number.POSITIVE_INFINITY){
					throw "Interval lower bound cannot be positive infinity";
				}else if(upperBound === Number.NEGATIVE_INFINITY){
					throw "Interval upper bound cannot be negative infinity";
				}

				this.lower = lowerBound;
				this.upper = upperBound;
				this.kind = "FloatingInterval";

				//conditional compilation is not a thing for Javascript, so we do all of it all the time
				this.searchHint = SearchHint.none;
			},

			/**
			 * Check to see if the the interval is a unique value (i.e. the upper and lower bounds are the same thing)
			 */
			isUnique : function(){
				return this.upper == this.lower;
			},

			/**
			 * Get a unique value based on the upper and lower bounds
			 */
			uniqueValue : function(){
				if(!this.unique){
					return this.midpoint();
				}
			},

			/**
			 * Invalid intervals (lower > upper) are considered 'empty', and a way to have
			 * a null interval.
			 */
			empty : function(){
				return this.lower > this.upper;
			},

			/**
			 * Check to see if a value is in this interval
			 * @param  {Number} value does the interval contain this number?
			 * @return {Boolean}       true if value lies in this interval.  False if otherwise.
			 */
			contains : function(value){
				if (value instanceof Interval){
					return this.lower <= value.lower && value.upper <= this.upper;
				}else{
					return this.lower <= value && value <= this.upper;
				}
			},

			/**
			 * Check to see if this interval contains 0
			 * @return {Boolean} true if 0 is in this interval, false if otherwise
			 */
			containsZero : function(){
				return this.lower <= 0 && 0 <= this.upper;
			},

			/**
			 * Check to see if the interval crosses zero.
			 * 		(lower < 0 && upper > 0)
			 * @return {Boolean} true if the interval crosses zero, false if otherwise
			 */
			crossesZero : function(){
				return this.lower < 0 && this.upper > 0;
			},

			/**
			 * Check that this interval is positive, ie, lower and upper are  >= 0
			 * @return {Boolean} true if interval is positive, false if otherwise
			 */
			nonNegative : function(){
				return this.lower >= 0;
			},

			nonPositive : function(){
				return this.upper <= 0;
			},

			strictlyNegative : function(){
				return this.upper < 0;
			},

			strictlyPositive : function(){
				return this.lower > 0;
			},

			isZero : function(){
				//FIXME: there was weirdness here in the C# code.  Should probably investigate
				return this.lower === 0 && this.upper === 0;
			},

			nearlyContains : function(i, epsilon){
				//TODO type check i (Interval), epsilon (double)
				return MathUtil.nearlyLE(this.lower, i.lower, epsilon) && MathUtil.nearlyGE(this.upper, i.upper, epsilon);
			},

			randomElement : function(){
				var realLower = this.practicalLower();
	            var range = (this.practicalUpper() - realLower);
	            //TODO: assert not NaN and not positive infinity

	            var randomElement = realLower + (Math.random() * range);
	            //TODO: assert not positive infinity and not negative infinity

	            return randomElement;
			},

			width : function(){
				return this.upper - this.lower;
			},

			abs : function(){
				return Math.max(Math.abs(this.lower), Math.abs(this.upper));
			},

			//TODO: did not implement this privately.  There is a way to do that within Require and Inheritance, but meeeehhhh.
			practicalUpper :  function(){
				return Math.min(this.upper, Interval.maxPracticalDouble);
			},

			//TODO: did not implement this privately.  There is a way to do that within Require and Inheritance, but meeeehhhh.
			practicalLower : function(){
				return Math.max(this.lower, Interval.minPracticalDouble);
			},

			midpoint : function(){
				return (this.practicalLower() + this.practicalUpper()) * 0.5; //Javascript don't give no fucks about floats or not floats.  It's all a number
			},

			//TODO: now I'm in the point where functions should return more intervals, and I'm not so sure how Javascript can handle that.
			//		I'll need to play around in a fiddle or make a test project or something

			upperHalf : function(){
				return new Interval(this.midpoint(), this.upper);
			},

			lowerHalf : function(){
				return new Interval(this.lower, this.midpoint());
			},

			reciprocal : function(){
				return new Interval(1 / this.upper, 1 / this.lower);
			},

			square : function(){
				var lowerSq = this.lower * this.lower;
				var upperSq = this.upper * this.upper;

				if(this.crossesZero()){
					return new Interval(0, Math.max(lowerSq, upperSq));
				}else if(this.upper <= 0){
					return new Interval(upperSq, lowerSq);
				}else{
					return new Interval(lowerSq, upperSq);
				}
			},

			equals : function(a){
				//FIXME: this is a terrible way of doing this
				if((typeof a) == (typeof this)){
					return this.lower == a.lower && this.upper == a.upper;
				}else{
					return false;
				}
			},

			//TODO: I don't think this is a thing in Javascript.  Maybe go look it up
			getHashCode : function(){

			},

			toString : function(){
				if(this.empty()){
					return "Empty";
				}else{
					//there is a part of this that looks weird and I don't get it.  If I feel like my strings suck, go check out the Craft
					//implementation again
					return "[" + this.lower + ", " + this.upper + "]";
				}
			},

			nearlyUnique : function(){
				return !this.empty() && MathUtil.nearlyEqual(this.lower, this.upper, MathUtil.defaultEpsilon);
			}
		});
		//static constants
		Interval.allValues = new Interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
		Interval.maxPracticalDouble = Number.MAX_VALUE * 0.5;
		Interval.minPracticalDouble = -Number.MAX_VALUE * 0.5; //javascript is weird

		//special constructors
		function fromUnsortedBounds(a, b){
			 if (a > b){
	         	return new Interval(b, a);
	         }else{
	            return new Interval(a, b);
	         }

		}
		Interval.fromUnsortedBounds = fromUnsortedBounds;

		function singleton(a){
			//TODO: add type checking that a is a Number
			return new Interval(a, a);
		}
		Interval.singleton = singleton;

		// static methods
		function propagatePositiveInfinity(x, otherwise){
	    	if(x == Number.POSITIVE_INFINITY){
	    		return Number.POSITIVE_INFINITY;
	    	}else{
	    		return otherwise;
	    	}
	    }
	    Interval.proagatePositiveInfinity = propagatePositiveInfinity;

	    function propagateNegativeInfinity(x, otherwise){
	    	if(x == Number.NEGATIVE_INFINITY){
	    		return Number.NEGATIVE_INFINITY;
	    	}else{
	    		return otherwise;
	    	}
	    }
		Interval.propagateNegativeInfinity = propagateNegativeInfinity;

		function intersection (a, b ){
			return new Interval(Math.max(a.lower, b.lower), Math.min(a.upper, b.upper));
		}
		Interval.intersection = intersection;

		function unionBound (a, b){
			if (a.empty()){
	        	return b;
	        }

	        if (b.empty()){
	        	return a;
	       }

	       return new Interval(Math.min(a.lower, b.lower), Math.max(a.upper, b.upper));

		}
		Interval.unionBound = unionBound;

		function unionOfIntersections(intersector, a, b){
			return unionBound(intersection(intersector, a), intersection(intersector, b));
		}
		Interval.unionOfIntersections = unionOfIntersections;

		//because this is a javascript implementation, we can't redefine operators like Craft can.  Interval.maththing is the syntax to get at that
		function add(a, b ){
			//TODO: type check on intersector, a and b (interval)
			return new Interval(a.lower + b.lower, a.upper + b.upper);
		}
		Interval.add = add;

		function subtract(a, b){
			//TODO: type check on intersector, a and b (interval)
			return new Interval(
	        	propagateNegativeInfinity(a.lower, a.lower - b.upper),
	            propagatePositiveInfinity(a.upper, a.upper - b.lower));
		}
		Interval.subtract = subtract;

		/**
		 * Additive Inverse of A
	 	 * @param {Interval} a
		 */
		function invert(a){
			//TODO: type check on a (interval)
			return new Interval(-a.lower, -a.upper);
		}
		Interval.invert = invert;

		function multiply(a, b){
			//TODO: type check on intersector, a and b (interval)
			return new Interval(
	               	MathUtil.min(a.lower * b.lower, a.upper * b.upper, a.lower * b.upper, a.upper * b.lower),
	                MathUtil.max(a.lower * b.lower, a.upper * b.upper, a.lower * b.upper, a.upper * b.lower));
		}
		Interval.multiply = multiply;

		/**
		 * this is Interval * K
	 	 * @param {Interval} a the interval to multiply by K
	 	 * @param {Object} k constant to multiply to a
		 */
		function multiplyIntervalByConstant(a, k){
			 return new Interval(
	                Math.min(a.lower * k, a.upper * k),
	                Math.max(a.lower * k, a.upper * k));
		}
		Interval.multiplyIntervalByConstant = multiplyIntervalByConstant;
		/**
		 * This is pretty much the same as multiplyIntervalByConstant
	 	 * @param {Object} k
	 	 * @param {Object} a
		 */
		function multiplyConstantByInterval(k, a){
			return multiplyIntervalByConsant(a,k);
		}
		Interval.multiplyConstantByInterval = multiplyConstantByInterval;
		/**
		 * Divide by two Intervals, such that a / b
	 	 * @param {Interval} a operand?
	 	 * @param {Interval} b dividend?
		 */
		function divide(a, b){
			//TODO: type check on intersector, a and b (interval)
			//ReShaper comments here, which may mean I need to do something....
			if(b.lower === 0){
				if(b.upper === 0){
					return Interval.allValues;
				}else{
					return new Interval(Math.min(a.upper / b.upper, a.lower / b.upper), Number.POSITIVE_INFINITY);
				}
			}else if(b.upper === 0){
				//ReShaper comment here
				 return new Interval(Number.NEGATIVE_INFINITY, Math.max(a.lower / b.lower, a.upper / b.lower));
			}else if(b.contains(0)){
				return Interval.allValues;
			}else{
				return new Interval(
	                MathUtil.min(a.lower / b.lower, a.upper / b.upper, a.lower / b.upper, a.upper / b.lower),
	                MathUtil.max(a.lower / b.lower, a.upper / b.upper, a.lower / b.upper, a.upper / b.lower));
			}
		}
		Interval.divide = divide;

		function pow(a, exponent){
			//TODO: type check on intersector, a (interval) and b (integer... this is actually important)
			switch(exponent){
				case 0:
					return new Interval(1,1);
				case 1:
					return a;
				default:
					if(exponent % 2 === 0){
						//even exponent
						if(a.lower >= 0){
							return new Interval(Math.pow(a.lower, exponent), Math.pow(a.upper, exponent));
						}else if(a.upper < 0){
							return new Interval(Math.pow(a.upper, exponent), Math.pow(a.lower, exponent));
						}else{
							return new Interval(
	                            0,
	                            Math.max(Math.pow(a.upper, exponent), Math.pow(a.lower, exponent))
	                            );
						}
					}else{
						//odd exponent
						return new Interval(Math.pow(a.lower, exponent), Math.pow(a.upper, exponent));
					}
				break;
			}
		}
		Interval.pow = pow;

		function invPower(a, exponent){
			//TODO: type check on intersector, a (interval) and b (integer... this is actually important)
			if(exponent == 1){
				return a;
			}else{
				if (exponent % 2 === 0){
	                // even exponent
	                var lower = MathUtil.nthroot(Math.max(0, a.lower), exponent);
	                var upper = MathUtil.nthroot(Math.max(0, a.upper), exponent);
	                return new Interval(lower, upper);
	            }else{
	            	// odd exponent
	            	return new Interval(MathUtil.nthroot(a.lower, exponent), MathUtil.nthroot(a.upper, exponent));
	            }

			}
		}
		Interval.invPower = invPower;

		function positiveSqrt(a){
			if(a.lower <= 0){
				throw "Attempt to take square root of a negative interval.";
			}
			return new Interval(Math.sqrt(a.lower), Math.sqrt(a.upper));
		}
		Interval.positiveSqrt = positiveSqrt;

		//A little awkward, but Interval.equals is eaten in the class definition :(
		function equalOp(a, b){
			//reshaper comments
			return a.lower == b.lower && a.upper == b.upper;
		}
		Interval.equalOp = equalOp;

		function notEqualOp(a, b){
			//reshaper comments
			return a.lower != b.lower || a.upper != b.upper;
		}
		Interval.notEqualOp = notEqualOp;

		return Interval;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Pulled from Craft, but not currently used in Craftjs
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){
	    
	  var SearchHint = {
	    none : 0,
	    noGuess : null
	  };

	  return SearchHint;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Javascript implementation of the MathUtil class from Craft
	 * Added in several other helper functions.
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){
		var MathUtil = {
			defaultEpsilon : 0.000001,

			nearlyEqual : function(a,b,epsilon){
				if(epsilon !== undefined){
					// Cribbed from http://doubleing-point-gui.de/errors/comparison/
					//this comment cribbed from Ian's comment
	            	var absA = Math.abs(a);
	            	var absB = Math.abs(b);
	            	var diff = Math.abs(a - b);

					// reshaper comment here in source
	           		if (a == b){
	                	// shortcut, handles infinities
	                	return true;
	                }else if (a === 0 || b === 0 || diff < Number.EPSILON){
	                	// a or b is zero or both are extremely close to it
	                	// relative error is less meaningful here
	                	return diff < epsilon; // (epsilon * double.Epsilon);
	                }else{
	            		// use relative error
	            		return diff / (absA + absB) < epsilon;
	            	}
					// reshaper comment here

				}else{
					return MathUtil.nearlyEqual(a, b, MathUtil.defaultEpsilon);
				}
			},

			nearlyLE : function(a, b, epsilon){
	            if (a <= b){  // Fastpath + < test
	                return true;
	            }else{
	            	return MathUtil.nearlyEqual(a, b, epsilon);
	            }
	        },

	        nearlyGE : function(a, b, epsilon){
	            if (a >= b){  // Fastpath + < test
	                return true;
	            }else{
	            	return MathUtil.nearlyEqual(a, b, epsilon);
	            }
	        },

			/**
			 * Function to take an n-th root of a number.  Correctly does
			 * negative numbers to odd roots.
			 * Note: there is no negative even power check, so if you try to take
			 * the square root of a negative number, behavour is undefined.
			 * From:
			 * http://stackoverflow.com/questions/12810765/calculating-cubic-root-for-negative-number
			 * @param  {Number} x number to take the nth root of
			 * @param  {Number} n amount of root to take (radicand?)
			 * @return {Number}   the nth root of X as a number.
			 */
			nthroot : function(x, n) {
	  			try {
	    			var negate = n % 2 == 1 && x < 0;
	    			if(negate){
	      				x = -x;
					}
	    			var possible = Math.pow(x, 1 / n);
	    			n = Math.pow(possible, n);
	    			if(Math.abs(x - n) < 1 && (x > 0 == n > 0)){
	      				return negate ? -possible : possible;
					}
	  			} catch(e){}
			},

		    /**
		     * 4 way min function.  Returns the min of all the arguments.
		     * @param  {Number} a First number to take a minimum of
		     * @param  {Number} b Second number to take a minimum of
		     * @param  {Number} c Third number to take a minimum of
		     * @param  {Number} d Fourth number to take a minimum of
		     * @return {Number}   The minimum of a,b,c,d.
		     */
			min : function(a, b, c, d){
				return Math.min(Math.min(a, b), Math.min(c, d));
			},

			/**
			 * 4 way max function.  Returns the max of all the arguments.
			 * @param  {Number} a First number to take a maximum of
			 * @param  {Number} b Second number to take a maximum of
			 * @param  {Number} c Third number to take a maximum of
			 * @param  {Number} d Fourth number to take a maximum of
			 * @return {Number}   The maximum of a,b,c,d.
			 */
			max : function(a, b, c, d){
				return Math.max(Math.max(a, b), Math.max(c, d));
			}
		};

		return MathUtil;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	*Scalar constraints for the CSP
	*/
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(13), __webpack_require__(9), __webpack_require__(11)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance, Constraint, Interval, MathUtil){
	    var constraints = {};
	    var SumConstraint = Constraint.extend({
	        init : function(sum, a, b){
	            this._super(sum.csp);
	            this.sum = sum;
	            this.a = a;
	            this.b = b;
	        },

	        canonicalizeVariables : function(){
	            sum = this.registerCanonical(this.sum);
	            a = this.registerCanonical(this.a);
	            b = this.registerCanonical(this.b);
	        },

	        propagate : function(fail){
	            if(this.narrowedVariable != this.sum){
	                this.sum.narrowTo(Interval.add(this.a.value(), this.b.value()), fail);
	                if(fail[0]){
	                    return;
	                }
	            }

	            if(this.narrowedVariable != this.a){
	                this.a.narrowTo(Interval.subtract(this.sum.value(), this.b.value()), fail);
	                if(fail[0]){
	                    return;
	                }
	            }

	            if(this.narrowedVariable != this.b){
	                this.b.narrowTo(Interval.subtract(this.sum.value(), this.a.value()), fail);
	            }
	        },

	        toString : function(){
	            return "{" + this.sum.name + "}={" + this.a.name + "}+{" + this.b.name + "}";
	        }
	    });
	    constraints.SumConstraint = SumConstraint;

	    var DifferenceConstraint = Constraint.extend({
	        init : function(difference, a, b){
	            this._super(difference.csp);
	            this.difference = difference;
	            this.a = a;
	            this.b = b;
	        },

	        canonicalizeVariables : function(){
	            this.difference = this.registerCanonical(this.difference);
	            this.a = this.registerCanonical(this.a);
	            this.b = this.registerCanonical(this.b);
	        },

	        propagate : function(fail){
	            if(this.narrowedVariable != this.difference){
	                this.difference.narrowTo(Interval.subtract(this.a.value(), this.b.value()), fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.a){
	                this.a.narrowTo(Interval.add(this.difference.value(), this.b.value()), fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.b){
	                this.b.narrowTo(Interval.subtract(this.a.value(), this.difference.value()), fail);
	            }
	        },

	        toString : function(){
	            return "{" + this.difference.name + "}={" + this.a.name + "}-{" + this.b.name +"}";
	        }
	    });
	    constraints.DifferenceConstraint = DifferenceConstraint;

	    var ProductConstraint = Constraint.extend({
	        init : function(product, a, b){
	            this._super(product.csp);
	            this.product = product;
	            this.a = a;
	            this.b = b;
	        },

	        canonicalizeVariables : function(){
	            this.product = this.registerCanonical(this.product);
	            this.a = this.registerCanonical(this.a);
	            this.b = this.registerCanonical(this.b);
	        },

	        propagate : function(fail){
	            if(this.narrowedVariable != this.product){
	                this.product.narrowTo(Interval.multiply(this.a.value(), this.b.value()), fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.a){
	                this.a.narrowToQuotient(this.product.value(), this.b.value(), fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.b){
	                this.b.narrowToQuotient(this.product.value(), this.a.value(), fail);
	            }
	        },

	        toString : function(){
	            return "{" + this.product.name + "}={" + this.a.name + "}*{"+ this.b.name + "}";
	        }
	    });
	    constraints.ProductConstraint = ProductConstraint;

	    /*
	    var ConstantProductConstraint = Constraint.extend({
	        init : function(product, a, k){
	            this._super(product.csp);
	            this.product = product;
	            this.a = a;
	            this.k = k;
	        },

	        canonicalizeVariables : function(){
	            this.product = this.registerCanonical(this.product);
	            this.a = this.registerCanonical(this.a);
	        },

	        propagate : function(fail){
	            if(this.narrowedVariable != this.product){
	                this.product.narrowTo(Interval.multiplyIntervalByConstant(this.a.value(), this.k), fail);
	                if(fail[0]){ return; }
	            }
	            if(this.narrowedVariable != this.a){
	                //when k is 0, 1/k doesn't work (it becomes infinity).
	                //In the limit, inf * 0 = 0, and even then the nearest real
	                //number to inf * 0 = 0.
	                //So, under practical cases, we've already narrowed the product to 0 at this point,
	                //the value of a doesn't matter.
	                //... still waiting for the bug that I'm sure this introduced to rear its head
	                if(this.k !== 0){
	                    this.a.narrowTo(Interval.multiplyIntervalByConstant(this.product.value(), (1 / this.k)), fail);
	                }
	            }
	        },

	        toString : function(){
	            return "{"+ this.product.name +"}={" + this.a.name + "}*{" + this.k + "}";
	        }
	    });
	    constraints.ConstantProductConstraint = ConstantProductConstraint;
	    */

	    var QuoitentConstraint = Constraint.extend({
	        init : function(quotient, a, b){
	            this._super(quotient.csp);
	            this.quotient = quotient;
	            this.a = a;
	            this.b = b;
	        },

	        canonicalizeVariables : function(){
	            this.quotient = this.registerCanonical(this.quotient);
	            this.a = this.registerCanonical(this.a);
	            this.b = this.registerCanonical(this.b);
	        },

	        propagate : function(fail){
	            if(this.narrowedVariable != this.quotient){
	                this.quotient.narrowToQuotient(this.a.value(), this.b.value(), fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.a){
	                this.a.narrowTo(Interval.multiply(this.quotient.value(), this.b.value()), fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.b){
	                this.b.narrowToQuotient(this.a.value(), this.quotient.value(), fail);
	                if(fail[0]){ return; }
	            }
	        },

	        toString : function(){
	            return "{" + this.quotient.name + "}={"+ this.a.name +"}/{" + this.b.name + "}";
	        }
	    });
	    constraints.QuotientConstraint = QuoitentConstraint;

	    var PowerConstraint = Constraint.extend({
	        init : function(power, a, exponent){
	            this._super(power.csp);
	            this.power = power;
	            this.a = a;
	            this.exponent = exponent;
	        },

	        canonicalizeVariables : function(){
	            this.power = this.registerCanonical(this.power);
	            this.a = this.registerCanonical(this.a);
	        },

	        propagate : function(fail){
	            if(this.narrowedVariable != this.power){
	                this.power.narrowTo(Interval.pow(this.a.value(), this.exponent), fail);
	                if(fail[0]){ return; }
	            }

	            //We want to repropagate in case this is an even power and we just split on a
	            if((this.exponent % 2 === 0) && this.a.value().lower < 0){
	                if (this.a.value().upper <= 0){
	                    //a is non-positive
	                    this.a.narrowTo(Interval.invert(Interval.invPower(this.power.value(), this.exponent)), fail);
	                }else{
	                    // even inverse power of an interval that crosses zero
	                    var bound = Interval.invPower(this.power.value(), this.exponent).upper;
	                    this.a.narrowTo(new Interval(-bound, bound), fail);
	                }
	            }else{
	                //a is already non-negative or exponent is odd (and so function is monotone)
	                this.a.narrowTo(Interval.invPower(this.power.value(), this.exponent), fail);
	            }
	        },

	        toString : function(){
	            return "{" + this.power.name + "}={" + this.a.name + "}^{" + this.exponent + "}";
	        }
	    });
	    constraints.PowerConstraint = PowerConstraint;

	    return constraints;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	* Module defines a base class for a constraint on the solver.
	*/
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(1), __webpack_require__(7)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance, CSP, Variable){
	    var Constraint = Class.extend({
	        /**
	         * Constructor for the constraint class
	         * @param  {CSP} p Constraint satisfaction problem this constraint is a part of
	         * @return {Constraint}   A new constraint to use for a CSP
	         */
	        init : function(p){
	            this.csp = p;
	            this.csp.constraints.push(this);
	            this.queued = false;
	            this.narrowedVariable = null;
	        },

	        /**
	         * Put this constraint in the CSP's propigation queue, if this variable is
	         * not currently being propigated.  When propigating a constraint, we also set
	         * which variable has been recently narrowed to check this constraint again.
	         *
	         * @param  {Variable} narrowedVariable the recently narrowed variable to cause
	         *                                     a need to check CSP constriants
	         */
	        queuePropigation : function(narrowedVariable){
	            if(this.csp.currentlyPropagating(this)){
	                return;
	            }else{
	                console.log("Queue " + this);
	            }

	            if(this.queued){
	                this.narrowedVariable = null;
	            }else{
	                this.narrowedVariable = narrowedVariable;
	                this.csp.queueConstraint(this);
	            }
	        },

	        /**
	         * Register this constraint with the canonical form of a variable.
	         * @param  {Variable} variable The variable to register with
	         * @return {Variable}          The canonical form of the variable with
	         *                             This constraint registered to it
	         */
	        registerCanonical : function(variable){
	            var canonical = variable.canonicalVariable();
	            canonical.addConstraint(this);
	            return canonical;
	        }
	    });

	    return Constraint;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//A variable that only works over the integers
	//
	//As of right now, do not mix integer variables and int variables.  bad things'll happen if you do.
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(15), __webpack_require__(6), __webpack_require__(11), __webpack_require__(16)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance, IntegerInterval, FloatVariable, MathUtil, IntegerScalarArithmeticConstraints){
	    //For ease of reference later, split the properties of the IntegerScalarArithmeticConstraints
	    //module.
	    IntSumConstraint = IntegerScalarArithmeticConstraints.SumConstraint;
	    IntDifferenceConstraint = IntegerScalarArithmeticConstraints.DifferenceConstraint;
	    IntProductConstraint = IntegerScalarArithmeticConstraints.ProductConstraint;
	    IntConstantProductConstraint = IntegerScalarArithmeticConstraints.ConstantProductConstraint;
	    IntQuotientConstraint = IntegerScalarArithmeticConstraints.QuotientConstraint;
	    IntPowerConstraint = IntegerScalarArithmeticConstraints.PowerConstraint;

	    /**
	     * 'Static' method for making a int variable with two provided bounds
	     * @param  {String} name  Name of the int variable
	     * @param  {CSP} p     Constraint Satisifaction Problem to associate the
	     *                     the int var with
	     * @param  {Number} lower The lower bound of this int variable
	     * @param  {Number} upper The upper bound of this int variable
	     * @return {IntVariable}       new int variable in range [lower, upper]
	     */
	    var makeIntVariableWithBounds = function(name, p, lower, upper){
	        return new IntVariable(name, p, new IntegerInterval(lower, upper));
	    };

	    /**
	     * Constructor for creating a new integer constant.
	     *
	     @param    {String} name the name the CSP will use to refer to this constant
	     * @param  {CSP} p The constraint satisifaction problem to associate this constant with
	     * @param  {Number} c The value of the constant to create
	     * @return {Variable}   the memorized value for the 'constant' function in the CSP's memo table.
	     *                           which will be a int Variable with the correct bounds.
	     */
	    var makeIntConstant = function(name, p, c){
	        var funct = function(){return makeIntVariableWithBounds(name, p, c, c);};
	        return p.memorize("constant", funct, [c]);
	    };

	    var IntVariable = FloatVariable.extend({
	        /**
	         * Create a new int Varible and register that int variable with a CSP
	         *
	         * @param  {String} name         Name of the int variable
	         * @param  {CSP} p            Constraint satisfaction problem to associate with this int variable
	         * @param  {Interval} initialValue Initial bounds of this int variable
	         * @return {intVariable}              A new int variable to use with the CSP
	         */
	        init : function(name, p, initialValue){
	            this._super(name, p, initialValue);

	            this.startingWidth = 0;
	        },

	        /**
	         * Add a constraint that this int variable must be contained by a particular
	         * interval
	         * Although this function can be used externally, is intended to not be.
	         * This keeps Craftjs from ever having to expose the IntInterval object / class
	         * @param  {Number} i the bounds that this variable must be in ([i.lower(), i.upper()])
	         */
	        mustBeContainedInInterval : function(i){
	            this.csp.assertConfigurationPhase();
	            var intersection = IntegerInterval.intersection(this.value(), i);
	            if(intersection.empty()){
	                throw "Argument out of current range of variable";
	            }
	            this.currentValue.setInitialValue(intersection);
	        },

	        /**
	         * Narrow the range of this int variable to the passed in restriction.
	         * @param  {IntegerInterval} restriction The range to narrow this int variable down to
	         * @param  {[boolean]} fail        pass-by-ref failure bool (will be set to true if we can't narrow)
	         */
	        narrowTo : function(restriction, fail){
	        	if(this.value().isUnique()){
	                if(restriction.nearlyContains(this.value(), MathUtil.defaultEpsilon)){
	                    return;
	                }else{
	                    fail[0] = true;
	                    console.log(this.name + ": " + this.value() + " -> Empty          " + restriction);
	                    return;
	                }
	            }
	            var oldValue = this.value();
	            if(!restriction.contains(this.value())){
	                var newValue = IntegerInterval.intersection(this.value(), restriction);
	                if(newValue.nearlyUnique()){
	                    var mid = newValue.midpoint();
	                    newValue = new IntegerInterval(mid, mid);
	                }
	                console.log(this.name + ": " + oldValue + " -> " + newValue + "         " + restriction +
	                                ", narrowed by " + (100 * (1-newValue.width() /oldValue.width())));

	                if(newValue.empty()){
	                    fail[0] = true;
	                }else{
	                    var propagate = (newValue.width() / this.value().width()) < 0.99;
	                    this.canonicalVariable().currentValue.set(newValue);
	                    if(propagate){
	                        for(var index = 0, len = this.constraints.length; index < len; index++){
	                            this.constraints[index].queuePropigation(this);
	                        }
	                    }
	                }
	            }
	        },

	        /**
	         * Narrow this int var to the union of the intersections of the provided intervals
	         * @param  {IntegerInterval} a    The first interval
	         * @param  {IntegerInterval} b    The second interval
	         * @param  {[boolean]} fail pass-by-ref failure bool (will be set to true if we can't narrow)
	         */
	        narrowToUnion : function(a, b, fail){
	            this.narrowTo(IntegerInterval.unionOfIntersections(this.value(), a, b), fail);
	        },

	        /**
	         * Narrow the current variable down to the quotient of the passed in args.
	         * @param  {IntegerInterval} numerator   Range of the numerator
	         * @param  {IntegerInterval} denominator Range of the denominator
	         * @param  {boolean} fail        pass-by-ref failure bool (will be set to true if we can't narrow)
	         */
	        narrowToQuotient : function(numerator, denominator, fail){
	            if(denominator.isZero()){
	                //Denominator is [0,0], so quotent is the empty set
	                fail[0] = !numerator.containsZero();
	            }else if(numerator.isZero()){
	                if(!denominator.containsZero()){
	                    //Quotent is [0,0].
	                    this.narrowTo(new IntegerInterval(0,0), fail);
	                }
	            }else if(!denominator.containsZero()){
	                //FIXME: potential optimization here. We'll end up looking for divisors
	                //twice (once now to check and once to do integer interval division).
	                //It might be a loss of clarity from the implementing papers
	                //to only search here and take it out of the IntegerInterval class, but it will speed up
	                //division.
	                console.log("Starting integer divisor consistency check, NaN/undefined warnings may ensue ...");
	                var potential = numerator.findDivisors(denominator);
	                console.log("... finished check, NaN/undefined warnings are bad now.");
	                if(potential.lower === undefined || potential.upper === undefined ||
	                    Number.isNaN(potential.lower) || Number.isNaN(potential.upper)){
	                    fail[0] = true;
	                    console.log("Unable to find potential integer quotents for " + numerator + "/" + denominator);
	                    return;
	                }
	                this.narrowTo(IntegerInterval.divide(numerator, denominator), fail);

	            //three cases: crosses zero, [a, 0] and [0, b]
	            //For integer intervals, all of these cases are handled inside of the interval itself.
	          }else if(denominator.lower === 0){
	                //[0,d]
	                this.narrowTo(IntegerInterval.divide(numerator, denominator), fail);
	            }else if(denominator.upper === 0){
	                //[c,0]
	                this.narrowTo(IntegerInterval.divide(numerator, denominator), fail);
	            }else if(numerator.upper < 0){
	                //[c,d] crosses 0, [+a, +b]
	                this.narrowTo(IntegerInterval.divide(numerator, denominator), fail);
	            }else if(numerator.lower > 0){
	                //[c,d] crosses 0, [-a, -b]
	                this.narrowTo(IntegerInterval.divide(numerator, denominator), fail);
	            }
	        },

	        /**
	         * Narrow this int variable to the signed square root of the provided bounds
	         * @param  {Interval} square the range of the square
	         * @param  {[boolean]} fail   pass-by-ref failure bool (will be set to true if we can't narrow)
	         */
	        narrowToSignedSqrt : function(square, fail){
	            console.log("[WARN PROMOTE] Narrowing to a signed sqrt with an IntVariable promotes a result with floating point intervals");
	            return this._super(square, fail);
	        }
	    });

	    //now time to put in all the 'static' parts of being a int variable.
	    // These are utility methods and ways to add in constraints that use
	    // int variables

	    /**
	     * Check the type of the parameters and convert Numbers to IntegerVariable
	     * constants.
	     * This function throws an error if provided with two Numbers, as there is
	     * no CSP reference for it to use to promote them to FloatVariables.
	     * @param {IntegerVariable or Number} a first parameter to check
	     * @param {IntegerVariable or Number} b second parameter to check
	     * @return {Object}                   an object containing two properties,
	     *                                    a and b, which contain the sanitized
	     *                                    versions of the input params.
	     */
	    function checkParams(a, b){
	      var sanitizedParams = {};
	      if(typeof(a) == "number"){
	        //a is a Number
	        if(typeof(b) == "number"){
	          //both params are JS numbers-- in this case, we don't have a CSP reference, and can't do much of anything.
	          throw "Two plain javascript numbers we passed to a craft multiply function!";
	        }else if(b.csp !== undefined){
	          //first param is a JS number, the second is a variable.
	          if(Number.isInteger(a)){
	            sanitizedParams.a = IntVariable.makeIntConstant(a.toString(), b.csp, a);
	            sanitizedParams.b = b;
	          }else{
	            throw "First parameter was not an integer!";
	          }
	        }else{
	          throw "Unable to get a valid type on second argument!";
	        }
	      }else if(a.csp !== undefined){
	        //TODO: not the best way to check if a is a Craft variable, but it does fit the JS way
	        if(typeof(b) == "number"){
	          //first param is a variable, second is a JS Number
	          if(Number.isInteger(b)){
	            sanitizedParams.a = a;
	            sanitizedParams.b = IntVariable.makeIntConstant(b.toString(), a.csp, b);
	          }else{
	            throw "Second parameter was not an integer!"
	          }

	        }else if(b.csp !== undefined){
	          //both arguments are already Craft variable objects
	          sanitizedParams.a = a;
	          sanitizedParams.b = b;
	        }else{
	          throw "Unable to get valid type on second argument!";
	        }
	      }else{
	        throw "Unable to get valid type on first argument!";
	      }

	      return sanitizedParams;
	    }

	    /**
	     * Handles the internal logic of subtraction to seperate it from an interface.
	     * Adds a new constraint to the CSP.
	     * @param  {IntegerVariable} a first operand of addition
	     * @param  {IntegerVariable} b second operand of addition
	     * @return {integerVariable}   the sum of a and b
	     */
	    function internalAdd(a, b){
	      var funct = function(){
	          var sum = new IntVariable("sum", a.csp, IntegerInterval.add(a.value(), b.value()));
	          new IntSumConstraint(sum, a, b);
	          return sum;
	      };
	      return a.csp.memorize("+", funct, [a, b]);
	    }
	    /**
	     * Add two int variables together (a + b). Both operands can not be
	     * numbers, as then Craftjs has no CSP to associate.
	     * @param {intVariable or Number} a First operand of addition
	     * @param {intVariable or Number} b Second operand of addition
	     * @return {intVariable}      the sum of a and b.  This is a set of bounds that
	     *                                  a + b must be in
	     */
	    function add(a, b){
	      var sanitizedParams = checkParams(a, b);
	      return internalAdd(sanitizedParams.a, sanitizedParams.b);
	    }
	    IntVariable.add = add;

	    /**
	     * Handles the internal logic of subtraction to seperate it from an interface.
	     * Adds a new constraint to the CSP
	     * @param  {IntVariable} a First operand of subtraction
	     * @param  {IntVariable} b Second operand of subtraction
	     * @return {IntVariable}   the difference of a from b.
	     */
	    function internalSubtract(a, b){
	      var funct = function(){
	          var difference = new IntVariable("difference", a.csp, IntegerInterval.subtract(a.value(), b.value()));
	          new IntDifferenceConstraint(difference, a, b);
	          return difference;
	      };
	      return a.csp.memorize("-", funct, [a, b]);
	    }
	    /**
	     * Subtract two int variables together (a - b). Both operands can not be
	     * numbers, as then Craftjs has no CSP to associate.
	     * @param  {intVariable or Number} a First operand to subtraction
	     * @param  {intVariable or Number} b Second operand to subtraction
	     * @return {intVariable}   the difference of a from b.  This is a set of bounds that
	     *                               a - b must be in
	     */
	    function subtract(a, b){
	      var sanitizedParams = checkParams(a, b);
	      return internalSubtract(sanitizedParams.a, sanitizedParams.b);
	    }
	    IntVariable.subtract = subtract;

	    /**
	     * Internal logic for multiplcation.  This also adds a new constraint to
	     * the CSP
	     * @param  {IntegerVariable} a First operand in multiplcation
	     * @param  {IntegerVariable} b Second operand in multiplcation
	     * @return {IntegerVariable}   a variable that holds the result of a * b
	     */
	    function internalMultiply(a, b){
	      var funct = function(){
	          var product = new IntVariable("product", a.csp, IntegerInterval.multiply(a.value(), b.value()));
	          new IntProductConstraint(product, a, b);
	          return product;
	      };
	      return a.csp.memorize("*", funct, [a, b]);
	    }
	    /**
	     * Multiply two int variables together (a * b). Both operands can not be
	     * numbers, as then Craftjs has no CSP to associate
	     * @param  {IntegerVariable or Number} a First operand to multipulcation
	     * @param  {IntegerVariable or Number} b Second operand to multipulcaiton
	     * @return {intVariable}   the product of a and b.  This is the set of bounds that
	     *                               a * b must be in
	     */
	    function multiply(a, b){
	      var sanitizedParams = checkParams(a, b);
	      return internalMultiply(sanitizedParams.a, sanitizedParams.b);
	    }
	    IntVariable.multiply = multiply;

	    /**
	     * Internal logic for division.  This is wrapped by the divide function in
	     * the interface.  This also adds a constraint to the CSP.
	     * @param  {IntegerVariable} a first operand in division
	     * @param  {IntegerVariable} b second operand in division
	     * @return {IntegerVariable}   a variable that holds the result of a / b.
	     */
	    function internalDivide(a, b){
	      var funct = function(){
	          var quotient = new IntVariable("quotient", a.csp, IntegerInterval.divide(a.value(), b.value()));
	          new IntQuotientConstraint(quotient, a, b);
	          return quotient;
	      };
	      return a.csp.memorize("/", funct, [a, b]);
	    }
	    /**
	     * Divide two Integer variables (a / b). Both operands can not be
	     * numbers, as then Craftjs has no CSP to associate.
	     * @param  {IntegerVariable or Number} a the first operand for division
	     * @param  {IntegerVariable or Number} b second operand for division
	     * @return {IntegerVariable}   the quotient of a / b.  This is the set of bounds that
	     *                               a / b must be in.
	     */
	    function divide(a, b){
	      var sanitizedParams = checkParams(a, b);
	      return internalDivide(sanitizedParams.a, sanitizedParams.b);
	    }
	    IntVariable.divide = divide;

	    /**
	     * Raise a integer variable to a power (a ^ exponent).  This also adds a
	     * constraint to the CSP.
	     * @param  {IntVariable} a        the base of the pow equation.
	     * @param  {Number} exponent The exponent of the pow
	     * @return {IntVariable}          the result of a ^ exponent.  This is the set of bounds that
	     *                                      a ^ exponent must be in.
	     */
	    function pow(a, exponent){
	        var funct = function(){
	            var power = new IntVariable("power", a.csp, IntegerInterval.pow(a.value(), exponent));
	            new IntPowerConstraint(power, a, exponent);
	            return power;
	        };
	        return a.csp.memorize("^", funct, [a, exponent]);
	    }
	    IntVariable.pow = pow;

	    //append static constructors.
	    IntVariable.makeIntVariableWithBounds =  makeIntVariableWithBounds;
	    IntVariable.makeIntConstant = makeIntConstant;

	    return IntVariable;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//Implementation of a Craft interval for the integers, rather than the
	//reals.
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(10), __webpack_require__(11), __webpack_require__(1), __webpack_require__(9)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance, SearchHint, MathUtil, CSP, Interval){"use strict";
	    var IntegerInterval = Interval.extend({
	        /**
	         * Create a new Interval given a lower and upper bound.  Inteval is
	         * [lower, upper]
	         * @param  {Number} lowerBound lower bound on the interval (floats are floored to ints)
	         * @param  {Number} upperBound upper bound on the interval (floats are floored to ints)
	         * @return {Interval}            A new Craftjs interval such that [lower, upper]
	         */
	        init : function(lowerBound, upperBound){

	            if(Number.isNaN(lowerBound)){
	                throw "Interval lower bound is not a number";
	            }else if(Number.isNaN(upperBound)){
	                throw "Interval upper bound is not a number";
	            }else if(lowerBound === Number.POSITIVE_INFINITY){
	                throw "Interval lower bound cannot be positive infinity";
	            }else if(upperBound === Number.NEGATIVE_INFINITY){
	                throw "Interval upper bound cannot be negative infinity";
	            }

	            //enforce that results here need to be an int.
	            if(!Number.isInteger(lowerBound) || !Number.isInteger(upperBound)){
	                //TODO: Right now, just throw a warning.
	                console.log("[WARN PROMOTE] Calculating the largest containing integer interval for [" + lowerBound + "," + upperBound + "]");
	            }
	            this.lower = Math.floor(lowerBound);
	            this.upper = Math.ceil(upperBound);
	            this.kind = "IntegerInterval";

	            //conditional compilation is not a thing for Javascript, so we do all of it all the time
				this.searchHint = SearchHint.none;
	        },

	        /**
	         * Get a random element in this range, ensuring that this element is
	         * an integer.
	         * @return {Number} A random integer in this range
	         */
	        randomElement : function(){
				var realLower = this.practicalLower();
	            var range = (this.practicalUpper() - realLower);
	            //TODO: assert not NaN and not positive infinity

	            var randomElement = realLower + (Math.random() * range);
	            if(realLower <= Math.floor(randomElement)){
	                //we can safely floor the number
	                randomElement = Math.floor(randomElement);
	            }else if(this.practicalUpper() >= Math.ceil(randomElement)){
	                //we can safely ceil the number
	                randomElement = Math.ceil(randomElement);
	            }else{
	                console.log(this.practicalLower(), this.practicalUpper());
	                throw "Unable to find a random integer in provided range!";

	            }
	            //TODO: assert not positive infinity and not negative infinity

	            return randomElement;
			},

	        /**
	         * get a practical upper bound on this Integer Interval
	         * @return {Number} an Integer that is either this interval's upper bound
	         *                     or a practical replacement
	         */
	        practicalUpper :  function(){
				return Math.min(this.upper, IntegerInterval.maxPracticalInt);
			},

	        /**
	         * get a practical lower bound on this Integer Interval
	         * @return {Number} an Integer that is either this interval's lower bound
	         *                     or a practical replacement
	         */
			practicalLower : function(){
				return Math.max(this.lower, IntegerInterval.minPracticalInt);
			},

	        /**
			 * Get a unique value based on the upper and lower bounds
			 */
			uniqueValue : function(){
				if(!this.unique){
	                var mid = this.midpoint();
	                if(mid >= this.lower){
	                    //safe to floor
	                    return Math.floor(mid);
	                }else if(mid <= this.upper){
	                    //safe to ceil
	                    return Math.ceil(mid);
	                }
				}
			},

	        upperHalf : function(){
	            //if the midpoint is right between two integers (say 2,3 -> midpoint of 2.5)
	            //this won't actually narrow, so we need to check for that case, otherwise
	            //proceed as normal.
	            if(this.width() == 1){
	                return new IntegerInterval(Math.ceil(this.midpoint()), this.upper);
	            }else{
				    return new IntegerInterval(Math.floor(this.midpoint()), this.upper);
	            }
			},

			lowerHalf : function(){
	            //if the midpoint is right between two integers (say 2,3 -> midpoint of 2.5)
	            //this won't actually narrow, so we need to check for that case, otherwise
	            //proceed as normal.
	            if(this.width() == 1){
	                return new IntegerInterval(this.lower, Math.floor(this.midpoint()));
	            }else{
				    return new IntegerInterval(this.lower, Math.ceil(this.midpoint()));
	            }

			},

	        /**
	         * Get the reciprocal of this IntegerInterval.
	         *
	         * WARN: this returns a standard floating point Interval
	         * @return {Interval} the recirpocal of this integer interval
	         */
			reciprocal : function(){
				console.log("[PROMOTE WARN] Reciprocal on an IntegerInterval returns a standard, floating point Interval");
	            return this._super();
			},

	        /**
	         * Get the square of this integer interval.
	         *
	         * @return {Interval} the square of this integer interval
	         */
			square : function(){
				var lowerSq = this.lower * this.lower;
				var upperSq = this.upper * this.upper;

				if(this.crossesZero()){
					return new IntegerInterval(0, Math.max(lowerSq, upperSq));
				}else if(this.upper <= 0){
					return new IntegerInterval(upperSq, lowerSq);
				}else{
					return new IntegerInterval(lowerSq, upperSq);
				}
			},

	        /**
	         * return a new empty integer interval
	         * @return {IntegerInterval} this integer interval such lower > upper
	         */
	        makeEmpty : function(){
	            return new IntegerInterval(this.upper + 1, this.upper);
	        },

	        /**
	         * Search through b for the smallest int that can completely divide a number
	         * in this interval, then search through b for the largest int that can completely
	         * divide a number in this interval.
	         * @param  {IntegerInterval} b interval to search for divisors in.
	         * @return {IntegerInterval}   An integer interval where lower and upper divides
	         * an element in this interval
	         */
	        findDivisors : function(b){
	            var c;
	            var d;
	            //look for the smallest number in b that holds the potential divisor
	            //equality
	            for(var test = b.lower; test <= b.upper; test++){
	                var div = Math.floor(this.upper / test);
	                if(test * div >= this.lower){
	                    c = test;
	                    break;
	                }
	            }

	            // start from the other direction of the interval, look for the largest
	            // number in b that holds the potential divisor equality
	            for(var test = b.upper; test >= b.lower; test--){
	                var div = Math.floor(this.upper / test);
	                if(test * div >= this.lower){
	                    d = test;
	                    break;
	                }
	            }

	            return new IntegerInterval(c, d);
	        }
	    });

	    //TODO: refactor?
	    // A lot of this is going ot be very similar to the stuff in interval.js.  In
	    // addition, some of it is a little weird, for example, infinity is not in the integers.
	    //static constants
		IntegerInterval.allValues = new Interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
		IntegerInterval.maxPracticalInt = Math.floor(Number.MAX_VALUE * 0.5);
		IntegerInterval.minPracticalInt = Math.ceil(-Number.MAX_VALUE * 0.5); //javascript is weird

	    //Special constructors.
		function fromUnsortedBounds(a, b){
			 if (a > b){
	         	return new IntegerInterval(b, a);
	         }else{
	            return new IntegerInterval(a, b);
	         }

		}
		IntegerInterval.fromUnsortedBounds = fromUnsortedBounds;

		function singleton(a){
			//TODO: add type checking that a is an int
			return new IntegerInterval(a, a);
		}
		IntegerInterval.singleton = singleton;

	    // static methods
		function propagatePositiveInfinity(x, otherwise){
	    	if(x == Number.POSITIVE_INFINITY){
	    		return Number.POSITIVE_INFINITY;
	    	}else{
	    		return otherwise;
	    	}
	    }
	    IntegerInterval.proagatePositiveInfinity = propagatePositiveInfinity;

	    function propagateNegativeInfinity(x, otherwise){
	    	if(x == Number.NEGATIVE_INFINITY){
	    		return Number.NEGATIVE_INFINITY;
	    	}else{
	    		return otherwise;
	    	}
	    }
		IntegerInterval.propagateNegativeInfinity = propagateNegativeInfinity;

	    function intersection (a, b){
			return new IntegerInterval(Math.max(a.lower, b.lower), Math.min(a.upper, b.upper));
		}
		IntegerInterval.intersection = intersection;

		function unionBound (a, b){
			if (a.empty()){
	        	return b;
	        }

	        if (b.empty()){
	        	return a;
	       }

	       return new IntegerInterval(Math.min(a.lower, b.lower), Math.max(a.upper, b.upper));

		}
		IntegerInterval.unionBound = unionBound;

		function unionOfIntersections(intersector, a, b){
			return unionBound(intersection(intersector, a), intersection(intersector, b));
		}
	    IntegerInterval.unionOfIntersections = unionOfIntersections;



	    //because this is a javascript implementation, we can't redefine operators like Craft can.  Interval.maththing is the syntax to get at that
	    //TODO: add type checking and promote warnings
	    function add(a, b){
			return new IntegerInterval(a.lower + b.lower, a.upper + b.upper);
		}
		IntegerInterval.add = add;

	    //TODO: add type checking and promote warnings
		function subtract(a, b){
	        // TODO leaving the potential for inf in right now.  Trying to not undo
	        // work that may help writing a mixed method later on.
			return new IntegerInterval(
	        	propagateNegativeInfinity(a.lower, a.lower - b.upper),
	            propagatePositiveInfinity(a.upper, a.upper - b.lower));
		}
		IntegerInterval.subtract = subtract;

		/**
		 * Additive Inverse of A
	 	 * @param {Interval} a
		 */
		function invert(a){
			//TODO: type check on a (interval)
			return new IntegerInterval(-a.lower, -a.upper);
		}
		IntegerInterval.invert = invert;

		function multiply(a, b){
			//TODO: type check and promote warnings on a, b
			return new IntegerInterval(
	               	MathUtil.min(a.lower * b.lower, a.upper * b.upper, a.lower * b.upper, a.upper * b.lower),
	                MathUtil.max(a.lower * b.lower, a.upper * b.upper, a.lower * b.upper, a.upper * b.lower));
		}
		IntegerInterval.multiply = multiply;

		/**
		 * this is Interval * K
	 	 * @param {Interval} a the interval to multiply by K
	 	 * @param {Object} k constant to multiply to a
		 */
		function multiplyIntervalByConstant(a, k){
	        var lower = a.lower * k;
	        var upper = a.upper * k;
	         if(Number.isInteger(k)){
	             return new IntegerInterval(
	                 Math.min(lower, upper),
	                 Math.max(lower, upper));
	         }else{
	             console.log("[PROMOTE WARN] multiplying an IntegerInterval by a non-integer returns an Interval");
	             return new Interval(
	                 Math.min(lower, upper),
	                 Math.max(lower, upper));
	         }
		}
		IntegerInterval.multiplyIntervalByConstant = multiplyIntervalByConstant;
		/**
		 * This is pretty much the same as multiplyIntervalByConstant
	 	 * @param {Number} k
	 	 * @param {IntegerInterval} a
		 */
		function multiplyConstantByInterval(k, a){
			return multiplyIntervalByConsant(a,k);
		}
		IntegerInterval.multiplyConstantByInterval = multiplyConstantByInterval;
		/**
		 * Divide by two Intervals, such that a / b
	 	 * @param {IntegerInterval} a numerator
	 	 * @param {IntegerInterval} b denominator
		 */
		function divide(a, b){
			//Whelp, it turns out we can do division in integer intervals.  This may be
			//the missing piece to suddenly be able to solve these suckers.
			if(a.lower <= 0 && a.upper >= 0){
	            //0 is an element of [b.lower..b.upper]
	            if(b.lower <= 0 && b.upper >=0){
	                //0 is an element of [a.lower..a.upper]
	                return IntegerInterval.allValues;
	            }
	        }

	        //numerator interval does not cross 0.
	        if(a.lower > 0 || a.upper < 0){
	            if(b.lower === 0 && b.upper === 0){
	                //can't divide by 0
	                return a.makeEmpty();
	            }else if(b.lower < 0 && b.upper > 0){
	                //denominator interval crosses 0
	                return new IntegerInterval(-Math.max(Math.abs(a.lower), Math.abs(a.upper)), Math.max(Math.abs(a.lower), Math.abs(a.upper)));
	            }else if(b.lower === 0 && b.upper !== 0){
	                //denominator interval touches 0 ([0, ...])
	                return divide(a, new IntegerInterval(b.lower + 1, b.upper));
	            }else if(b.lower !== 0 && b.upper === 0){
	                //denominator interval touches 0 ([..., 0])
	                return divide(a, new IntegerInterval(b.lower, b.upper - 1));
	            }
	        }

	        //neither interval cross 0.
	        if(b.lower > 0 || b.upper < 0){
	            //the tricky case.  We need to find a b.lower' that divides a and a b.upper' that divides b
	            var fitB = a.findDivisors(b);
	            return new IntegerInterval(
	                Math.ceil(MathUtil.min(a.lower / fitB.lower, a.upper / fitB.upper, a.lower / fitB.upper, a.upper / fitB.lower)),
	                Math.floor(MathUtil.max(a.lower / fitB.lower, a.upper / fitB.upper, a.lower / fitB.upper, a.upper / fitB.lower)));
	        }
		}
		IntegerInterval.divide = divide;

	    /**
	     * Raise an IntegerInterval to a power
	     *
	     * I don't think Craftjs plays nice with fractional exponents, but I'm not sure of that.
	     * @param  {Interval} a        root Interval
	     * @param  {Number} exponent exponent to raise the root interval too
	     * @return {Interval}          the interval raised to the power
	     */
		function pow(a, exponent){
			switch(exponent){
				case 0:
					return new IntegerInterval(1,1); // speedup case
				case 1:
					return a; // speedup case
				default:
	                //more complicated crap
	                if(exponent % 2 !== 0){
	                    //odd exponent
	                    return new IntegerInterval(Math.pow(a.lower, exponent), Math.pow(a.upper, exponent));
	                }else if (exponent % 2 === 0){
	                    //exponent is even
	                    if(a.lower >= 0){
	                        return new IntegerInterval(Math.pow(a.lower, exponent), Math.pow(a.upper, exponent));
	                    }else if(a.upper <= 0){
	                        return new IntegerInterval(Math.pow(a.upper, exponent), Math.pow(a.lower, exponent));
	                    }else if(a.lower < 0 && 0 < a.upper){
	                        return new IntegerInterval(0, Math.max(Math.pow(a.lower, exponent), Math.pow(a.upper, exponent)));
	                    }
	                }
				break;
			}
		}
		IntegerInterval.pow = pow;

	    /**
	     * The int closure on root extraction for intervals.  Lets us do things like n-th roots
	     * @param  {IntegerInterval} a interval to get a n-th root from
	     * @param  {Number (please be an int kthx)} n amount of root to get (2 = square root, 3 = cube root, 1 = you're an asshole)
	     * @return {IntegerInterval}   an integer interval of the appropriate type
	     */
	    function rootExtraction(a, n){
	        switch(n){
	            case 0:
	                return new IntegerInterval(0, 0);
	            case 1:
	                return a;
	            case -1:
	                return invert(a);
	            default:
	                if(n % 2 !== 0){
	                    //n is odd
	                    return new IntegerInterval(Math.ceil(MathUtil.nthroot(a.lower, n)), Math.floor(MathUtil.nthroot(a.upper, n)));
	                }else{
	                    //n is even
	                    if(a.upper < 0){
	                        //the entire interval is negative.  can't take an even root of a negative number without
	                        //going into complexes.
	                        return a.makeEmpty();
	                    }else{
	                        // a.upper is greater than or equal to 0
	                        return new IntegerInterval(
	                            -Math.ceil(Math.abs(MathUtil.nthroot(a.upper, n))),
	                            Math.floor(Math.abs(MathUtil.nthroot(a.upper, n)))
	                        );
	                    }
	                }
	                break;
	        }
	    }
	    IntegerInterval.rootExtraction = rootExtraction;

	    /**
	     * Taking an inverse power is just doing root extraction on that power (sqrt(a) == rootExtraction(a, 2) == invPower(a, 2))
	     * @param  {Interval} a       Interval to take the inverse power of
	     * @param  {Number} exponent Exponent to use for the inverse power op
	     * @return {Interval}          inverse power of a by exp as an integer interval
	     */
		function invPower(a, exponent){
			if(exponent == 1){
				return a;
			}else{
				return rootExtraction(a, exponent);
			}
		}
		IntegerInterval.invPower = invPower;

		function positiveSqrt(a){
			if(a.lower <= 0){
				throw "Attempt to take square root of a negative interval";
			}
			return rootExtraction(a, 2);
		}
		IntegerInterval.positiveSqrt = positiveSqrt;

		//A little awkward, but Interval.equals is eaten in the class definition :(
		function equalOp(a, b){
			//reshaper comments
			return a.lower == b.lower && a.upper == b.upper;
		}
		IntegerInterval.equalOp = equalOp;

		function notEqualOp(a, b){
			//reshaper comments
			return a.lower != b.lower || a.upper != b.upper;
		}
		IntegerInterval.notEqualOp = notEqualOp;
		return IntegerInterval;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * Module defines the constraints for integer scalar arithmetic
	 */
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(2), __webpack_require__(15), __webpack_require__(11), __webpack_require__(12)], __WEBPACK_AMD_DEFINE_RESULT__ = function(Inheritance, IntegerInterval, MathUtil, ScalarArithmeticConstraints){
	    var intConstraints = {};

	    //Difference and Sum constraints are exactly the same regardless of if they
	    //work with integers or reals.
	    var IntSumConstraint = ScalarArithmeticConstraints.SumConstraint.extend({
	        init : function(sum, a, b){
	            this._super(sum, a, b);
	        },

	        canonicalizeVariables : function(){
	            this._super();
	        },

	        propagate : function(fail){
	            if(this.narrowedVariable != this.sum){
	                var constraint = IntegerInterval.add(this.a.value(), this.b.value());
	                this.sum.narrowTo(
	                    new IntegerInterval(
	                        Math.floor(constraint.lower),
	                        Math.ceil(constraint.upper)
	                    ),
	                fail);

	                if(fail[0]){
	                    return;
	                }
	            }

	            if(this.narrowedVariable != this.a){
	                var constraint = IntegerInterval.subtract(this.sum.value(), this.b.value());

	                this.a.narrowTo(
	                    new IntegerInterval(
	                        Math.floor(constraint.lower),
	                        Math.ceil(constraint.upper)
	                    ),
	                fail);

	                if(fail[0]){
	                    return;
	                }
	            }

	            if(this.narrowedVariable != this.b){
	                var constraint = IntegerInterval.subtract(this.sum.value(), this.a.value());
	                this.b.narrowTo(
	                    new IntegerInterval(
	                        Math.floor(constraint.lower),
	                        Math.ceil(constraint.upper)
	                    ),
	                fail);
	            }
	        },
	    });
	    intConstraints.SumConstraint = IntSumConstraint;

	    var IntDifferenceConstraint = ScalarArithmeticConstraints.DifferenceConstraint.extend({
	        init : function(difference, a, b){
	            this._super(difference, a, b);
	        },

	        canonicalizeVariables : function(){
	            this._super();
	        },

	        propagate : function(fail){
	            if(this.narrowedVariable != this.difference){
	                var constraint = IntegerInterval.subtract(this.a.value(), this.b.value());
	                this.difference.narrowTo(
	                    new IntegerInterval(
	                        Math.floor(constraint.lower),
	                        Math.ceil(constraint.upper)
	                    ),
	                fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.a){
	                var constraint = IntegerInterval.add(this.difference.value(), this.b.value());
	                this.a.narrowTo(
	                    new IntegerInterval(
	                        Math.floor(constraint.lower),
	                        Math.ceil(constraint.upper)
	                    ),
	                fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.b){
	                var constraint = IntegerInterval.subtract(this.a.value(), this.difference.value());
	                this.b.narrowTo(
	                    new IntegerInterval(
	                        Math.floor(constraint.lower),
	                        Math.ceil(constraint.upper)
	                    ),
	                fail);
	            }
	        },
	    });
	    intConstraints.DifferenceConstraint = IntDifferenceConstraint;

	    //non-linear constraints, however...
	    var IntProductConstraint = ScalarArithmeticConstraints.ProductConstraint.extend({
	        init : function(product, a, b){
	            this._super(product, a, b);
	        },

	        canonicalizeVariables : function(){
	            this._super();
	        },

	        propagate : function(fail){
	            if(this.narrowedVariable != this.product){
	                var constraint = IntegerInterval.multiply(this.a.value(), this.b.value());
	                this.product.narrowTo(
	                    new IntegerInterval(
	                        Math.floor(constraint.lower),
	                        Math.ceil(constraint.upper)
	                    ),
	                fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.a){
	                this.a.narrowToQuotient(this.product.value(), this.b.value(), fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.b){
	                this.b.narrowToQuotient(this.product.value(), this.a.value(), fail);
	            }
	        },
	    });
	    intConstraints.ProductConstraint = IntProductConstraint;

	    /*
	    var IntConstantProductConstraint = ScalarArithmeticConstraints.ConstantProductConstraint.extend({
	        init : function(product, a, k){
	            this._super(product, a, k);
	        },

	        canonicalizeVariables : function(){
	            this._super();
	        },

	        propagate : function(fail){
	            if(this.narrowedVariable != this.product){
	                var constraint = IntegerInterval.multiplyIntervalByConstant(this.a.value(), this.k);
	                this.product.narrowTo(
	                    new IntegerInterval(
	                        Math.floor(constraint.lower),
	                        Math.ceil(constraint.upper)
	                    ),
	                fail);
	                if(fail[0]){ return; }
	            }
	            if(this.narrowedVariable != this.a){
	                //See the comment in real scalar arithmetic constraints, but, when k is 0,
	                //this.product / k gets rough to narrow on.  In the limit, [-inf, inf] * 0 = 0,
	                //we've already narrowed the product, and this sounds practical enough, so
	                //when k = 0, don't narrow a.
	                //FIXME: I can't wait to find the bug I just introduced with this.
	                if(this.k !== 0){
	                    this.a.narrowToQuotient(
	                        this.product.value(),
	                        new IntegerInterval(
	                            Math.floor(this.k),
	                            Math.ceil(this.k)
	                        ),
	                    fail);
	                }
	            }
	        },
	    });
	    intConstraints.ConstantProductConstraint = IntConstantProductConstraint;
	    */
	   
	    var IntQuoitentConstraint = ScalarArithmeticConstraints.QuotientConstraint.extend({
	        init : function(quotient, a, b){
	            this._super(quotient, a, b);
	        },

	        canonicalizeVariables : function(){
	            this._super();
	        },

	        propagate : function(fail){
	            if(this.narrowedVariable != this.quotient){
	                this.quotient.narrowToQuotient(this.a.value(), this.b.value(), fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.a){
	                var constraint = IntegerInterval.multiply(this.quotient.value(), this.b.value());
	                this.a.narrowTo(
	                    new IntegerInterval(
	                        Math.floor(constraint.lower),
	                        Math.ceil(constraint.upper)
	                    ),
	                fail);
	                if(fail[0]){ return; }
	            }

	            if(this.narrowedVariable != this.b){
	                this.b.narrowToQuotient(this.a.value(), this.quotient.value(), fail);
	            }

	            //TODO: this should be factored into the checks... somehow.  Most of the real work is in
	            //the IntegerVariable.narrowToQuotient function and moving the stuff from IntegerInterval out of there.
	            if(this.a.value().isZero() && this.b.value().isZero()){
	                fail[0] = true; //the integers can't go out into infinity like reals can.
	            }
	        }
	    });
	    intConstraints.QuotientConstraint = IntQuoitentConstraint;

	    var IntPowerConstraint = ScalarArithmeticConstraints.PowerConstraint.extend({
	        init : function(power, a, exponent){
	            this._super(power, a, exponent);
	        },

	        canonicalizeVariables : function(){
	            this._super();
	        },

	        propagate : function(fail){

	            if(this.narrowedVariable != this.power){
	                var constraint = IntegerInterval.pow(this.a.value(), this.exponent);
	                this.power.narrowTo(
	                    new IntegerInterval(
	                        Math.floor(constraint.lower),
	                        Math.ceil(constraint.upper)
	                    ),
	                fail);
	                if(fail[0]){ return; }
	            }

	            //For integers, we need to check if power's range even allows for
	            //an integer solution to the problem.
	            //see: http://stackoverflow.com/questions/3140562/does-a-range-of-integers-contain-at-least-one-perfect-square
	            // There are potential optimizations here (a precomputation check, for example),
	            // but right now I'm going to cut right to the heart of the matter.
	            // power.lower <= ceil(exponent(th)_root(a.lower))^exponent <= power.upper
	            // must be preserved for a solution to exist (otherwise, stop
	            // propigating the current constraint)

	            var pow_range = this.power.value();
	            var checkVal = Math.pow(
	                Math.ceil(MathUtil.nthroot(pow_range.lower, this.exponent)),
	                this.exponent
	            );

	            if(!(pow_range.lower <= checkVal && checkVal <= pow_range.upper)){
	                fail[0] = true;
	                console.log(this.power.value() + " does not contain an Integer " + this.exponent + "th root.");
	                return;
	            }

	            //We want to repropagate in case this is an even power and we just split on a
	            if((this.exponent % 2 === 0) && this.a.value().lower < 0){
	                if (this.a.value().upper <= 0){
	                    //a is non-positive
	                    this.a.narrowTo(IntegerInterval.invPower(this.power.value(), this.exponent), fail);
	                }else{
	                    // even inverse power of an interval that crosses zero
	                    var bound = IntegerInterval.invPower(this.power.value(), this.exponent);
	                    this.a.narrowTo(bound, fail);
	                }
	            }else{
	                //a is already non-negative or exponent is odd (and so function is monotone)
	                this.a.narrowTo(IntegerInterval.invPower(this.power.value(), this.exponent), fail);
	            }
	        },
	    });
	    intConstraints.PowerConstraint = IntPowerConstraint;
	    return intConstraints;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ }
/******/ ]);