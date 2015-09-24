## Requirements
Craftjs uses RequireJS to handle module loading and John Resig's inheritance.js library for Java-style polymorphism.
For testing, Craftjs uses Jasmine.

All three libraries are in the /vendor folder.

## Importing
#### Standard Use
Craftjs uses RequireJS for module loading.  As such, you'll need to load the RequireJS script before
using Craftjs
```html
<script src="js/vendor/require.js"></script>
<!-- script that uses Craftjs -->
<script src="js/main.js"></script>
```
In addition, you'll need to configure Require to point to where your Craftjs modules
are stored.  Craftjs expects that every module will be mapped in Require's ```configure``` statement,
like so:
```javascript
require.config({
    paths : {
        'inheritance' : 'js/vendor/inheritance',
        'boundingBox' : '../js/modules/boundingBox',
        'csp' : '../js/modules/csp',
        'constraint' : '../js/modules/constraint',
        'floatVariable' : '../js/modules/floatVariable',
        ...
    }
});
```
This allows for you to shift Craftjs's modules around in your own project to fit
your own mangement scheme / naming conventions, and only need to update one file.
After pointing RequireJS to where each module is, you'll want to tell Require that your Craftjs
code needs the CSP and FloatVariable modules:
```javascript
require(["csp", "floatVariable"], function(CSP, FloatVariable){'use strict';
	//Craftjs-using code.
});
```
You can also expose any of Craftjs's internal modules by explicitly requiring them in the above statement.
#### Testing
To run Craftjs's test suite, you'll also need to use Jasmine.  Jasmine is also provided in the /vendor folder.
However, Jasmine needs to be bootstrapped by Require before it can be used, so your `configure` statement
will look a little different...
```javascript
require.config({
    paths : {
        'inheritance' : 'js/vendor/inheritance',
        'jasmine-src' : 'js/vendor/jasmine/lib/jasmine-2.3.4/jasmine',
        'jasmine-html' : 'js/vendor/jasmine/lib/jasmine-2.3.4/jasmine-html',
        'jasmine-boot' : 'js/vendor/jasmine/lib/jasmine-2.3.4/boot',
        'csp' : '../js/modules/csp',
        'constraint' : '../js/modules/constraint',
        'floatVariable' : '../js/modules/floatVariable',
        ...
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
```
And the `require` statement will also look different:
```javascript
require(['jasmine-boot'], function () {
    require(["./js/test/canonicalizationTests.js", "./js/test/intervalTests.js", "./js/test/restorableTests.js", "./js/test/scalarArithmeticTests.js"], function(CanonicalizationTests, IntervalTests, RestorableTests, ScalarArithmeticTests){'use strict';
        window.onload();
    });
});
```
The various tests are located in js/tests.  The above example is in runTests.js, and can be seen by opening the tester.html file in a browser (in /test), but if you want to access from them different location, you'll need to update the file paths appropriately.

## Usage
To understand how Craftjs does what it does, you probably want to review the
documentation in the original Craft project, here:
https://github.com/ianhorswill/Craft

All Craftjs usage starts with one thing-- a CSP object.  This object does all the
bookkeeping required to generate a solution constraint satisfaction problem.
```javascript
var p = new CSP();
```
Now, we still need to define what the actual problem is going to be.  In Craftjs,
this is a mix of FloatVariable objects and mathematical operations.  For example,
lets say we're dealing with a basic quadratic problem of quad = a^2 + b, where:
* a must be between -100 and 100
* b must be between -100 and 100
* quad must be between 10 and 20
First, we want to specify our independent variables:
```javascript
var a = FloatVariable.makeFloatVariableWithBounds('a', p, -100, 100);
var b = FloatVariable.makeFloatVariableWithBounds('b', p, -100, 100);
```

It's important to note that `FloatVariable.makeFloatVariableWithBounds()` is a
convience method.  The above could also be done with `FloatVariable`'s constructor:
```javascript
var a = new FloatVariable('a', p, new Interval(-100, 100));
var b = new FloatVariable('b', p, new Interval(-100, 100));
```

Now that we've got our independent variables figured out, lets add constraints.
Quad is constrained to be the a squared plus b, so let us tell Craftjs that.
```Javascript
var quad = FloatVariable.add(FloatVariable.pow(a, 2), b);
```

Well, that's some weird syntax.  To do scalar arithmetic in Craftjs, you need to
use the operations in `FloatVariable`.  The available ops are (variables are
Craftjs FloatVariables unless otherwise noted):
```
FloatVariable.add(a, b) --> a + b
FloatVariable.subtract(a, b) --> a - b
FloatVariable.multiply(a, b) --> a * b
FloatVariable.multiplyIntervalByConstant(a, k) --> a * k (where k is a Number)
FloatVariable.divide(a, b) --> a / b
FloatVariable.pow(a, exponent) --> a ^ exponent (where exponent is a Number)
```

If you're familiar with reverse polish syntax, this probably rings a few bells.
It's also important to note that Craftjs does not enforce order of operations--
ops are just function calls.

Finally we need to add one more explicit constraint to quad-- that it must be within
10 and 20.
```javascript
quad.mustBeContainedInRange(10, 20);
```

Craftjs has another explicit constraints to add to `FloatVariable`s, and that is
`mustEqual()`, which a primative `Number` and requires the `FloatVariable` be equal to that number.

Now that we've set up the CSP, we can start getting solutions to it.  Craftjs gets one
solution to the CSP at a time, and does not make any promises about not returning the same solution twice.
```javascript
p.newSolution();
var a_value = a.uniqueValue();
var b_value = b.uniqueValue();
var quad_value = quad.uniqueValue();
```

The important bit here is that `CSP` doesn't return any solutions, it just modifies the `FloatVariable`
objects that it knows about, and they contain the values that satisfy the constraints.
`uniqueValue()` returns a Javascript primitive `Number`, so you can safely plug them
into whatever other part of your program you want to.  To get another solution,
call `newSolution()` again.

## Examples
The examples folder (html page is in /example and relevant javascript is in js/example) contains a toy program that draws circles in a circle.  It also illustrates a weakness of math beind Craftjs-- it does not ensure a uniform distribution, and why that can be awkward is illustrated best with a impossibly large range.

## Known Problems
#### bugs
The original Craft ensures that `cspObj.narrowTo()` also adds the relevant constraints while `cspObj` is in
the configuration phase.  Craftjs does not do this, and uses mustBeContainedIn() to add contain-based constraints.

#### other
Craftjs is very much in development, and is not feature complete.  The biggest hole
is that Craftjs only handles `FloatVariable`s and scalar arithmetic, whereas Craft
can also handle constraint satisfaction problems with vectors and vector arithmetic.

Also, Craftjs is not optimized (in some parts, embarrassingly so) and will tend to run
rather slow.

Finally, Craftjs's current interface and way to import to a project are not the easiest.
