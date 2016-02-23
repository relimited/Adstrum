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
    }

    /**
     * 'Static' method for memorizing a 'make constant' function.
     *
     * @TODO: this is currently unused by Craftjs, untested, and mostly still a stub.
     * @param  {CSP} p The constraint satisifaction problem to associate this constant with
     * @param  {Number} c The value of the constant to create
     * @return {Variable}   the memorized value for the 'constant' function in the CSP's memo table.
     *                           which will be a int Variable with the correct bounds.
     */
    var constant = function(p, c){
        var funct = function(){makeIntVariableWithBounds(c.toString(), p, c, c);};
        return p.memorize("constant", funct, c);
    }

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
            this.currentValue.setInitialValue(intersection)
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
                console.log("Starting integer divisor consistency check, NaN/undefined warnings may ensue ...")
                var potential = numerator.findDivisors(denominator);
                console.log("... finished check, NaN/undefined warnings are bad now.")
                if(potential.lower == undefined || potential.upper == undefined ||
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
            console.log("[WARN PROMOTE] Narrowing to a signed sqrt with an IntVariable promotes a result with floating point intervals")
            return this._super(square, fail);
        }
    });

    //now time to put in all the 'static' parts of being a int variable.
    // These are utility methods and ways to add in constraints that use
    // int variables

    /**
     * Coerce passed in int variable to a primative.  If we've already
     * solved the CSP problem, then this will coerce to the value of the variable
     * that satifies the CSP.
     * @param  {intVariable} v variable to coerce to a primative
     * @return {Number}   a primative representation of this int var.
     */

     //TODO coerce is down until further notice.  This is due to a huge bug in
     //the way I'm using uniqueValue().
    //function coerceToPrimative(v){
    //    return v.uniqueValue();
    //}
    //IntVariable.coerceToPrimative = coerceToPrimative;

    /**
     * Add two int variables together.  This also adds a new constraint
     * to the CSP.
     * @param {intVariable} a First operand of addition
     * @param {intVariable} b Second operand of addition
     * @return {intVariable}      the sum of a and b.  This is a set of bounds that
     *                                  a + b must be in
     */
    function add(a, b){
        var funct = function(){
            var sum = new IntVariable("sum", a.csp, IntegerInterval.add(a.value(), b.value()));
            new IntSumConstraint(sum, a, b);
            return sum;
        };
        return a.csp.memorize("+", funct, [a, b]);
    }
    IntVariable.add = add;

    /**
     * Subtract two int variables together (a - b).  This also adds a new constraint to
     * the CSP
     * @param  {intVariable} a First operand to subtraction
     * @param  {intVariable} b Second operand to subtraction
     * @return {intVariable}   the difference of a from b.  This is a set of bounds that
     *                               a - b must be in
     */
    function subtract(a, b){
        var funct = function(){
            var difference = new IntVariable("difference", a.csp, IntegerInterval.subtract(a.value(), b.value()));
            new IntDifferenceConstraint(difference, a, b);
            return difference;
        }
        return a.csp.memorize("-", funct, [a, b]);
    }
    IntVariable.subtract = subtract;

    /**
     * Multiply two int variables together (a * b).  This also adds a new constraint to
     * the CSP
     * @param  {intVariable} a First operand to multipulcation
     * @param  {intVariable} b Second operand to multipulcaiton
     * @return {intVariable}   the product of a and b.  This is the set of bounds that
     *                               a * b must be in
     */
    function multiply(a, b){
        var funct = function(){
            var product = new IntVariable("product", a.csp, IntegerInterval.multiply(a.value(), b.value()));
            new IntProductConstraint(product, a, b);
            return product;
        }
        return a.csp.memorize("*", funct, [a, b]);
    }
    IntVariable.multiply = multiply;

    /**
     * Multiply a int variable by a constant (a * k).  This also adds a constraint to
     * the CSP.
     * @param  {Number} k The constant value to multiply a intVariable by.
     *                    K will get floored to the nearest int (use a float variable to allow for floating point k's)
     * @param  {intVariable} a the int variable part of the multipulcation
     * @return {intVariable}   the product of a * k.  This is the set of bounds that
     *                               a * k must be in.
     */
    function multiplyVariableByConstant(a, k){
        if(!Number.isInteger(k)){
            console.log("k: ", k);
            throw "Unable to set up integer problem, k is floating point.  See console for details."
        }
        var funct = function(){
            var product = new IntVariable("product", a.csp, IntegerInterval.multiplyIntervalByConstant(a.value(), k));
            new IntConstantProductConstraint(product, a, k);
            return product;
        }
        return a.csp.memorize("*", funct, [a, k]);
    }
    IntVariable.multiplyVariableByConstant = multiplyVariableByConstant;

    /**
     * Divide two Integer variables (a / b).  This also adds a constraint to
     * the CSP.
     * @param  {IntegerVariable} a the first operand for division
     * @param  {IntegerVariable} b second operand for division
     * @return {IntegerVariable}   the quotient of a / b.  This is the set of bounds that
     *                               a / b must be in.
     */
    function divide(a, b){
        var funct = function(){
            var quotient = new IntVariable("quotient", a.csp, IntegerInterval.divide(a.value(), b.value()));
            new IntQuotientConstraint(quotient, a, b);
            return quotient;
        }
        return a.csp.memorize("/", funct, [a, b]);
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
        }
        return a.csp.memorize("^", funct, [a, exponent]);
    }
    IntVariable.pow = pow;

    //append static constructors.
    IntVariable.makeIntVariableWithBounds =  makeIntVariableWithBounds;
    IntVariable.constant = constant;

    return IntVariable;
});
