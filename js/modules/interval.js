/**
 * Internal implementation of an Interval in Craftjs.
 * For Craftjs, this is the base level data type-- everything is an interval.
 */
define(["inheritance", "searchHint", "mathUtil", "csp"], function(Inheritance, SearchHint, MathUtil, CSP){'use strict';
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
});
