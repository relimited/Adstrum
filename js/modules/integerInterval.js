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
                console.log("[WARN PROMOTE] Calculating the largest containing integer interval for [" + lowerBound + "," + upperBound + "]");
            }
            this.lower = Math.ceil(lowerBound);
            this.upper = Math.floor(upperBound);
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
            var c = undefined;
            var d = undefined;
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
    IntegerInterval.unionOfIntersections = unionOfIntersections



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
             console.log("[PROMOTE WARN] multiplying an IntegerInterval by a non-integer returns an Interval")
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
            if(b.lower == 0 && b.upper == 0){
                //can't divide by 0
                return a.makeEmpty();
            }else if(b.lower < 0 && b.upper > 0){
                //denominator interval crosses 0
                return new IntegerInterval(-Math.max(Math.abs(a.lower), Math.abs(a.upper)), Math.max(Math.abs(a.lower), Math.abs(a.upper)))
            }else if(b.lower == 0 && b.upper != 0){
                //denominator interval touches 0 ([0, ...])
                return divide(a, new IntegerInterval(b.lower + 1, b.upper))
            }else if(b.lower != 0 && b.upper == 0){
                //denominator interval touches 0 ([..., 0])
                return divide(a, new IntegerInterval(b.lower, b.upper - 1))
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
			break;
			case 1:
				return a; // speedup case
			break;
			default:
                //more complicated crap
                if(exponent % 2 != 0){
                    //odd exponent
                    return new IntegerInterval(Math.pow(a.lower, exponent), Math.pow(a.upper, exponent));
                }else if (exponent % 2 == 0){
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
                break;
            case 1:
                return a;
                break;
            case -1:
                return invert(a);
                break;
            default:
                if(n % 2 != 0){
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
});
