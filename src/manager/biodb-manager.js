var BiodbManager = {
    // host: (typeof window.BioDB_HOST === 'undefined') ? 'http://localhost:5555' : window.BioDB_HOST,
    // version: (typeof window.BioDB_VERSION === 'undefined') ? 'v1' : window.BioDB_VERSION,
    host: 'http://test.babelomics.org/biodb/rest',
    version: 'v1',

    go: {
        info: function (args) {
            return BiodbManager._doRequest(args, 'go', 'info');
        },
        fetch: function (args) {
            return BiodbManager._doRequest(args, 'go', 'fetch');
        },
        genes: function (args) {
            return BiodbManager._doRequest(args, 'go', 'genes');
        }

    },
    hpo: {
        info: function (args) {
            return BiodbManager._doRequest(args, 'hpo', 'info');
        },
        fetch: function (args) {
            return BiodbManager._doRequest(args, 'hpo', 'fetch');
        },

    },
    clinical: {
      fetch: function(args){
        return BiodbManager._doRequest(args, 'clinical', 'fetch');
      }
    },
    tissue: {
      fetch: function(args){
        return BiodbManager._doRequest(args, 'tissue', 'fetch');
      }
    },
    _url: function (args, api, action) {
        var host = BiodbManager.host;
        if (typeof args.request.host !== 'undefined' && args.request.host != null) {
            host = args.request.host;
        }
        var version = BiodbManager.version;
        if (typeof args.request.version !== 'undefined' && args.request.version != null) {
            version = args.request.version;
        }
        var id = '';
        if (typeof args.id !== 'undefined' && args.id != null) {
            id = '/' + args.id;
        }

        // var url = host + '/' + version + '/' + api + id + '/' + action;
        var url = host + '/' + api + id + '/' + action;
        url = this._addQueryParamtersToUrl(args.query, url);
        return url;
    },

    _doRequest: function (args, api, action) {
        var url = BiodbManager._url(args, api, action);
        if (args.request.url === true) {
            return url;
        } else {
            var method = 'GET';
            if (typeof args.request.method !== 'undefined' && args.request.method != null) {
                method = args.request.method;
            }
            var async = true;
            if (typeof args.request.async !== 'undefined' && args.request.async != null) {
                async = args.request.async;
            }
            var request = new XMLHttpRequest();
            request.onload = function () {
                var contentType = this.getResponseHeader('Content-Type');
                if (contentType.indexOf('application/json') != -1) {
                    var json = JSON.parse(this.response);
                    if (json.error == null || json.error.msg == "") {
                        args.request.success(json, this);
                    } else {
                        // if (window.BIODB_LOG === true) {
                        console.log('! ----    BioDB -------');
                        console.log(json.error);
                        console.log(json);
                        console.log('! ----    BioDB -------');
                        // }
                        args.request.error(json, this);
                    }
                } else {
                    args.request.success(this.response, this);
                }
            };
            request.onerror = function (e) {
                args.request.error({
                    error: 'Request error.',
                    errorEvent: e
                }, this);
            };
            request.open(method, url, async);
            if (args.request.headers != null) {
                for (var header in args.request.headers) {
                    request.setRequestHeader(header, args.request.headers[header]);
                }
            }

            var body = null;
            if (args.request.body != null) {
                body = args.request.body;
            }
            if (args.request.responseType != null) {
                request.responseType = args.request.responseType;
            }
            request.send(body);
            return url;
        }
    },

    _addQueryParamtersToUrl: function (paramsWS, url) {
        var chr = "?";
        if (url.indexOf("?") != -1) {
            chr = "&";
        }
        var query = this._queryString(paramsWS);
        if (query != "")
            query = chr + query;
        return url + query;
    },
    _queryString: function (obj) {
        var items = [];
        for (var key in obj) {
            if (obj[key] != null && obj[key] != undefined) {
                items.push(key + '=' + obj[key]);
            }
        }
        return items.join('&');
    },
};
