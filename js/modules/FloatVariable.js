/**
 *	A floating point variable in Craft
 *	This class not only creates new Floating Variables for Scalar Arithmatic in Craft, but also
 *	handles performing common scalar arithmatic operations to floating variables
 */

define(['inheritance', 'variable', 'interval', 'mathUtil', 'scalarArithmaticConstraints'], function(Inheritance, Variable, Interval, MathUtil, ScalarArithmaticConstraints){
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
    }

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
    }

    /**
     * 'Static' method for memorizing a 'make constant' function.
     *
     * @TODO: this is currently unused by Craftjs, untested, and mostly still a stub.
     * @param  {CSP} p The constraint satisifaction problem to associate this constant with
     * @param  {Number} c The value of the constant to create
     * @return {FloatVariable}   the memorized value for the 'constant' function in the CSP's memo table.
     *                           which will be a Float Variable with the correct bounds.
     */
    var constant = function(p, c){
        var funct = function(){makeFloatVariableWithBounds(c.toString(), p, c, c);};
        return p.memorize("constant", funct, c);
    }

    var FloatVariable = Variable.extend({
        /**
         * Create a new Float Varible and register that float variable with a CSP
         *
         * @param  {String} name         Name of the float variable
         * @param  {CSP} p            Constraint satisfaction problem to associate with this float variable
         * @param  {Interval} initialValue Initial bounds of this float variable
         * @return {FloatVariable}              A new float variable to use with the CSP
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
                this.mustBeContainedInInterval(new Interval(v, v))
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
         * Add a constraint that this float variable must be contained by a particular
         * interval
         * Although this function can be used externally, is intended to not be.
         * This keeps Craftjs from ever having to expose the Interval object / class
         * @param  {Number} i the bounds that this variable must be in ([i.lower(), i.upper()])
         */
        mustBeContainedInInterval : function(i){
            this.csp.assertConfigurationPhase();
            var intersection = Interval.intersection(this.value(), i);
            if(intersection.empty()){
                throw "Argument out of current range of variable";
            }
            this.currentValue.setInitialValue(intersection)
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
                var newValue = Interval.intersection(this.currentValue.get(), restriction);
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
                    this.currentValue.set(newValue);
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
            }else if(denominator.lower == 0){
                if (numerator.upper <= 0){
                    this.narrowTo(new Interval(Number.NEGATIVE_INFINITY, numerator.upper / denominator.upper), fail);
                }else if(numerator.lower >= 0){
                    this.narrowTo(new Interval(numerator.lower / denominator.upper, Number.POSITIVE_INFINITY), fail);
                }
            }else if(denominator.upper == 0){
                if(numerator.upper <= 0){
                    this.narrowTo(new Interval(numerator.upper / denominator.lower, Number.POSITIVE_INFINITY), fail);
                }else if(numerator.lower >= 0){
                    this.narrowTo(new Interval(Number.NEGATIVE_INFINITY, numerator.lower / denominator.lower), fail);
                }
            }else if(numerator.upper < 0){
                var lowerHalf = new Interval(Number.NEGATIVE_INFINITY, numerator.upper / denominator.upper);
                var upperHalf = new Interval(numerator.upper / denominator.lower, Number.NEGATIVE_INFINITY);
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
                restriction = sqrt
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
            //there are some maybe control based assert statements here.  IAN HORSEWIL WHAT HAVE YOU DONE
            yield false;

            if(Math.random() & 1 == 0){
                this.csp.pushChoice("Lower half {0} to {1}", [this.name, this.value().lowerHalf()]);
                this.narrowTo(this.value().lowerHalf(), fail);
                //there are some maybe control based assert statements here.  IAN HORSEWIL WHAT HAVE YOU DONE
                yield false;

                this.csp.pushChoice("Upper half {0} to {1}", [this.name, this.value().upperHalf()]);
                this.narrowTo(this.value().upperHalf(), fail);
                //there are some maybe control based assert statements here.  IAN HORSEWIL WHAT HAVE YOU DONE
                return false;
            }else{
                this.csp.pushChoice("Upper half {0} to {1}", [this.name, this.value().upperHalf()]);
                this.narrowTo(this.value().upperHalf(), fail);
                //there are some maybe control based assert statements here.  IAN HORSEWIL WHAT HAVE YOU DONE
                yield false;

                this.csp.pushChoice("Lower half {0} to {1}", [this.name, this.value().lowerHalf()]);
                this.narrowTo(this.value().lowerHalf(), fail);
                //there are some maybe control based assert statements here.  IAN HORSEWIL WHAT HAVE YOU DONE
                return false;
            }
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
            return this.value().uniqueValue();
        }
    });

    //now time to put in all the 'static' parts of being a float variable.
    // These are utility methods and ways to add in constraints that use
    // floating point variables

    /**
     * Coerce passed in floating point variable to a primative.  If we've already
     * solved the CSP problem, then this will coerce to the value of the variable
     * that satifies the CSP.
     * @param  {FloatVariable} v variable to coerce to a primative
     * @return {Number}   a primative representation of this floating point var.
     */
    function coerceToPrimative(v){
        return v.uniqueValue();
    }
    FloatVariable.coerceToPrimative = coerceToPrimative;

    /**
     * Add two floating point variables together.  This also adds a new constraint
     * to the CSP.
     * @param {FloatVariable} a First operand of addition
     * @param {FloatVariable} b Second operand of addition
     * @return {FloatVariable}      the sum of a and b.  This is a set of bounds that
     *                                  a + b must be in
     */
    function add(a, b){
        var funct = function(){
            var sum = new FloatVariable("sum", a.csp, Interval.add(a.value(), b.value()));
            new SumConstraint(sum, a, b);
            return sum;
        };
        return a.csp.memorize("+", funct, [a, b]);
    }
    FloatVariable.add = add;

    /**
     * Subtract two floating point variables together (a - b).  This also adds a new constraint to
     * the CSP
     * @param  {FloatVariable} a First operand to subtraction
     * @param  {FloatVariable} b Second operand to subtraction
     * @return {FloatVariable}   the difference of a from b.  This is a set of bounds that
     *                               a - b must be in
     */
    function subtract(a, b){
        var funct = function(){
            var difference = new FloatVariable("difference", a.csp, Interval.subtract(a.value(), b.value()));
            new DifferenceConstraint(difference, a, b);
            return difference;
        }
        return a.csp.memorize("-", funct, [a, b]);
    }
    FloatVariable.subtract = subtract;

    /**
     * Multiply two floating point variables together (a * b).  This also adds a new constraint to
     * the CSP
     * @param  {FloatVariable} a First operand to multipulcation
     * @param  {FloatVariable} b Second operand to multipulcaiton
     * @return {FloatVariable}   the product of a and b.  This is the set of bounds that
     *                               a * b must be in
     */
    function multiply(a, b){
        var funct = function(){
            var product = new FloatVariable("product", a.csp, Interval.multiply(a.value(), b.value()));
            new ProductConstraint(product, a, b);
            return product;
        }
        return a.csp.memorize("*", funct, [a, b]);
    }
    FloatVariable.multiply = multiply;

    /**
     * Multiply a floating point variable by a constant (a * k).  This also adds a constraint to
     * the CSP.
     * @param  {Number} k The constant value to multiply a FloatVariable by.
     * @param  {FloatVariable} a the float variable part of the multipulcation
     * @return {FloatVariable}   the product of a * k.  This is the set of bounds that
     *                               a * k must be in.
     */
    function multiplyIntervalByConstant(a, k){
        var funct = function(){
            var product = new FloatVariable("product", a.csp, Interval.multiplyIntervalByConstant(a.value(), k));
            new ConstantProductConstraint(product, a, k);
            return product;
        }
        return a.csp.memorize("*", funct, [a, k]);
    }
    FloatVariable.multiplyIntervalByConstant = multiplyIntervalByConstant;

    /**
     * Divide two floating point variables (a / b).  This also adds a constraint to
     * the CSP.
     * @param  {FloatVariable} a the first operand for division
     * @param  {FloatVariable} b second operand for division
     * @return {FloatVariable}   the quotient of a / b.  This is the set of bounds that
     *                               a / b must be in.
     */
    function divide(a, b){
        var funct = function(){
            var quotient = new FloatVariable("quotient", a.csp, Interval.divide(a.value(), b.value()));
            new QuotientConstraint(quotient, a, b);
            return quotient;
        }
        return a.csp.memorize("/", funct, [a, b]);
    }
    FloatVariable.divide = divide;

    /**
     * Raise a floating point variable to a power (a ^ exponent).  This also adds a
     * constraint to the CSP.
     * @param  {FloatVariable} a        the base of the pow equation.
     * @param  {Number} exponent The exponent of the pow
     * @return {FloatVariable}          the result of a ^ exponent.  This is the set of bounds that
     *                                      a ^ exponent must be in.
     */
    function pow(a, exponent){
        var funct = function(){
            var power = new FloatVariable("power", a.csp, Interval.pow(a.value(), exponent));
            new PowerConstraint(power, a, exponent);
            return power;
        }
        return a.csp.memorize("^", funct, [a, exponent]);
    }
    FloatVariable.pow = pow;

    //append static constructors.
    FloatVariable.makeInfinateFloatVariable = makeInfinateFloatVariable;
    FloatVariable.makeFloatVariableWithBounds =  makeFloatVariableWithBounds;
    FloatVariable.constant = constant;

    return FloatVariable;
});
