/**
* Module defines a base class for a constraint on the solver.
*/
define(["inheritance", "js/modules/csp", "js/modules/variable"],function(Inheritance, CSP, Variable){
    var Constraint = Class.extend({
        /**
         * Constructor for the constraint class
         * @param  {CSP} p Constraint satisfaction problem this constraint is a part of
         * @return {Constraint}   A new constraint to use for a CSP
         */
        init : function(p){
            this.csp = p;
            this.csp.constraints.push(this);
            this.queued = false;
            this.narrowedVariable = null;
        },

        /**
         * Put this constraint in the CSP's propigation queue, if this variable is
         * not currently being propigated.  When propigating a constraint, we also set
         * which variable has been recently narrowed to check this constraint again.
         *
         * @param  {Variable} narrowedVariable the recently narrowed variable to cause
         *                                     a need to check CSP constriants
         */
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

        /**
         * Register this constraint with the canonical form of a variable.
         * @param  {Variable} variable The variable to register with
         * @return {Variable}          The canonical form of the variable with
         *                             This constraint registered to it
         */
        registerCanonical : function(variable){
            var canonical = variable.canonicalVariable();
            canonical.addConstraint(this);
            return canonical;
        }
    });

    return Constraint;
});
