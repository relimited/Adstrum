//A variable that only works over the integers
//
//As of right now, do not mix integer variables and int variables.  bad things'll happen if you do.
define(['inheritance', 'integerInterval', 'floatVariable', 'mathUtil', 'scalarArithmaticConstraints'], function(Inheritance, IntegerInterval, FloatVariable, MathUtil, ScalarArithmaticConstraints){
    //For ease of reference later, split the properties of the ScalarArithmaticConstraints
    //module.
    SumConstraint = ScalarArithmaticConstraints.SumConstraint;
    DifferenceConstraint = ScalarArithmaticConstraints.DifferenceConstraint;
    ProductConstraint = ScalarArithmaticConstraints.ProductConstraint;
    ConstantProductConstraint = ScalarArithmaticConstraints.ConstantProductConstraint;
    QuotientConstraint = ScalarArithmaticConstraints.QuotientConstraint;
    PowerConstraint = ScalarArithmaticConstraints.PowerConstraint;

    //'Static' method constructors for making common variations on Integer Variables

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
                var newValue = IntegerInterval.intersection(this.currentValue.get(), restriction);
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
         * @param  {Interval} numerator   Range of the numerator
         * @param  {Interval} denominator Range of the denominator
         * @param  {boolean} fail        pass-by-ref failure bool (will be set to true if we can't narrow)
         */
        narrowToQuotient : function(numerator, denominator, fail){
            console.log("[WARN PROMOTE] Narrowing to a quotent with an IntVariable promotes a result with floating point intervals")
            return this._super(numerator, denominator, fail);
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
    // inting point variables

    /**
     * Coerce passed in inting point variable to a primative.  If we've already
     * solved the CSP problem, then this will coerce to the value of the variable
     * that satifies the CSP.
     * @param  {intVariable} v variable to coerce to a primative
     * @return {Number}   a primative representation of this inting point var.
     */
    function coerceToPrimative(v){
        return v.uniqueValue();
    }
    IntVariable.coerceToPrimative = coerceToPrimative;

    /**
     * Add two inting point variables together.  This also adds a new constraint
     * to the CSP.
     * @param {intVariable} a First operand of addition
     * @param {intVariable} b Second operand of addition
     * @return {intVariable}      the sum of a and b.  This is a set of bounds that
     *                                  a + b must be in
     */
    function add(a, b){
        var funct = function(){
            var sum = new IntVariable("sum", a.csp, IntegerInterval.add(a.value(), b.value()));
            new SumConstraint(sum, a, b);
            return sum;
        };
        return a.csp.memorize("+", funct, [a, b]);
    }
    IntVariable.add = add;

    /**
     * Subtract two inting point variables together (a - b).  This also adds a new constraint to
     * the CSP
     * @param  {intVariable} a First operand to subtraction
     * @param  {intVariable} b Second operand to subtraction
     * @return {intVariable}   the difference of a from b.  This is a set of bounds that
     *                               a - b must be in
     */
    function subtract(a, b){
        var funct = function(){
            var difference = new IntVariable("difference", a.csp, IntegerInterval.subtract(a.value(), b.value()));
            new DifferenceConstraint(difference, a, b);
            return difference;
        }
        return a.csp.memorize("-", funct, [a, b]);
    }
    IntVariable.subtract = subtract;

    /**
     * Multiply two inting point variables together (a * b).  This also adds a new constraint to
     * the CSP
     * @param  {intVariable} a First operand to multipulcation
     * @param  {intVariable} b Second operand to multipulcaiton
     * @return {intVariable}   the product of a and b.  This is the set of bounds that
     *                               a * b must be in
     */
    function multiply(a, b){
        var funct = function(){
            var product = new IntVariable("product", a.csp, IntegerInterval.multiply(a.value(), b.value()));
            new ProductConstraint(product, a, b);
            return product;
        }
        return a.csp.memorize("*", funct, [a, b]);
    }
    IntVariable.multiply = multiply;

    /**
     * Multiply a inting point variable by a constant (a * k).  This also adds a constraint to
     * the CSP.
     * @param  {Number} k The constant value to multiply a intVariable by.
     *                    K will get floored to the nearest int (use a float variable to allow for floating point k's)
     * @param  {intVariable} a the int variable part of the multipulcation
     * @return {intVariable}   the product of a * k.  This is the set of bounds that
     *                               a * k must be in.
     */
    function multiplyVariableByConstant(a, k){
        k = Math.floor(k);
        var funct = function(){
            var product = new IntVariable("product", a.csp, IntegerInterval.multiplyIntervalByConstant(a.value(), k));
            new ConstantProductConstraint(product, a, k);
            return product;
        }
        return a.csp.memorize("*", funct, [a, k]);
    }
    IntVariable.multiplyVariableByConstant = multiplyVariableByConstant;

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
            new PowerConstraint(power, a, exponent);
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
