StringDataSource.prototype.fetch = DataSource.prototype.fetch;
StringDataSource.prototype.on = DataSource.prototype.on;
StringDataSource.prototype.trigger = DataSource.prototype.trigger;

function StringDataSource(str) {
    DataSource.prototype.constructor.call(this);

    this.str = str;
};

StringDataSource.prototype.fetch = function (async) {
    if (async) {
        this.trigger('success', this.str);
    } else {
        return this.str;
    }
};
