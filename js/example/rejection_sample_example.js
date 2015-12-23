/**
 * Using rejection sampling to only return integer values in Craftjs.
 * 	This example is similar to the large_range_circle example.
 */

 //gonna expose library based things
 var FloatVariable = Craft.FloatVariable;
 var IntegerVariable = Craft.IntegerVariable;
 var CSP = Craft.CSP;

var canvas = document.getElementById("demoCanvas");
var ctx = canvas.getContext('2d');
var width = canvas.width;
var height = canvas.height;

var p = new CSP();
var var1 = FloatVariable.makeFloatVariableWithBounds("var1", p, -canvas.width/2, canvas.width/2); //canvas dimensions
var var2 = FloatVariable.makeFloatVariableWithBounds("var2", p, -canvas.height/2, canvas.height/2);
var quad = FloatVariable.add(FloatVariable.pow(var1, 2), FloatVariable.pow(var2, 2));
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
    var var1_check = FloatVariable.makeFloatVariableWithBounds("var1_check", check, -canvas.width/2, canvas.width/2);
    var var2_check = FloatVariable.makeFloatVariableWithBounds("var2_check", check,  -canvas.height/2, canvas.height/2);
    var quad_check = FloatVariable.add(FloatVariable.pow(var1_check, 2), FloatVariable.pow(var2_check, 2));

    try{
        console.log("Checking for consistency")
        var1_check.mustEqual(Math.round(var1.uniqueValue()))
        var2_check.mustEqual(Math.round(var2.uniqueValue()))
        quad_check.mustEqual(Math.round(quad.uniqueValue()));
        check.testConsistency();
    }catch(err){
        success_flag = false;
    }

    if(success_flag){
        points.x.push(var1_check.uniqueValue());
        points.y.push(var2_check.uniqueValue());
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
