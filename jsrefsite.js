/*******************************************************************************
 * Project JavaScript Reference Site (JS Ref Site)
 *
 * Started March, 2011
 *
 * By Stanley R. Silver and Peter de Croos
 *******************************************************************************/

/*******************************************************************************
 * Root
 *******************************************************************************/
var JsrRoot = PRoot.create({
    printString: function() {
        var ws = WriteStream.create();
        this.printOn(ws);
        return ws.contents();
    }
});
var JsrConstant = JsrRoot.create({
    _assignedColor: 'cyan'
});
var JsrApp = JsrRoot.create({
    ready: function() {
        alert(1);
        $('.tar').tabby();
        JsrButtonManager.bindButtons();
        JsrTarText.bindKeyEvents();
    }
});
var JsrButtonManager = JsrRoot.create({
    button: function(nId, sText, fClick) {
        var $button = $('#btn' + nId);
        $button.text(sText).click(fClick);
        $button.css('background-color', JsrConstant._assignedColor);
        return this;
    },
    bindButtons: function() {
        var id = 1;
        this.button(id++, 'Eval', function(e) {
            JsrEval.evaluateLines();
        });
        return this;
    }
});
/*******************************************************************************
 * Eval
 *******************************************************************************/
var JsrEval = JsrRoot.create({
    shouldTest: true,
    //====
    // API
    //====
    evaluateLines: function () {
        var text = JsrTarText.getText();
        var result = this._evaluateLines(text);
        JsrTarText.setText(result);
        return this;
    },
    breakString: function () {
        return this.replaceCr('\\n');
    },
    breakStringPlus: function () {
        return this.replaceCr("\\n' +\n'");
    },
    mainLines: function () {
        var lines = JsrTarText.getText();
        var result = this._mainLines(lines);
        JsrTarText.setText(result);
        return this;
    },
    //===============
    // Evaluate Lines
    //===============
    spaceString: function (i) {
        var result = '';
        while (result.length < i) {
            result += ' ';
        }
        return result;
    },
    upToResult: function(sLine) {
        var index = sLine.search(/\/\/=>/);
        return (index > -1) ? sLine.slice(0, index) : sLine;
    },
    _evaluateLines: function (sLines) {
        var _this = this, max = 0, code = '', display = '';
        var lines = sLines.split('\n').map(function(each) {
            return _this.upToResult(each).trimRight();
        });
        lines = lines.filter(function(each) {
            return each.length > 0;
        });
        lines.forEach(function(each) {
            max = Math.max(max, each.length);
        });
        lines.forEach(function(each, i) {
            var pad = max + 2 - each.length;
            code += each + '\n';
            if (i > 0) {
                display += '\n';
            }
            display += each;
            try {
                var result = eval(code);
                if (result !== undefined) {
                    display += _this.spaceString(pad) + '//=> ' + result;
                }
            } catch (e) {
            }
        });
        return display;
    },
    //===========================
    // Multiline String
    //===========================
    replaceCr: function (sReplacement) {
        DfInput.getSetText(function(sInput) {
            var result = sInput.replace(/\n/g, sReplacement);
            result = "'" + result + "'";
            return result;
        });
        return this;
    },
    //===========================
    // Main Lines
    //===========================
    whitePrefixLength: function(s) {
        var match = s.match(/^(\s*)/);
        if (match === null) {
            return 0
        }
        return match[1].length;
    },
    minWhitePrefixLength: function(s) {
        var lines = s.split('\n');
        var min = 9999;
        var _this = this;
        $.each(lines, function(i, each) {
            var length = _this.whitePrefixLength(each);
            if (length < min) {
                min = length;
            }
        });
        return min;
    },
    _mainLines: function (sLines) {
        var length = _this.minWhitePrefixLength(sLines);
        var lines = sLines.split('\n');
        var trimmed = $.map(lines, function(each) {
            return each.slice(length);
        });
        var notSpace = /^\S/;
        var main = $.grep(trimmed, function(each) {
            return notSpace.test(each);
        });
        var result = main.join('\n');
        return result;
    }

});
/*******************************************************************************
 * Textareas
 *******************************************************************************/
