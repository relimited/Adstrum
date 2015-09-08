/**
* tests for veriable canonicalization.
* canonicalization is a silly word
*/
define(['inheritance', 'jasmine', '../modules/memoTable', '../modules/csp', '../modules/FloatVariable'], function(Inheritance, Jasmine, CSP, FloatVariable){
    describe("Testing out variable canonicalization", function(){
        it("Caching Test", function(){
            var i = 0;
            var f = function(){};
            var t = new MemoTable();

            expect(t.memorize("x", f, 1).equals(t.memorize("x", f, 1))).toBe(true)
            expect(t.memorize("x", f, 1).equals(t.memorize("x", f, 2))).toBe(false)
        })

        it("Equality Constraint Test 1", function(){
            var p = new CSP()
            var a = new FloatVariable("a", p, 0, 1);
            var b = new FloatVariable("b", p, 0, 1);
            var c = new FloatVariable("c", p);
            c.mustEqual(b);
            var sum = FloatVariable.add(a, b);
            sum.mustEqual(1);

            for(var i = 0; i < 10; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue, (a.uniqueValue + b.uniqueValue))).toBe(true);
                expect(c.value == b.value).toBe(true);
            }
        })

        it("Equality Constraint Test 2", function(){
            var p = new CSP()
            var a = new FloatVariable("a", p, 0, 1);
            var b = new FloatVariable("b", p, 0, 1);
            var c = new FloatVariable("c", p);
            c.mustEqual(b);
            var sum = a.plus(b);
            sum.mustEqual(1);

            for(var i = 0; i < 10; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue, (a.uniqueValue + b.uniqueValue))).toBe(true);
                expect(c.value == b.value).toBe(true);
            }
        })
    })
});
