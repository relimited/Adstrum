/**
 * Using rejection sampling to only return integer values in Craftjs.
 * 	This example is similar to the large_range_circle example.
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
    quad.mustBeContainedInRange(-10000, 10000);

    var points = {
        x : [],
        y : [],
        sol : []
    };

    var generationIterator = 0;
    while(generationIterator < 50){
        p.newSolution();

        // now, build a new CSP with rounded integer intevals for our independent variables
        // the max and the min should be the same number, but we could have also gotten the same behavour
        // by enforcing an mustEqual constraint on larger intervals.
        var success_flag = true;
        var check = new CSP();
        var a_check = FloatVariable.makeFloatVariableWithBounds("a_check", check, -canvas.width/2, canvas.width/2);
        var b_check = FloatVariable.makeFloatVariableWithBounds("b_check", check,  -canvas.height/2, canvas.height/2);
        var quad_check = FloatVariable.add(FloatVariable.pow(a_check, 2), FloatVariable.pow(b_check, 2));

        try{
            console.log("Checking for consistency")
            a_check.mustEqual(Math.round(a.uniqueValue()))
            b_check.mustEqual(Math.round(b.uniqueValue()))
            quad_check.mustEqual(Math.round(quad.uniqueValue()));
            check.testConsistency();
        }catch(err){
            success_flag = false;
        }

        if(success_flag){
            points.x.push(a_check.uniqueValue());
            points.y.push(b_check.uniqueValue());
            points.sol.push(quad_check.uniqueValue())
            generationIterator = generationIterator + 1;
        }
    };

    for(var i = 0; i < 50; i++){
        console.log(points.x[i], points.y[i], points.sol[i]);
        ctx.beginPath();
        ctx.arc(points.x[i] + width/2, points.y[i] + height/2, 5, 0, 2*Math.PI, false);
        ctx.stroke();
    }

});
