//A variable that only works over the integers
//
//As of right now, do not mix integer variables and int variables.  bad things'll happen if you do.
define(['inheritance', 'integerInterval', 'floatVariable', 'mathUtil', 'integerScalarArithmeticConstraints'], function(Inheritance, IntegerInterval, FloatVariable, MathUtil, IntegerScalarArithmeticConstraints){
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
     * Recusrively sum out an array of IntVariable (or Numbers that will get
     * promoted to numbers)
     * @param  {Array} array  Array of FloatVariables or Numbers
     * @param  {IntVariable} curSum current summed out variable
     * @param  {Number} idx    current index in the array
     * @return {IntVariable}        FloatVariable that contains all the required constraints
     */
    function recusriveSum(array, curSum, idx){
      if(idx >= array.length){
        return curSum;
      }
      curSum = IntVariable.add(curSum, array[idx]);
      idx = idx + 1;
      recusriveSum(array, curSum, idx);
      return curSum;
    }

    /**
     * internal logic for summing out an array
     * @param  {Array} v an array of IntVariables or floating point numbers to sum out
     * @return {IntVariable}   A FloatVariable that represents the running sum
     */
    function internalSum(v){
      var startSum = IntVariable.add(v[0], v[1]);
      return recusriveSum(v, startSum, 2);
    }

    /**
     * Sums out a provided array of IntVariables and/or Numbers by promoting numbers
     * to constants and adding every element of the array.
     * @param  {Array of IntVariables or Numbers} v
     * @return {IntVariable}   variable constrained to the sum of all members of v
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
    IntVariable.sumAll = sumAll;

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
});
