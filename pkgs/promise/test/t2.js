
var Promise = require('../index.js'),
	factory = Promise.factory,
	promise = Promise.getPromise,
	assert = require('assert');

factory({
	x : 1,
	name : 'a'
})
.progress(function (v) {
	console.log(v);
	if (v == 100) {
		factory('a').resolve(v);
	}
})
.then(function (v) {
	console.log(v);
});

var i = 0;
(function run () {
	if (i++ < 100) {
		factory('a').notify(i);
		setTimeout(run, 10);
	}
})();