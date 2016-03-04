require.config({
    paths : {
        'inheritance' : './vendor/inheritance',
        'boundingBox' : './modules/boundingBox',
        'csp' : './modules/csp',
        'constraint' : './modules/constraint',
        'floatVariable' : './modules/FloatVariable',
        'integerVariable' : './modules/IntegerVariable',
        'interval' : './modules/interval',
        'integerInterval' : './modules/integerInterval',
        'mathUtil' : './modules/mathUtil',
        'memoTable' : './modules/memoTable',
        'restorable' : './modules/restorable',
        'scalarArithmeticConstraints' : './modules/scalarArithmeticConstraints',
        'integerScalarArithmeticConstraints': './modules/integerScalarArithmeticConstraints',
        'searchHint' : './modules/searchHint',
        'undoStack' : './modules/undoStack',
        'variable' : './modules/variable',
        'dictionary' : './shared/dictionary',
        'formatTools' : './shared/formatTools'
    }
});

define(function(require, exports, module){
    var CSP = require('csp'),
        FloatVariable = require('floatVariable'),
        IntegerVariable = require('integerVariable');

    exports.CSP = CSP;
    exports.FloatVariable = FloatVariable;
    exports.IntegerVariable = IntegerVariable;
});
