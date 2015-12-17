//Testing framework for integer intervals with arithmatic and other standard ops

define(['inheritance', 'integerInterval', 'interval'], function(Inheritance, IntegerInterval, Interval){
    describe("Testing Integer Intervals", function(){
        it("Testing Empty Intervals", function(){
                expect(new IntegerInterval(1, -1).empty()).toBe(true)
                expect(new IntegerInterval(-1, 1).empty()).toBe(false)
        });

        it("Contains Scalar Tests", function(){
            expect(new IntegerInterval(0,1).contains(1)).toBe(true)
            expect(new IntegerInterval(0,1).contains(0)).toBe(true)
            expect(new IntegerInterval(0,2).contains(1)).toBe(true)
            expect(new IntegerInterval(0,1).contains(-1)).toBe(false)
            expect(new IntegerInterval(0,1).contains(2)).toBe(false)
        });

        it("Contains Interval Tests", function(){
            expect(new IntegerInterval(0,1).contains(new IntegerInterval(0, 1))).toBe(true);
            expect(new IntegerInterval(0,1).contains(new IntegerInterval(1, 1))).toBe(true);
            expect(new IntegerInterval(0,1).contains(new IntegerInterval(0, 0))).toBe(true);
            expect(new IntegerInterval(0,3).contains(new IntegerInterval(1, 3))).toBe(true);

            expect(new IntegerInterval(0,1).contains(new IntegerInterval(0, 2))).toBe(false);
            expect(new IntegerInterval(0,1).contains(new IntegerInterval(1, 2))).toBe(false);
            expect(new IntegerInterval(0,1).contains(new IntegerInterval(-1, 0))).toBe(false);
            expect(new IntegerInterval(0,3).contains(new IntegerInterval(-1, 2))).toBe(false);
        });

        it("Intersection Tests", function(){
            expect(new IntegerInterval(1, 2).equals(IntegerInterval.intersection(new IntegerInterval(1, 2), new IntegerInterval(1, 2)))).toBe(true);
            expect(new IntegerInterval(1, 2).equals(IntegerInterval.intersection(new IntegerInterval(1, 2), new IntegerInterval(0, 3)))).toBe(true);
            expect(new IntegerInterval(1, 2).equals(IntegerInterval.intersection(new IntegerInterval(0, 2), new IntegerInterval(1, 3)))).toBe(true);
            expect(new IntegerInterval(1, 2).equals(IntegerInterval.intersection(new IntegerInterval(1, 2), new IntegerInterval(1, 3)))).toBe(true);
            expect(new IntegerInterval(1, 2).equals(IntegerInterval.intersection(new IntegerInterval(1, 2), new IntegerInterval(0, 2)))).toBe(true);
            expect(new IntegerInterval(2, 2).equals(IntegerInterval.intersection(new IntegerInterval(1, 2), new IntegerInterval(2, 4)))).toBe(true);
            expect(IntegerInterval.intersection(new IntegerInterval(1, 2), new IntegerInterval(3, 4)).empty()).toBe(true);
        });

        it("Union Tests", function(){
            expect(new IntegerInterval(1, 2).equals(IntegerInterval.unionBound(new IntegerInterval(1, 2), new IntegerInterval(1, 2)))).toBe(true);
            expect(new IntegerInterval(0, 3).equals(IntegerInterval.unionBound(new IntegerInterval(1, 2), new IntegerInterval(0, 3)))).toBe(true);
            expect(new IntegerInterval(0, 3).equals(IntegerInterval.unionBound(new IntegerInterval(0, 2), new IntegerInterval(1, 3)))).toBe(true);
            expect(new IntegerInterval(1, 3).equals(IntegerInterval.unionBound(new IntegerInterval(1, 2), new IntegerInterval(1, 3)))).toBe(true);
            expect(new IntegerInterval(0, 2).equals(IntegerInterval.unionBound(new IntegerInterval(1, 2), new IntegerInterval(0, 2)))).toBe(true);
            expect(new IntegerInterval(1, 4).equals(IntegerInterval.unionBound(new IntegerInterval(1, 2), new IntegerInterval(3, 4)))).toBe(true);
            expect(new IntegerInterval(1, 2).equals(IntegerInterval.unionBound(new IntegerInterval(1, 2), new IntegerInterval(3, -4)))).toBe(true);
        });

        it("Add Interval Test", function(){
            expect(new IntegerInterval(1, 3).equals(IntegerInterval.add(new IntegerInterval(0, 1), new IntegerInterval(1, 2)))).toBe(true);
        });

        it("Subtract Interval Test", function(){
            expect(new IntegerInterval(-2, 0).equals(IntegerInterval.subtract(new IntegerInterval(0, 1), new IntegerInterval(1, 2)))).toBe(true);
        });

        it("Multiply Interval Tests", function(){
            expect(new IntegerInterval(2, 2).equals(IntegerInterval.multiply(new IntegerInterval(1, 1), new IntegerInterval(2, 2)))).toBe(true);
            expect(new IntegerInterval(2, 6).equals(IntegerInterval.multiply(new IntegerInterval(1, 2), new IntegerInterval(2, 3)))).toBe(true);
            expect(new IntegerInterval(-3, 6).equals(IntegerInterval.multiply(new IntegerInterval(-1, 2), new IntegerInterval(2, 3)))).toBe(true);
            expect(new IntegerInterval(-12, 8).equals(IntegerInterval.multiply(new IntegerInterval(-2, 3), new IntegerInterval(-4, 1)))).toBe(true);
            expect(new IntegerInterval(1, 4).equals(IntegerInterval.multiply(new IntegerInterval(-2, -1), new IntegerInterval(-2, -1)))).toBe(true);
        });

        it("Divide Interval Tests", function(){
            expect(new Interval(-1, 1).equals(IntegerInterval.divide(new IntegerInterval(1, 1), new IntegerInterval(-1, 1)))).toBe(true);
            expect(Interval.allValues.equals(IntegerInterval.divide(new IntegerInterval(-1, 1), new IntegerInterval(-1, 1)))).toBe(true);
            expect(new Interval(1, 4).equals(IntegerInterval.divide(new IntegerInterval(2, 4), new IntegerInterval(1, 2)))).toBe(true);
            expect(new Interval(-4, -1).equals(IntegerInterval.divide(new IntegerInterval(2, 4), new IntegerInterval(-2, -1)))).toBe(true);
            expect(new Interval(1, 2).equals(IntegerInterval.divide(new IntegerInterval(1, 2), new IntegerInterval(0, 1)))).toBe(true);
            expect(new Interval(-2, -1).equals(IntegerInterval.divide(new IntegerInterval(1, 2), new IntegerInterval(-1, 0)))).toBe(true);
        });

        it("Integer Power Interval Tests", function(){
            var neg = new IntegerInterval(-2, -1);
            var pos = new IntegerInterval(1, 2);
            var cross = new IntegerInterval(-2, 2);

            expect(new IntegerInterval(1, 1).equals(IntegerInterval.pow(neg, 0))).toBe(true)
            expect(neg.equals(IntegerInterval.pow(neg, 1))).toBe(true)
            expect(new IntegerInterval(1, 4).equals(IntegerInterval.pow(neg, 2))).toBe(true)
            expect(new IntegerInterval(1, 4).equals(IntegerInterval.pow(pos, 2))).toBe(true)
            expect(new IntegerInterval(0, 4).equals(IntegerInterval.pow(cross, 2))).toBe(true)

            expect(new IntegerInterval(-8, -1).equals(IntegerInterval.pow(neg, 3))).toBe(true)
            expect(new IntegerInterval(1, 8).equals(IntegerInterval.pow(pos, 3))).toBe(true)
        });

        it("Sqrt Interval Test", function(){
            expect(new Interval(-3, 3).equals(IntegerInterval.positiveSqrt(new IntegerInterval(4,9)))).toBe(true)
        });
    });
});
