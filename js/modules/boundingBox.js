/**
 * A Bounding Box is just what it says on the tin-- a box of bounds.
 * Bounds are stored as intervals in x, y and z.
 *
 * TODO: Currently, this isn't used for anything in Craftjs.  It will be, though.
 */
define(["inheritance"], function(Inheritance){
	var BoundingBox = Class.extend({
		/**
		 * Constructor for the BoundingBox class.  Makes a new bounding box.
		 * @param  {Interval} x Bounds for the X dimension
		 * @param  {Interval} y Bounds for the Y dimension
		 * @param  {Interval} z Bounds for the Z dimension
		 * @return {BoundingBox}   A new bounding box!
		 */
		init : function(x, y, z){
			this.x = x;
			this.y = y;
			this.z = z;

		}
	});
	return BoundingBox;
});
