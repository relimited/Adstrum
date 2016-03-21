//Runs tests.  Configures require to handle jasmine test libraries

require.config({
    paths : {
        'inheritance' : '../js/vendor/inheritance',
        'jasmine-src' : '../js/vendor/jasmine/lib/jasmine-2.3.4/jasmine',
        'jasmine-html' : '../js/vendor/jasmine/lib/jasmine-2.3.4/jasmine-html',
        'jasmine-boot' : '../js/vendor/jasmine/lib/jasmine-2.3.4/boot',
        'boundingBox' : '../js/modules/boundingBox',
        'csp' : '../js/modules/csp',
        'constraint' : '../js/modules/constraint',
        'floatVariable' : '../js/modules/FloatVariable',
        'integerVariable' : '../js/modules/IntegerVariable',
        'floatVectorVariable' : '../js/modules/floatVectorVariable',
        'interval' : '../js/modules/interval',
        'integerInterval' : '../js/modules/integerInterval',
        'mathUtil' : '../js/modules/mathUtil',
        'memoTable' : '../js/modules/memoTable',
        'restorable' : '../js/modules/restorable',
        'scalarArithmeticConstraints' : '../js/modules/scalarArithmeticConstraints',
        'integerScalarArithmeticConstraints': '../js/modules/integerScalarArithmeticConstraints',
        'vectorArithmeticConstraints' : '../js/modules/vectorArithmeticConstraints',
        'searchHint' : '../js/modules/searchHint',
        'undoStack' : '../js/modules/undoStack',
        'variable' : '../js/modules/variable',
        'dictionary' : '../js/shared/dictionary',
        'formatTools' : '../js/shared/formatTools'
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
    require(["../js/test/canonicalizationTests.js", "../js/test/intervalTests.js", "../js/test/integerIntervalTests.js", "../js/test/restorableTests.js", "../js/test/scalarArithmeticTests.js", "../js/test/integerScalarArithmeticTests", "../js/test/vectorArithmeticTests", "../js/test/constraintTests.js"], function(CanonicalizationTests, IntervalTests, integerIntervalTests, RestorableTests, ScalarArithmeticTests, IntegerScalarArithmeticTests, VectorArithmeticTests, ConstraintTests){'use strict';
        window.onload();
    });
});
