var TestCase_JPosiQUnit = {
    test_sortedKeys: function() {
        var A = {one: 1, two: function() {
            return 2;
        }};
        var B = {three: 3, four: function() {
            return 4;
        }};
        var keys = JPosiQUnit.sortedKeys(A);
        deq(keys, ['one', 'two']);
        keys = JPosiQUnit.sortedKeys(B);
        deq(keys, ['four', 'three']);
    },
    test_matchingKeys: function() {
        var object = {
            one: 1,
            two: 2,
            three: 3,
            test_four: function() {
                return 4
            },
            test_five: function() {
                return 5
            },
            six: function() {
                return 6
            }
        };
        var result = JPosiQUnit.matchingKeys(object, /t/);
        var desired = [ 'test_five', 'test_four', 'three', 'two' ];
        deq(result, desired);
    },
    test_functionKeys: function() {
        var object = {
            one: 1,
            two: 2,
            three: 3,
            test_four: function() {
                return 4
            },
            test_five: function() {
                return 5
            },
            six: function() {
                return 6
            }
        };
        var result = JPosiQUnit.functionKeys(object);
        var desired = [ 'six', 'test_five', 'test_four' ];
        deq(result, desired);
    },
    test_testCaseNames: function() {
        var result = JPosiQUnit.testCaseNames(window);
        var desired = [ "TestCase_JPosiQUnit", "TestCase_Y", "TestCase_helper", "TestCase_setup", "TestCase_test" ];
        deq(result, desired);
    },
    test_testMethodNames: function() {
        var object = {
            one: 1,
            two: 2,
            three: 3,
            test_four: function() {
                return 4
            },
            test_five: function() {
                return 5
            },
            xtest_six: function() {
                return 6
            },
            seven: function() {
                return 6
            }
        };
        var result = JPosiQUnit.testMethodNames(object);
        var desired = [ 'test_five', 'test_four' ];
        deq(result, desired);
    },
    test_testedNamesFromObject: function() {
        var object = {test_one:1, test_two:2, test_three_four:34, four:4}
        var result = JPosiQUnit.testedNamesFromObject(object);
        var desired = [ "four", "one", "three", "three_four", "two" ];
        deq(result, desired);
    },
    test_testedNamesFromMethod: function() {
        var testMethodName = 'test_one';
        var result = JPosiQUnit.testedNamesFromMethod(testMethodName);
        var desired = [ 'one' ];
        deq(result, desired);
        var testMethodName = 'test_one_two_three';
        var result = JPosiQUnit.testedNamesFromMethod(testMethodName);
        var desired = [ 'one', 'one_two_three', 'three', 'two'];
        deq(result, desired);
    },
    test_toTestProtoNames: function() {
        var object = {XyOne:1, XyTwo:2, ZzThree:3};
        var r = JPosiQUnit.toTestProtoNames(object, ['Xy']);
        deq(r, [ "XyOne", "XyTwo" ]);
    },
    test_testedProtoNames: function() {
        var object = {TestCase_One:1, XyTwo:2, TestCase_Three:3};
        var r = JPosiQUnit.testedProtoNames(object);
        deq(r, [ "One", "Three" ]);
    },
    test_testedProtoName: function() {
        var name = 'TestCase_One';
        var r = JPosiQUnit.testedProtoName(name);
        deq(r, 'One');
    },
    test_notIn: function() {
        var a = [5,6,7,8];
        var b = [1,3,5,7,9];
        var result = JPosiQUnit.notIn(a, b);
        var desired = [6,8];
        deq(result, desired);
    },
    test_constructorName: function() {
        var result = JPosiQUnit.constructorName(17);
        eq(result, 'Number');
        var result = JPosiQUnit.constructorName('hi');
        eq(result, 'String');
        var result = JPosiQUnit.constructorName([1,2,3]);
        eq(result, 'Array');
        var result = JPosiQUnit.constructorName({one:1});
        eq(result, 'Object');
    }
};
var X = {
    one: function() {
       return 1;
    }
};
var Y = {
    shouldTest: true,
    two: function() {
       return 2;
    },
    three: function() {
        return 3;
    }
};
var Z = {
    shouldTest: false,
    four: function() {
       return 4;
    }
};
var TestCase_Y = {
    shouldCover: Y,
    test_two: function() {
        eq(Y.two(), 2);
    },
    test_three: function() {
        eq(Y.three(), 3);
    }
}
var TestCase_test = {
    test_one: function() {
        var a = 1;
        this._a = 1;
        eq(1, 1);
        eq(1, a);
        eq(1, this._a);
    },
    test_two_all_fail: function() {
        var b = 2;
        this._b = 2;
        neq(1, 2);
        neq(1, b);
        neq(1, this._b);
    },
    test_four: function() {
        var a = {a: [
            {b: 1},
            {c: 2}
        ], d: 'hi'};
        var b = {a: [
            {b: 1},
            {c: 2}
        ], d: 'hi'};
        var c = {a: [
            {b: 1},
            {x: 2}
        ], d: 'hi'};
        deq(a, b);
        ndeq(a, c);
    },
    test_five: function() {
        this._a = {a: [
            {b: 1},
            {c: 2}
        ], d: 'hi'};
        this._b = {a: [
            {b: 1},
            {c: 2}
        ], d: 'hi'};
        this._c = {a: [
            {b: 1},
            {x: 2}
        ], d: 'hi'};
        deq(this._a, this._b);
        ndeq(this._a, this._c);
    }
};
var TestCase_setup = {
    setup: function() {
        this._a = 1;
        this._b = 2;
        this._c = [];
    },
    test_one: function() {
        eq(1, this._a);
        neq(1, this._b);
    },
    test_two: function() {
        eq(1, this._a);
        this._a = 2;
        eq(2, this._a);
    },
    test_three: function() {
        eq(1, this._a);
        this._a = 2;
        eq(2, this._a);
    },
    test_four: function() {
        deq([], this._c);
        this._c.push(1);
        deq([1], this._c);
    },
    test_five: function() {
        deq([], this._c);
        this._c.push(1);
        deq([1], this._c);
    }
};
var TestCase_helper = {
    doNotCall: function() {
        eq(17, 18);
    },
    helper_one: function() {
        eq(1, 1);
        neq(1, 2);
    },
    test_one: function() {
        this.helper_one();
    },
    helper_two: function() {
        return 1;
    },
    test_two: function() {
        eq(1, this.helper_two());
        neq(2, this.helper_two());
    }
};
