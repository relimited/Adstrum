//Testing various helper constraint constructors to make sure they do what's on the tin.

define(['inheritance', 'csp', 'floatVariable', 'integerVariable', 'mathUtil'], function(Inheritance, CSP, FloatVariable, IntegerVariable, MathUtil){
    describe("Testing Constraints", function(){
        it("Testing Must Equal Constraint", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var sum = FloatVariable.add(a, b);
            sum.mustEqual(1)

            for(var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), 1)).toBe(true);
            }
        });

        it("Testing Must Be In Range Constraint", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 10);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 10);
            var sum = FloatVariable.add(a, b);
            sum.mustBeContainedInRange(5, 7);

            for(var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
                expect(MathUtil.nearlyLE(sum.uniqueValue(), 7)).toBe(true);
                expect(MathUtil.nearlyGE(sum.uniqueValue(), 5)).toBe(true);
            }
        });

        it("Testing Less Than or Equal To Constraint", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 10);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 10);
            var sum = FloatVariable.add(a, b);
            sum.mustBeLessThanOrEqualTo(10);

            for(var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
                expect(MathUtil.nearlyLE(sum.uniqueValue(), 10)).toBe(true);
            }
        });

        it("Testing Greater Than or Equal To Constraint", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 10);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 10);
            var sum = FloatVariable.add(a, b);
            sum.mustBeGreaterThanOrEqualTo(5);

            for(var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
                expect(MathUtil.nearlyGE(sum.uniqueValue(), 5)).toBe(true);
            }
        });

        it("Testing Must Equal Constraint for integers", function(){
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 10);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 10);
            var sum = IntegerVariable.add(a, b);
            sum.mustEqual(14);

            for(var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), 14)).toBe(true);
                expect(Number.isInteger(a.uniqueValue())).toBe(true);
                expect(Number.isInteger(b.uniqueValue())).toBe(true);
            }
        });

        it("Testing Must Be In Range Constraint for integers", function(){
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 10);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 10);
            var sum = IntegerVariable.add(a, b);
            sum.mustBeContainedInRange(5, 7);

            for(var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
                expect(MathUtil.nearlyLE(sum.uniqueValue(), 7)).toBe(true);
                expect(MathUtil.nearlyGE(sum.uniqueValue(), 5)).toBe(true);
                expect(Number.isInteger(a.uniqueValue())).toBe(true);
                expect(Number.isInteger(b.uniqueValue())).toBe(true);
                expect(Number.isInteger(sum.uniqueValue())).toBe(true);
            }
        });

        it("Testing Less Than or Equal To Constraint for integers", function(){
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 10);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 10);
            var sum = IntegerVariable.add(a, b);
            sum.mustBeLessThanOrEqualTo(10);

            for(var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
                expect(MathUtil.nearlyLE(sum.uniqueValue(), 10)).toBe(true);
                expect(Number.isInteger(a.uniqueValue())).toBe(true);
                expect(Number.isInteger(b.uniqueValue())).toBe(true);
                expect(Number.isInteger(sum.uniqueValue())).toBe(true);
            }
        });

        it("Testing Greater Than or Equal To Constraint for integers", function(){
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 10);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 10);
            var sum = IntegerVariable.add(a, b);
            sum.mustBeGreaterThanOrEqualTo(5);

            for(var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
                expect(MathUtil.nearlyGE(sum.uniqueValue(), 5)).toBe(true);
                expect(Number.isInteger(a.uniqueValue())).toBe(true);
                expect(Number.isInteger(b.uniqueValue())).toBe(true);
                expect(Number.isInteger(sum.uniqueValue())).toBe(true);
            }
        });
    })
});
