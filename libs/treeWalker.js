(function (factory) {
	if (typeof module === 'object' && module.exports)
		module.exports = factory();
	else if (typeof define === 'function' && define.amd)
		define(function () { return factory(); });
	else
		throw new Error('no define or module');
})(function () {
	var treeWalker = function (tree, callback, y, x) {
		y = y || 0;
		x = x || 0;

		callback(tree, y++, x);

		var children = tree.children,
			i = -1,
			len = (!children && 0) || children.length,
			node;

		while (++i < len) {
			node = children[i];

			if (node.children) {
				treeWalker(node, callback, y, i);
			}
			else {
				callback(node, y, i);
			}
		}
	};

	return treeWalker;
});