var JsrTextArea = JsrRoot.create({
    shouldTest: true,
    _id: null,
    id: F.getSet('_id'),
    //=======================
    // to and from textarea
    //=======================
    getText: function() {
        return $(this.id()).val();
    },
    setText: function(s) {
        $(this.id()).val(s);
        return this;
    },
    setLines: function(as) {
        var text = '';
        as.forEach(function(each, i) {
            if (i > 0) {
                text += '\n';
            }
            text += each;
        })
        this.setText(text);
    },
    insertText: function(s) {
        var text = this.getText();
        var newText;
        var $this = $(this.id());
        var startSelection = $this.attr('selectionStart');
        var endSelection = $this.attr('selectionEnd');

        if (startSelection || startSelection === 0) {
            var before = text.substring(0, startSelection);
            var after = text.substring(endSelection, text.length);
            newText = before + s + after;
            this.setText(newText);
            this.selectText(startSelection, startSelection + s.length);
        } else {
            this.setText(text + s);
            this.selectText(text.length, text.length + s.length);
        }
    },
    selection: function() {
        return {
            start: $(this.id()).attr('selectionStart'),
            end: $(this.id()).attr('selectionEnd')
        };
    },
    selectText: function(iFrom, iTo) {
        iTo = iTo || iFrom;
        $(this.id()).attr('selectionStart', iFrom);
        $(this.id()).attr('selectionEnd', iTo);
    },
    setValue: function(v) {
        var visitor = PrintVisitor.create();
        var string = visitor.visit(v);
        return this.setText(string);
    },
    setValueInspect: function(v, iMaxCount) {
        var visitor = PrintVisitor.create({
            _maxCount: iMaxCount,
            _revisit: true,
            _indexAll: true
        });
        var string = visitor.visit(v);
        return this.setText(string);
    },
    clear: function() {
        return this.setText('');
    },
    //=======================
    // print
    //=======================
    printText: function() {
        this.openText(this.getText());
    },
    openText: function(sText) {
        var html = '<textarea rows=50 cols=80>' + sText + '</textarea>';
        this.openHtml(html);
    },
    openHtml: function(sHtml) {
        var printWindow = window.open("", "printpop", "location=0,status=0,scrollbars=0,width=700,height=750");
        $(printWindow.document.body).html(sHtml);
        return this;
    },
    //=======================
    // insert
    //=======================
    insertDate: function() {
        this.selectText(0);
        var date = BrwUtility.dateStringHuman();
        var ws = WriteStream.create();
        ws.line(date.length).cr().s(date).cr().line(date.length).cr();
        var dateLines = ws.contents();
        this.insertText(dateLines);
        this.selectText(dateLines.length);
    },
    insertComment: function(sComment) {
        sComment = sComment || 'xxx';
        var selectionStart = this.selection().start;
        var ws = WriteStream.create();
        ws.line(78).cr().s(sComment).cr().line(78).cr();
        var commentLines = ws.contents();
        this.insertText(commentLines);
        var start = selectionStart + 79;
        var end = start + sComment.length;
        this.selectText(start, end);
    },
    //=======================
    // bind key events
    //=======================
    bindKeyEvents: function() {
        var _this = this;
        $(this.id()).keypress(function(e) {
            _this.isDirty();
            //metaKey, ctrlKey, shiftKey, altKey
            if (e.metaKey) {
                var charCode = e.keyCode || e.charCode;
                var letter = String.fromCharCode(charCode);
                if (letter === 's') {
                    _this.save();
                    return false;
                }
                //if (letter === 'r') {
                //    _this.read();
                //    return false;
                //}
                if (letter === 'd') {
                    _this.insertDate();
                    return false;
                }
                if (letter === 'C') {
                    _this.insertComment();
                    return false;
                }
                if (letter === 'e') {
                    _this.addPaths();
                    return false;
                }
            }
            return true;
        });
    }
});
JsrTarText = JsrTextArea.create({
    _id: '#tarText'
})

