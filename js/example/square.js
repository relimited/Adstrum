/**
 * Example square sketching.
 *
 * This require config statement points to the location of all the modules of Craftjs.
 */

require.config({
    paths : {
        'inheritance' : '../js/vendor/inheritance',
        'boundingBox' : '../js/modules/boundingBox',
        'csp' : '../js/modules/csp',
        'constraint' : '../js/modules/constraint',
        'floatVariable' : '../js/modules/FloatVariable',
        'integerVariable' : '../js/modules/IntegerVariable',
        'interval' : '../js/modules/interval',
        'integerInterval' : '../js/modules/integerInterval',
        'mathUtil' : '../js/modules/mathUtil',
        'memoTable' : '../js/modules/memoTable',
        'restorable' : '../js/modules/restorable',
        'scalarArithmeticConstraints' : '../js/modules/scalarArithmeticConstraints',
        'searchHint' : '../js/modules/searchHint',
        'undoStack' : '../js/modules/undoStack',
        'variable' : '../js/modules/variable',
        'dictionary' : '../js/shared/dictionary'
    }
});

/**
 *  Now for the actual program.  The only two modules needed to use Craftjs are
 *  csp and integerVariable.
 */
require(["csp", "integerVariable"], function(CSP, IntegerVariable){'use strict';
    var canvas = document.getElementById("demoCanvas");
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;

    var p = new CSP();
    var a = IntegerVariable.makeIntVariableWithBounds("a", p, 0, Math.floor(canvas.width/2)); //canvas dimensions
    var b = IntegerVariable.makeIntVariableWithBounds("b", p, 0, Math.floor(canvas.height/2));
    var c = IntegerVariable.add(a, b);
    c.mustBeContainedInRange(0, 1000);

    var points = {
        x : [],
        y : [],
    };

    for (var i = 0; i < 500; i++){
        p.newSolution();
        points.x.push(a.uniqueValue())
        points.y.push(b.uniqueValue())
    };

    for(var i = 0; i < 500; i++){
        ctx.beginPath();
        ctx.arc(points.x[i] + width/2, points.y[i] + height/2, 5, 0, 2*Math.PI, false);
        ctx.stroke();
    }

});
