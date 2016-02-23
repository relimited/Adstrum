/**
 * Module defines the constraints for integer scalar arithmetic
 */
define(['inheritance', 'integerInterval', 'mathUtil', 'scalarArithmeticConstraints'], function(Inheritance, IntegerInterval, MathUtil, ScalarArithmeticConstraints){
    var intConstraints = {};

    //Difference and Sum constraints are exactly the same regardless of if they
    //work with integers or reals.
    var IntSumConstraint = ScalarArithmeticConstraints.SumConstraint.extend({
        init : function(sum, a, b){
            this._super(sum, a, b);
        },

        canonicalizeVariables : function(){
            this._super();
        },

        propagate : function(fail){
            if(this.narrowedVariable != this.sum){
                var constraint = IntegerInterval.add(this.a.value(), this.b.value());
                this.sum.narrowTo(
                    new IntegerInterval(
                        Math.floor(constraint.lower),
                        Math.ceil(constraint.upper)
                    ),
                fail);

                if(fail[0]){
                    return;
                }
            }

            if(this.narrowedVariable != this.a){
                var constraint = IntegerInterval.subtract(this.sum.value(), this.b.value());

                this.a.narrowTo(
                    new IntegerInterval(
                        Math.floor(constraint.lower),
                        Math.ceil(constraint.upper)
                    ),
                fail);

                if(fail[0]){
                    return;
                }
            }

            if(this.narrowedVariable != this.b){
                var constraint = IntegerInterval.subtract(this.sum.value(), this.a.value());
                this.b.narrowTo(
                    new IntegerInterval(
                        Math.floor(constraint.lower),
                        Math.ceil(constraint.upper)
                    ),
                fail);
            }
        },
    });
    intConstraints.SumConstraint = IntSumConstraint;

    var IntDifferenceConstraint = ScalarArithmeticConstraints.DifferenceConstraint.extend({
        init : function(difference, a, b){
            this._super(difference, a, b);
        },

        canonicalizeVariables : function(){
            this._super();
        },

        propagate : function(fail){
            if(this.narrowedVariable != this.difference){
                var constraint = IntegerInterval.subtract(this.a.value(), this.b.value());
                this.difference.narrowTo(
                    new IntegerInterval(
                        Math.floor(constraint.lower),
                        Math.ceil(constraint.upper)
                    ),
                fail);
                if(fail[0]){ return; }
            }

            if(this.narrowedVariable != this.a){
                var constraint = IntegerInterval.add(this.difference.value(), this.b.value());
                this.a.narrowTo(
                    new IntegerInterval(
                        Math.floor(constraint.lower),
                        Math.ceil(constraint.upper)
                    ),
                fail);
                if(fail[0]){ return; }
            }

            if(this.narrowedVariable != this.b){
                var constraint = IntegerInterval.subtract(this.a.value(), this.difference.value());
                this.b.narrowTo(
                    new IntegerInterval(
                        Math.floor(constraint.lower),
                        Math.ceil(constraint.upper)
                    ),
                fail);
            }
        },
    });
    intConstraints.DifferenceConstraint = IntDifferenceConstraint;

    //non-linear constraints, however...
    var IntProductConstraint = ScalarArithmeticConstraints.ProductConstraint.extend({
        init : function(product, a, b){
            this._super(product, a, b);
        },

        canonicalizeVariables : function(){
            this._super();
        },

        propagate : function(fail){
            if(this.narrowedVariable != this.product){
                var constraint = IntegerInterval.multiply(this.a.value(), this.b.value());
                this.product.narrowTo(
                    new IntegerInterval(
                        Math.floor(constraint.lower),
                        Math.ceil(constraint.upper)
                    ),
                fail);
                if(fail[0]){ return; }
            }

            if(this.narrowedVariable != this.a){
                this.a.narrowToQuotient(this.product.value(), this.b.value(), fail);
                if(fail[0]){ return; }
            }

            if(this.narrowedVariable != this.b){
                this.b.narrowToQuotient(this.product.value(), this.a.value(), fail);
            }
        },
    });
    intConstraints.ProductConstraint = IntProductConstraint;

    var IntConstantProductConstraint = ScalarArithmeticConstraints.ConstantProductConstraint.extend({
        init : function(product, a, k){
            this._super(product, a, k);
        },

        canonicalizeVariables : function(){
            this._super();
        },

        propagate : function(fail){
            if(this.narrowedVariable != this.product){
                var constraint = IntegerInterval.multiplyIntervalByConstant(this.a.value(), this.k);
                this.product.narrowTo(
                    new IntegerInterval(
                        Math.floor(constraint.lower),
                        Math.ceil(constraint.upper)
                    ),
                fail);
                if(fail[0]){ return; }
            }
            if(this.narrowedVariable != this.a){
                //See the comment in real scalar arithmetic constraints, but, when k is 0,
                //this.product / k gets rough to narrow on.  In the limit, [-inf, inf] * 0 = 0,
                //we've already narrowed the product, and this sounds practical enough, so
                //when k = 0, don't narrow a.
                //FIXME: I can't wait to find the bug I just introduced with this.
                if(this.k !== 0){
                    this.a.narrowToQuotient(
                        this.product.value(),
                        new IntegerInterval(
                            Math.floor(this.k),
                            Math.ceil(this.k)
                        ),
                    fail);
                }
            }
        },
    });
    intConstraints.ConstantProductConstraint = IntConstantProductConstraint;

    var IntQuoitentConstraint = ScalarArithmeticConstraints.QuotientConstraint.extend({
        init : function(quotient, a, b){
            this._super(quotient, a, b);
        },

        canonicalizeVariables : function(){
            this._super();
        },

        propagate : function(fail){
            if(this.narrowedVariable != this.quotient){
                this.quotient.narrowToQuotient(this.a.value(), this.b.value(), fail);
                if(fail[0]){ return; }
            }

            if(this.narrowedVariable != this.a){
                var constraint = IntegerInterval.multiply(this.quotient.value(), this.b.value());
                this.a.narrowTo(
                    new IntegerInterval(
                        Math.floor(constraint.lower),
                        Math.ceil(constraint.upper)
                    ),
                fail);
                if(fail[0]){ return; }
            }

            if(this.narrowedVariable != this.b){
                this.b.narrowToQuotient(this.a.value(), this.quotient.value(), fail);
            }

            //TODO: this should be factored into the checks... somehow.  Most of the real work is in
            //the IntegerVariable.narrowToQuotient function and moving the stuff from IntegerInterval out of there.
            if(this.a.value().isZero() && this.b.value().isZero()){
                fail[0] = true; //the integers can't go out into infinity like reals can.
            }
        }
    });
    intConstraints.QuotientConstraint = IntQuoitentConstraint;

    var IntPowerConstraint = ScalarArithmeticConstraints.PowerConstraint.extend({
        init : function(power, a, exponent){
            this._super(power, a, exponent);
        },

        canonicalizeVariables : function(){
            this._super();
        },

        propagate : function(fail){

            if(this.narrowedVariable != this.power){
                var constraint = IntegerInterval.pow(this.a.value(), this.exponent);
                this.power.narrowTo(
                    new IntegerInterval(
                        Math.floor(constraint.lower),
                        Math.ceil(constraint.upper)
                    ),
                fail);
                if(fail[0]){ return; }
            }

            //For integers, we need to check if power's range even allows for
            //an integer solution to the problem.
            //see: http://stackoverflow.com/questions/3140562/does-a-range-of-integers-contain-at-least-one-perfect-square
            // There are potential optimizations here (a precomputation check, for example),
            // but right now I'm going to cut right to the heart of the matter.
            // power.lower <= ceil(exponent(th)_root(a.lower))^exponent <= power.upper
            // must be preserved for a solution to exist (otherwise, stop
            // propigating the current constraint)

            var pow_range = this.power.value();
            var checkVal = Math.pow(
                Math.ceil(MathUtil.nthroot(pow_range.lower, this.exponent)),
                this.exponent
            );

            if(!(pow_range.lower <= checkVal && checkVal <= pow_range.upper)){
                fail[0] = true;
                console.log(this.power.value() + " does not contain an Integer " + this.exponent + "th root.");
                return;
            }

            //We want to repropagate in case this is an even power and we just split on a
            if((this.exponent % 2 === 0) && this.a.value().lower < 0){
                if (this.a.value().upper <= 0){
                    //a is non-positive
                    this.a.narrowTo(IntegerInterval.invPower(this.power.value(), this.exponent), fail);
                }else{
                    // even inverse power of an interval that crosses zero
                    var bound = IntegerInterval.invPower(this.power.value(), this.exponent);
                    this.a.narrowTo(bound, fail);
                }
            }else{
                //a is already non-negative or exponent is odd (and so function is monotone)
                this.a.narrowTo(IntegerInterval.invPower(this.power.value(), this.exponent), fail);
            }
        },
    });
    intConstraints.PowerConstraint = IntPowerConstraint;
    return intConstraints;
});
