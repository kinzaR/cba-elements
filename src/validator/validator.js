function Validator(options) {
    if (!(this instanceof Validator)) {
        return new Validator(options);
    }

    this.file = options.file ? options.file : null;

    this.log = [];
    this.line = 0;
    this.progress = 0;
    this._readBytes = 0;
    this._events = {};
    this.numLines = 0;
    this.linesToRead = 2000;

}

Validator.prototype = {
    init: function () {
        this.file = null;
        this.log = [];
        this.line = 0;
        this.numLines = 0;
        this.progress = 0;
        this._readBytes = 0;
        this.linesToRead = 2000;
    },
    stop: function (cb) {
        if (this._navigator != null) {
            this._navigator._stop = true;
        }
    },

    validate: function () {
        var me = this;

        /*Check if file is \r or \n , \r\n */
        this._getLineBreakChar(this.file, function(lineBreak){
            var lastReadBytes = null;
            if(lineBreak && lineBreak != '\n'){
                me._navigator = new LineNavigator(me.file, {
                    newLineCode: lineBreak.charCodeAt(0),
                    splitLinesPattern: lineBreak
                });
            }else{
                me._navigator = new LineNavigator(me.file, {
                    chunkSize: 1024 * 50
                });
                console.log("Error : no break line detected!");
            }
            me._totalBytes = me.file.size;
            var indexToStartWith = 0;
            lastReadBytes = 0;

            me._navigator.readLines(indexToStartWith, me.linesToRead, function linesReadHandler(err, index, lines, eof, progress) {
                if (err) {
                    me._emit("err");
                    return;
                }
                // console.log(lines.length);
                console.log(progress);

                var isLast = false;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    isLast = (i == (lines.length - 1) && eof);

                    me.line++;
                    me.numLines++;
                    me._readBytes += line.length;
                    me.progress = (me._readBytes / me._totalBytes) * 100;
                    me.validateLine(line, isLast);
                    if(me.validateStop()){
                        me._emit("stop");
                        return;
                    }
                }
                me._emit("progress", me.progress);

                if (eof) {
                    me._emit("progress", 100);
                    me._emit("end");
                    me._validateEnd();
                    return;
                }

                // if (lastReadBytes == me._readBytes) {
                //     me._emit("progress", 100);
                //     me._emit("end");
                //     me._validateEnd();
                //     return;
                // }

                lastReadBytes = me._readBytes;

                if (me._navigator._stop != true) {
                    me._navigator.readLines(index + lines.length, me.linesToRead, linesReadHandler);
                } else {
                    me._emit("stop");
                    console.log("STOP!!!!!");
                }
            });
        });
        /*this._detectCRSeparator(this.file, function (res) {
            var lastReadBytes = null;

            if (res) {
                me._navigator = new LineNavigator(me.file, undefined, {
                    newLineCode: '\r'.charCodeAt(0),
                    splitPattern: /\r/
                });
            } else {
                me._navigator = new LineNavigator(me.file, {
                    chunkSize: 1024 * 50
                });
            }
            me._totalBytes = me.file.size;
            var indexToStartWith = 0;

            lastReadBytes = 0;

            me._navigator.readLines(indexToStartWith, me.linesToRead, function linesReadHandler(err, index, lines, eof, progress) {
                if (err) {
                    me._emit("err");
                    return;
                }
                // console.log(lines.length);
                console.log(progress);

                var isLast = false;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    isLast = (i == (lines.length - 1) && eof);

                    me.line++;
                    me.numLines++;
                    me._readBytes += line.length;
                    me.progress = (me._readBytes / me._totalBytes) * 100;
                    me.validateLine(line, isLast);
                    if(me.validateStop()){
                        me._emit("stop");
                        return;
                    }
                }
                me._emit("progress", me.progress);

                if (eof) {
                    me._emit("progress", 100);
                    me._emit("end");
                    me._validateEnd();
                    return;
                }

                // if (lastReadBytes == me._readBytes) {
                //     me._emit("progress", 100);
                //     me._emit("end");
                //     me._validateEnd();
                //     return;
                // }

                lastReadBytes = me._readBytes;

                if (me._navigator._stop != true) {
                    me._navigator.readLines(index + lines.length, me.linesToRead, linesReadHandler);
                } else {
                    me._emit("stop");
                    console.log("STOP!!!!!");
                }
            });

        });*/
        // });
    },
    validateLine: function (line) {
        return true;
    },
    _validateEnd: function () {
        this.validateEnd();
    },
    validateEnd: function () {
        return true;
    },
    addLog: function (type, msg, column,link) {
        var log = {
            type: type,
            msg: msg,
            line: this.line,
            column: column,
            link: link
        };
        this.log.push(log);
        this._emit("log", log);
    },
    on: function (eventName, cb) {
        this._events[eventName] = cb;
    },
    _emit: function (event) {
        if (typeof this._events[event] === 'function') {
            this._events[event].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    },
    _detectCRSeparator: function (file, cb) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var regex = /\r(?!\n)/;
            if (regex.test(e.target.result)) {
                cb(true);
            } else {
                cb(false);
            }
        }
        reader.readAsText(file);
    },
    _getLineBreakChar: function (file, cb) {
        var reader = new FileReader();
        reader.onload =function(e){
            var string= e.target.result;
            const indexOfLF = string.indexOf('\n', 1);  // No need to check first-character
            if (indexOfLF >0 & string[indexOfLF - 1] === '\r') cb('\r\n');
            else if (indexOfLF === -1) {
                if (string.indexOf('\r') !== -1) cb('\r');
            }
            else cb('\n');
        }
        reader.readAsText(file);
    }
}
