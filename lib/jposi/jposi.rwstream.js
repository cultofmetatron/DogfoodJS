/**
 * jposi.rwstream.js
 *
 * requires
 *      jquery
 *      jposi.proot.js
 **/

/***
 peek is next with last parameter (consume) = false

 while      (char function)
 until       (char function)

 whileWhite  (char function)
 untilWhite  (char function)

 before          whileNot for character, but also substring
 after
 afterExclude

 beforeCr
 afterCr
 afterCrExclude

 beforeWhite
 afterWhite
 afterWhiteExclude

 beforeNotWhite
 afterNotWhite
 afterNotWhiteExclude

 nextLine = afterCrExclude

 rest
 peekRest
 atEnd

 atStart

 restIncludes
 lineIncludes

 ***/
var ReadStream = PRoot.create({
    //Prototype (used to create instances)

    //ReadStream is inspired by Smalltalk's
    //ReadStream.  It allows you to read from
    //a string programtically.  It knows how to
    //read up to or through a cr, a position,
    //a substring, or a grep match.
    //
    //It is useful for simple parsing.
    //
    //=======================================
    //Prototype methods (to create instances)
    //=======================================
    on: function(s) {
        var instance = this.create();
        instance.s = s;
        return instance;
    },

    //=======================================
    //Prototype-read/Instance-write variables.
    //  Initial values read from prototype
    //  Initial values can be overwritten
    //      in WriteStream.create({here})
    //  New values are written to instances
    //=======================================
    s: '',      //string
    p: 0,       //position

    //======================================
    //Instance methods (called by instances)
    //======================================
    //======================================
    // utility
    //======================================
    makeGlobal: function(re) {
        var modifiers = 'g';
        if (re.ignoreCase) {
            modifiers += 'i';
        }
        if (re.multiline) {
            modifiers += 'm';
        }
        var reNew = new RegExp(re.source, modifiers);
        return reNew;
    },
    //======================================
    // string parts
    //======================================
    contents: function() {
        return this.s;
    },
    char: function() {
        if (this.atEnd()) {
            return null;
        }
        var char = this.slice(this.p, this.p + 1);
        return char;
    },
    snapshot: function(n) {
        n = n || 5;
        var p = this.p;
        var start = p - n;
        start = Math.max(start, 0);
        var end = p + n;
        end = Math.min(end, this.length());
        //
        var prefix = '', suffix = '';
        if (start !== 0) {
            prefix = '...';
        }
        if (end !== this.length()) {
            suffix = '...';
        }
        var before = this.slice(start, p);   //.replace(/\n/, '\\n');
        var after = this.slice(p, end);      //.replace(/\n/, '\\n');
        var result = '[' + prefix + before + '|' + after + suffix + '][' + this.p + ']';
        return result;
    },
    slice: function(start, end) {
        var result;
        if (end !== undefined) {
            result = this.s.slice(start, end);
        } else {
            if (start !== undefined) {
                result = this.s.slice(start);
            } else {
                result = this.s.slice();
            }
        }
        return result;
    },
    sliceToEnd: function() {
        var result = this.slice(this.p);
        return result;
    },
    splitSplit: function(sSplitter1, sSplitter2) {
        function splitTrimNoEmpties(sString, sSplitter) {
            var array1 = sString.split(sSplitter);
            var array2 = $.map(array1, function(eachV, eachI) {
                return $.trim(eachV);
            });
            var array3 = $.grep(array2, function(eachV, eachI) {
                return !!eachV;
            });
            return array3;
        }

        var array = splitTrimNoEmpties(this.s, sSplitter1);
        var arrayOfArrays = [];
        //$.map concats sub-arrays!!!
        for (var i = 0; i < array.length; i++) {
            arrayOfArrays.push(splitTrimNoEmpties(array[i], sSplitter2))
        }
        return arrayOfArrays;
    },
    split: function(sSeparator) {
        return this.s.split(sSeparator);
    },
    splitTrim: function(sSeparator) {
        //split, trim pieces, then remove blanks
        var array = this.split(sSeparator);
        var trimmed = $.map(array, function(each) {
            return $.trim(each);
        });
        return trimmed;
    },
    splitTrimCull: function(sSeparator) {
        //split, trim pieces, then remove blanks
        var trimmed = this.splitTrim(sSeparator);
        var culled = $.grep(trimmed, function(each) {
            //true if not blank
            return !!each;
        });
        return culled;
    },
    asHtml: function() {
        //replace \n with <br />
        var html = this.s;
        //html = html.replace(/&/g, '&amp;');
        html = html.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
        html = html.replace(/\t/g, '&#09;');
        html = html.replace(/ /g, '&nbsp;');
        html = html.replace(/</g, '&lt;');
        html = html.replace(/>/g, '&gt;');
        html = html.replace(/\n/g, '<br />');
        return html;
    },
    //======================================
    // lines
    //======================================
    firstLine: function() {
        return this.lines()[0];
    },
    lines: function() {
        return this.split('\n');
    },
    linesTrim: function() {
        //get lines, trim each
        var lines = this.splitTrim('\n');
        return lines;
    },
    linesTrimCull: function() {
        //get lines, trim each, then remove blanks
        var lines = this.splitTrimCull('\n');
        return lines;
    },
    forEachLine: function(f_each_i_a) {
        var lines = this.lines();
        //switch each and i
        f_i_each = function(i, each) {
            return f_each_i_a(each, i, lines);
        };
        var result = $.each(this.lines(), f_i_each);
        return result;
    },
    //======================================
    // length
    //======================================
    length: function() {
        return this.s.length;
    },
    lengthToEnd: function() {
        return this.length() - this.p;
    },
    //======================================
    // boolean
    //======================================
    atStart: function() {
        return (this.p === 0);
    },
    atEnd: function() {
        return (this.p === this.length());
    },
    matchesHere: function(re) {
        var search = this.sliceToEnd().search(re);
        var result = (search === 0);
        return result;
    },
    //======================================
    // next, peek, go
    //======================================
    next: function(n, bPeek, bGo) {
        //next is next(n, false, false)
        //peek is next(n, true, false)
        //go is next(n, false, true)
        if (n !== 0) {
            n = n || 1
        }
        var from = this.p;
        var to = this.p + n;
        to = Math.min(to, this.length());
        var result = this.slice(from, to);
        this.p = to;
        if (bGo) {
            return this;
        }
        if (bPeek) {
            this.p = from;
        }
        return result;
    },
    nextToEnd: function(bPeek, bGo) {
        var result = this.next(this.lengthToEnd(), bPeek, bGo);
        return result;
    },
    peek: function(n) {
        return this.next(n, true, false);
    },
    go: function(n) {
        return this.next(n, false, true);
    },
    //======================================
    // before, after
    //======================================
    before: function(re, bPeek, bGo) {
        var fromHere = this.sliceToEnd();
        var index = fromHere.search(re);
        index = (index === -1 ? this.lengthToEnd() : index);
        return this.next(index, bPeek, bGo);
    },
    after: function(re, bPeek, bGo) {
        var reG = this.makeGlobal(re);
        var fromHere = this.sliceToEnd();
        var reResult = reG.exec(fromHere);
        var result;
        var index = reG.lastIndex;
        if (index === 0) {
            result = this.nextToEnd(bPeek, bGo);
        } else {
            result = this.next(index, bPeek, bGo);
        }
        return result;
    },
    beforeLineStartsWith: function(re) {
        //if at start, and first line starts with re, do nothing
        var start = this.p;
        var result;
        if (this.atStart() && this.matchesHere(re)) {
            result = '';
            return result;
        }
        //else repeat until at start of line that starts with re
        while (!this.atEnd()) {
            this.after(/\n/);
            if (this.matchesHere(re)) {
                result = this.slice(start, this.p);
                return result;
            }
        }
        //didn't find \n followed be re - will be at end here
        return this.slice(start, this.length());
    },
    //======================================
    // nextWhile, nextUntil
    //======================================
    nextWhile: function(fWhile) {
        var start = this.p;
        //increment p until at end, or fWhile is false
        while (!this.atEnd() & fWhile(this.char())) {
            this.p++;
        }
        var result = this.slice(start, this.p);
        return result;
    },
    nextUntil: function(fUntil) {
        var result = this.nextWhile(function(c) {
            return !fUntil(c);
        });
        return result;
    },
    //======================================
    // SON parse
    //
    // SON means "simple object notation"
    // This method converts SON to JSON
    //
    // xxx
    // .one:1
    // .two
    //    20
    //    21
    // .three:
    //    30
    //    31
    //
    // {one:'1', two:'   20\n   21', three:'   30\n   31'}
    //======================================
    sonToJson: function() {
        var pages = this.splitTrimCull(/\n\==\n/);
        var arrayOfObjects = $.map(pages, function(each) {
            var rs = ReadStream.on(each);
            var object = rs.sonToJsonInner();
            return object;
        });
        return arrayOfObjects;
    },
    sonToJsonInner: function() {
        function trimCr(s) {
            //trim leading and trailing cr's
            return s.replace(/^\n+/, '').replace(/\n+$/, '');
        }

        function trimColon(s) {
            //trim leading :
            return s.replace(/^:/, '');
        }

        var groups = this.splitTrimCull(/\n\./);
        if (this.char() !== '.') {
            //get rid of junk before first key
            groups = groups.slice(1);
        }
        var result = {};
        $.each(groups, function(i, each) {
            var endOfKey = each.search(/:|\n/);
            var key = each.slice(0, endOfKey);
            key = trimCr(key);
            var value = each.slice(endOfKey);
            value = trimColon(value)
            value = trimCr(value);
            result[key] = value;
        });
        return result;
    }
});
var WriteStream = PRoot.create({
    //Prototype (used to create instances)

    //WriteStream is inspired by Smalltalk's
    //WriteStream.  It allows you to create
    //a string programtically.  It knows how to
    //increment indent and decrement indent.
    //It is useful for allowing tree objects to
    //print themselves.

    //Example
    //
    //var stream = WriteStream.create({_sp:'_'});
    //stream.ind().s('hello').cr().
    // inc().
    // ind().s('how').sp().s('are').cr().
    // ind().s('you').cr().
    // dec().
    // ind().s('world').cr(2);
    //return stream.contents();

    //=======================================
    //Prototype methods (to create instances)
    //=======================================
    on: function(s) {
        var instance = this.create();
        instance._string = s;
        return instance;
    },

    //=======================================
    //Prototype-read/Instance-write variables.
    //  Initial values read from prototype
    //  Initial values can be overwritten
    //      in WriteStream.create({here})
    //  New values are written to instances
    //=======================================
    _string: '',
    _indent: '    ',
    _indentCount: 0,
    _stops: [],

    _sp: ' ',
    _cr: '\n',
    _tab: '\t',

    _line: '=',


    //======================================
    // add string(s)
    //======================================
    s: function(s, n) {
        if (n !== 0) {
            n = n || 1
        }
        while (n--) {
            this._string += s;
        }
        return this;
    },
    sPad: function(s, iLength, sCharacter) {
        sCharacter = sCharacter || this._sp;
        for (var i = 0; i < iLength; i++) {
            if (i >= s.length) {
                this.s(sCharacter);
            } else {
                this.s(s[i]);
            }
        }
        return this;
    },
    //======================================
    // whitespace
    //======================================
    sp: function(n) {
        return this.s(this._sp, n)
    },
    cr: function(n) {
        return this.s(this._cr, n)
    },
    tab: function(n) {
        return this.s(this._tab, n)
    },
    //======================================
    // characters
    //======================================
    colon: function(n) {
        return this.s(':', n)
    },
    comma: function(n) {
        return this.s(',', n)
    },
    semi: function(n) {
        return this.s(';', n)
    },
    period: function(n) {
        return this.s('.', n)
    },
    dot: function(n) {
        return this.s('.', n)
    },
    eq: function(n) {
        return this.s('=', n)
    },
    ne: function(n) {
        return this.s('!=', n)
    },
    gt: function(n) {
        return this.s('>', n)
    },
    ge: function(n) {
        return this.s('>=', n)
    },
    lt: function(n) {
        return this.s('<', n)
    },
    le: function(n) {
        return this.s('<=', n)
    },
    //======================================
    // lines
    //======================================
    dash: function(n) {
        return this.s('-', n)
    },
    star: function(n) {
        return this.s('*', n)
    },
    under: function(n) {
        return this.s('_', n)
    },
    //======================================
    // indent or stop
    //======================================
    ind: function() {
        var stop = this.getStop();
        if (stop) {
            return this.col(stop, true)
        } else {
            return this.s(this._indent, this._indentCount);
        }
    },
    //======================================
    // adjust indent or stop
    //======================================
    inc: function() {
        this._indentCount += 1;
        return this;
    },
    dec: function() {
        this._indentCount -= 1;
        this._indentCount = Math.max(0, this._indentCount);
        return this;
    },
    setStop: function() {
        this._stops.push(this.lengthAfterLastCr());
        return this;
    },
    unStop: function() {
        this._stops.pop();
        return this;
    },
    unstopAll: function() {
        this._stops = [];
        return this;
    },
    getStop: function() {
        if (this._stops.length === 0) {
            return null;
        }
        return this._stops[this._stops.length - 1];
    },
    //======================================
    // combinations
    //======================================
    crInd: function() {
        return this.cr().ind();
    },
    crIndS: function(s) {
        return this.cr().ind().s(s);
    },
    key: function(s) {
        return this.ind().s(s).colon().sp().setStop();
    },
    line: function(n) {
        if (n !== 0) {
            n = n || 10
        }
        return this.s(this._line, n);
    },
    title: function(s) {
        var length = s.length;
        return this.crInd().line(length).crIndS(s).crInd().line(length).cr(2);
    },
    comment: function(s) {
        var length = s.length;
        this.s('/').s('*', length + 1).crIndS('* ').s(s).crIndS('*', length + 1).s('/').cr();
        return this;
    },
    //======================================
    // columns
    //======================================
    colBasic: function(nPosition, bTrim, bNoSpace) {
        //  move right to column
        //  if bTrim, delete left to column
        //  if bSpace, delete one more and add space
        //  (assume length of _sp is 1)
        var desired = this.afterLastCrIndex() + nPosition;
        var actual = this._string.length;
        var delta = desired - actual;
        if (delta > 0) {
            this.sp(delta);
        } else {
            if (bTrim) {
                if (delta < 0) {
                    this._string = this._string.slice(0, delta);    //delta is negative
                }
                if (!bNoSpace) {                                    //make a space (is default)
                    this._string = this._string.slice(0, -1);
                    this.sp();
                }
            }
        }
        return this;
    },
    col: function(nPosition) {
        return this.colBasic(nPosition);
    },
    colTrim: function(nPosition) {
        return this.colBasic(nPosition, true);
    },
    colTrimNoSpace: function(nPosition) {
        return this.colBasic(nPosition, true, true);
    },
    //======================================
    // visiting
    //======================================
    visitWith: function(v, oVisitor) {
        oVisitor.visit(v, this);
        return this;
    },
    //======================================
    // printing
    //======================================
    print: function(v) {
        //print a value (that understands .printOn() or .toString()) on the stream
        if (v.printOn) {
            v.printOn(this);
            return this;
        }
        if (v.toString) {
            this.s(v.toString());
            return this;
        }
        this.s('???' + typeof v + '???');
        return this;
    },
    printBetween: function(a, fBetween) {
        //print an array of values, calling fBetween(ws) in between them
        if (!fBetween) {
            return this.printBetweenCommaSp(a);
        }
        if (typeof fBetween === 'string') {
            var string = fBetween;
            fBetween = function(ws) {
                ws.s(string);
            }
        }
        for (var i = 0; i < a.length; i++) {
            this.print(a[i]);
            if (i < a.length - 1) {
                fBetween(this);
            }
        }
        return this;
    },
    printBetweenCommaSp: function(aValues) {
        return this.printBetween(aValues, ', ');
    },
    printBetweenCrInd: function(aValues) {
        return this.printBetween(aValues, function(ws) {
            ws.cr().ind()
        });
    },
    //======================================
    // querying
    //======================================
    length: function () {
        return this._string.length
    },
    lengthAfterLastCr: function () {
        var indexAfterCr = this.afterLastCrIndex();
        var column = this._string.length - indexAfterCr;
        return column;
    },
    asLines: function () {
        return this._string.split(this._cr);
    },
    lastCrIndex: function () {
        return this._string.lastIndexOf(this._cr);
    },
    afterLastCrIndex: function () {
        var lastIndex = this.lastCrIndex();
        return lastIndex + this._cr.length;
    },
    lastLineLength: function () {
        return this.length() - this.lastCrIndex() - 1;
    },
    numberOfLines: function() {
        return this.asLines().length
    },
    maxLineLength: function () {
        var lines = this.asLines();
        var result = 0;
        for (var i in lines) {
            result = Math.max(result, lines[i].length);
        }
        return result;
    },
    stringReverse: function () {
        return this._string.split('').reverse().join('');
    },
    //======================================
    // result
    //======================================
    asHtml: function() {
        var rs = ReadStream.on(this._string);
        return rs.asHtml();
    },
    contents: function() {
        return this._string;
    }
});