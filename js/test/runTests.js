//Runs tests.  Configures require to handle jasmine test libraries

require.config({
    paths : {
        'inheritance' : 'js/vendor/inheritance',
        'jasmine-src' : 'js/vendor/jasmine/lib/jasmine-2.3.4/jasmine',
        'jasmine-html' : 'js/vendor/jasmine/lib/jasmine-2.3.4/jasmine-html',
        'jasmine-boot' : 'js/vendor/jasmine/lib/jasmine-2.3.4/boot'
    },
    shim: {
        'jasmine-html': {
            deps : ['jasmine-src']
        },
        'jasmine-boot': {
            deps : ['jasmine-src', 'jasmine-html']
        }
  }
});

//bootstrap Jasmine
require(['jasmine-boot'], function () {
    require(["./js/test/canonicalizationTests.js", "./js/test/intervalTests.js", "./js/test/restorableTests.js", "./js/test/scalarArithmeticTests.js"], function(CanonicalizationTests, IntervalTests, RestorableTests, ScalarArithmeticTests){'use strict';
        //TODO: preprocessing goes here

        window.onload();
        //CanonicalizationTests.runTests();
        //IntervalTests.runTests();
        //RestorableTests.runTests();
        //ScalarArithmeticTests.runTests();

        //TODO: postprocessing goes here
    });
});
