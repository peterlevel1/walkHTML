
var Promise = require('../index.js'),
	factory = Promise.factory,
	promise = Promise.getPromise,
	assert = require('assert');

factory({
	x : 1,
	name : 'a'
});

factory({
	x : 2,
	name : 'b'
});

promise('a').then(function (v) {
	console.log(v, 'xxxxx');
	return 10;
});

promise('b').then(function (v) {
	console.log(v, 'yyyyy');
	return 10;
});

Promise.resolveAll(['a', 1], ['b', 2]);

Promise.resetAll(['a', { p : 911 }], ['b']);

promise('a').then(function (v, opt) {
	console.log(v, opt);
	return 10;
});

promise('b').then(function (v) {
	console.log(v, 'yyyyy');
	return new Promise(function (s) {
		setTimeout(function () {
			s('==================');
		}, 100);
	});
})
.then(function (v) {
	console.log(v, '[[]]');
});

Promise.resolveAll(['a', 1000], ['b', 2000]);

// console.log(Promise.promises);

var c = new Promise({
	name : 'a'
});

console.log(c.getOptions());
c.setOptions({
	name : 'c'
});
console.log(c.getOptions());
// assert(1 == 2, '1 == 2');

// console.log(assert);console.log(Promise.promises);