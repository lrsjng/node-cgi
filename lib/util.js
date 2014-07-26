/*jshint node: true */
'use strict';


var util = module.exports = require('util');


util.startsWith = function (sequence, head) {

	sequence = '' + sequence;
	return sequence.slice(0, head.length) === head;
};

util.endsWith = function (sequence, tail) {

	sequence = '' + sequence;
	return sequence.slice(-tail.length) === tail;
};

util.trim = function (sequence) {

	sequence = '' + sequence;
	return sequence.replace(/^\s*|\s*$/g, '');
};
