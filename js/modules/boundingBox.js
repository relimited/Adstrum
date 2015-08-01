/**
 * Implementation of a BoundingBox object from Craft
 */
define(["inhertiance"], function(Inheritance){
	var BoundingBox = Class.extend({
		init : function(x, y, z){
			this.x = x;
			this.y = y;
			this.z = z;

			//TODO: add in checking to make sure x,y and z are Interval objects
		}
	});
});
