//Testing framework for intervals and interval arithmetic and such

define(['inheritance', 'interval'], function(Inheritance, Interval){
    describe("Testing Intervals", function(){
        it("Testing Empty Intervals", function(){
                expect(new Interval(1, -1).empty()).toBe(true);
                expect(new Interval(-1, 1).empty()).toBe(false);
        });

        it("Contains Scalar Tests", function(){
            expect(new Interval(0,1).contains(1)).toBe(true);
            expect(new Interval(0,1).contains(0)).toBe(true);
            expect(new Interval(0,1).contains(0.5)).toBe(true);
            expect(new Interval(0,1).contains(-1)).toBe(false);
            expect(new Interval(0,1).contains(2)).toBe(false);
        });

        it("Contains Interval Tests", function(){
            expect(new Interval(0,1).contains(new Interval(0, 1))).toBe(true);
            expect(new Interval(0,1).contains(new Interval(1, 1))).toBe(true);
            expect(new Interval(0,1).contains(new Interval(0, 0))).toBe(true);
            expect(new Interval(0,1).contains(new Interval(0.25, 0.75))).toBe(true);

            expect(new Interval(0,1).contains(new Interval(0, 2))).toBe(false);
            expect(new Interval(0,1).contains(new Interval(1, 2))).toBe(false);
            expect(new Interval(0,1).contains(new Interval(-1, 0))).toBe(false);
            expect(new Interval(0,1).contains(new Interval(-0.25, 0.75))).toBe(false);
        });

        it("Intersection Tests", function(){
            expect(new Interval(1, 2).equals(Interval.intersection(new Interval(1, 2), new Interval(1, 2)))).toBe(true);
            expect(new Interval(1, 2).equals(Interval.intersection(new Interval(1, 2), new Interval(0, 3)))).toBe(true);
            expect(new Interval(1, 2).equals(Interval.intersection(new Interval(0, 2), new Interval(1, 3)))).toBe(true);
            expect(new Interval(1, 2).equals(Interval.intersection(new Interval(1, 2), new Interval(1, 3)))).toBe(true);
            expect(new Interval(1, 2).equals(Interval.intersection(new Interval(1, 2), new Interval(0, 2)))).toBe(true);
            expect(new Interval(2, 2).equals(Interval.intersection(new Interval(1, 2), new Interval(2, 4)))).toBe(true);
            expect(Interval.intersection(new Interval(1, 2), new Interval(3, 4)).empty()).toBe(true);
        });

        it("Union Tests", function(){
            expect(new Interval(1, 2).equals(Interval.unionBound(new Interval(1, 2), new Interval(1, 2)))).toBe(true);
            expect(new Interval(0, 3).equals(Interval.unionBound(new Interval(1, 2), new Interval(0, 3)))).toBe(true);
            expect(new Interval(0, 3).equals(Interval.unionBound(new Interval(0, 2), new Interval(1, 3)))).toBe(true);
            expect(new Interval(1, 3).equals(Interval.unionBound(new Interval(1, 2), new Interval(1, 3)))).toBe(true);
            expect(new Interval(0, 2).equals(Interval.unionBound(new Interval(1, 2), new Interval(0, 2)))).toBe(true);
            expect(new Interval(1, 4).equals(Interval.unionBound(new Interval(1, 2), new Interval(3, 4)))).toBe(true);
            expect(new Interval(1, 2).equals(Interval.unionBound(new Interval(1, 2), new Interval(3, -4)))).toBe(true);
        });

        it("Add Interval Test", function(){
            expect(new Interval(1, 3).equals(Interval.add(new Interval(0, 1), new Interval(1, 2)))).toBe(true);
        });

        it("Subtract Interval Test", function(){
            expect(new Interval(-2, 0).equals(Interval.subtract(new Interval(0, 1), new Interval(1, 2)))).toBe(true);
        });

        it("Multiply Interval Tests", function(){
            expect(new Interval(2, 2).equals(Interval.multiply(new Interval(1, 1), new Interval(2, 2)))).toBe(true);
            expect(new Interval(2, 6).equals(Interval.multiply(new Interval(1, 2), new Interval(2, 3)))).toBe(true);
            expect(new Interval(-3, 6).equals(Interval.multiply(new Interval(-1, 2), new Interval(2, 3)))).toBe(true);
            expect(new Interval(-12, 8).equals(Interval.multiply(new Interval(-2, 3), new Interval(-4, 1)))).toBe(true);
            expect(new Interval(1, 4).equals(Interval.multiply(new Interval(-2, -1), new Interval(-2, -1)))).toBe(true);
        });

        it("Divide Interval Tests", function(){
            expect(Interval.allValues.equals(Interval.divide(new Interval(1, 1), new Interval(-1, 1)))).toBe(true);
            expect(Interval.allValues.equals(Interval.divide(new Interval(-1, 1), new Interval(-1, 1)))).toBe(true);
            expect(new Interval(1, 4).equals(Interval.divide(new Interval(2, 4), new Interval(1, 2)))).toBe(true);
            expect(new Interval(-4, -1).equals(Interval.divide(new Interval(2, 4), new Interval(-2, -1)))).toBe(true);
            expect(new Interval(1, Number.POSITIVE_INFINITY).equals(Interval.divide(new Interval(1, 2), new Interval(0, 1)))).toBe(true);
            expect(new Interval(Number.NEGATIVE_INFINITY, -1).equals(Interval.divide(new Interval(1, 2), new Interval(-1, 0)))).toBe(true);
        });

        it("Integer Power Interval Tests", function(){
            var neg = new Interval(-2, -1);
            var pos = new Interval(1, 2);
            var cross = new Interval(-2, 2);

            expect(new Interval(1, 1).equals(Interval.pow(neg, 0))).toBe(true);
            expect(neg.equals(Interval.pow(neg, 1))).toBe(true);
            expect(new Interval(1, 4).equals(Interval.pow(neg, 2))).toBe(true);
            expect(new Interval(1, 4).equals(Interval.pow(pos, 2))).toBe(true);
            expect(new Interval(0, 4).equals(Interval.pow(cross, 2))).toBe(true);

            expect(new Interval(-8, -1).equals(Interval.pow(neg, 3))).toBe(true);
            expect(new Interval(1, 8).equals(Interval.pow(pos, 3))).toBe(true);
        });

        it("Sqrt Interval Test", function(){
            expect(new Interval(2, 3).equals(Interval.positiveSqrt(new Interval(4,9)))).toBe(true);
        });
    });
});
