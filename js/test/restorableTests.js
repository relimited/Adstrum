

define(['inheritance', '../modules/undoStack', '../modules/restorable'], function(Inheritance, UndoStack, Restorable){
    describe("Testing Restorables", function(){
        it("Testing Initialized Values", function(){
            var s = new UndoStack();
            var a = new Restorable(s, 0);
            expect(a.get() == 0).toBe(true);
        });

        it("Testing setting a restorable", function(){
            var s = new UndoStack();
            var a = new Restorable(s, 0);
            a.set(1);
            expect(a.get() == 1).toBe(true);
        });

        it("Testing Set and Restore", function(){
            var s = new UndoStack();
            var a = new Restorable(s, 0);
            var mark1 = s.markStack();
            a.set(1);
            expect(a.get() == 1).toBe(true);
            var mark2 = s.markStack();
            a.set(2);
            expect(a.get() == 2).toBe(true);
            s.restore(mark2);
            expect(a.get() == 1).toBe(true);
            a.set(3);
            expect(a.get() == 3).toBe(true);
            var mark3 = s.markStack();
            a.set(4);
            expect(a.get() == 4).toBe(true);
            s.restore(mark3);
            expect(a.get() == 3).toBe(true);
            s.restore(mark1);
            expect(a.get() == 0).toBe(true);
        })
    });
});
