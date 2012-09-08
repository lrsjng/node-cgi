/*jshint node: true */
'use strict';

var _ = require('underscore'),

	CRLF = '\r\n',

	defaultHeaders = {
		'Content-Type': 'text/html'
	},

	toStringDefaults = {
		headers: true,
		content: true,
		errors: false
	};


var HttpResponse = module.exports = function () {

	this._headers = _.extend({}, defaultHeaders);
	this._content = '';
	this._errors = [];
};


_.extend(HttpResponse, {

	plain: function (sequence) {

		var httpResponse = new HttpResponse();
		httpResponse.header('Content-Type', 'text/plain');
		httpResponse.write(sequence);
		return httpResponse;
	},

	json: function (arg) {

		var httpResponse = new HttpResponse();
		httpResponse.header('Content-Type', 'application/json');
		httpResponse.write(JSON.stringify(arg));
		return httpResponse;
	}
});


_.extend(HttpResponse.prototype, {

	header: function (key, value) {

		if (value !== undefined) {
			this._headers[key] = value;
		}
		return this._headers[key];
	},

	write: function (sequence) {

		this._content += sequence !== undefined ? sequence : '';
	},

	writeLine: function (sequence) {

		this.write(sequence);
		this._content += CRLF;
	},

	error: function (arg) {

		this._errors.push(arg);
	},

	toString: function (options) {

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
	},

	toStdout: function (options) {

		process.stdout.write(this.toString(options));
	}
});
