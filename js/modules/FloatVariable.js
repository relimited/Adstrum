/**
*A floating point variable in Craft-Speak
*/

define(['inheritance', 'js/modules/variable', 'js/modules/interval', 'js/modules/mathUtil', 'js/modules/scalarArithmaticConstraints'], function(Inheritance, Variable, Interval, MathUtil, ScalarArithmaticConstraints){
    //split the arithmetic constraints into something useable.
    SumConstraint = ScalarArithmaticConstraints.SumConstraint;
    DifferenceConstraint = ScalarArithmaticConstraints.DifferenceConstraint;
    ProductConstraint = ScalarArithmaticConstraints.ProductConstraint;
    ConstantProductConstraint = ScalarArithmaticConstraints.ConstantProductConstraint;
    QuotientConstraint = ScalarArithmaticConstraints.QuotientConstraint;
    PowerConstraint = ScalarArithmaticConstraints.PowerConstraint;

    //useful constructors... might need to shfit these to the bottom and/or add them as static methods
    var makeInfinateFloatVariable = function(name, p){
        return new FloatVariable(name, p, Interval.allValues);
    }

    var makeFloatVariableWithBounds = function(name, p, lower, upper){
        return new FloatVariable(name, p, new Interval(lower, upper));
    }

    var constant = function(p, c){
        var funct = function(){makeFloatVariableWithBounds(c.toString(), p, c, c);};
        return p.memorize("constant", funct, c);
    }

    var FloatVariable = Variable.extend({
        init : function(name, p, initialValue){
            this._super(name, p, p.intervalUndoStack, initialValue);

            this.startingWidth = 0;
        },

        initializeStartingWidth : function(){
            this.startingWidth = this.value().startingWidth;
        },

        relativeMeasure : function(){
            return this.value().width() / this.startingWidth;
        },

        //C# has some compiler problems here.  It's likely we won't have that problems
        //therefore, I'm only implementing the variable<interval> version
        mustEqual : function(v){
            if (v instanceof Variable){
                v.mustBeContainedIn(this.value());
                this._super(v);
            }else if (v.constructor === Number){
                //This is our final condition-- also Javascript is awesome
                this.mustBeContainedIn(new Interval(v, v))
            }
        },

        mustBeContainedIn : function(i){
            this.csp.assertConfigurationPhase();
            intersection = Interval.intersection(this.value(), i);
            if(intersection.empty()){
                throw "Argument out of current range of variable";
            }
            this.currentValue.setInitialValue(intersection)
        },

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

                //some stuff with search hints here.  Because conditional compilation is not my lyfe, I'm not putting it in

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

        narrowToUnion : function(a, b, fail){
            this.narrowTo(Interval.unionOfIntersections(this.value(), a, b), fail);
        },

        narrowToQuotent : function(numerator, denominator, fail){
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

        //skipping safe to guess because search hints aren't a thing because they seem to be a compiler
        //time flag

        tryNarrowing : function*(){
            var fail = [false]; //we need fail to be passed by reference... which means wrapping it in an object.
                                //TODO: wrap in a null object and not an array to carry less bullshit along for the ride

            var randElement = this.value().randomElement();
            this.csp.pushChoice("Guess {0}={1}", this.name, randElement);
            this.narrowTo(new Interval(randElement, randElement), fail);
            //there are some maybe control based assert statements here.  IAN HORSEWIL WHAT HAVE YOU DONE
            yield false;

            //currently interpeting this line as pulling a random number generator as part of the CSP
            if(Math.random() & 1 == 0){
                this.csp.pushChoice("Lower half {0} to {1}", this.name, this.value().lowerHalf());
                this.narrowTo(this.value().lowerHalf(), fail);
                //there are some maybe control based assert statements here.  IAN HORSEWIL WHAT HAVE YOU DONE
                yield false;

                this.csp.pushChoice("Upper half {0} to {1}", this.name, this.value().upperHalf());
                this.narrowTo(this.value().upperHalf(), fail);
                //there are some maybe control based assert statements here.  IAN HORSEWIL WHAT HAVE YOU DONE
                return false;
            }else{
                this.csp.pushChoice("Upper half {0} to {1}", this.name, this.value.upperHalf());
                this.narrowTo(this.value().upperHalf(), fail);
                //there are some maybe control based assert statements here.  IAN HORSEWIL WHAT HAVE YOU DONE
                yield false;

                this.csp.pushChoice("Lower half {0} to {1}", this.name, this.value().lowerHalf());
                this.narrowTo(this.value().lowerHalf(), fail);
                //there are some maybe control based assert statements here.  IAN HORSEWIL WHAT HAVE YOU DONE
                return false;
            }
        },

        isUnique : function(){
            return this.value().isUnique();
        },

        uniqueValue : function(){
            return this.value().uniqueValue();
        }
    });

    //now time to put in all the static parts of being a float variable.
    function coerceToPrimative(v){
        return v.uniqueValue();
    }
    FloatVariable.coerceToPrimative = coerceToPrimative;

    function add(a, b){
        var funct = function(){
            var sum = new FloatVariable("sum", a.csp, Interval.add(a.value(), b.value()));
            new SumConstraint(sum, a, b);
            return sum;
        };
        return a.csp.memorize("+", funct, [a, b]);
    }
    FloatVariable.add = add;

    function subtract(a, b){
        var funct = function(){
            var difference = new FloatVariable("difference", a.csp, Interval.subtract(a.value(), b.value()));
            new DifferenceConstraint(difference, a, b);
            return difference;
        }
        return a.csp.memorize("-", funct, [a, b]);
    }
    FloatVariable.subtract = subtract;

    function multiply(a, b){
        var funct = function(){
            var product = new FloatVariable("product", a.csp, Interval.multiply(a.value(), b.value()));
            new ProductConstraint(product, a, b);
            return product;
        }
        return a.csp.memorize("*", funct, [a, b]);
    }
    FloatVariable.multiply = multiply;

    function multiplyIntervalByConsant(k, a){
        var funct = function(){
            var product = new FloatVariable("product", a.csp, Interval.multiplyIntervalByConsant(a.value(), k));
            new ConstantProductConstraint(product, a, k);
            return product;
        }
        return a.csp.memorize("*", funct, [a, k]);
    }
    FloatVariable.multiplyIntervalByConsant = multiplyIntervalByConsant;

    function divide(a, b){
        var funct = function(){
            var quotient = new FloatVariable("quotient", a.csp, Interval.divide(a.value(), b.value()));
            new QuotientConstraint(quotient, a, b);
            return quotient;
        }
        return a.csp.memorize("/", funct, [a, b]);
    }
    FloatVariable.divide = divide;

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
