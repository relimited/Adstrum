//Testing various helper constraint constructors to make sure they do what's on the tin.

define(['inheritance', 'csp', 'floatVariable', 'mathUtil'], function(Inheritance, CSP, FloatVariable, MathUtil){
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
    })
});
