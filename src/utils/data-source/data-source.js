function DataSource() {
    this.boundEvents = {};
};

DataSource.prototype.on = function (eventName, cb) {
    this.boundEvents[eventName] = cb;
};

DataSource.prototype.trigger = function (event) {
    if (typeof this.boundEvents[event] === 'function') {
        this.boundEvents[event].apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

DataSource.prototype.fetch = function () {};
