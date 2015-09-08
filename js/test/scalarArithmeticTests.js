//Scalar Arithmetic Testing
define(['inheritance', 'jasmine', '../modules/memoTable', '../modules/csp', '../modules/FloatVariable', '../modules/mathUtil.js'], function(Inheritance, Jasmine, CSP, FloatVariable, MathUtil){

    describe("Testing Scalar Arithmetic", function(){
        assertUnique = function(v, value){
            expect(v.isUnique()).toBe(true);
            expect(value == v.uniqueValue).toBe(true);
        };

        it("Unconstrained Sum Tests", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var sum = FloatVariable.sum(a, b);

            for(var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue, (a.uniqueValue + b.uniqueValue))).toBe(true);
            }
        });

        it("Semi-Constrained Sum Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var sum = FloatVariable.add(a, b);
            sum.mustEqual(1);

            for (var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue, (a.uniqueValue + b.uniqueValue))).toBe(true);
            }
        });

        it("Quadratic Tests", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, -100, 100);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, -100, 100);
            var quad = FloatVariable.add(FloatVariable.pow(a, 2), b));
            fail = false;
            quad.narrowTo(new Interal(10, 20), fail);

            for (var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(quad.uniqueValue, (a.uniqueValue * a.uniqueValue + b.UniqueValue))).toBe(true);
            }
        });

        it("Sum Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var sum = FloatVariable.add(a, b);
            a.mustEqual(0.5);
            b.mustEqual(0.25);

            p.testConsistency();
            assertUnique(sum, 0.75);
        });

        it("Sum A term Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var sum = FloatVariable.add(a, b);
            b.mustEqual(0.5);
            sum.mustEqual(1);

            p.testConsistency();
            assertUnique(a, 0.5);
        });

        it("Sum B Term Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var sum = FloatVariable.add(a, b);
            a.mustEqual(0.5);
            sum.mustEqual(1);

            p.testConsistency();
            assertUnique(b, 0.5);
        });

        it("Difference Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var difference = FloatVariable.subtract(a, b);
            a.mustEqual(0.5);
            b.mustEqual(0.25);

            p.testConsistency();
            assertUnique(difference, 0.25);
        });

        it("Difference A Term Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var difference = FloatVariable.subtract(a, b);
            b.mustEqual(0.5);
            difference.mustEqual(0.5);

            p.testConsistency();
            assertUnique(a, 1);
        });

        it("Difference B Term Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var difference = FloatVariable.subtract(a, b);
            a.mustEqual(0.5);
            difference.mustEqual(0.25);

            p.testConsistency();
            assertUnique(b, 0.25);
        });

        it("Product Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var product = FloatVariable.multiply(a, b);
            a.mustEqual(0.5);
            b.mustEqual(0.5);

            p.testConsistency();
            assertUnique(product, 0.25);
        });

        it("Product A Term Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var product = FloatVariable.multiply(a, b);

            b.mustEqual(0.5);
            product.mustEqual(0.5);

            p.testConsistency();
            assertUnique(a, 1);
        });

        it("Product B Term Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var product = FloatVariable.multiply(a, b);

            a.mustEqual(0.5);
            product.mustEqual(0.25);
        });

        it("Quotent Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var quotent = FloatVariable.divide(a, b);

            a.mustEqual(0.5);
            b.mustEqual(0.5);

            p.testConsistency();
            assertUnique(quotent, 1);
        });

        it("Quotent A Term Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var quotent = FloatVariable.divide(a, b);

            b.mustEqual(0.5);
            quotent.mustEqual(0.5);

            p.testConsistency();
            assertUnique(a, 0.25);
        });

        it("Quotent B Term Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithInterval("b", p, 0, 1);
            var quotent = FloatVariable.divide(a, b);

            a.mustEqual(0.5);
            quotent.mustEqual(0.25);

            p.testConsistency();
            assertUnique(b, 2);
        });

        it("Odd Power Negative Tests", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, -3, 3);
            var power = FloatVariable.pow(a, 3);
            a.mustEqual(-2);

            p.testConsistency();
            assertUnique(power, -8);
        });

        it("Odd Power Negative A Term Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, -3, 3);
            var power = FloatVariable.pow(a, 3);
            power.mustEqual(-8);

            p.testConsistency();
            assertUnique(a, -2);
        });

        it("Odd Power Positive Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, -3, 3);
            var power = FloatVariable.pow(a, 3);

            p.testConsistency();
            assertUnique(power, 8);
        });

        it("Odd Power Positive A Term", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, -3, 3);
            var power = FloatVariable.pow(a, 3);
            power.mustEqual(8);

            p.testConsistency();
            assertUnique(a, 2);
        });

        it("Even Power Positive A Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 3);
            var power = FloatVariable.pow(a, 2);
            power.mustEqual(4);

            p.testConsistency();
            assertUnique(a, 2);
        });

        it("Even Power Positive Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, 0, 3);
            var power = FloatVariable.pow(a, 2);

            p.testConsistency();
            assertUnique(power, 4);
        });

        it("Even Power Negative A Term Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, -3, 0);
            var power = FloatVariable.pow(a, 2);
            power.mustEqual(4);

            p.testConsistency();
            assertUnique(a, -2);
        });

        it("Even Power Negative Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, -3, 0);
            var power = FloatVariable.pow(a, 2);
            a.mustEqual(-2);

            p.testConsistency();
            assertUnique(power, 4);
        });

        it("Even Power Zero Crossing A Term Test", function(){
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithInterval("a", p, -3, 3);
            var power = FloatVariable.pow(a, 2);
            power.mustEqual(4);

            p.testConsistency();
            expect(new Interval(-2, 2).equals(a.value())
        })
    });
}
