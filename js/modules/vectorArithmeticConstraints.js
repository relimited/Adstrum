/**
 *   Vector arithmetic constraints for floating point numbers.
 */
define(['inheritance', 'constraint', 'interval', 'mathUtil'], function(Inheritance, Constraint, Interval, MathUtil){
  var constraints = {};
  var DotProductConstraint = Constraint.extend({
    init : function(product, a, b){
      this._super(product.csp);
      this.product = product;
      this.a = a;
      this.b = b;
    },

    canonicalizeVariables : function(){
      this.product = this.registerCanonical(this.product);
      this.a.canonicalizeAndRegisterConstraint(this);
      this.b.canonicalizeAndRegisterConstraint(this);
    },

    propagate : function(fail){
      //this is gonna get interesting.  because we're dealing with an
      //n-dimensional array, this propagate is fun and perhaps awkward.

      //First, we want to build out an array intervals that are each term
      //multiplied together
      var termProducts = [];
      for(var index = 0, len = this.a.vars.length; index < len; ++index){
         termProducts.push(Interval.multiply(this.a.vars[index].value(), this.b.vars[index].value()));
      }

      if(this.narrowedVariable != this.product){
        this.product.narrowTo(Interval.sumAll(termProducts), fail);
        if(fail[0]){
          return;
        }
      }
      
      for(var index = 0, len = this.a.vars.length; index < len; ++index){
        if(this.narrowedVariable != this.a.vars[index]){
          var relevantTermProducts = termProducts.slice(0, index);
          relevantTermProducts = relevantTermProducts.concat(termProducts.slice(index + 1, termProducts.length));
          this.a.vars[index].narrowToQuotient(
            Interval.subtract( this.product.value(), Interval.sumAll(relevantTermProducts)),
            this.b.vars[index].value(),
            fail
          );
          if(fail[0]){
            return;
          }
        }

        if(this.narrowedVariable != this.b.vars[index]){
          var relevantTermProducts = termProducts.slice(0, index);
          relevantTermProducts = relevantTermProducts.concat(termProducts.slice(index + 1, termProducts.length));
          this.b.vars[index].narrowToQuotient(
            Interval.subtract( this.product.value(), Interval.sumAll(relevantTermProducts)),
            this.a.vars[index].value(),
            fail
          );
          if(fail[0]){
            return;
          }
        }
      }
    },

    toString : function(){
      return "<" + this.product.name + " = " + this.a.name + " dot " + this.b.name + ">";
    }
  });
  constraints.DotProductConstraint = DotProductConstraint;

  var MagnitudeConstraint = Constraint.extend({
    init : function(magnitude, vector){
      this._super(magnitude.csp);
      this.magnitude = magnitude;
      this.vector = vector;
    },

    canonicalizeVariables : function(){
      this.magnitude = this.registerCanonical(this.magnitude);
      this.vector.canonicalizeAndRegisterConstraint(this);
    },

    propagate : function(fail){
      //start by compiling a list of squares on the vector values
      var squares = [];
      for(index = 0, len = this.vector.vars.length; index < len; ++index){
        squares.push(this.vector.vars[index].value().square());
      }

      if(this.narrowedVariable != this.magnitude){
        this.magnitude.narrowTo(Interval.positiveSqrt(Interval.sumAll(squares)), fail);
        if(fail[0]){
          return;
        }
      }

      var squaredMagnitude = this.magnitude.value().square();
      for(index = 0, len = this.vector.vars.length; index < len; ++index){
        var relevantSquares = squares.slice(0, index);
        relevantSquares = relevantSquares.concat(squares.slice(index + 1, squares.length));
        this.vector.vars[index].narrowToSignedSqrt(Interval.subtract(squaredMagnitude, Interval.sumAll(relevantSquares)), fail);
        if(fail[0]){
          return;
        }
      }
    },

    toString : function(){
      return "<" + this.magnitude.name + " = magnitude(" + this.vector.name + ")>";
    }
  });
  constraints.MagnitudeConstraint = MagnitudeConstraint;

  return constraints;
});
