(function (root, factory) {
	if (typeof module === 'object' && module.exports)
		module.exports = factory(require('./htmlToArray.js'));
	else if (typeof define === 'function' && define.amd)
		define(['./htmlToArray'], function (f) { return factory(f); });
	else
		throw new Error('no define or module');
})(this, function (htmlToArray) {
	var rtag = /<[^>]+>/;
	var rtagName = /(\/)?([\w]+)/;
	var singleTags = 'link br hr meta input img'.split(' ');
	var isSingle = function (tag, tagName) {
		return tag[tag.length - 2] === '/' ||
			( (tagName ||
				(tagName = (rtagName.exec(tag) || [])[2]) ) &&
				singleTags.indexOf(tagName) >= 0 );
	};
	var rattr = / +([\w-]+)(?:=\"([^\"]+)\"|)?/g;
	var makeAttributes = function (str) {
		var one;
		var node = {};
		while ((one = rattr.exec(str))) {
			node[one[1]] = one[2] || true;
		}
		return node;
	};

	function buildTree(str) {
		var stack = htmlToArray(str);
		var tracker = [];
		var parentIndex = null;
		var map = {};

		//the tree
		var tree = stack.map(function (tag, index) {
			if (!rtag.test(tag)) return false;

			var match = tag.match(rtagName) || [];

			var tagName = match[2];
			if (!tagName) throw new Error('miss match tag: ' + tag);

			var node = {
				istackStart : null,
				istackEnd : index,
				tagName : tagName,
				textContent : '',
				attributes : null,
				single : false,
				nodeType : 1,
				parentNode : null,
				children : [],
				parentIndex : index > 0 && parentIndex
			};

			var single = isSingle(tag, tagName);
			if (single) {
				node.single = true;
				node.istackStart = node.istackEnd;
				node.attributes = makeAttributes(tag);
				node.children = null;
				return node;
			}

			var isEnd = !!match[1];
			tracker.push({
				tagName : tagName,
				index : index,
				parentIndex : node.parentIndex,
				attributes : !isEnd && makeAttributes(tag)
			});
			if (!isEnd) {
				parentIndex = index;
				return false;
			}

			var endTag = tracker.pop();
			var startTag = tracker.pop();
			if (endTag.tagName !== startTag.tagName) {
				throw new Error(endTag.tagName + ' !== ' + startTag.tagName);
			}

			node.attributes = startTag.attributes;
			node.istackStart = startTag.index;
			node.textContent = stack.slice(node.istackStart + 1, node.istackEnd).join('');
			node.parentIndex = startTag.parentIndex;

			map[node.istackStart] = node;
			parentIndex = startTag.parentIndex;

			return node;
		})
		.reduce(function (memo, val, index) {
			if (val) {
				memo.push(val);
			}
			return memo;
		}, [])
		.sort(function (a, b) {
			return a.istackStart - b.istackStart;
		})
		.map(function (node, index) {
			if (index > 0) {
				node.parentNode = map[node.parentIndex];
				map[node.parentIndex].children.push(node);
			}
			return node;
		});

		tree.docDef = stack.docDef;

		return tree;
	}

	return buildTree;
});