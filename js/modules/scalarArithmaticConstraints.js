/**
*Scalar constraints for the CSP
*/
define(['inheritance', 'constraint'], function(Inheritance, Constraint){
    var constraints = {};
    var SumConstraint = Constraint.extend({
        init : function(sum, a, b){
            this._super(sum.csp);
            this.sum = sum;
            this.a = a;
            this.b = b;
        },

        canonicalizeVariables : function(){
            sum = this.registerCanonical(this.sum);
            a = this.registerCanonical(this.a);
            b = this.registerCanonical(this.b);
        },

        propagate : function(fail){
            if(this.narrowedVariable != this.sum){
                this.sum.narrowTo(this.a.value + this.b.value, fail);
                if(fail[0]){
                    return;
                }
            }

            if(this.narrowedVariable != this.a){
                this.a.narrowTo(this.sum.value - this.b.value, fail);
                if(fail[0]){
                    return;
                }
            }

            if(this.narrowedVariable != this.b){
                this.b.narrowTo(this.sum.value - this.a.value, fail);
            }
        }
    });
    constraints.SumConstraint = SumConstraint;

    var DifferenceConstraint = Constraint.extend({
        init : function(difference, a, b){
            this._super(difference.csp);
            this.difference = difference;
            this.a = a;
            this.b = b;
        },

        canonicalizeVariables : function(){
            this.difference = this.registerCanonical(this.difference);
            this.a = this.registerCanonical(this.a);
            this.b = this.registerCanonical(this.b);
        },

        propagate : function(fail){
            if(this.narrowedVariable != this.difference){
                this.difference.narrowTo(this.a.value - this.b.value, fail);
                if(fail[0]){ return; };
            }

            if(this.narrowedVariable != this.a){
                this.a.narrowTo(this.difference.value + this.b.value, fail);
                if(fail[0]){ return; };
            }

            if(this.narrowedVariable != this.b){
                this.b.narrowTo(this.difference.value + this.a.value, fail);
            }
        }
    });
    constraints.differneceConstraint = DifferenceConstraint;

    var productConstraint = Constraint.extend({
        init : function(product, a, b){
            this._super(product.csp);
            this.product = product;
            this.a = a;
            this.b = b;
        },

        canonicalizeVariables : function(){
            this.product = this.registerCanonical(this.product);
            this.a = this.registerCanonical(this.a);
            this.b = this.registerCanonical(this.b);
        },

        propagate : function(fail){
            if(this.narrowedVariable != this.product){
                this.product.narrowTo(this.a.value * this.b.value, fail);
                if(fail[0]){ return; };
            }

            if(this.narrowedVariable != this.a){
                this.a.narrowToQuotent(this.product.value, this.b.value, fail);
                if(fail[0]){ return; };
            }

            if(this.narrowedVariable != this.b){
                this.b.narrowToQuotent(this.product.value, this.a.value, fail);
            }
        }
    });
    constraints.ProductConstraint = ProductConstraint;

    var ConstantProductConstraint = Constraint.extend({
        init : function(prodcuct, a, k){
            this._super(product.csp);
            this.product = product;
            this.a = a;
            this.k = k;
        },

        canonicalizeVariables : function(){
            this.product = this.registerCanonical(this.product);
            this.a = this.registerCanonical(this.a);
        },

        propigate : function(fail){
            if(this.narrowedVariable != this.product){
                this.product.narrowTo(this.a.value * k, fail);
                if(fail[0]){ return; };
            }

            if(this.narrowedVariable != this.a){
                this.a.narrowTo(this.prodcuct.value * (1 / k), fail);
            }
        }
    });
    constraints.ConstantProductConstraint = ConstantProductConstraint;

    var QuoitentConstraint = Constraint.extend({
        init : function(quotient, a, b){
            this._super(quotient);
            this.quotient = quotient;
            this.a = a;
            this.b = b;
        },

        canonicalVariables : function(){
            this.quotient = this.registerCanonical(this.quotient);
            this.a = this.registerCanonical(this.a);
            this.b = this.registerCanonical(this.b);
        },

        propagate : function(fail){
            if(this.narrowedVariable != this.quotient){
                this.quotient.narrowToQuotient(this.a.value, this.b.value, fail);
                if(fail[0]){ return; };
            }

            if(this.narrowedVariable != this.a){
                this.a.narrowTo(this.quotient.value * this.b.value, fail);
                if(fail[0]){ return; };
            }

            if(this.narrowedVariable != this.b){
                this.b.narrowToQuotient(this.a.value, this.quotient.value, fail);
            }
        }
    });
    constraints.QuotientConstraint = QuotientConstraint;

    var PowerConstraint = Constriant.extend({
        init : function(power, a, exponent){
            this._super(power.csp);
            this.power = power;
            this.a = a;
            this.exponent = exponent;
        },

        canonicalizeVariables : function(){
            this.power = this.registerCanonical(this.power);
            this.a = this.registerCanonical(this.a);
        },

        propagate : function(fail){
            if(this.narrowedVariable != this.power){
                this.power.narrowTo(Math.pow(this.a.value, this.exponent), fail);
                if(fail[0]){ return; };
            }

            //We want to repropagate in case this is an even power and we just split on a
            if((exponent % 2 == 0) && this.a.value.lower < 0){
                if (this.a.value.upper <= 0){
                    //a is non-positive
                    this.a.narrowTo(Interval.invert(Interval.invPower(power.value, exponent)). fail);
                }else{
                    // even inverse power of an interval that crosses zero
                    var bound = Interval.invPower(power.value, exponent).upper;
                    this.a.narrowTo(new Interval(Interval.invert(bound), bound), fail);
                }
            }else{
                //a is already non-negative or exponent is odd (and so function is monotone)
                this.a.narrowTo(Interval.invPower(this.power.value, this.exponent), fail);
            }
        }
    });
    constraints.PowerConstraint = PowerConstraint;
    return constraints;
});
