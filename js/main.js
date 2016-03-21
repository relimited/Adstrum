require.config({
    paths : {
      'inheritance' : 'vendor/inheritance.js',
      'boundingBox' : 'modules/boundingBox.js',
      'csp' : 'modules/csp.js',
      'constraint' : 'modules/constraint.js',
      'floatVariable' : 'modules/FloatVariable.js',
      'integerVariable' : 'modules/IntegerVariable.js',
      'floatVectorVariable' : 'modules/floatVectorVariable.js',
      'interval' : 'modules/interval.js',
      'integerInterval' : 'modules/integerInterval.js',
      'mathUtil' : 'modules/mathUtil.js',
      'memoTable' : 'modules/memoTable.js',
      'restorable' : 'modules/restorable.js',
      'scalarArithmeticConstraints' : 'modules/scalarArithmeticConstraints.js',
      'integerScalarArithmeticConstraints': 'modules/integerScalarArithmeticConstraints.js',
      'vectorArithmeticConstraints' : 'modules/vectorArithmeticConstraints.js',
      'searchHint' : 'modules/searchHint.js',
      'undoStack' : 'modules/undoStack.js',
      'variable' : 'modules/variable.js',
      'dictionary' : 'shared/dictionary.js',
      'formatTools' : 'shared/formatTools.js'
    }
});

define(function(require, exports, module){
    var CSP = require('csp'),
        FloatVariable = require('floatVariable'),
        IntegerVariable = require('integerVariable'),
        FloatVectorVariable = require('floatVectorVariable');

    exports.CSP = CSP;
    exports.FloatVariable = FloatVariable;
    exports.IntegerVariable = IntegerVariable;
    exports.FloatVectorVariable = FloatVectorVariable;
});
