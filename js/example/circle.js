/**
 *  Now for the actual program.  The only two modules needed to use Craftjs are
 *  csp and floatVariable.
 */
//gonna expose library based things
var FloatVariable = Adstrum.FloatVariable;
var IntegerVariable = Adstrum.IntegerVariable;
var CSP = Adstrum.CSP;

var pointNum = 500;
var canvas = document.getElementById("demoCanvas");
var ctx = canvas.getContext('2d');
var width = canvas.width;
var height = canvas.height;

var p = new CSP();
var var1 = FloatVariable.makeFloatVariableWithBounds("var1", p, -canvas.width/2, canvas.width/2); //canvas dimensions
var var2 = FloatVariable.makeFloatVariableWithBounds("var2", p, -canvas.height/2, canvas.height/2);
var quad = FloatVariable.add(FloatVariable.pow(var1, 2), FloatVariable.pow(var2, 2));
quad.mustBeContainedInRange(-50000, 50000);

var points = {
    x : [],
    y : [],
};

for (var i = 0; i < pointNum; i++){
    p.newSolution();
    points.x.push(var1.uniqueValue());
    points.y.push(var2.uniqueValue());
}

for(var i = 0; i < pointNum; i++){
    ctx.beginPath();

    ctx.arc(points.x[i] + width/2, points.y[i] + height/2, 5, 0, 2*Math.PI, false);
    ctx.stroke();
}
