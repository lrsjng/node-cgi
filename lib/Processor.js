/*jshint node: true */
'use strict';

var fs = require('fs'),
	path = require('path'),
	vm = require('vm'),

	_ = require('underscore'),

	util = require('./util'),
	HttpResponse = require('./HttpResponse'),
	Preprocessor = require('./Preprocessor'),
	pkg = require('../package.json'),

	defaults = {
		defaultType: 'js',
		typeByExt: {
			'.jade.nd': 'jade',
			'.html.nd': 'html'
		}
	},

	runCode = function (code, sandbox) {

		var stdout = process.stdout.write,
			stderr = process.stderr.write;

		process.stdout.write = sandbox.write;
		process.stderr.write = sandbox.error;

		vm.runInNewContext(code, sandbox);

		process.stdout.write = stdout;
		process.stderr.write = stderr;
	},

	processFile = function (filename, options) {

		if (!filename) {
			return HttpResponse.json({
				name: pkg.name,
				version: pkg.version,
				err: 'file not found: "' + filename + '"'
			}).toStdout();
		}

		filename = path.resolve(filename);
		var settings = _.extend({}, defaults, options);

		var virtEnv = {
			source: fs.readFileSync(filename, 'utf8'),
			code: '',
			global: {}
		};

		var type = settings.defaultType;
		_.each(settings.typeByExt, function (t, ext) {
			if (util.endsWith(filename, ext)) {
				type = t;
			}
		});
		if (!_.isFunction(Preprocessor[type])) {
			type = 'js';
		}

		virtEnv = Preprocessor[type](virtEnv);

		var httpResponse = new HttpResponse(),
			dirname = path.dirname(filename);

		_.extend(virtEnv.global, {
			filename: filename,
			dirname: dirname,
			processFile: function (filename) {

				return processFile(path.resolve(dirname, filename));
			},
			require: function (id) {

				if (util.startsWith(id, './') || util.startsWith(id, '../')) {
					id = path.resolve(dirname, id);
				}
				return module.require(id);
			},
			env: process.env
		});

		_.each('header write writeLine error'.split(' '), function (methodName) {

			virtEnv.global[methodName] = _.bind(httpResponse[methodName], httpResponse);
		});

		runCode(virtEnv.code, virtEnv.global);

		return httpResponse;
	};


module.exports = {

	processFile: processFile
};
