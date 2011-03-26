//=========================================================
// test.jquery.posi.proot.js
//
// Tests the POSI class PRoot
// and QUnit equal, deepEqual, and async tests
//=========================================================
var TestCase_QUnit = {
    setup: function() {
        this._a1 = [
            { "name": "user_name", "value": "david" }
        ];
        this._a2 = [
            { "name": "user_name", "value": "david" }
        ];
        this._b1 = [
            { "name": "user_name", "value": "henry" }
        ];
    },
    test_equal: function() {
        expect(2);
        notEqual(this._a1, this._a2);
        notEqual(this._a1, this._b1);
    },
    test_deepEqual: function() {
        expect(2);
        deepEqual(this._a1, this._a2);
        notDeepEqual(this._a1, this._b1);
    }
};
var TestCase_PRoot = {
    test_create: function() {
        expect(4);
        var P = PRoot.create({
            one: 1,
            two: 2,
            three: function () {
                return this.one + this.two;
            }
        });
        var i = P.create({
            four: 4
        });
        eq(i.one, 1);
        eq(i.two, 2);
        eq(i.three(), 3);
        eq(i.four, 4);
    },
    test_create_mixin: function() {
        expect(6);
        var Animal = PRoot.create({walksOn: '4 legs'});
        var Mammal = Animal.create({birth: 'live'});
        var Bipedal = PRoot.create({walksOn: '2 legs'});
        var Bird = Animal.create(Bipedal).create({coveredBy: 'feathers'});
        var Man = Mammal.create(Bipedal).create({coveredBy: 'skin'});
        eq(Man.walksOn, '2 legs');
        eq(Bird.walksOn, '2 legs');
        eq(Mammal.walksOn, '4 legs');
        eq(Man.birth, 'live');
        eq(Bird.birth, undefined);
        eq(Mammal.birth, 'live');
    }
};
var TestCase_REST = {
    test_stackoverflow: function() {
        //========================================
        // wait for async callbacks (in any order)
        //========================================
        stop(2000);                             //give up after 2 seconds
        var waitFor = 3;                        //wait for this many callbacks (don't use expect)
        function done() {                       //each callback reports in
            --waitFor === 0 ? start() : null;   //start after last callback reports in
        }
        //
        var url = 'http://stackoverflow.com/users/flair/346711.json?callback=?';
        $.getJSON(url, function (data, textStatus) {
            var desired = "Stan";        //must go in the callback - can be changed asynchronously
            eq(data.displayName, desired);
            done();
        });
        $.getJSON(url, function (data, textStatus) {
            var desired = [ "badgeHtml", "displayName", "gravatarHtml", "id", "profileUrl", "reputation" ];
            deq(JPosiQUnit.sortedKeys(data), desired);
            done();
        });
        $.getJSON(url, function (data, textStatus) {
            var desired = '346711';
            eq(data.id, desired);
            done();
        });
    }
};