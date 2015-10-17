
var Promise = require('../index.js'),
	factory = Promise.factory,
	promise = Promise.getPromise,
	assert = require('assert');

factory('b').then(function (v) {
	console.log(v);
	return new Promise(function (s) {
		setTimeout(function () {
			s('==================');
		}, 10000);
	});
})
.then(function (v) {
	console.log(v, '[[]]');
});

factory('b').resolve(1);

// console.log(Promise.isPromise(factory('a')));
// console.log(typeof factory('a'));
// console.log(typeof factory('a') === 'object' && typeof factory('a').then === 'function');
// console.log(Promise.isPromise(factory('a')));