/**
* tests for veriable canonicalization.
* canonicalization is a silly word
*/
define(['inheritance', 'memoTable', 'csp', 'floatVariable', 'mathUtil'], function(Inheritance, MemoTable, CSP, FloatVariable, MathUtil){
    describe("Testing out variable canonicalization", function(){
        it("Caching Test", function(){
            console.log("======================================");
            console.log("Caching Test");
            console.log("======================================");
            var i = 0;
            var f = function(){return i + 1};
            var t = new MemoTable();
            expect(t.memorize("x", f, [1]) == t.memorize("x", f, [1])).toBe(true)
            i=i+1;
            expect(t.memorize("x", f, [1]) == t.memorize("x", f, [2])).toBe(false)
        })

        it("Equality Constraint Test 1", function(){
            console.log("======================================");
            console.log("Equality Constraint Test 1");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var c = FloatVariable.makeInfinateFloatVariable("c", p);

            c.mustEqual(b);
            var sum = FloatVariable.add(a, b);
            sum.mustEqual(1);

            for(var i = 0; i < 10; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
                expect(c.value().equals(b.value())).toBe(true);
            }
        })

        it("Equality Constraint Test 2", function(){
            console.log("======================================");
            console.log("Equality Constraint Test 2");
            console.log("======================================");
            var p = new CSP()
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var c = FloatVariable.makeInfinateFloatVariable("c", p);
            c.mustEqual(b);
            var sum = FloatVariable.add(a, b);
            sum.mustEqual(1);

            for(var i = 0; i < 10; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
                expect(c.value().equals(b.value())).toBe(true);
            }
        })
    })
});
