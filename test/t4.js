var fs = require('fs');
var getContent = function (filename, callback) {
	fs.readFile(filename, 'utf8', callback);
};
var buildTree = require('../libs/buildTree.js');
var treeWalker = require('../libs/treeWalker.js');

getContent('./2.html', function (err, str) {
	if (err) {
		throw err;
	}

	var tree = buildTree(str)[0];
	// console.log(tree);
	treeWalker(tree, function (node, depth, index) {
		console.log(node.tagName, depth, index);
	});

});