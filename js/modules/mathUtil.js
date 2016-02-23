/**
 * Javascript implementation of the MathUtil class from Craft
 * Added in several other helper functions.
 */
define([], function(){
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
});
