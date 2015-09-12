/**
 * Javascript implementation of the MathUtil class from Craft
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
                }else if (a == 0 || b == 0 || diff < Number.EPSILON){
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
        }
	};

	return MathUtil;
});
