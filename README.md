## Requirements
Craftjs uses several functions, constants and patterns as part of the ES6 standard,
and will fail on browsers that do not support them.  Craftjs has been tested on
the most recent build of Google Chrome.

Craftjs uses RequireJS to handle module loading and John Resig's inheritance.js
library for Java-style polymorphism.  For testing, Craftjs uses Jasmine.

All three libraries are in the /vendor folder.

Craftjs was built using webpack.

## Importing
Using Craftjs in your own projects is easy (unlike in the previous build, where it was a nightmare).  Right now, Craft.js exports to a single global object (```Craft```), which has a set of properties set (```Craft.CSP```, ```Craft.FloatVariable``` and ```Craft.IntegerVariable```).  

Support for using Craft.js with AMD / CommonJS is upcomming in the next release.

Just copy the ```craft.js``` file to your project and load it before you'd load any Craftjs dependant code.
```HTML
<html>
	<head></head>
<body>
		<!-- page elements here -->
		<script src="/path/to/craft.js"></script>
		<script src="../some/craftjs/using/script.js"></script>
	</body>
</html>
```

Examples in the Usage section assume a few setup lines:
```javascript
var CSP = Craft.CSP;
var FloatVariable = Craft.FloatVariable;
var IntegerVariable = Craft.IntegerVariable;
```

#### Testing
The various tests are located in js/tests.  The above example is in runTests.js, and can be seen by opening the tester.html file in a browser (in /test).  If you want to import the testing framework for whatever reason, it uses Require.js and a bootstrap.

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
lets say we're dealing with a basic quadratic problem of quad = m^2 + intercept, where:
* m must be between -100 and 100
* intercept must be between -100 and 100
* quad must be between 10 and 20

First, we want to specify our independent variables:
```javascript
var m = FloatVariable.makeFloatVariableWithBounds('m', p, -100, 100);
var intercept = FloatVariable.makeFloatVariableWithBounds('intercept', p, -100, 100);
```
Craftjs also supports integers!  If we wanted to set the same problem up, but
in this case, m and intercept needed to be ints, we'd write:
```javascript
var m = IntegerVariable.makeIntVariableWithBounds('m', p, -100, 100);
var intercept = IntegerVariable.makeIntVariableWithBounds('intercept', p, -100, 100);
```

Craftjs can also create constants:
```javascript
var floatConstant = FloatVariable.makeFloatConstant('flConst', p, 0.5);
var intConstant = IntegerVariable.makeIntConstant('intConst', p, 7);
```

Now that we've got our independent variables figured out, lets add constraints.
Quad is constrained to be the a squared plus b, so let us tell Craftjs that.
```javascript
var quad = FloatVariable.add(FloatVariable.pow(m, 2), intercept);
```
If quad also needed to be an integer, we'd write:
```javascript
var quad = IntegerVariable.add(IntegerVariable.pow(m, 2), intercept);
```

Well, that's some weird syntax.  To do scalar arithmetic in Craftjs, you need to
use the operations in `FloatVariable` or `IntegerVariable`.  The available ops
are:
```
FloatVariable.add(a, b) --> a + b
FloatVariable.subtract(a, b) --> a - b
FloatVariable.multiply(a, b) --> a * b
FloatVariable.divide(a, b) --> a / b
FloatVariable.pow(a, exponent) --> a ^ exponent (where exponent is a Number)
```

For Integers, the same sorts of ops look like:
```
IntegerVariable.add(a, b) --> a + b
IntegerVariable.subtract(a, b) --> a - b
IntegerVariable.multiply(a, b) --> a * b
IntegerVariable.divide(a, b) --> a / b
IntegerVariable.pow(a, exponent) --> a ^ exponent (where exponent is a Number)
```

For both these cases, `a` and `b` can be variables or plain Javascript numbers.
```javascript
var example = FloatVariable.makeFloatVariableWithBounds('ex', p, 0, 1);
FloatVariable.add(1, example);
FloatVariable.add(example, 1);
```
Both of the above cases are valid.  Craftjs will promote numbers to constants
automagically.  This is also true for `IntegerVariables`.

Note that, for integers, Craftjs will throw errors if any provided argument is
a floating point number.  If you need to use floats, use the operations in FloatVariable
instead.  Future work will allow to constrain floating point operations to the integer space.

If you're familiar with reverse polish syntax, this probably rings a few bells.
It's also important to note that Craftjs does not enforce order of operations--
ops are just function calls.

Finally we need to add one more explicit constraint to quad-- that it must be within
10 and 20.
```javascript
quad.mustBeContainedInRange(10, 20);
```

Craftjs has some other constraints to add to `FloatVariable` or `IntegerVariable`s:
```
.mustBeContainedIn(low, high) --> variable must be within the specified range
.mustEqual(Number Or Variable) --> variable must equal the provided Number or Variable
.mustBeLessThanOrEqualTo(Number Or Variable) --> variable must be less than or equal to the provided Number or Variable
.mustBeGreaterThanOrEqualTo(Number Or Variable) --> variable must be greater than or equal to the provided number or Variable
```
with the usual caveat of Craftjs having undefined behavior if you mix variable types (i.e. `FloatVariable.mustEqual(IntegerVariable)`
or the other way around)

Now that we've set up the CSP, we can start getting solutions to it.  Craftjs gets one
solution to the CSP at a time, and does not make any promises about not returning the same solution twice.
```javascript
p.newSolution();
var m_value = m.uniqueValue();
var intercept_value = intercept.uniqueValue();
var quad_value = quad.uniqueValue();
```

The important bit here is that `CSP` doesn't return any solutions, it just modifies the `FloatVariable`
objects that it knows about, and they contain the values that satisfy the constraints.
`uniqueValue()` returns a Javascript primitive `Number`, so you can safely plug them
into whatever other part of your program you want to.  To get another solution,
call `newSolution()` again.

## Examples
The examples folder (html page is in /example and relevant javascript is in js/example) contains a toy program that draws circles in a circle.  It also illustrates a weakness of math beind Craftjs-- it does not ensure a uniform distribution, and why that can be awkward is illustrated best with a impossibly large range.

There is a program that also draws circles in a square to show off how to use Integer constraints.  If Craftjs isn't expressive enough to your liking, Craftjs can do rejection sampling to get more complicated constrained solutions, as seen in the final example.

## Features to Add
-- Mixed CSPs, able to handle both Reals and Ints.

-- Vectors, for both Reals and Integers.

-- Some calling interface (perhaps an equation parser?) to make setting up problems easier.

-- Various optimizations to speed up finding solutions.

-- Refactor to using prototype inheritance, to make future debugging easier and remove the reliance on inheritance.js

## Known Problems
#### bugs
The original Craft ensures that `cspObj.narrowTo()` also adds the relevant constraints while `cspObj` is in
the configuration phase.  Craftjs does not do this, and uses `mustBeContainedIn()` to add contain-based constraints.

Take care when assigning variable names.  The names "a", "b", "sum", "difference", "product", "quotient" and "power" may get overwritten by the solver and end up getting assigned to the wrong constraints.  The more descriptive a name is, the more useful it is overall.  The internal variable representation will get tweaked in a future release to prevent this from happening.

#### other
Craftjs is very much in development.  This is an alpha build (0.21, at time of writing this disclamer), and may be bug-ridden.
Please, add an issue tag for any bugs you find.
