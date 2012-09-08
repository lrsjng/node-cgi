/*jshint node: true */
'use strict';

var _ = require('underscore'),
	jade = require('jade'),

	util = require('./util'),

	writeFnName = 'write',
	blocksId = '__blocks';


var Preprocessor = module.exports = {

	js: function (virtEnv) {

		var blocks = [];
		var blockIdx = -1;

		virtEnv.code = virtEnv.source.replace(/\/\*=([\s\S]*?)\*\//g, function (match, content) {

			blockIdx += 1;
			blocks[blockIdx] = content;
			return ';' + writeFnName + '(' + blocksId + '[' + blockIdx + ']);';
		});
		virtEnv.global[blocksId] = blocks;

		return virtEnv;
	},

	jade: function (virtEnv) {

		virtEnv.source = jade.compile(virtEnv.source)({});

		return Preprocessor.html(virtEnv);
	},

	html: function (virtEnv) {

		var startMark = '<?',
			endMark = '?>',
			startIdx = 0,
			endIdx = 0,
			typeRe = /^(\S*)\s/,
			typeMatch = null,
			defaultType = 'js',
			parts = [],
			part;

		var html = virtEnv.source;
		while (true) {
			startIdx = html.indexOf(startMark, endIdx);

			if (startIdx < 0) {
				break;
			}

			parts.push({
				content: html.slice(endIdx, startIdx)
			});

			endIdx = html.indexOf(endMark, startIdx);
			if (endIdx < 0) {
				endIdx = html.length;
			}

			var content = html.slice(startIdx + startMark.length, endIdx);
			endIdx += endMark.length;
			typeMatch = content.match(typeRe);
			if (typeMatch) {
				var type = typeMatch[1] || '';

				parts.push({
					type: type || defaultType,
					content: content.slice(type.length)
				});
			} else {
				parts.push({
					content: startMark + content + endMark
				});
			}
		}
		parts.push({
			content: html.slice(endIdx)
		});

		var blocks = [];
		var blockIdx = -1;
		var code = _.map(parts, function (part) {

				if (part.type === 'js') {
					return util.trim(part.content) + ';';
				} else if (part.type === '=') {
					return writeFnName + '(' + util.trim(part.content) + ');';
				} else {
					blockIdx += 1;
					blocks[blockIdx] = part.content;
					return writeFnName + '(' + blocksId + '[' + blockIdx + ']);';
				}
			}).join('');

		virtEnv.code = code;
		virtEnv.global[blocksId] = blocks;

		return virtEnv;
	}
};
