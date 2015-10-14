var fs = require('fs');
var getContent = function (filename, callback) {
	fs.readFile(filename, 'utf8', callback);
};
var buildTree = require('../libs/buildTree.js');
var treeWalker = require('../libs/treeWalker.js');

getContent('./xml-1.xml', function (err, str) {
	if (err) {
		throw err;
	}

	str = str.replace(/\'/g, '"');
	var tree = buildTree(str);
	console.log(tree.indexMap[0]);
	// console.log(tree);
	// treeWalker(tree[0], function (node, depth, index) {
	// 	console.log(node.tagName, depth, index);
	// });

});