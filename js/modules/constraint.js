/**
* It's a constraint!  For the solver!
*/
define(["inheritance", "js/modules/csp", "js/modules/variable"],function(Inheritance, CSP, Variable){
    var Constraint = Class.extend({
        init : function(p){
            this.csp = p;
            this.csp.constraints.push(this);
            this.queued = false;
            this.narrowedVariable = null;
        },

        queuePropigation : function(narrowedVariable){
            if(this.csp.currentlyPropagating(this)){
                return;
            }else{
                console.log("Queue " + this);
            }

            if(this.queued){
                this.narrowedVariable = null;
            }else{
                this.narrowedVariable = narrowedVariable;
                this.csp.queueConstraint(this);
            }
        },

        //abstract propagate method here.  Meh.  Javascript
        // and also canonizeVariables.  Meh.  Javascript.

        registerCanonical : function(variable){
            var canonical = variable.canonicalVariable();
            canonical.addConstraint(this);
            return canonical;
        }
    });

    return Constraint;
});
