//Scalar Arithmetic Testing
define(['inheritance', '../modules/csp', '../modules/FloatVariable', '../modules/mathUtil.js', '../modules/interval'], function(Inheritance, CSP, FloatVariable, MathUtil, Interval){
    describe("Testing Scalar Arithmetic", function(){
        assertUnique = function(v, value){
            expect(v.isUnique()).toBe(true);
            expect(value == v.uniqueValue()).toBe(true);
        };
        it("Unconstrained Sum Tests", function(){
            console.log("======================================");
            console.log("Unconstrained Sum Tests");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var sum = FloatVariable.add(a, b);

            for(var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
            }
        });

        it("Semi-Constrained Sum Test", function(){
            console.log("======================================");
            console.log("Semi-Constrained Sum Tests");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var sum = FloatVariable.add(a, b);
            sum.mustEqual(1);

            for (var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
            }
        });

        it("mustBeContainedIn test", function(){
            console.log("======================================");
            console.log("Must Be Contained In... Tests");
            console.log("======================================");
            var p = new CSP();
            var a = new FloatVariable("a", p, new Interval(0, 10));
            var b = new FloatVariable("b", p, new Interval(0, 10));
            var sum = FloatVariable.add(a, b);
            sum.mustBeContainedIn(new Interval(4, 8))

            for (var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(sum.uniqueValue(), (a.uniqueValue() + b.uniqueValue()))).toBe(true);
            }
        });
        it("Quadratic Tests", function(){
            console.log("======================================");
            console.log("Quadratic Sum Tests");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, -100, 100);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, -100, 100);
            var quad = FloatVariable.add(FloatVariable.pow(a, 2), b);
            var fail = [false];
            quad.mustBeContainedIn(new Interval(10, 20));

            for (var i = 0; i < 1000; i++){
                p.newSolution();
                expect(MathUtil.nearlyEqual(quad.uniqueValue(), ((a.uniqueValue() * a.uniqueValue()) + b.uniqueValue()))).toBe(true);
                //expect(quad.uniqueValue() >= 10 && quad.uniqueValue() <= 20).toBe(true);
            }
        });

        it("Sum Test", function(){
            console.log("======================================");
            console.log("Sum Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var sum = FloatVariable.add(a, b);
            a.mustEqual(0.5);
            b.mustEqual(0.25);

            p.testConsistency();
            assertUnique(sum, 0.75);
        });

        it("Sum A term Test", function(){
            console.log("======================================");
            console.log("Sum A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var sum = FloatVariable.add(a, b);
            b.mustEqual(0.5);
            sum.mustEqual(1);

            p.testConsistency();
            assertUnique(a, 0.5);
        });

        it("Sum B Term Test", function(){
            console.log("======================================");
            console.log("Sum B Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var sum = FloatVariable.add(a, b);
            a.mustEqual(0.5);
            sum.mustEqual(1);

            p.testConsistency();
            assertUnique(b, 0.5);
        });

        it("Difference Test", function(){
            console.log("======================================");
            console.log("Difference Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var difference = FloatVariable.subtract(a, b);
            a.mustEqual(0.5);
            b.mustEqual(0.25);

            p.testConsistency();
            assertUnique(difference, 0.25);
        });

        it("Difference A Term Test", function(){
            console.log("======================================");
            console.log("Difference A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var difference = FloatVariable.subtract(a, b);
            b.mustEqual(0.5);
            difference.mustEqual(0.5);

            p.testConsistency();
            assertUnique(a, 1);
        });

        it("Difference B Term Test", function(){
            console.log("======================================");
            console.log("Difference B Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var difference = FloatVariable.subtract(a, b);
            a.mustEqual(0.5);
            difference.mustEqual(0.25);

            p.testConsistency();
            assertUnique(b, 0.25);
        });

        it("Product Test", function(){
            console.log("======================================");
            console.log("Difference Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var product = FloatVariable.multiply(a, b);
            a.mustEqual(0.5);
            b.mustEqual(0.5);

            p.testConsistency();
            assertUnique(product, 0.25);
        });

        it("Product A Term Test", function(){
            console.log("======================================");
            console.log("Product A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var product = FloatVariable.multiply(a, b);

            b.mustEqual(0.5);
            product.mustEqual(0.5);

            p.testConsistency();
            assertUnique(a, 1);
        });

        it("Product B Term Test", function(){
            console.log("======================================");
            console.log("Product B Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var product = FloatVariable.multiply(a, b);

            a.mustEqual(0.5);
            product.mustEqual(0.25);
            p.testConsistency();
            assertUnique(b, 0.5);

        });

        it("Quotient Test", function(){
            console.log("======================================");
            console.log("Quotient Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 1);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 1);
            var quotent = FloatVariable.divide(a, b);

            a.mustEqual(0.5);
            b.mustEqual(0.5);

            p.testConsistency();
            assertUnique(quotent, 1);
        });

        it("Quotent A Term Test", function(){
            console.log("======================================");
            console.log("Quotient A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 3);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 3);
            var quotent = FloatVariable.divide(a, b);

            b.mustEqual(0.5);
            quotent.mustEqual(0.5);

            p.testConsistency();
            assertUnique(a, 0.25);
        });

        it("Quotent B Term Test", function(){
            console.log("======================================");
            console.log("Quotient B Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 3);
            var b = FloatVariable.makeFloatVariableWithBounds("b", p, 0, 3);
            var quotent = FloatVariable.divide(a, b);

            a.mustEqual(0.5);
            quotent.mustEqual(0.25);

            p.testConsistency();
            assertUnique(b, 2);
        });

        it("Odd Power Negative Tests", function(){
            console.log("======================================");
            console.log("Odd Power Negative Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, -3, 3);
            var power = FloatVariable.pow(a, 3);
            a.mustEqual(-2);

            p.testConsistency();
            assertUnique(power, -8);
        });

        it("Odd Power Negative A Term Test", function(){
            console.log("======================================");
            console.log("Odd Power Negative A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, -3, 3);
            var power = FloatVariable.pow(a, 3);
            power.mustEqual(-8);

            p.testConsistency();
            assertUnique(a, -2);
        });

        it("Odd Power Positive Test", function(){
            console.log("======================================");
            console.log("Odd Power Positive Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, -3, 3);
            var power = FloatVariable.pow(a, 3);
            a.mustEqual(2);

            p.testConsistency();
            assertUnique(power, 8);
        });

        it("Odd Power Positive A Term", function(){
            console.log("======================================");
            console.log("Odd Power Positive A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, -3, 3);
            var power = FloatVariable.pow(a, 3);
            power.mustEqual(8);

            p.testConsistency();
            assertUnique(a, 2);
        });

        it("Even Power Positive A Test", function(){
            console.log("======================================");
            console.log("Even Power Positive A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 3);
            var power = FloatVariable.pow(a, 2);
            power.mustEqual(4);

            p.testConsistency();
            assertUnique(a, 2);
        });

        it("Even Power Positive Test", function(){
            console.log("======================================");
            console.log("Even Power Positive Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, 0, 3);
            var power = FloatVariable.pow(a, 2);
            a.mustEqual(2);

            p.testConsistency();
            assertUnique(power, 4);
        });

        it("Even Power Negative A Term Test", function(){
            console.log("======================================");
            console.log("Even Power Negative A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, -3, 0);
            var power = FloatVariable.pow(a, 2);
            power.mustEqual(4);

            p.testConsistency();
            assertUnique(a, -2);
        });

        it("Even Power Negative Test", function(){
            console.log("======================================");
            console.log("Even Power Negative Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, -3, 0);
            var power = FloatVariable.pow(a, 2);
            a.mustEqual(-2);

            p.testConsistency();
            assertUnique(power, 4);
        });

        it("Even Power Zero Crossing A Term Test", function(){
            console.log("======================================");
            console.log("Even Power Zero Crossing A Term Test");
            console.log("======================================");
            var p = new CSP();
            var a = FloatVariable.makeFloatVariableWithBounds("a", p, -3, 3);
            var power = FloatVariable.pow(a, 2);
            power.mustEqual(4);

            p.testConsistency();
            expect(new Interval(-2, 2).equals(a.value())).toBe(true)
        })

    });
});
