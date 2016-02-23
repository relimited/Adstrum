module.exports = {
    // configuration
    output: {
       // export itself to a global var
       libraryTarget: "var",
       // name of the global var: "Craft"
       library: "Craft"
   },
   
   resolve : {
        root: '/Users/Johnathan/GitHub/Craftjs/js/',
        alias : {
            'inheritance' : 'vendor/inheritance.js',
            'boundingBox' : 'modules/boundingBox.js',
            'csp' : 'modules/csp.js',
            'constraint' : 'modules/constraint.js',
            'floatVariable' : 'modules/FloatVariable.js',
            'integerVariable' : 'modules/IntegerVariable.js',
            'interval' : 'modules/interval.js',
            'integerInterval' : 'modules/integerInterval.js',
            'mathUtil' : 'modules/mathUtil.js',
            'memoTable' : 'modules/memoTable.js',
            'restorable' : 'modules/restorable.js',
            'scalarArithmeticConstraints' : 'modules/scalarArithmeticConstraints.js',
            'integerScalarArithmeticConstraints': 'modules/integerScalarArithmeticConstraints.js',
            'searchHint' : 'modules/searchHint.js',
            'undoStack' : 'modules/undoStack.js',
            'variable' : 'modules/variable.js',
            'dictionary' : 'shared/dictionary.js'
        }
    }
};
