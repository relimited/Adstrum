//Integer Scalar Arithmetic Testing
define(['inheritance', 'csp', 'floatVariable', 'integerVariable', 'mathUtil', 'interval', 'integerInterval'], function(Inheritance, CSP, FloatVariable, IntegerVariable, MathUtil, Interval, IntegerInterval){
    describe("Testing Integer Scalar Arithmetic", function(){
        assertUnique = function(v, value){
            expect(v.isUnique()).toBe(true);
            expect(value == v.uniqueValue()).toBe(true);
        };
        it("Unconstrained Integer Sum Tests", function(){
            console.log("======================================");
            console.log("Unconstrained Sum Tests");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 1);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 1);
            var sum = IntegerVariable.add(a, b);

            for(var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
            }
        });

        it("Semi-Constrained Integer Sum Test", function(){
            console.log("======================================");
            console.log("Semi-Constrained Sum Tests");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 1);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 1);
            var sum = IntegerVariable.add(a, b);
            sum.mustEqual(1);

            for (var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
            }
        });

        /**
        it("Quadratic Integer Tests", function(){
            console.log("======================================");
            console.log("Quadratic Sum Tests");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, -100, 100);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, -100, 100);
            var quad = IntegerVariable.add(IntegerVariable.pow(a, 2), b);
            var fail = [false];
            quad.mustBeContainedInRange(10, 20);

            for (var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(quad.uniqueValue(), ((a.uniqueValue() * a.uniqueValue()) + b.uniqueValue()))).toBe(true);
                //expect(quad.uniqueValue() >= 10 && quad.uniqueValue() <= 20).toBe(true);
            }
        });
        **/

        it("Integer Sum Test", function(){
            console.log("======================================");
            console.log("Sum Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 2);
            var sum = IntegerVariable.add(a, b);
            a.mustEqual(1);
            b.mustEqual(1);

            p.testConsistency();
            assertUnique(sum, 2);
        });

        it("Integer Sum A term Test", function(){
            console.log("======================================");
            console.log("Sum A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 2);
            var sum = IntegerVariable.add(a, b);
            b.mustEqual(1);
            sum.mustEqual(2);

            p.testConsistency();
            assertUnique(a, 1);
        });

        it("Integer Sum B Term Test", function(){
            console.log("======================================");
            console.log("Sum B Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 2);
            var sum = IntegerVariable.add(a, b);
            a.mustEqual(1);
            sum.mustEqual(2);

            p.testConsistency();
            assertUnique(b, 1);
        });

        it("Integer Difference Test", function(){
            console.log("======================================");
            console.log("Difference Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 2);
            var difference = IntegerVariable.subtract(a, b);
            a.mustEqual(2);
            b.mustEqual(1);

            p.testConsistency();
            assertUnique(difference, 1);
        });

        it("Integer Difference A Term Test", function(){
            console.log("======================================");
            console.log("Difference A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 2);
            var difference = IntegerVariable.subtract(a, b);
            b.mustEqual(1);
            difference.mustEqual(1);

            p.testConsistency();
            assertUnique(a, 2);
        });

        it("Integer Difference B Term Test", function(){
            console.log("======================================");
            console.log("Difference B Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 2);
            var difference = IntegerVariable.subtract(a, b);
            a.mustEqual(2);
            difference.mustEqual(1);

            p.testConsistency();
            assertUnique(b, 1);
        });

        it("Integer Product Test", function(){
            console.log("======================================");
            console.log("Difference Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 2);
            var product = IntegerVariable.multiply(a, b);
            a.mustEqual(2);
            b.mustEqual(2);

            p.testConsistency();
            assertUnique(product, 4);
        });

        it("Integer Product A Term Test", function(){
            console.log("======================================");
            console.log("Product A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 2);
            var product = IntegerVariable.multiply(a, b);

            b.mustEqual(2);
            product.mustEqual(2);

            p.testConsistency();
            assertUnique(a, 1);
        });

        it("Integer Product B Term Test", function(){
            console.log("======================================");
            console.log("Product B Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 2);
            var product = IntegerVariable.multiply(a, b);

            a.mustEqual(1);
            product.mustEqual(2);
            p.testConsistency();
            assertUnique(b, 2);

        });

        it("Integer Const Product Test", function(){
            console.log("======================================");
            console.log("Const Product Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var k = 4;
            var product = IntegerVariable.multiplyVariableByConstant(a, k);

            a.mustEqual(1);
            p.testConsistency();
            assertUnique(product, 4);
        });

        it("Integer Const Product Test w/ floating point k", function(){
            console.log("======================================");
            console.log("Const Product Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var k = 4.4;
            var product = IntegerVariable.multiplyVariableByConstant(a, k);

            a.mustEqual(1);
            p.testConsistency();
            assertUnique(product, 4);
        });

        it("Integer Const Product A Term Test", function(){
            console.log("======================================");
            console.log("Const Product A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var k = 4;
            var product = IntegerVariable.multiplyVariableByConstant(a, k);
            product.mustEqual(8);

            p.testConsistency();
            assertUnique(a, 2);
        });

        /**
        it("Integer Quotient Test", function(){
            console.log("======================================");
            console.log("Quotient Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 2);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 2);
            var quotent = FloatVariable.divide(a, b);

            a.mustEqual(1);
            b.mustEqual(2);

            p.testConsistency();
            assertUnique(quotent, 0.5);
        });

        it("Integer Quotent A Term Test", function(){
            console.log("======================================");
            console.log("Quotient A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 3);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 3);
            var quotent = FloatVariable.divide(a, b);

            b.mustEqual(2);
            quotent.mustEqual(0.5);

            p.testConsistency();
            assertUnique(a, 1);
        });

        it("Integer Quotent B Term Test", function(){
            console.log("======================================");
            console.log("Quotient B Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 3);
            var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, 3);
            var quotent = FloatVariable.divide(a, b);

            a.mustEqual(1);
            quotent.mustEqual(0.5);

            p.testConsistency();
            assertUnique(b, 2);
        });
        **/

        /**
        it("Integer Odd Power Negative Tests", function(){
            console.log("======================================");
            console.log("Odd Power Negative Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, -3, 3);
            var power = IntegerVariable.pow(a, 3);
            a.mustEqual(-2);

            p.testConsistency();
            assertUnique(power, -8);
        });

        it("Integer Odd Power Negative A Term Test", function(){
            console.log("======================================");
            console.log("Odd Power Negative A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, -3, 3);
            var power = IntegerVariable.pow(a, 3);
            power.mustEqual(-8);

            p.testConsistency();
            assertUnique(a, -2);
        });

        it("Integer Odd Power Positive Test", function(){
            console.log("======================================");
            console.log("Odd Power Positive Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, -3, 3);
            var power = IntegerVariable.pow(a, 3);
            a.mustEqual(2);

            p.testConsistency();
            assertUnique(power, 8);
        });

        it("Integer Odd Power Positive A Term", function(){
            console.log("======================================");
            console.log("Odd Power Positive A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, -3, 3);
            var power = IntegerVariable.pow(a, 3);
            power.mustEqual(8);

            p.testConsistency();
            assertUnique(a, 2);
        });

        it("Integer Even Power Positive A Test", function(){
            console.log("======================================");
            console.log("Even Power Positive A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 3);
            var power = IntegerVariable.pow(a, 2);
            power.mustEqual(4);

            p.testConsistency();
            assertUnique(a, 2);
        });

        it("Integer Even Power Positive Test", function(){
            console.log("======================================");
            console.log("Even Power Positive Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, 3);
            var power = IntegerVariable.pow(a, 2);
            a.mustEqual(2);

            p.testConsistency();
            assertUnique(power, 4);
        });

        it("Integer Even Power Negative A Term Test", function(){
            console.log("======================================");
            console.log("Even Power Negative A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, -3, 0);
            var power = IntegerVariable.pow(a, 2);
            power.mustEqual(4);

            p.testConsistency();
            assertUnique(a, -2);
        });

        it("Integer Even Power Negative Test", function(){
            console.log("======================================");
            console.log("Even Power Negative Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, -3, 0);
            var power = IntegerVariable.pow(a, 2);
            a.mustEqual(-2);

            p.testConsistency();
            assertUnique(power, 4);
        });

        it("Integer Even Power Zero Crossing A Term Test", function(){
            console.log("======================================");
            console.log("Even Power Zero Crossing A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = IntegerVariable.makeIntVariableWithBounds("a", p, -3, 3);
            var power = IntegerVariable.pow(a, 2);
            power.mustEqual(4);

            p.testConsistency();
            expect(new IntegerInterval(-2, 2).equals(a.value())).toBe(true)
        });
        **/
    });
});
