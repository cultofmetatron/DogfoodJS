//=========================================================
// jquery.posi.proot.js is a prototype inheritence plugin
//
// PRoot is the top prototype of prototype chains.  Prototype chains look like
// PR,I or PR,P,P,I or PR,P,P,P,M,I where PR = PRoot, P = a prototype with methods,
// M = a prototype mixin with methods, and I = an instance with methods and data,
// which inherits methods up the chain from right to left.
//
// PRoot, and consequently PRoot's children
//   A) know how to create new children (from Crockford's Object.create method)
//   B) know how to add methods to the new children during creation
//   C) know how to add a mixin above the new children
//
// We have moved away from constructors and using "new", so we suggest the names of
// prototypes (children of PRoot) be capitalized.  It is often helpful to prefix all
// names with a single application prefix (example ComTree, ComStorage, ComScript)
//=========================================================

//======
// PRoot
//======
var PRoot = {
    create: function(o) {
        //=========================================================
        // The .create() method creates subprotos or instances.
        // It is inherited, so subprotos can also create subprotos
        // or instances.
        //=========================================================
        function F() {
        }
        F.prototype = this;
        var child = new F;
        if (o) {
            $.extend(child, o);
        }
        return child;
    }
};
//===================
// Function utilities
//===================
var F = PRoot.create({
    getSet: function(sVariableName) {
        //=========================================================
        // F.getSetArray returns a getter and setter function
        //=========================================================
        var getSetFunction = function(aValue) {
            if (aValue !== undefined) {
                this[sVariableName] = aValue;
                return this;
            }
            return this[sVariableName];
        };
        getSetFunction.accessor = true;
        return getSetFunction;
    },
    getSetArray: function(sVariableName) {
        //=========================================================
        // F.getSetArray returns a getter and setter function
        // with lazy initialization to an empty array
        //
        // did not use getSetInit because it kept the same []
        //=========================================================
        var getSetFunction = function(aValue) {
            if (aValue !== undefined) {
                this[sVariableName] = aValue;
                return this;
            }
            if (!this.hasOwnProperty(sVariableName)) {
                this[sVariableName] = [];
            }
            if (this[sVariableName] === null) {
                this[sVariableName] = [];
            }
            return this[sVariableName];
        };
        getSetFunction.accessor = true;
        return getSetFunction;
    },
    add: function(sGetterName) {
        //=========================================================
        // F.add returns an add function
        // for the array returned by sGetterName
        //=========================================================
        var addFunction = function(value) {
            this[sGetterName]().push(value);
            return this;
        };
        addFunction.accessor = true;
        return addFunction;
    },
    orFalse: function(f) {
        //=========================================================
        // F.orFalse wraps a function to return false
        // if it throws an error
        //=========================================================
        try {
            return f();
        } catch(error) {
            return false;
        }
    }
});