//Implementation of a Craft interval for the integers, rather than the
//reals.
define(["inheritance", "searchHint", "mathUtil", "csp", "interval"], function(Inheritance, SearchHint, MathUtil, CSP, Interval){"use strict";
    var IntegerInterval = Interval.extend({
        /**
         * Create a new Interval given a lower and upper bound.  Inteval is
         * [lower, upper]
         * @param  {Number} lowerBound lower bound on the interval (floats are floored to ints)
         * @param  {Number} upperBound upper bound on the interval (floats are floored to ints)
         * @return {Interval}            A new Craftjs interval such that [lower, upper]
         */
        init : function(lowerBound, upperBound){

            if(lowerBound === Number.NaN){
                throw{
                    message : "Interval lower bound is not a number"
                };
            }else if(upperBound === Number.NaN){
                throw{
                    message : "Interval upper bound is not a number"
                };
            }else if(lowerBound === Number.POSITIVE_INFINITY){
                throw{
                    message : "Interval lower bound cannot be positive infinity"
                };
            }else if(upperBound === Number.NEGATIVE_INFINITY){
                throw{
                    message : "Interval upper bound cannot be negative infinity"
                };
            }

            //enforce that results here need to be an int.
            if(!Number.isInteger(lowerBound) || !Number.isInteger(upperBound)){
                //TODO: Right now, just throw a warning.
                console.log("[WARN] Non-integer arguments passed to an IntegerInterval.  It's about to do disgusting things to your numbers.");
            }
            this.lower = Math.floor(lowerBound);
            this.upper = Math.floor(upperBound);

            //debug info
            this.kind = "IntegerInterval"

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
                randomElement = Math.floor(randomElement)
            }else if(this.practicalUpper() >= Math.ceil(randomElement)){
                //we can safely ceil the number
                randomElement = Math.ceil(randomElement)
            }else{
                console.log(this.practicalLower())
                console.log(this.practicalUpper())
                throw "Unable to find a random integer in provided range!"

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
			return new IntegerInterval(Math.floor(this.midpoint()), this.upper);
		},

		lowerHalf : function(){
			return new IntegerInterval(this.lower, Math.ceil(this.midpoint()));
		},

        /**
         * Get the reciprocal of this IntergerInterval.
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
		}
    });

    //static constants
	IntegerInterval.allValues = new Interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
	IntegerInterval.maxPracticalInt = Math.floor(Number.MAX_VALUE * 0.5);
	IntegerInterval.minPracticalInt = Math.ceil(-Number.MAX_VALUE * 0.5); //javascript is weird

    //Special constructors.  TODO: There is some overlap form Interval here
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

    //=============== HELPER FUNCTIONS===============
    // helper min function
	function min(a, b, c, d){
		return Math.min(Math.min(a, b), Math.min(c, d));
	}

	//helper max function
	function max(a, b, c, d){
		return Math.max(Math.max(a, b), Math.max(c, d));
	}
    //================ END HELP =====================

    //TODO: lot of repeated code here.  Refactor it.
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
    IntegerInterval.unionOfIntersections = unionOfIntersections



    //because this is a javascript implementation, we can't redefine operators like Craft can.  Interval.maththing is the syntax to get at that
    //TODO: add type checking and promote warnings
    function add(a, b){
		return new IntegerInterval(a.lower + b.lower, a.upper + b.upper);
	}
	IntegerInterval.add = add;

    //TODO: add type checking and promote warnings
	function subtract(a, b){
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

    //TODO: add type checking and promote warnings
	function multiply(a, b){
		//TODO: type check on intersector, a and b (interval)
		return new IntegerInterval(
               	min(a.lower * b.lower, a.upper * b.upper, a.lower * b.upper, a.upper * b.lower),
                max(a.lower * b.lower, a.upper * b.upper, a.lower * b.upper, a.upper * b.lower));
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
             console.log("[PROMOTE WARN] multiplying an IntegerInterval by a non-integer returns an Interval")
             return new Interval(
                 Math.min(lower, upper),
                 Math.max(lower, upper));
         }
	}
	IntegerInterval.multiplyIntervalByConstant = multiplyIntervalByConstant;
	/**
	 * This is pretty much the same as multiplyIntervalByConstant
 	 * @param {Object} k
 	 * @param {Object} a
	 */
	function multiplyConstantByInterval(k, a){
		return multiplyIntervalByConsant(a,k);
	}
	IntegerInterval.multiplyConstantByInterval = multiplyConstantByInterval;
	/**
	 * Divide by two Intervals, such that a / b
 	 * @param {Interval} a operand?
 	 * @param {Interval} b dividend?
	 */
	function divide(a, b){
		//Not even going to try to say that this could be interger saving.
		console.log("[PROMOTE WARN] divide with IntegerInterval returns an Interval")
		if(b.lower == 0){
			if(b.upper == 0){
				return Interval.allValues;
			}else{
				return new Interval(Math.min(a.upper / b.upper, a.lower / b.upper), Number.POSITIVE_INFINITY);
			}
		}else if(b.upper == 0){
			//ReShaper comment here
			 return new Interval(Number.NEGATIVE_INFINITY, Math.max(a.lower / b.lower, a.upper / b.lower));
		}else if(b.contains(0)){
			return Interval.allValues;
		}else{
			return new Interval(
                min(a.lower / b.lower, a.upper / b.upper, a.lower / b.upper, a.upper / b.lower),
                max(a.lower / b.lower, a.upper / b.upper, a.lower / b.upper, a.upper / b.lower));
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
				return new IntegerInterval(1,1);
			break;
			case 1:
				return a;
			break;
			default:
				if(exponent % 2 == 0){
					//even exponent
					if(a.lower >= 0){
						return new IntegerInterval(Math.pow(a.lower, exponent), Math.pow(a.upper, exponent));
					}else if(a.upper < 0){
						return new IntegerInterval(Math.pow(a.upper, exponent), Math.pow(a.lower, exponent));
					}else{
						return new IntegerInterval(
                            0,
                            Math.max(Math.pow(a.upper, exponent), Math.pow(a.lower, exponent))
                            );
					}
				}else{
					//odd exponent
					return new IntegerInterval(Math.pow(a.lower, exponent), Math.pow(a.upper, exponent));
				}
			break;
		}
	}
	IntegerInterval.pow = pow;

	/**
	 * A negative tolerant exponent function.
	 * I might not expose this one.
 	 * @param {Object} number
 	 * @param {Object} exponent
	 */
	function negativeTolerantPower(number, exponent){
		//TODO: Math.sign DNE in Javascript
		return Math.sign(number) * Math.pow(Math.abs(number), exponent);
	}

    /**
     * Returns an integer interval of the inverse power of this interval
     * @param  {Interval} a       Interval to take the inverse power of
     * @param  {Number} exponent Exponent to use for the inverse power op
     * @return {Interval}          inverse power of a by exp as an integer interval
     */
	function invPower(a, exponent){
		if(exponent == 1){
			return a;
		}else{
			var invExponent = 1.0 / exponent;
			if (exponent % 2 == 0){
                // even exponent
                var lower = Math.pow(Math.max(0, a.lower), Math.floor(invExponent));
                var upper = Math.pow(Math.max(0, a.upper), Math.ceil(invExponent));
                return new IntegerInterval(lower, upper);
            }else{
            	// odd exponent
            	return new IntegerInterval(Math.floor(negativeTolerantPower(a.lower, invExponent)), Math.ceil(negativeTolerantPower(a.upper, invExponent)));
            }

		}
	}
	IntegerInterval.invPower = invPower;

	function positiveSqrt(a){
        console.log("[PROMOTE WARN] sqrt with IntegerInterval returns an Interval")
		//TODO: type check on intersector, a (interval)
		if(a.lower <= 0){
			throw {
				message : "Attempt to take square root of a negative interval"
			};
		}
		return new Interval(Math.sqrt(a.lower), Math.sqrt(a.upper));
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
});
