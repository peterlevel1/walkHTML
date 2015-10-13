(function (root) {

var rtag = /<(\/)?([a-z]+) ?([^>]*?)?(\/)?>/,
	//text node should not appear: <,
	rcontent = /(?:[^<]*)?/,
	rcomment = /<\!--(?:[\s\S]*?)?-->/g,
	rdocDef = /<\!?doctype(?:[^>]*?)?>/i,
	//in case looping too many times
	MAX = 300,
	//add singleTags here with whitespace
	singleTags = 'link br hr meta input'.split(' ');

var walkHTML = function (str, callback) {
	//no [\s\t\n]+ at head
	str = str.trim().replace(rcomment, '');

	var	docDef = (str.match(rdocDef) || [])[0],
		stack = [],
		one = void 0,
		index = 0,
		rest = void 0,
		isEnd = void 0,
		isSingle = void 0,
		depth = 0,
		tags = [],
		startTag = void 0,
		i = 0;

	if (docDef) {
		str = str.slice(docDef.length).trim();
	}
	rest = str;

	do {
		if (i === MAX) {
			return callback(new Error('loop too many times: ' + MAX));
		}

		if (!(one = rtag.exec(rest))) {
			return callback(new Error('missing match tag: ' + rest));
		}
		else {
			isEnd = !!one[1];
			isSingle = !!one[4] || (singleTags.indexOf(one[2]) >= 0);
			if (isEnd && (isSingle || one[3])) {
				return callback(new Error('wrong tag: ' + one[0]));
			}

			if (!isSingle) {
				tags.push({tagName : one[2], index : i});
			}

			if (isEnd) {
				tags.pop();
				if (!(startTag = tags.pop())
				|| startTag.tagName !== one[2]) {
					return callback(new Error(
						' wrong start tagName: ' + startTag + '\n' +
						' cur end tagName: ' + one[2] + '\n' +
					 	' depth should end: ' + (depth - 1) + '\n' +
					  ' rest str:\n ' + rest + '\n'));
				}
			}
			rest = str.slice((index += (one[0]).length));

			stack.push({
				tag : true,
				text : one[0],
				isEnd : isEnd,
				tagName : one[2],
				attributes : one[3] || '',
				isSingle : isSingle,
				depth : isEnd ? --depth : isSingle ? depth : depth++,
				index : i++,
				startIndex : isEnd && (startTag.index || 0)
			});
		}

		if (depth > 0) {
			if ( !(one = rest.match(rcontent)) ) {
				return callback(new Error('missing match text: ' + rest));
			}
			else {
				rest = str.slice((index += (one[0]).length));
				stack.push({tag : false, text : one[0], depth : depth, index : i++});
			}
		}

	} while (depth > 0);

	if (docDef) {
		stack.unshift({tag : true, docDef : true, text : docDef});
	}

	callback(null, stack);
};

	if (typeof module === 'object' && module.exports) {
		module.exports = walkHTML;
	}
	else if (typeof define === 'function' && define.amd) {
		define(function () { return walkHTML; });
	}
	else {
		root.walkHTML = walkHTML;
	}

})(this);