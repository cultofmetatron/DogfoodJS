/**
 * JposiQUnit(jposi.qunit.js)
 *
 * allows use of test cases and test methods with QUnit
 *
 * loaded after QUnit files and all test files
 * executes right away - does not need document ready
 * selects all global test cases named 'TestCase_...'
 *    and runs the qUnit method "module" for each test case
 * selects all test case methods named 'test_...'
 *    and runs the qUnit method "test" for each test method
 **/

//==============================================================
// global QUnit shortcuts ('ok' does not need a shortcut)
//==============================================================
var eq = equal;
var neq = notEqual;
var deq = deepEqual;
var ndeq = notDeepEqual;

//==============================================================
// Object JposiQUnit acts as a name space, but allows
// access to methods for testing, unlike (function(){})()
//==============================================================
var JPosiQUnit = {
    sortedKeys: function(o) {
        //======================================================
        // utility - return sorted keys of an object o
        //======================================================
        var keys = [];
        for (var key in o) {
            if (o.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys.sort();
    },
    matchingKeys: function(o, re) {
        //======================================================
        // utility - return keys of o that start with regexp re
        //======================================================
        var keys = [];
        var allKeys = this.sortedKeys(o);
        for (var i = 0; i < allKeys.length; i++) {
            var key = allKeys[i];
            if (key.match(re)) {
                keys.push(key);
            }
        }
        return keys;
    },
    functionKeys: function (o) {
        //======================================================
        // utility - return keys of o that hold functions
        //======================================================
        var keys = [];
        var allKeys = this.sortedKeys(o);
        for (var i = 0; i < allKeys.length; i++) {
            var key = allKeys[i];
            if (typeof(o[key]) === 'function') {
                keys.push(key);
            }
        }
        return keys;
    },
    objectKeysWith: function (o, sSelector) {
        //======================================================
        // utility - return keys of o that are objects
        //           that have key sSelector
        //======================================================
        var keys = [];
        var allKeys = this.sortedKeys(o);
        for (var i = 0; i < allKeys.length; i++) {
            var key = allKeys[i];
            try {
                var result = o[key][sSelector];
            } catch(e) {
                result = false;
            }
            if (result) {
                keys.push(key);
            }
        }
        return keys;
    },
    testCaseNames: function (o) {
        //======================================================
        // utility - return globals starting with "TestCase_"
        //======================================================
        var names = this.matchingKeys(o, /^TestCase_/)
        return names;
    },
    testMethodNames: function (o) {
        //======================================================
        // utility - return methods that start with "test_"
        //======================================================
        var names = this.matchingKeys(o, /^test_/)
        return names;
    },
    testedNamesFromObject: function (o) {
        //======================================================
        // utility - return testMethodNames without "test_"
        //           both split and not split by "_"
        //======================================================
        var names = this.testMethodNames(o);
        var testedNames = [];
        for (var i = 0; i < names.length; i++) {
            testedNames = testedNames.concat(this.testedNamesFromMethod(names[i]));
        }
        return testedNames.sort();
    },
    testedNamesFromMethod: function(sTestMethodName) {
        //======================================================
        // utility - remove the "test_" to get tested method name
        //           name might be one method (possibly with "_"'s),
        //           or might be multiple method names joined by "_"
        //======================================================
        var name = sTestMethodName.slice(5);
        var splitNames = name.split('_');
        if (splitNames.length > 1) {
            splitNames.push(name);
        }
        return splitNames.sort();
    },
    toTestProtoNames: function(o, asPrefices) {
        //======================================================
        // utility - return keys in o that start with the
        // prefices in asPrefices
        // e.g. ['Df'] => [DfButtons, DfSearch, DfStorage, ...]
        //======================================================
        var protos = [];
        var _this = this;
        asPrefices.forEach(function(each) {
            var prefixRegExp = new RegExp('^' + each);
            var matching = _this.matchingKeys(o, prefixRegExp);
            protos = protos.concat(matching);
        });
        return protos;
    },
    testedProtoNames: function(o) {
        //======================================================
        // utility - return domain part of test case names
        // e.g. {TestCase_One:, TestCase_Two:] => ['One', 'Two']
        //======================================================
        var fullNames = this.testCaseNames(o);
        var _this = this;
        var testedNames = fullNames.map(function(each) {
            return _this.testedProtoName(each);
        })
        return testedNames;
    },
    testedProtoName: function(sTestCaseName) {
        //======================================================
        // utility - return domain part of test case name
        // e.g. 'TestCase_One' => 'One'
        //======================================================
        return sTestCaseName.substring(9);
    },
    notIn: function (a1, a2) {
        //======================================================
        // utility - return values in a1 that are not in a2
        //======================================================
        function doesNotInclude(a, v) {
            for (var i = 0; i < a.length; i++) {
                if (a[i] === v) {
                    return false
                }
            }
            return true;
        }

        var result = [];
        for (var i = 0; i < a1.length; i++) {
            if (doesNotInclude(a2, a1[i])) {
                result.push(a1[i]);
            }
        }
        return result;
    },
    constructorName: function (v) {
        //======================================================
        // utility - return constructor name for value
        //           by parsing the function source string
        //======================================================
        var string = v.constructor.toString();
        var name = string.split(' ')[1].slice(0, -2);
        return name;
    },
    runTests: function () {
        //======================================================
        // method runTests()
        //
        // called once, after all .js test files have been loaded
        // does not need document ready
        //
        // logic:
        //     find all test cases (defined in the global namespace)
        //     for each test case
        //         if it has a setup method
        //             bind the setup method to the test case
        //         call the global QUnit function "module"
        //             with the test case name as the string argument
        //             with the bound setup method in the argument object if there is one
        //         find all test methods of the test case
        //         for each test method
        //             bind the test method to the test case
        //             call the global QUnit function "test"
        //                 with the test method name as the string argument
        //                 with the bound test method as the function argument
        //======================================================
        this.runTestCaseCoverage();
        this.runTestCases();
        return this;
    },
    runTestCases: function () {
        var names = this.testCaseNames(window);
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            this.runTestCase(name);
        }
        return this;
    },
    runTestCase: function (sTestCaseName) {
        var testCase = window[sTestCaseName];
        if (testCase.setup) {
            var boundSetup = (function(_fSetup, _oThis) {
                return function() {
                    _fSetup.call(_oThis)
                }
            })(testCase.setup, testCase);
            module(sTestCaseName, {setup: boundSetup});
        } else {
            module(sTestCaseName);
        }
        this.runTestCoverage(testCase);
        this.runTestMethods(testCase);
        return this;
    },
    runTestCoverage: function (oTestCase) {
        var testedObject = oTestCase.shouldCover;
        if (!testedObject) {
            return this;
        }
        var functionNames = this.functionKeys(testedObject);
        var notAccessorNames = functionNames.filter(function(each) {
            return !testedObject[each].accessor;
        })
        var testedNames = this.testedNamesFromObject(oTestCase);
        var untestedNames = this.notIn(notAccessorNames, testedNames);
        var coverageFunction = function() {
            deq(untestedNames, []);
        }
        test('untested methods', coverageFunction);
        return this;
    },
    runTestMethods: function (oTestCase) {
        var names = this.testMethodNames(oTestCase);
        for (var i in names) {
            var name = names[i];
            this.runTestMethod(oTestCase, name);
        }
        return this;
    },
    runTestMethod: function (oTestCase, sMethodName) {
        var method = oTestCase[sMethodName];
        var boundMethod = (function(_fMethod, _oThis) {
            return function() {
                _fMethod.call(_oThis);
            }
        })(method, oTestCase);
        test(sMethodName, boundMethod);
        return this;
    },
    runTestCaseCoverage: function () {
        var toTestNames = this.objectKeysWith(window, 'shouldTest');
        var testedNames = this.testedProtoNames(window);
        var untestedNames = this.notIn(toTestNames, testedNames);
        var coverageFunction = function() {
            deq(untestedNames, []);
        }
        module('Coverage');
        test('untested protos', coverageFunction);
        return this;
    }
};

//===========================================================
// execute JposiQUnit.runTests() when file is loaded
// QUnit and all test files should be loaded at this point
// no need to wait for document ready
//===========================================================
JPosiQUnit.runTests();