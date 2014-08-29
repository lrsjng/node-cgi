/*jshint node: true */
'use strict';


var _ = require('lodash');
var CRLF = '\r\n';
var defaultHeaders = {
        'Content-Type': 'text/html'
    };
var toStringDefaults = {
        headers: true,
        content: true,
        errors: false
    };


function HttpResponse() {

    this._headers = _.extend({}, defaultHeaders);
    this._content = '';
    this._errors = [];
}
module.exports = HttpResponse;


HttpResponse.plain = function (sequence) {

    var httpResponse = new HttpResponse();
    httpResponse.header('Content-Type', 'text/plain');
    httpResponse.write(sequence);
    return httpResponse;
};

HttpResponse.json = function (arg) {

    var httpResponse = new HttpResponse();
    httpResponse.header('Content-Type', 'application/json');
    httpResponse.write(JSON.stringify(arg));
    return httpResponse;
};

HttpResponse.prototype.header = function (key, value) {

    if (value !== undefined) {
        this._headers[key] = value;
    }
    return this._headers[key];
};

HttpResponse.prototype.write = function (sequence) {

    this._content += sequence !== undefined ? sequence : '';
};

HttpResponse.prototype.writeLine = function (sequence) {

    this.write(sequence);
    this._content += CRLF;
};

HttpResponse.prototype.error = function (arg) {

    this._errors.push(arg);
};

HttpResponse.prototype.toString = function (options) {

    var settings = _.extend({}, toStringDefaults, options);
    var sequence = '';

    if (settings.errors) {
        this._content += CRLF + '<!-- errors: ' + JSON.stringify(this._errors) + '-->';
    }

    if (settings.headers) {
        this._headers['Content-Length'] = this._content.length;
        _.each(this._headers, function (value, key) {

            sequence += '' + key + ': ' + value + CRLF;
        });
        sequence += CRLF;
    }

    if (settings.content) {
        sequence += this._content;
    }

    return sequence;
};

HttpResponse.prototype.toStdout = function (options) {

    process.stdout.write(this.toString(options));
};
