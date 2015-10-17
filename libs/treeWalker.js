(function (factory) {
	if (typeof module === 'object' && module.exports)
		module.exports = factory();
	else if (typeof define === 'function' && define.amd)
		define(function () { return factory(); });
	else
		throw new Error('no define or module');
})(function () {
	var isObject = function (obj) {
		return obj != null && typeof obj === 'object';
	};

	var treeWalker = function (tree, callback, prop, y, x) {
		prop = prop || 'children';
		y = y || 0;
		x = x || 0;

		callback(tree, y++, x);

		var children = tree[prop]
			, i = -1
			, len = !isObject(children) ? 0 : +children.length
			, node = null
			, ret = null;

		while (++i < len) {
			node = children[i];

			ret = node && node[prop] != null
				? treeWalker(node, callback, prop, y, i)
				: callback(node, y, i);

			if (ret === false) break;
			else if (ret === true) continue;
		}
	};

	return treeWalker;
});

/*
	var obj = {
		x : [
			{	x : [1, 2, 3, 4, 5, 6, 7] },
			{	x : [8, 9] },
			{
				x : [
					{	x : [10, 11, 12] },
				]
			}
		]
	};

	treeWalker(obj, function (one, y, x) {
		console.log(one, y, x);
	}, 'x', 0, 0);
*/