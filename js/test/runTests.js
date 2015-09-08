//Runs tests.  Configures require to handle jasmine test libraries

require.config({
    paths : {
        'inheritance' : 'js/vendor/inheritance',
        'jasmine-src' : 'js/vendor/jasmine/lib/jasmine-2.3.4/jasmine.js',
        'jasmine-html' : 'js/vendor/jasmine/lib/jasmine-2.3.4/jasmine-html.js',
        'jasmine-boot' : 'js/vendor/jasmine/lib/jasmine-2.3.4/boot.js'
    },
    shim : {
        'jasmine' : {
            deps: ['jasmine-src', 'jasmine-html', 'jasmine-boot'],
            exports : 'Jasmine'
        }
    }
});

require(["./js/test/canonicalizationTests.js", "./js/test/intervalTests.js", "./js/test/restorableTests.js", "./js/test/scalarArithmeticTests.js"], function(CanonicalizationTests, IntervalTests, RestorableTests, ScalarArithmeticTests){'use strict';
	//TODO: preprocessing goes here

	//CanonicalizationTests.runTests();
    //IntervalTests.runTests();
    //RestorableTests.runTests();
    //ScalarArithmeticTests.runTests();

	//TODO: postprocessing goes here
});
