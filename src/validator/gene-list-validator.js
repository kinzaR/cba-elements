function GeneListValidator(options) {
    if (!(this instanceof GeneListValidator)) {
        return new GeneListValidator(options);
    }
    Validator.call(this, options);

    // this._header = true;
    this._duplicates = {};
    this._sorted = true;

}

GeneListValidator.prototype = Object.create(Validator.prototype);

GeneListValidator.prototype.validateLine = function (line, isLast) {
    this.parseData(line, isLast);
}

GeneListValidator.prototype.validateEnd = function () {
    if (this.numLines < 1) {
        this.addLog("error", "The file is empty");
    }
}

GeneListValidator.prototype.parseData = function (line, isLast) {
    if (line == "") {
        if (!isLast)
            this.addLog("warning", "Empty line. isLast:"+isLast);
    } else {
        var columns = line.split("\t");

        if (columns.length < 1) {
            this.addLog("error", "Number of columns must be 1");
        }
    }
}