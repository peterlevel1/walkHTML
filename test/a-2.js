(function (root, factory) {
	if (typeof module === 'object' && module.exports)
		module.exports = factory(require('../libs/buildTree.js'), require('util'));
	else if (typeof define === 'function' && define.amd)
		define(['../libs/buildTree', 'ninja'], function (f, _) {
			return factory(f, _);
		});
	else
		throw new Error('no define or module');
})(this, function (buildTree, util) {

	var EE = require('events');
	var fs = require('fs');
	var getContent = function (filename, callback) {
		fs.readFile(filename, 'utf8', callback);
	};

	getContent('../test/3.html', function (err, str) {
		if (err) {
			throw err;
		}

		var tree = buildTree(str);

		var rtag = /<[^>]+>/;
		var isEndTag = function (tag) {
			return tag[1] === '/';
		};

	  function getCmd(index, str) {
			var node;

			if (rtag.test(str)) {
				node = tree.indexMap[index];
			}
			else {
				var prevStr = tree.renderStack[index - 1];
				node = !isEndTag(prevStr)
					? tree.indexMap[index - 1]
					: tree.indexMap[index - 3];

				while (node) {
					if (node.attributes['nt-cmd']) break;
					else {
						node = node.parentNode;
					}
				}
			}

			return !node
				? void 0
				: { node : node, cmd : node.attributes['nt-cmd'] };
		}

		// console.log(tree.renderStack);
		// var str = tree.renderStack
		var index = tree.renderStack.length - 6;
		var str = tree.renderStack[index];
		console.log(str);

		var a = getCmd(index, str);

		console.log(a);

	});
});