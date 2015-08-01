/**
 * A quickie test suite of the Interval Class for Craftjs
 * basically, we just want to ensure some functionality, considering how hacky that class got
 */
define(["../modules/interval"], function(Interval){
	var test = {
		runTest : function(){
			console.log(Interval);
			
			//test constructors
			var a = new Interval(3.5, 5.6);
			var b = Interval.fromUnsortedBounds(5.6, 3.5);
			var c = Interval.singleton(9);
			
			//just going to test some of the weirder things
			console.log("Typedef: ");
			console.log(typeof a);
			console.log(typeof b);
			console.log(typeof c);
			
			console.log("Object Info: ");
			console.log(a);
			console.log(b);
			console.log(c);
			
			console.log("Lower Half: ");
			console.log(a.lowerHalf());
			
			console.log("Addition: ");
			console.log(Interval.add(a, b).toString());
		}
	};
	
	return test;
});
