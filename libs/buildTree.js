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
	var singleTags = 'link br hr meta input img base'.split(' ');
	var isSingle = function (tag, tagName) {
		return tag[tag.length - 2] === '/' ||
			( (tagName ||
				(tagName = (rtagName.exec(tag) || [])[2]) ) &&
				singleTags.indexOf(tagName) >= 0 );
	};
	var rattr = / +([\w-]+)(?:=\"([^\"]+)\"|=\'([^\']+)\'|)?/g;
	var makeAttributes = function (str) {
		var one;
		var node = {};
		while ((one = rattr.exec(str))) {
			node[one[1]] = one[2] || true;
		}
		return node;
	};
	var isTag = function (tag) {
		return rtag.test(tag);
	};
	var matchTag = function (tag) {
		return isTag(tag) && tag.match(rtagName);
	};
	var isTagEnd = function (tag) {
		return (matchTag(tag) || [])[1];
	};

	function buildTree(str) {
		var stack = htmlToArray(str);
		var tracker = [];
		var parentIndex = false;
		var map = {};

		//the tree
		var tree = stack.reduce(function (memo, tag, index) {
			if (!rtag.test(tag)) return memo;

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
				parentIndex : parentIndex,
				tagString : tag
			};

			var single = isSingle(tag, tagName);
			if (single) {
				node.single = true;
				node.istackStart = node.istackEnd;
				node.attributes = makeAttributes(tag);
				node.children = null;
				memo.push(node);
				return memo;
			}

			var isEnd = !!match[1];
			tracker.push({
				tagName : tagName,
				index : index,
				parentIndex : parentIndex,
				attributes : !isEnd && makeAttributes(tag),
				tagString : tag
			});
			if (!isEnd) {
				parentIndex = index;
				return memo;
			}

			var endTag = tracker.pop();
			var startTag = tracker.pop();
			if (endTag.tagName !== startTag.tagName) {
				throw new Error(endTag.tagName + ' !== ' + startTag.tagName);
			}

			node.attributes = startTag.attributes;
			node.istackStart = startTag.index;
			node.textContent = stack.slice(node.istackStart + 1, node.istackEnd).join('');
			node.parentIndex = node.istackStart === 0 ? false : startTag.parentIndex || 0;
			node.tagString = startTag.tagString + '{{ninja}}' + node.tagString;

			map[node.istackStart] = node;
			parentIndex = startTag.parentIndex;

			memo.push(node);
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

		tree.stack = stack;
		tree.indexMap = map;
		tree.renderStack = stack.slice();
		tree.header = ((stack.helper.docDef || '') +
			(stack.helper.otherXmlDef || ['']).join('')).trim();
		tree.isSingle = isSingle;
		tree.isTag = isTag;
		tree.matchTag = matchTag;
		tree.isTagEnd = isTagEnd;
		tree.makeAttributes = makeAttributes;

		return tree;
	}

	return buildTree;
});