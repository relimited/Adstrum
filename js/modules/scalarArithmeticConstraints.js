/**
*Scalar constraints for the CSP
*/
define(['inheritance', 'constraint', 'interval', 'mathUtil'], function(Inheritance, Constraint, Interval, MathUtil){
    var constraints = {};
    var SumConstraint = Constraint.extend({
        init : function(sum, a, b){
            this._super(sum.csp);
            this.sum = sum;
            this.a = a;
            this.b = b;
        },

        canonicalizeVariables : function(){
            this.sum = this.registerCanonical(this.sum);
            this.a = this.registerCanonical(this.a);
            this.b = this.registerCanonical(this.b);
        },

        propagate : function(fail){
            if(this.narrowedVariable != this.sum){
                this.sum.narrowTo(Interval.add(this.a.value(), this.b.value()), fail);
                if(fail[0]){
                    return;
                }
            }

            if(this.narrowedVariable != this.a){
                this.a.narrowTo(Interval.subtract(this.sum.value(), this.b.value()), fail);
                if(fail[0]){
                    return;
                }
            }

            if(this.narrowedVariable != this.b){
                this.b.narrowTo(Interval.subtract(this.sum.value(), this.a.value()), fail);
            }
        },

        toString : function(){
            return "{" + this.sum.name + "}={" + this.a.name + "}+{" + this.b.name + "}";
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
                this.difference.narrowTo(Interval.subtract(this.a.value(), this.b.value()), fail);
                if(fail[0]){ return; }
            }

            if(this.narrowedVariable != this.a){
                this.a.narrowTo(Interval.add(this.difference.value(), this.b.value()), fail);
                if(fail[0]){ return; }
            }

            if(this.narrowedVariable != this.b){
                this.b.narrowTo(Interval.subtract(this.a.value(), this.difference.value()), fail);
            }
        },

        toString : function(){
            return "{" + this.difference.name + "}={" + this.a.name + "}-{" + this.b.name +"}";
        }
    });
    constraints.DifferenceConstraint = DifferenceConstraint;

    var ProductConstraint = Constraint.extend({
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
                this.product.narrowTo(Interval.multiply(this.a.value(), this.b.value()), fail);
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

        toString : function(){
            return "{" + this.product.name + "}={" + this.a.name + "}*{"+ this.b.name + "}";
        }
    });
    constraints.ProductConstraint = ProductConstraint;

    var QuoitentConstraint = Constraint.extend({
        init : function(quotient, a, b){
            this._super(quotient.csp);
            this.quotient = quotient;
            this.a = a;
            this.b = b;
        },

        canonicalizeVariables : function(){
            this.quotient = this.registerCanonical(this.quotient);
            this.a = this.registerCanonical(this.a);
            this.b = this.registerCanonical(this.b);
        },

        propagate : function(fail){
            //several checks here-- b can't be zero.
            if(this.b.value().isZero()){
              fail[0] = true;
              return;
            }

            //try to force the quotient into a reasonable range
            if(this.quotient.value().lower === -Number.POSITIVE_INFINITY || this.quotient.value().upper === Number.POSITIVE_INFINITY){
              this.quotient.narrowTo(new Interval(this.quotient.value().practicalLower(), this.quotient.value().practicalUpper()));
            }
            
            if(this.narrowedVariable != this.quotient){
                this.quotient.narrowToQuotient(this.a.value(), this.b.value(), fail);
                if(fail[0]){ return; }
            }

            if(this.narrowedVariable != this.a){
                this.a.narrowTo(Interval.multiply(this.quotient.value(), this.b.value()), fail);
                if(fail[0]){ return; }
            }

            if(this.narrowedVariable != this.b){
                this.b.narrowToQuotient(this.a.value(), this.quotient.value(), fail);
                if(fail[0]){ return; }
            }
        },

        toString : function(){
            return "{" + this.quotient.name + "}={"+ this.a.name +"}/{" + this.b.name + "}";
        }
    });
    constraints.QuotientConstraint = QuoitentConstraint;

    var PowerConstraint = Constraint.extend({
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
                this.power.narrowTo(Interval.pow(this.a.value(), this.exponent), fail);
                if(fail[0]){ return; }
            }

            //We want to repropagate in case this is an even power and we just split on a
            if((this.exponent % 2 === 0) && this.a.value().lower < 0){
                if (this.a.value().upper <= 0){
                    //a is non-positive
                    this.a.narrowTo(Interval.invert(Interval.invPower(this.power.value(), this.exponent)), fail);
                }else{
                    // even inverse power of an interval that crosses zero
                    var bound = Interval.invPower(this.power.value(), this.exponent).upper;
                    this.a.narrowTo(new Interval(-bound, bound), fail);
                }
            }else{
                //a is already non-negative or exponent is odd (and so function is monotone)
                this.a.narrowTo(Interval.invPower(this.power.value(), this.exponent), fail);
            }
        },

        toString : function(){
            return "{" + this.power.name + "}={" + this.a.name + "}^{" + this.exponent + "}";
        }
    });
    constraints.PowerConstraint = PowerConstraint;

    return constraints;
});
