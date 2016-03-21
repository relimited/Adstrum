/**
 * Example square sketching.
 */

/**
 *  Now for the actual program.
 */
 //gonna expose library based things
 var FloatVariable = Adstrum.FloatVariable;
 var IntegerVariable = Adstrum.IntegerVariable;
 var CSP = Adstrum.CSP;

var canvas = document.getElementById("demoCanvas");
var ctx = canvas.getContext('2d');
var width = canvas.width;
var height = canvas.height;

var p = new CSP();
var var1 = IntegerVariable.makeIntVariableWithBounds("var1", p, 0, Math.floor(canvas.width/2)); //canvas dimensions
var var2 = IntegerVariable.makeIntVariableWithBounds("var2", p, 0, Math.floor(canvas.height/2));
var sum = IntegerVariable.add(var1, var2);
sum.mustBeContainedInRange(0, 1000);

var points = {
    x : [],
    y : [],
};

for (var i = 0; i < 500; i++){
    p.newSolution();
    points.x.push(var1.uniqueValue())
    points.y.push(var2.uniqueValue())
};

for(var i = 0; i < 500; i++){
    ctx.beginPath();
    ctx.arc(points.x[i] + width/2, points.y[i] + height/2, 5, 0, 2*Math.PI, false);
    ctx.stroke();
}
