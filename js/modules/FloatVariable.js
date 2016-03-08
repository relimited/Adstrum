/**
 *	A floating point variable in Craft
 *	This class not only creates new Floating Variables for Scalar Arithmatic in Craft, but also
 *	handles performing common scalar arithmatic operations to floating variables
 */

define(['inheritance', 'variable', 'interval', 'mathUtil', 'scalarArithmeticConstraints'], function(Inheritance, Variable, Interval, MathUtil, ScalarArithmaticConstraints){
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
     * Recusrively sum out an array of FloatVariables (or Numbers that will get
     * promoted to numbers)
     * @param  {Array} array  Array of FloatVariables or Numbers
     * @param  {FloatVariable} curSum current summed out variable
     * @param  {Number} idx    current index in the array
     * @return {FloatVariable}        FloatVariable that contains all the required constraints
     */
    function recusriveSum(array, curSum, idx){
      if(idx >= array.length){
        return curSum;
      }
      curSum = FloatVariable.add(curSum, array[idx]);
      idx = idx + 1;
      recusriveSum(array, curSum, idx);
      return curSum;
    }

    /**
     * internal logic for summing out an array
     * @param  {Array} v an array of FloatVariables or floating point numbers to sum out
     * @return {FloatVariable}   A FloatVariable that represents the running sum
     */
    function internalSum(v){
      var startSum = FloatVariable.add(v[0], v[1]);
      return recusriveSum(v, startSum, 2);
    }

    /**
     * Sums out a provided array of FloatVariables and/or Numbers by promoting numbers
     * to constants and adding every element of the array.
     * @param  {Array of FloatVariable or Number} v
     * @return {FloatVariable}   constrained sum of all members of v
     */
    function sumAll(v){
      // check that v is an Array
      if(v.constructor !== Array){
        throw "Argument to sumAll is not an array!";
      }

      //check that every element is a Craftjs variable and/or a Number
      for(var index = 0, len = v.length; index < len; ++index){
        if(v[index].csp === undefined && !(v[index] instanceof Number)){
          throw "Some parts of this array aren't numbers or Variables!";
        }
      }

      return internalSum(v);
    }
    FloatVariable.sumAll = sumAll;

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
});
