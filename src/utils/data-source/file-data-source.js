FileDataSource.prototype.fetch = DataSource.prototype.fetch;
FileDataSource.prototype.on = DataSource.prototype.on;
FileDataSource.prototype.trigger = DataSource.prototype.trigger;

function FileDataSource(args) {
    DataSource.prototype.constructor.call(this);

    this.file;
    this.maxSize = 500 * 1024 * 1024;
    this.type = 'text';

    //set instantiation args, must be last
    for (var prop in args) {
        if (hasOwnProperty.call(args, prop)) {
            if (args[prop] != null) {
                this[prop] = args[prop];
            }
        }
    }
};

FileDataSource.prototype.error = function () {
    alert("File is too big. Max file size is " + this.maxSize + " bytes");
};

FileDataSource.prototype.fetch = function (async) {
    var _this = this;
    if (this.file.size <= this.maxSize) {
        if (async) {
            var reader = new FileReader();
            reader.onload = function (evt) {
                _this.trigger('success', evt.target.result);
            };
            return this.readAs(this.type, reader);
        } else {
            // FileReaderSync web workers only
            var reader = new FileReaderSync();
            return this.readAs(this.type, reader);
        }
    } else {
        _this.error();
        _this.trigger('error', {sender: this});
    }
};


FileDataSource.prototype.readAs = function (type, reader) {
    switch (type) {
        case 'binary':
            return reader.readAsBinaryString(this.file);
            break;
        case 'text':
        default:
            return reader.readAsText(this.file, "UTF-8");
    }
};
