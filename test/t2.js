var fs = require('fs');
var getContent = function (filename, callback) {
	fs.readFile(filename, 'utf8', callback);
};
var buildTree = require('../libs/buildTree.js');

getContent('./2.html', function (err, str) {
	if (err) {
		throw err;
	}

	var ret = buildTree(str);
	console.log(ret[0].children[0].children);

});