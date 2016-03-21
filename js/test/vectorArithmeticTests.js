/*
  Unit tests for floating point vector arithmetic
 */
define(['inheritance', 'csp', 'floatVariable', 'floatVectorVariable', 'boundingBox', 'mathUtil', 'interval'], function(Inheritance, CSP, FloatVariable, FloatVectorVariable, BoundingBox, MathUtil, Interval){
  describe("Testing Vector Arithmetic", function(){
      var box = new BoundingBox(new Interval(-1, 1), new Interval(-1, 1), new Interval(-1, 1));

      assertUnique = function(v, value){
          expect(v.isUnique()).toBe(true);
          expect(value == v.uniqueValue()).toBe(true);
      };

      it("Vector Addition Tests", function(){
        var p = new CSP();
        var v1 = FloatVectorVariable.makeFloatVectorFromBBox("v1", p, box);
        var v2 = FloatVectorVariable.makeFloatVectorFromBBox("v2", p, box);
        var sum = FloatVectorVariable.add(v1, v2);
        for(var index = 0, len = 1000; index < len; ++index){
          p.newSolution();
          expect(MathUtil.nearlyEqual((v1.vars[0].uniqueValue() + v2.vars[0].uniqueValue()), sum.vars[0].uniqueValue())).toBe(true);
          expect(MathUtil.nearlyEqual((v1.vars[1].uniqueValue() + v2.vars[1].uniqueValue()), sum.vars[1].uniqueValue())).toBe(true);
          expect(MathUtil.nearlyEqual((v1.vars[2].uniqueValue() + v2.vars[2].uniqueValue()), sum.vars[2].uniqueValue())).toBe(true);
        }
      });

      it("Vector Subtraction Tests", function(){
        var p = new CSP();
        var v1 = FloatVectorVariable.makeFloatVectorFromBBox("v1", p, box);
        var v2 = FloatVectorVariable.makeFloatVectorFromBBox("v2", p, box);
        var sum = FloatVectorVariable.subtract(v1, v2);
        for(var index = 0, len = 1000; index < len; ++index){
          p.newSolution();
          expect(MathUtil.nearlyEqual((v1.vars[0].uniqueValue() - v2.vars[0].uniqueValue()), sum.vars[0].uniqueValue())).toBe(true);
          expect(MathUtil.nearlyEqual((v1.vars[1].uniqueValue() - v2.vars[1].uniqueValue()), sum.vars[1].uniqueValue())).toBe(true);
          expect(MathUtil.nearlyEqual((v1.vars[2].uniqueValue() - v2.vars[2].uniqueValue()), sum.vars[2].uniqueValue())).toBe(true);
        }
      });

      it("Scalar Multiplcation Tests", function(){
        var p = new CSP();
          var v1 = FloatVectorVariable.makeFloatVectorFromBBox("v1", p, box);
          var s = FloatVariable.makeFloatVariableWithBounds("s", p, -1, 1);
          var product = FloatVectorVariable.scalarMultiply(v1, s);

          for(var index = 0, len = 1000; index < len; ++index){
            p.newSolution();
            expect(MathUtil.nearlyEqual((v1.vars[0].uniqueValue() * s.uniqueValue()), product.vars[0].uniqueValue())).toBe(true);
            expect(MathUtil.nearlyEqual((v1.vars[1].uniqueValue() * s.uniqueValue()), product.vars[1].uniqueValue())).toBe(true);
            expect(MathUtil.nearlyEqual((v1.vars[2].uniqueValue() * s.uniqueValue()), product.vars[2].uniqueValue())).toBe(true);
          }
      });

      it("Divide by a scalar tests", function(){
        var p = new CSP();
          var v1 = FloatVectorVariable.makeFloatVectorFromBBox("v1", p, box);
          var s = FloatVariable.makeFloatVariableWithBounds("s", p, -1, 1);
          var product = FloatVectorVariable.scalarDivide(v1, s);

          for(var index = 0, len = 1000; index < len; ++index){
            p.newSolution();
            expect(MathUtil.nearlyEqual((v1.vars[0].uniqueValue() / s.uniqueValue()), product.vars[0].uniqueValue())).toBe(true);
            expect(MathUtil.nearlyEqual((v1.vars[1].uniqueValue() / s.uniqueValue()), product.vars[1].uniqueValue())).toBe(true);
            expect(MathUtil.nearlyEqual((v1.vars[2].uniqueValue() / s.uniqueValue()), product.vars[2].uniqueValue())).toBe(true);
          }
      });

      it("Dot Product 1 over fixed Tets", function(){
        var p = new CSP();
        var eX = FloatVectorVariable.makeFloatVectorFromDoubles("eX", p, [1, 0, 0]);
        var unknown = FloatVectorVariable.makeFloatVectorFromBBox("unknown", p, box);
        var dot = FloatVectorVariable.dotProduct(eX, unknown);
        dot.mustEqual(0);

        for(var index = 0, len = 1000; index < len; ++index){
          p.newSolution();
          expect(MathUtil.nearlyEqual(unknown.vars[0].uniqueValue(), 0)).toBe(true);
        }
      });

      it("Dot Product Test", function(){
        var p = new CSP();
        var v1 = FloatVectorVariable.makeFloatVectorFromBBox("v1", p, box);
        var v2 = FloatVectorVariable.makeFloatVectorFromBBox("v2", p, box);
        var dot = FloatVectorVariable.dotProduct(v1, v2);
        dot.mustEqual(0);

        for(var index = 0, len = 1000; index < len; ++index){
          p.newSolution();
          var actualProduct = (v1.vars[0].uniqueValue() * v2.vars[0].uniqueValue()) +
                              (v1.vars[1].uniqueValue() * v2.vars[1].uniqueValue()) +
                              (v1.vars[2].uniqueValue() * v2.vars[2].uniqueValue());
          expect(MathUtil.nearlyEqual(actualProduct, 0)).toBe(true);
          expect(MathUtil.nearlyEqual(dot.uniqueValue(), 0)).toBe(true);
        }
      });

      it("Unit Vector Test", function(){
        var p = new CSP();
        var v = FloatVectorVariable.makeFloatVectorFromBBox("v", p, box);
        var mag = v.magnitude();
        mag.mustEqual(1);

        for(var index = 0, len = 1000; index < len; ++index){
          p.newSolution();
          var actualMag = Math.sqrt(Math.pow(v.vars[0].uniqueValue(), 2) +
                                    Math.pow(v.vars[1].uniqueValue(), 2) +
                                    Math.pow(v.vars[2].uniqueValue(), 2));
          expect(MathUtil.nearlyEqual(actualMag, 1)).toBe(true);
          expect(MathUtil.nearlyEqual(mag.uniqueValue(), 1)).toBe(true);
        }
      });

      it("2D Orthonormal Basis Test", function(){
        var p = new CSP();
        var v1 = FloatVectorVariable.makeFloatVectorFromVariables("vec1", [FloatVariable.makeFloatVariableWithBounds("vec1[0]", p, -1, 1), FloatVariable.makeFloatVariableWithBounds("vec1[1]", p, -1, 1)]);
        var v2 = FloatVectorVariable.makeFloatVectorFromVariables("vec2", [FloatVariable.makeFloatVariableWithBounds("vec2[0]", p, -1, 1), FloatVariable.makeFloatVariableWithBounds("vec2[1]", p, -1, 1)]);
        v1.magnitude().mustEqual(1);
        v2.magnitude().mustEqual(1);
        v1.mustBePerpendicular(v2);
        for(var index = 0, len = 1000; index < len; ++index){
          p.newSolution();
          var actualDot = (v1.vars[0].uniqueValue() * v2.vars[0].uniqueValue()) +
                          (v1.vars[1].uniqueValue() * v2.vars[1].uniqueValue());
          expect(MathUtil.nearlyEqual(actualDot, 0)).toBe(true);
        }
      });

      /*
      it("Orthonormal Basis Test", function(){
        var p = new CSP();
        //set the CSP for a long, looooong problem.
        p.maxSteps = 10000000;

        var v1 = FloatVectorVariable.makeFloatVectorFromBBox("v1", p, box);
        var v2 = FloatVectorVariable.makeFloatVectorFromBBox("v2", p, box);
        var v3 = FloatVectorVariable.makeFloatVectorFromBBox("v3", p, box);
        var v1Mag = v1.magnitude();
        var v2Mag = v2.magnitude();
        var v3Mag = v3.magnitude();
        v1Mag.mustEqual(1);
        v2Mag.mustEqual(1);
        v3Mag.mustEqual(1);
        v1.mustBePerpendicular(v2);
        v2.mustBePerpendicular(v3);
        v3.mustBePerpendicular(v1);

        for(var index = 0, len = 10; index < len; ++len){
          p.newSolution();
          var actualMag = Math.sqrt(Math.pow(v1.vars[0].uniqueValue(), 2) +
                                    Math.pow(v1.vars[1].uniqueValue(), 2) +
                                    Math.pow(v1.vars[2].uniqueValue(), 2));
          expect(MathUtil.nearlyEqual(actualMag, 1)).toBe(true);
          expect(MathUtil.nearlyEqual(v1Mag.uniqueValue(), 1)).toBe(true);
          var actualDot = (v1.vars[0].uniqueValue() * v2.vars[0].uniqueValue()) +
                          (v1.vars[1].uniqueValue() * v2.vars[1].uniqueValue()) +
                          (v1.vars[2].uniqueValue() * v2.vars[2].uniqueValue());
          expect(MathUtil.nearlyEqual(actualDot, 0)).toBe(true);


          actualMag = Math.sqrt(Math.pow(v2.vars[0].uniqueValue(), 2) +
                                Math.pow(v2.vars[1].uniqueValue(), 2) +
                                Math.pow(v2.vars[2].uniqueValue(), 2));
          expect(MathUtil.nearlyEqual(actualMag, 1)).toBe(true);
          expect(MathUtil.nearlyEqual(v2Mag.uniqueValue(), 1)).toBe(true);
          actualDot = (v2.vars[0].uniqueValue() * v3.vars[0].uniqueValue()) +
                      (v2.vars[1].uniqueValue() * v3.vars[1].uniqueValue()) +
                      (v2.vars[2].uniqueValue() * v3.vars[2].uniqueValue());
          expect(MathUtil.nearlyEqual(actualDot, 0)).toBe(true);


          actualMag = Math.sqrt(Math.pow(v3.vars[0].uniqueValue(), 2) +
                                Math.pow(v3.vars[1].uniqueValue(), 2) +
                                Math.pow(v3.vars[2].uniqueValue(), 2));
          expect(MathUtil.nearlyEqual(actualMag, 1)).toBe(true);
          expect(MathUtil.nearlyEqual(v3Mag.uniqueValue(), 1)).toBe(true);
          actualDot = (v3.vars[0].uniqueValue() * v1.vars[0].uniqueValue()) +
                      (v3.vars[1].uniqueValue() * v1.vars[1].uniqueValue()) +
                      (v3.vars[2].uniqueValue() * v1.vars[2].uniqueValue());
          expect(MathUtil.nearlyEqual(actualDot, 0)).toBe(true);
        }
      });
      */
    });
});
