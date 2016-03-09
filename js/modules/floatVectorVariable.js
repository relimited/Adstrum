/**
 * Representing a vector of floating point variables in Craftjs.  Allows us to
 * do magnitude computation, as well as parallel / intersecting constraints.
 *
 * Starting point for geometric constraints as well.  Vectors are also where
 * sum constraints and various statistics constraints will live (because they already organize sets of variables)
 */
define(['inheritance', 'floatVariable', 'interval', 'formatTools'], function(Inheritance, FloatVariable, Interval, FormatTools){

  /*
    =================CONSTRUCTORS====================================
   */


    makeFloatVectorFromBBox = function(name, p, b){
        return makeFloatVectorFromDoubles(name, p, [b.x, b.y, b.z]);
    };

    makeFloatVectorFromDoubles = function(name, p, array){
        var list = [];
        for(var i = 0; i < array.length; i++){
          list.push(new Interval(array[i], array[i]));
        }
        return makeFloatVectorFromIntervals(name, p, list);
    };

    makeFloatVectorFromIntervals = function(name, p, array){
        return new FloatVectorVariable(name, p, array);
    };

    makeFloatVectorFromVariables = function(name, array){
      return new FloatVectorVariable(name, array[0].csp, array);
    };

    /*
      =========================PRIVATE HELPER FUNCTIONS=================
    */
    recusriveMagnitudeOp = function(array, curSum, idx){
      if(idx >= array.length){
        return curSum;
      }else{
        curSum = Interval.add(curSum, array[idx].value().square());
        recusriveMagnitudeOp(array, curSum, ++idx);
      }
    };

    var FloatVectorVariable = Class.extend({
        init : function(name, p, array){
          this.vars = [];
          //trying to eke out speed wherever we can, see
          //http://stackoverflow.com/questions/9329446/for-each-over-an-array-in-javascript
          for(var index = 0, len = array.length; index < len; ++index){
            if(array[i].csp){
              this.vars.push(array[i]);
            }else{
              this.vars.push(new FloatVariable(name + "[" + i + "]", p, array[i]));
            }
          }

          this.name = name;
        },

        getCSP : function(){
            return this.vars[0].csp;
        },

        magnitude : function(){
          var funct = function(){
            var magnitude = new FloatVariable(
              "magnitude",
              this.getCSP(),
              Interval.positiveSqrt(
                recusriveMagnitudeOp(this.vars, 0, 0)
              )
            );
            new MagnitudeConstraint(magnitude, this);
            return magnitude;
          };
          return this.getCSP().memorize("magnitude", funct, [this]);
        },

        toString : function(){
          var str = this.name + " : (" + this.vars[0].value();
          for(var index = 1, len = this.vars.length; index < len; ++index){
            str = str + ", " + this.vars[i].value();
          }
          str = str + ")";
          return str;
        },

        canonicalizeAndRegisterConstraint : function(c){
          for(var index = 0, len = this.vars.length; index < len; ++index){
            this.vars[index] = c.registerCanonical(this.vars[index]);
          }
        },

        checkLength : function(v){
          if(v.vars.length == this.vars.length){
            return true;
          }else{
            return false;
          }
        },

        //constraints
        mustEqual : function(v){
          // fast fail-- if v and the current vector are of different lengths,
          // we can't inforce htat they're equal

          if(!checkLength(v)){
            throw "Can not constraint two different length vectors to be equal";
          }

          for(var index = 0, len = this.vars.length; index < len; ++index){
            this.vars[i].mustEqual(v.vars[i]);
          }
        },

        mustBeParallel : function(v){
          var coeff = new FloatVariable("parallelCoefficient", this.getCSP(), Interval.allValues);
          this.mustEqual(FloatVectorVariable.scalarMultiply(coeff, v));
        },

        mustBePerpendicular : function(v){
          var dotProduct = FloatVectorVariable.dotProduct(this, v);
          dotProduct.mustEqual(0);
        },
    });
    /*
      ============HELPER FUNCTIONS======================================
     */
    function checkFloatVector(v){
      if(v.vars){
        for(var index = 0, len = v.vars.length; index < len; ++index){
          if(v[index].csp === undefined){
            return false;
          }
        }
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
           var sumArray = [];
           for(var index = 0, len = a.vars.length; index < len; ++index){
             sumArray.push(FloatVariable.sum(a.vars[i], b.vars[i]));
           }
             var result = new FloatVectorVariable("sum", a.getCSP(), sumArray);
             return result;
         };
         return a.getCSP().memorize("+", funct, [a, b]);
     }

     function vectorAdd(a,b){
       //type check-- we can't coerce our way out of this one, so it's a hard
       //check
       if(checkFloatVector(a) && checkFloatVector(b) && a.checkLength(b)){
         return internalVectorAdd(a, b);
       }else{
         throw "Invalid arguments provided for vector addition";
       }
     }
     FloatVectorVariable.add = vectorAdd;

     //subtraction
     function internalVectorSubtract(a, b){
         var funct = function(){
           var differenceArray = [];
           for(var index = 0, len = a.vars.length; index < len; ++index){
             differenceArray.push(FloatVariable.subtract(a.vars[i], b.vars[i]));
           }
           var result = new FloatVectorVariable("difference", a.getCSP(), differenceArray);
           return result;
         };
         return a.getCSP().memorize("-", funct, [a, b]);
     }

     function vectorSubtract(a,b){
       //type check-- we can't coerce our way out of this one, so it's a hard
       //check
       if(checkFloatVector(a) && checkFloatVector(b) && a.checkLength(b)){
         return internalVectorSubtract(a, b);
       }else{
         throw "Invalid arguments provided for vector subtraction";
       }
     }
     FloatVectorVariable.subtract = vectorSubtract;

     //scalar multiplcation
     function internalMultiplyScalarByVector(s, v){
        var scalarMultiplyArray = [];
         var funct = function(){
           for(var index = 0, len = v.vars.length; index < len; ++index){
             scalarMultiplyArray.push(FloatVariable.multiply(s, v.vars[i]));
           }
            var result = new FloatVectorVariable("scalar product", v.getCSP(), scalarMultiplyArray);
            return result;
         };
         return v.getCSP().memorize("*", funct, [s, v]);
     }

     function scalarMultiply(a, b){
        //fast fail-- did the user supply two vectors?  If so, they're looking
        //for something that isn't scalar multiplcation
        if(check3Vector(a) && check3Vector(b)){
          throw "Scalar multiplcation is not valid for two vectors";
        }

       //find out which term is the vector term and multiply. FloatVariable
       //already has all the logic for coersion, so we don't need to do it here.
       if(check3Vector(a)){
         return internalMultiplyScalarByVector(b, a);
       }else if(checkFloatVector(b)){
         return internalMultiplyScalarByVector(a, b);
       }else{
         throw "Unable to find a vector to perform vector by scalar multiplcation";
       }
     }
     FloatVectorVariable.scalarMultiply = scalarMultiply;

     //division
     function internalDivideVectorByScalar(v, s){
         var scalarDivisionArray = [];
         var funct = function(){
           for(var index = 0, len = v.vars.length; index < len; ++index){
             scalarDivisionArray.push(FloatVariable.divide(v.vars[i], s));
           }
             var result = new FloatVectorVariable("scalar quotient", v.getCSP(), scalarDivisionArray);
             return result;
         };
         return v.getCSP().memorize("/", funct, [v, s]);
     }

     function scalarDivide(a, b){
       //unlike before, this has a strong order a / b.  A must be a vector, B a scalar.
       if(checkFloatVector(a)){
         return internalDivideVectorByScalar(a, b);
       }else{
         throw "the first term must be a vector to divide by a scalar";
       }
     }
     FloatVectorVariable.scalarDivide = scalarDivide;

     //dot product
     function internalDotProduct(a, b){
       //leverage Craftjs variables to keep track of arbitrary dimensional dot products
       var productArray = [];
         var funct = function(){
           //start by calculating all individual elements products
           for(var index = 0, len = a.vars.length; index < len; ++index){
             productArray.push(FloatVariable.multiply(a.vars[i], b.vars[i]));
           }
           var productVar = new FloatVectorVariable("product", a.getCSP(), productArray);

           //sum all elements in the productVector
           var sum = FloatVariable.sumAll(productVar.vars);
           new DotProductConstraint(sum, a, b);
           return sum;
         };
         return a.getCSP().memorize(a.name + " dot " + b.name, funct, [a, b]);
     }

     function dotProduct(a, b){
       if(checkFloatVector(a) && checkFloatVector(b)){
         return internalDotProduct(a, b);
       }else{
         throw "Both arguments must be vectors for a dot product";
       }
     }
     FloatVectorVariable.dotProduct = dotProduct;

     return VectorFloatVariable;
});
