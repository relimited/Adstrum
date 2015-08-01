/**
 * Good ol' main file.  Has setup information for require, and any 'before the app runs' processing goes here.
 */

require.config({
    paths : {
        'inheritance' : 'js/vendor/inheritance',
    }
});

require(["./js/test/intervalTest"], function(IntervalTest){'use strict';
	//TODO: preprocessing goes here
	
	IntervalTest.runTest();
	
	//TODO: postprocessing goes here
});