/**
 * Example curve sketching.
 *
 * This require config statement points to the location of all the modules of Craftjs.
 */

require.config({
    paths : {
        'inheritance' : '../js/vendor/inheritance',
        'boundingBox' : '../js/modules/boundingBox',
        'csp' : '../js/modules/csp',
        'constraint' : '../js/modules/constraint',
        'floatVariable' : '../js/modules/floatVariable',
        'interval' : '../js/modules/interval',
        'mathUtil' : '../js/modules/mathUtil',
        'memoTable' : '../js/modules/memoTable',
        'restorable' : '../js/modules/restorable',
        'scalarArithmaticConstraints' : '../js/modules/scalarArithmaticConstraints',
        'searchHint' : '../js/modules/searchHint',
        'undoStack' : '../js/modules/undoStack',
        'variable' : '../js/modules/variable',
        'dictionary' : '../js/shared/dictionary'
    }
});

/**
 *  Now for the actual program.  The only two modules needed to use Craftjs are
 *  csp and floatVariable.
 */
require(["csp", "floatVariable"], function(CSP, FloatVariable){'use strict';
    var canvas = document.getElementById("demoCanvas");
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;

    var p = new CSP();
    var a = FloatVariable.makeFloatVariableWithBounds("a", p, -canvas.width/2, canvas.width/2); //canvas dimensions
    var b = FloatVariable.makeFloatVariableWithBounds("b", p, -canvas.height/2, canvas.height/2);
    var quad = FloatVariable.add(FloatVariable.pow(a, 2), FloatVariable.pow(b, 2));
    quad.mustBeContainedInRange(-50000, 50000);

    var points = {
        x : [],
        y : [],
    };

    for (var i = 0; i < 5000; i++){
        p.newSolution();
        points.x.push(a.uniqueValue())
        points.y.push(b.uniqueValue())
    };

    for(var i = 0; i < 5000; i++){
        ctx.beginPath();
        ctx.arc(points.x[i] + width/2, points.y[i] + height/2, 5, 0, 2*Math.PI, false);
        ctx.stroke();
    }

});
