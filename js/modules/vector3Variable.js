//representation of a vector of three values for craftjs
//These are floating point values

define(['inheritance', 'floatVariable', 'interval', 'formatTools'], function(Inheritance, FloatVariable, Interval, FormatTools){

    makeVector3FromBBox = function(name, p, b){
        return makeVector3FromDouble(name, b.x, b.y, b.z, p);
    };

    makeVector3FromDouble = function(name, p, x, y, z){
        return makeVector3FromInterval(name, p, new Interval(x, x), new Interval(y, y), new Interval(z, z));
    };

    makeVector3FromInterval = function(name, p, x, y, z){
        return new Vector3Variable(name, p, x, y, z);
    };

    makeVector3FromFloatVariable = function(name, x, y, z){
      return new Vector3Variable(name, x.csp, x, y, z);
    };

    var Vector3Variable = Class.extend({
        init : function(name, p, x, y, z){
          if(x.csp){
            this.x = x;
          }else{
            this.x = new FloatVariable(name + ".X", p, x);
          }

          if(y.csp){
            this.y = y;
          }else{
            this.y = new FloatVariable(name + ".Y", p, y);
          }

          if(z.csp){
            this.z = z;
          }else{
            this.z = new FloatVariable(name + ".Z", p, z);
          }

          this.name = name;
        },

        getCSP : function(){
            return this.x.csp;
        },

        magnitude : function(){
          var funct = function(){
            var magnitude = new FloatVariable(
              "magnitude",
              this.x.csp,
              Interval.positiveSqrt(
                Interval.add(
                  Interval.add(
                    this.x.value().square(),
                    this.y.value().square()
                  ),
                  this.z.value().square()
                )
              )
            );
            new MagnitudeConstraint(magnitude, this);
            return magnitude;
          };
          return this.x.csp.memorize("magnitude", funct, [this]);
        },

        toString : function(){
          return FormatTools.stringFormat("{0} : ({1}, {2}, {3})", this.name, this.x.value(), this.y.value(), this.z.value());
        },

        canonicalizeAndRegisterConstraint : function(c){
          this.x = c.registerCanonical(this.x);
          this.y = c.registerCanonical(this.y);
          this.z = c.registerCanonical(this.z);
        },

        //constraints
        mustEqual : function(v){
          this.x.mustEqual(v.x);
          this.y.mustEqual(v.y);
          this.z.mustEqual(v.z);
        },

        mustBeParallel : function(v){
          var coeff = new FloatVariable("parallelCoefficient", this.getCSP(), Interval.allValues);
          this.mustEqual(Vector3Variable.scalarMultiply(coeff, v));
        },

        mustBePerpendicular : function(v){
          var dotProduct = Vector3Variable.dotProduct(this, v);
          dotProduct.mustEqual(0);
        }
    });
    /*
      ============HELPER FUNCTIONS======================================
     */
    function check3Vector(v){
      if((v.x !== undefined && v.x.csp !== undefined) &&
          (v.y !== undefined && v.y.csp !== undefined) &&
          (v.z !== undefined && v.z.csp !== undefined)){
        return true;
      }else{
        return false;
      }
    }

    /*
      =============OPERATIONS ON VECTOR3 VARIABLES======================
     */
     function internalVectorAdd(a, b){
         var funct = function(){
             var result = new Vector3Variable(FloatVariable.sum(a.x, b.x),
                 FloatVariable.sum(a.y, b.y), FloatVariable.sum(a.z, b.z));
             return result;
         };
         return a.x.csp.memorize("+", funct, [a, b]);
     }

     function vectorAdd(a,b){
       //type check-- we can't coerce our way out of this one, so it's a hard
       //check
       if(check3Vector(a) && check3Vector(b)){
         return internalVectorAdd(a, b);
       }else{
         throw "Invalid arguments provided for vector addition";
       }
     }
     Vector3Variable.add = vectorAdd;

     function internalVectorSubtract(a, b){
         var funct = function(){
             var result = new Vector3Variable(FloatVariable.subtract(a.x, b.x),
             FloatVariable.subtract(a.y, b.y), FloatVariable.subtract(a.z, b.z));
             return result;
         };
         return a.x.csp.memorize("-", funct, [a, b]);
     }

     function vectorSubtract(a,b){
       //type check-- we can't coerce our way out of this one, so it's a hard
       //check
       if(check3Vector(a) && check3Vector(b)){
         return internalVectorSubtract(a, b);
       }else{
         throw "Invalid arguments provided for vector subtraction";
       }
     }
     Vector3Variable.subtract = vectorSubtract;

     function internalMultiplyScalarByVector(s, v){
         var funct = function(){
             var result = new Vector3Variable(FloatVariable.multply(s, v.x),
                 FloatVariable.multiply(s, v.y), FloatVariable.mupltiply(s, v.z));
             return result;
         };
         return s.csp.memorize("*", funct, [s, v]);
     }

     function scalarMultiply(a,b){
        //fast fail-- did the user supply two vectors?  If so, they're looking
        //for something that isn't scalar multiplcation
        if(check3Vector(a) && check3Vector(b)){
          throw "Scalar multiplcation is not valid for two vectors";
        }

       //find out which term is the vector term and multiply. FloatVariable
       //already has all the logic for coersion, so we don't need to do it here.
       if(check3Vector(a)){
         return internalMultiplyScalarByVector(b, a);
       }else if(check3Vector(b)){
         return internalMultiplyScalarByVector(a, b);
       }else{
         throw "Unable to find a vector to perform vector by scalar multiplcation";
       }
     }
     Vector3Variable.scalarMultiply = scalarMultiply;

     function internalDivideVectorByScalar(v, s){
         var funct = function(){
             var result = new Vector3Variable(FloatVariable.divide(v.x, s),
                 FloatVariable.divide(v.y, s), FloatVariable.divide(v.z, s));
             return result;
         };
         return s.csp.memorize("/", funct, [v, s]);
     }

     function scalarDivide(a, b){
       //unlike before, this has a strong order a / b.  A must be a vector, B a scalar.
       if(check3Vector(a)){
         return internalDivideVectorByScalar(a, b);
       }else{
         throw "the first term must be a vector to divide by a scalar";
       }
     }
     Vector3Variable.scalarDivide = scalarDivide;

     function internalDotProduct(a, b){
         var funct = function(){
             var product = new FloatVariable(
                 a.name + " dot " + b.name,
                 a.x.csp,
                 Interval.multiply(
                   Interval.multiply(
                     Interval.multiply(
                       Interval.multiply(
                         Interval.multiply(
                           a.x.value(), b.x.value()
                         ), a.y.value()
                       ), b.y.value()
                     ), a.z.value()
                   ), b.z.value()
                 ));
             new DotProductConstraint(product, a, b);
             return product;
         };
         return a.x.csp.memorize(a.name + " dot " + b.name, funct, [a, b]);
     }

     function dotProduct(a, b){
       if(check3Vector(a) && check3Vector(b)){
         return internalDotProduct(a, b);
       }else{
         throw "Both arguments must be vectors for a dot product";
       }
     }
     Vector3Variable.dotProduct = dotProduct;

     return Vector3Variable;
});
