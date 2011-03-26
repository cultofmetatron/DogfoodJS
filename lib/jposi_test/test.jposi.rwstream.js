var TestCase_ReadStream = PRoot.create({
    shouldCover: ReadStream,
    setup: function() {
        this._rs = ReadStream.on('/one\n/two\n/three four five');
    },
    test_on: function() {
        var rs = ReadStream.on('12345');
        eq(rs.contents(), '12345');
    },
    test_makeGlobal: function() {
        expect(16);
        var reG = this._rs.makeGlobal(/abc/);
        eq(reG.source, 'abc');
        eq(reG.ignoreCase, false);
        eq(reG.multiline, false);
        eq(reG.global, true);
        //
        reG = this._rs.makeGlobal(/abc/i);
        eq(reG.source, 'abc');
        eq(reG.ignoreCase, true);
        eq(reG.multiline, false);
        eq(reG.global, true);
        //
        reG = this._rs.makeGlobal(/abc/m);
        eq(reG.source, 'abc');
        eq(reG.ignoreCase, false);
        eq(reG.multiline, true);
        eq(reG.global, true);
        //
        reG = this._rs.makeGlobal(/abc/im);
        eq(reG.source, 'abc');
        eq(reG.ignoreCase, true);
        eq(reG.multiline, true);
        eq(reG.global, true);
    },
    //======================================
    // string parts
    //======================================
    test_contents: function() {
        eq(this._rs.contents(), '/one\n/two\n/three four five');
    },
    test_char: function() {
        eq(this._rs.char(), '/');
        this._rs.next();
        eq(this._rs.char(), 'o');
        this._rs.nextToEnd();
        eq(this._rs.char(), null);
    },
    test_snapshot: function() {
        eq(this._rs.snapshot(), '[|/one\n...][0]');
        this._rs.next();
        eq(this._rs.snapshot(), '[/|one\n/...][1]');
        this._rs.nextToEnd();
        eq(this._rs.snapshot(), '[... five|][26]');
    },
    test_slice: function() {
        eq(this._rs.p, 0);
        eq(this._rs.slice(13, 16), 'ree');
        eq(this._rs.p, 0);
        this._rs.p = 13;
        eq(this._rs.snapshot(), '[...o\n/th|ree f...][13]');
        eq(this._rs.snapshot(20), '[/one\n/two\n/th|ree four five][13]');
    },
    test_sliceToEnd: function() {
        eq(this._rs.sliceToEnd(), this._rs.contents());
        eq(this._rs.before(/three/), '/one\n/two\n/');
        eq(this._rs.p, 11);
        eq(this._rs.sliceToEnd(), 'three four five');
    },
    test_splitSplit: function() {
        var desired = [
            [ "one" ],
            [ "two" ],
            [ "three", "four", "five" ]
        ];
        deq(this._rs.splitSplit('/', ' '), desired);
    },
    test_split: function() {
        deq(this._rs.split('/'), [ "", "one\n", "two\n", "three four five" ]);
        deq(this._rs.split('\n/'), [ "/one", "two", "three four five" ]);
    },
    test_splitTrim: function() {
        var rs = ReadStream.on('   asdf   asdf   asdf');
        deq(rs.splitTrim('a'), [ "", "sdf", "sdf", "sdf" ]);
    },
    test_splitTrimCull: function() {
        deq(this._rs.splitTrimCull('/'), [ "one", "two", "three four five" ]);
        deq(this._rs.splitTrimCull('\n/'), [ "/one", "two", "three four five" ]);
    },
    test_asHtml: function() {
        eq(this._rs.asHtml(), '/one<br />/two<br />/three&nbsp;four&nbsp;five');
    },
    //======================================
    // lines
    //======================================
    test_firstLine: function() {
        eq(this._rs.firstLine(), '/one');
        var s = 'Hello World';
        var rs = ReadStream.on(s);
        eq(rs.firstLine(), s);
    },
    test_lines: function() {
        var s = '  \n  \n\n  a.a   \n\n   b.  xxx   .b\n   \t   \t\t   c.xxx.c\n\t   \t\n';
        var rs = ReadStream.on(s);
        var result = rs.lines();
        eq(result.length, 9);
        deq(result, [ "  ", "  ", "", "  a.a   ", "", "   b.  xxx   .b", "   \t   \t\t   c.xxx.c", "\t   \t", "" ]);
    },
    test_linesTrim: function() {
        var s = '  asdf   \n   asdf  \n  asdf   \n   ';
        var rs = ReadStream.on(s);
        var result = rs.linesTrim();
        deq(result, [ "asdf", "asdf", "asdf", "" ]);
    },
    test_linesTrimCull: function() {
        var s = '  \n  \n\n  a.a   \n\n   b.  xxx   .b\n   \t   \t\t   c.xxx.c\n\t   \t\n';
        var rs = ReadStream.on(s);
        var result = rs.linesTrimCull();
        eq(result.length, 3);
        deq(result, [ "a.a", "b.  xxx   .b", "c.xxx.c" ]);
    },
    test_forEachLine: function() {
        var result = [];
        this._rs.forEachLine(function(each, i, s) {
            result.push(each);
            result.push(i);
            result.push(s.length);
        })
        deq(result, [ "/one", 0, 3, "/two", 1, 3, "/three four five", 2, 3 ]);
    },
    //======================================
    // length
    //======================================
    test_length: function() {
        eq(this._rs.length(), 26);
        this._rs.next(5);
        eq(this._rs.length(), 26);
    },
    test_lengthToEnd: function() {
        eq(this._rs.lengthToEnd(), 26);
        this._rs.next(5);
        eq(this._rs.lengthToEnd(), 21);
    },
    //======================================
    // boolean
    //======================================
    test_atStart: function() {
        eq(this._rs.snapshot(), '[|/one\n...][0]');
        eq(this._rs.atStart(), true);
        this._rs.next();
        eq(this._rs.snapshot(), '[/|one\n/...][1]');
        eq(this._rs.atStart(), false);
    },
    test_atEnd: function() {
        eq(this._rs.snapshot(), '[|/one\n...][0]');
        eq(this._rs.atEnd(), false);
        this._rs.next(1000);
        eq(this._rs.snapshot(), '[... five|][26]');
        eq(this._rs.atEnd(), true);
    },
    test_matchesHere: function() {
        eq(this._rs.snapshot(), '[|/one\n...][0]');
        eq(this._rs.matchesHere(/\/one/), true);
        eq(this._rs.matchesHere(/one/), false);
        eq(this._rs.matchesHere(/\/two/), false);
        this._rs.next();
        eq(this._rs.snapshot(), '[/|one\n/...][1]');
        eq(this._rs.matchesHere(/\/one/), false);
        eq(this._rs.matchesHere(/one/), true);
        eq(this._rs.matchesHere(/two/), false);
    },
    //======================================
    // next, peek, go
    //======================================
    test_next: function() {
        eq(this._rs.next(), '/');
        eq(this._rs.p, 1);
    },
    test_next2: function() {
        eq(this._rs.next(4), '/one');
        eq(this._rs.p, 4);
    },
    test_nextToEnd: function() {
        eq(this._rs.p, 0);
        var expected = this._rs.sliceToEnd();
        eq(this._rs.nextToEnd(), expected);
        eq(this._rs.p, 26);
    },
    test_nextToEnd2: function() {
        this._rs.next(5);
        eq(this._rs.p, 5);
        var expected = this._rs.sliceToEnd();
        eq(this._rs.nextToEnd(), expected);
        eq(this._rs.p, 26);
    },
    test_peek: function() {
        eq(this._rs.peek(), '/');
        eq(this._rs.p, 0);
    },
    test_peek2: function() {
        eq(this._rs.peek(4), '/one');
        eq(this._rs.p, 0);
    },
    test_go: function() {
        eq(this._rs.go(), this._rs);
        eq(this._rs.p, 1);
    },
    test_go2: function() {
        eq(this._rs.go(3), this._rs);
        eq(this._rs.p, 3);
    },
    //======================================
    // before, after
    //======================================
    test_before: function() {
        eq(this._rs.before(/three/), '/one\n/two\n/');
        eq(this._rs.snapshot(), '[...two\n/|three...][11]');
        eq(this._rs.p, 11);
    },
    test_beforeLineStartsWith: function() {
        eq(this._rs.snapshot(), '[|/one\n...][0]');
        eq(this._rs.beforeLineStartsWith(/\/one/), '');
        eq(this._rs.snapshot(), '[|/one\n...][0]');
        eq(this._rs.p, 0);
    },
    test_beforeLineStartsWith2: function() {
        eq(this._rs.snapshot(), '[|/one\n...][0]');
        eq(this._rs.beforeLineStartsWith(/\/three/), '/one\n/two\n');
        eq(this._rs.snapshot(), '[.../two\n|/thre...][10]');
        eq(this._rs.p, 10);
    },
    test_beforeLineStartsWith3: function() {
        eq(this._rs.snapshot(), '[|/one\n...][0]');
        eq(this._rs.beforeLineStartsWith(/asdf/), this._rs.contents());
        eq(this._rs.snapshot(), '[... five|][26]');
        eq(this._rs.p, 26);
    },
    test_after: function() {
        eq(this._rs.after(/three/), '/one\n/two\n/three');
        eq(this._rs.snapshot(), '[...three| four...][16]');
        eq(this._rs.p, 16);
    },
    test_after2: function() {
        eq(this._rs.after(/three/), '/one\n/two\n/three');
        eq(this._rs.snapshot(), '[...three| four...][16]');
        eq(this._rs.p, 16);
        var expected = this._rs.sliceToEnd();
        eq(this._rs.after(/asdf/), expected);
        eq(this._rs.snapshot(), '[... five|][26]');
        eq(this._rs.p, 26);
    },
    //======================================
    // nextWhile, nextUntil
    //======================================
    test_nextWhile: function() {
        var fWhile = function(c) {
            return c != 't'
        };
        var result = this._rs.nextWhile(fWhile);
        eq(result, '/one\n/');
    },
    test_nextUntil: function() {
        var fUntil = function(c) {
            return c == 't'
        };
        var result = this._rs.nextUntil(fUntil);
        eq(result, '/one\n/');
    },
    test_sonToJsonInner: function() {
        var string = 'xxx\n.one:1\n.two\n   20\n   21\n.three:\n   30\n   31';
        var rs = ReadStream.on(string);
        var result = rs.sonToJsonInner();
        desired = {'one':'1', 'two':'   20\n   21', 'three':'   30\n   31'}
        deq(result, desired);
    },
    test_sonToJson: function() {
        var string = 'xxx\n.one:1\n.two\n   20\n   21\n.three:\n   30\n   31\n==\nxxx\n.one:1\n.two\n   20\n   21\n.three:\n   30\n   31\n==\nxxx\n.one:1\n.two\n   20\n   21\n.three:\n   30\n   31';
        var rs = ReadStream.on(string);
        var result = rs.sonToJson();
        desired = [
            {'one':'1', 'two':'   20\n   21', 'three':'   30\n   31'},
            {'one':'1', 'two':'   20\n   21', 'three':'   30\n   31'},
            {'one':'1', 'two':'   20\n   21', 'three':'   30\n   31'}
        ];
        deq(result, desired);
    }
});
var TestCase_WriteStream = PRoot.create({
    shouldCover: WriteStream,
    setup: function() {
        this._ws = WriteStream.create({_sp: '.', _cr: '|', _tab: ';', _indent: ',,,,', _stops: []});
        this._ws2 = WriteStream.on('one\ntwo\nthree\nfour');
        this._ws3 = WriteStream.on('one_two_three_four');
    },
    //======================================
    // ???
    //======================================
    test_aaBlankLiteralArray1: function() {
        eq(this._ws.contents(), '');
        deq(this._ws._stops, []);
        this._ws.s('xyz');
        this._ws.setStop();
        eq(this._ws.contents(), 'xyz');
        deq(this._ws._stops, [3]);
    },
    test_aaBlankLiteralArray2: function() {
        eq(this._ws.contents(), '');
        deq(this._ws._stops, []);
        this._ws.s('xyz');
        this._ws.setStop();
        eq(this._ws.contents(), 'xyz');
        deq(this._ws._stops, [3]);
    },
    //======================================
    // prototype methods
    //======================================
    test_on: function() {
        var ws = WriteStream.on('hello');
        var r = ws.contents();
        eq(r, 'hello');
    },
    //======================================
    // add string(s)
    //======================================
    test_s_contents: function() {
        eq(this._ws.s('abc').contents(), 'abc');
        this.setup();
        eq(this._ws.s('abc', 3).contents(), 'abcabcabc');
        this.setup();
        eq(this._ws.s(17).contents(), '17');
        this.setup();
        eq(this._ws.s(0).contents(), '0');
        this.setup();
        eq(this._ws.s(false).contents(), 'false');
    },
    test_sPad: function() {
        eq(this._ws.sPad('abc', 5).contents(), 'abc..');
        this.setup();
        eq(this._ws.sPad('abcdef', 5).contents(), 'abcde');
        this.setup();
        eq(this._ws.sPad('abc', 5, '#').contents(), 'abc##');
    },
    //======================================
    // whitespace
    //======================================
    test_sp: function() {
        eq(this._ws.sp().contents(), '.');
        eq(this._ws.sp(3).contents(), '....');
    },
    test_cr: function() {
        eq(this._ws.cr().contents(), '|');
        eq(this._ws.cr(3).contents(), '||||');
    },
    test_tab: function() {
        eq(this._ws.tab().contents(), ';');
        eq(this._ws.tab(3).contents(), ';;;;');
    },
    //======================================
    // characters
    //======================================
    test_colon_comma_semi_period_dot_eq_ne_gt_ge_lt_le: function() {
        this._ws.colon().comma().semi().period().dot();
        this._ws.eq().ne().gt().ge().lt().le();
        eq(this._ws.contents(), ":,;..=!=>>=<<=");
        this.setup();
        this._ws.colon(2).comma(2).semi(2).period(2).dot(2);
        this._ws.eq(2).ne(2).gt(2).ge(2).lt(2).le(2);
        eq(this._ws.contents(), "::,,;;....==!=!=>>>=>=<<<=<=");
    },
    //======================================
    // lines
    //======================================
    test_dash_star_under: function() {
        this._ws.dash().star().under();
        eq(this._ws.contents(), "-*_");
        this.setup();
        this._ws.dash(2).star(2).under(2);
        eq(this._ws.contents(), "--**__");
    },
    //======================================
    // indent or stop
    //======================================
    test_ind_inc_dec: function() {
        eq(this._ws.s('a').ind().s('b').contents(), 'ab');
        this._ws.inc();
        eq(this._ws.ind().s('c').contents(), 'ab,,,,c');
        this._ws.inc();
        eq(this._ws.ind().s('d').contents(), 'ab,,,,c,,,,,,,,d');
        this._ws.dec();
        eq(this._ws.ind().s('e').contents(), 'ab,,,,c,,,,,,,,d,,,,e');
    },
    //======================================
    // adjust indent or stop
    //======================================
    test_setStop_unStop_unstopAll: function() {
        this._ws.s('12345').setStop().s('67890').setStop().s('12345').setStop();
        deq(this._ws._stops, [5, 10, 15]);
        this._ws.unStop();
        deq(this._ws._stops, [5, 10]);
        this._ws.unstopAll();
        deq(this._ws._stops, []);
    },
    test_getStop: function() {
        eq(this._ws.getStop(), null);
        this._ws.s('12345').setStop().s('67890').setStop().s('12345').setStop();
        deq(this._ws._stops, [5, 10, 15]);
        eq(this._ws.getStop(), 15);
        deq(this._ws._stops, [5, 10, 15]);
    },
    //======================================
    // combinations
    //======================================
    test_crInd: function() {
        this._ws.s('one').inc().crInd().s('two');
        this._ws.dec().crInd().s('three');
        eq(this._ws.contents(), "one|,,,,two|three");
    },
    test_crIndS: function(s) {
        this._ws.s('one').inc().crIndS('two');
        this._ws.dec().crIndS('three');
        eq(this._ws.contents(), "one|,,,,two|three");
    },
    test_key: function(s) {
        this._ws.inc().key('one');
        eq(this._ws.contents(), ",,,,one:.");
        deq(this._ws._stops, [9]);
    },
    test_line: function(n) {
        this._ws.line().cr().line(4);
        eq(this._ws.contents(), "==========|====");
    },
    test_title: function(s) {
        this._ws.title('Hello');
        eq(this._ws.contents(), "|=====|Hello|=====||");
    },
    test_comment: function(s) {
        this._ws.comment('Hello');
        eq(this._ws.contents(), "/******|* Hello|*/|");
    },
    //======================================
    // columns
    //======================================
    test_colBasic: function() {
        var r = this._ws.s('12345').colBasic(7).contents();
        eq(r, "12345..");
        this.setup();
        var r = this._ws.s('12345').colBasic(4).contents();
        eq(r, "12345");
        this.setup();
        var r = this._ws.s('12345').colBasic(4, true).contents();
        eq(r, "123.");
        this.setup();
        var r = this._ws.s('12345').colBasic(4, true, true).contents();
        eq(r, "1234");
    },
    test_col: function() {
        var r = this._ws.s('12345').col(7).contents();
        eq(r, "12345..");
        this.setup();
        var r = this._ws.s('12345').col(4).contents();
        eq(r, "12345");
    },
    test_colTrim: function() {
        var r = this._ws.s('12345').colTrim(7).contents();
        eq(r, "12345..");
        this.setup();
        var r = this._ws.s('12345').colTrim(4).contents();
        eq(r, "123.");
    },
    test_colTrimNoSpace: function() {
        var r = this._ws.s('12345').colTrimNoSpace(7).contents();
        eq(r, "12345..");
        this.setup();
        var r = this._ws.s('12345').colTrimNoSpace(4).contents();
        eq(r, "1234");
    },
    //======================================
    // visiting
    //======================================
    test_visitWith: function() {
        var visitor = {visit:function(v, ws) {
            ws.s('visited ' + v)
        }};
        this._ws.s('[');
        this._ws.visitWith('hello', visitor);
        this._ws.s(']');
    },
    //======================================
    // printing
    //======================================
    test_print: function(v) {
        var object = {printOn: function(ws) {
            ws.s('XXX');
        }};
        var r = this._ws.print(1);
        eq(this._ws.contents(), '1');
        this.setup();
        r = this._ws.print(object);
        eq(this._ws.contents(), 'XXX');
        eq(r.contents(), this._ws.contents());
    },
    test_printBetween: function() {
        var result = this._ws.printBetween([1, 2, 3], function(ws) {
            ws.cr().inc().ind();
        });
        eq(this._ws.contents(), '1|,,,,2|,,,,,,,,3');
        eq(result.contents(), this._ws.contents());
    },
    test_printBetweenCommaSp: function() {
        var result = this._ws.printBetweenCommaSp([1, 2, 3]);
        eq(this._ws.contents(), '1, 2, 3');
        eq(result.contents(), this._ws.contents());
    },
    test_printBetweenCrInd: function() {
        var r = this._ws.inc().printBetweenCrInd([1, 2, 3]);
        eq(this._ws.contents(), "1|,,,,2|,,,,3");
        eq(r.contents(), this._ws.contents());
    },
    //======================================
    // querying
    //======================================
    test_length: function () {
        var r = this._ws.length();
        eq(r, 0);
        r = this._ws2.length();
        eq(r, 18);
        r = this._ws3.length();
        eq(r, 18);
    },
    test_lengthAfterLastCr: function () {
        var r = this._ws.lengthAfterLastCr();
        deq(r, 0);
        r = this._ws2.lengthAfterLastCr();
        deq(r, 4);
        r = this._ws3.lengthAfterLastCr();
        deq(r, 18);
    },
    test_asLines: function () {
        var r = this._ws.asLines();
        deq(r, ['']);
        r = this._ws2.asLines();
        deq(r, [ "one", "two", "three", "four" ]);
        r = this._ws3.asLines();
        deq(r, [ "one_two_three_four" ]);
    },
    test_lastCrIndex: function () {
        var r = this._ws.lastCrIndex();
        eq(r, -1);
        r = this._ws2.lastCrIndex();
        eq(r, 13);
        r = this._ws3.lastCrIndex();
        eq(r, -1);
    },
    test_afterLastCrIndex: function () {
        var r = this._ws.afterLastCrIndex();
        eq(r, 0);
        r = this._ws2.afterLastCrIndex();
        eq(r, 14);
        r = this._ws3.afterLastCrIndex();
        eq(r, 0);
    },
    test_lastLineLength: function () {
        var r = this._ws.lastLineLength();
        eq(r, 0);
        r = this._ws2.lastLineLength();
        eq(r, 4);
        r = this._ws3.lastLineLength();
        eq(r, 18);
    },
    test_numberOfLines: function() {
        var r = this._ws.numberOfLines();
        eq(r, 1);
        r = this._ws2.numberOfLines();
        eq(r, 4);
        r = this._ws3.numberOfLines();
        eq(r, 1);
    },
    test_maxLineLength: function () {
        var r = this._ws.maxLineLength();
        eq(r, 0);
        r = this._ws2.maxLineLength();
        eq(r, 5);
        r = this._ws3.maxLineLength();
        eq(r, 18);
    },
    test_stringReverse: function () {
        var r = this._ws.stringReverse();
        eq(r, "");
        r = this._ws2.stringReverse();
        eq(r, "ruof\neerht\nowt\neno");
        r = this._ws3.stringReverse();
        eq(r, "ruof_eerht_owt_eno");
    },
    //======================================
    // result
    //======================================
    test_asHtml: function() {
        eq(this._ws.asHtml(), "");
        eq(this._ws2.asHtml(), "one<br />two<br />three<br />four");
        eq(this._ws3.asHtml(), "one_two_three_four");
    }
});