(function (root) {
	var rtag = /<[^>]+>/g,
		rdata = /\{\{(!|%|)?([^\}]+)\}\}/g,
		rloop = /\{\{ ?loop\:([^ }]+) ?(?:([^ }]+) ?([^ }]+)?|) ?\}\}/,
		rloop_g = / *?\{\{ ?loop\:[^}]+\}\} *?/g,
		rgetData = /[$\w-]+/g,
		rtagName = /[a-zA-Z]+/,
		singles = 'br link hr img meta base input'.split(' ');

	var isObject = function (obj) {
		return obj != null && typeof obj === 'object';
	};

	var isSingle = function (tag, tagName) {
		return tag[tag.length - 2] === '/' || ~singles.indexOf(tagName);
	};

	var escape = function (str) {
	  return (str + '')
	    .replace(/&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	    .replace(/"/g, '&quot;')
	    .replace(/'/g, '&#x27;')
	    .replace(/\//g,'&#x2F;');
	};

	var notEscape = function (str) {
	  return (str + '')
	    .replace(/&amp;/g, '&')
	    .replace(/&lt;/g, '<')
	    .replace(/&gt;/g, '>')
	    .replace(/&quot;/g, '"')
	    .replace(/&#x27;/g, "'")
	    .replace(/&#x2F;/g,'/');
	};

	function getData(str, data, noStack) {
		var match = Array.isArray(str)
			? str
			: typeof str === 'string'
			? (str = str.trim()) && str.match(rgetData)
			: void 0;

		if (!match || !match.length)
			return void 0;

		var $len = !noStack && data.$stack && data.$stack.length, $data, $one, len = match.length, one;

		for (var i = 0; i < len; i++) {
			one = match[i];

			if (!isObject(data))
				break;

			if (!$len || i > 0)
				data = data[one];
			else {
				if (one[0] !== '$') {
					data = data[one];
					continue;
				}

				while ($len--) {
					$data = data.$stack[$len];

					if (one === '$value' || ($data.$value != null && one === $data.$value)) {
						$one = $data.value;
						break;
					}
					else if (one === '$index' || ($data.$index != null && one === $data.$index)) {
						return typeof $data.index === 'number'
							? $data.index
							: void 0;
					}
				}

				data = $one != null ? $one : data[one];
			}
		}

		return i === len ? data : void 0;
	}

	function getTagEndIndex(tags, i) {
		var target = tags[i].match(rtagName)[0];

		if (isSingle(tags[i], target))
			return i;

		var tag, tagName, startTagName, endTagName, stack = [target];
		i++;

		for (var l = tags.length; i < l; i++) {
			tag = tags[i];
			tagName = tag.match(rtagName)[0];

			if (isSingle(tag, tagName))
				continue;

			stack.push(tagName);

			if (tag[1] === '/') {
				startTagName = stack.pop();
				endTagName = stack.pop();

				if (startTagName !== endTagName)
					throw new Error(startTagName + ' !== ' + endTagName);

				if (!stack.length) {
					if (target !== endTagName) {
						var info = 'target: '
							+ target
							+ ' !== '
							+ 'endTagName: '
							+ endTagName;
						throw new Error(info);
					}
					break;
				}
			}
		}

		if (stack.length)
			throw new Error('target is not two closed: ' + target);

		return i;
	}

	function compileLoop(i, end, match, tags, texts) {
		var $value = match[2], $index = match[3], _tags = tags.slice(i, end + 1), _texts = texts.slice(i, end),
			item = {value : null, index : null, $value : $value, $index : $index };

		return function (data) {
			var __$stack = data.$stack;
			data.$stack = data.$stack || [];

			var tag0 = _tags[0];
			_tags[0] = _tags[0].replace(rloop_g, '');

			var loopData = getData(match[1], data, true);
			var ret = '';

			for (var j = 0, len = loopData.length; j < len; j++) {
				item.value = loopData[j];
				item.index = j;
				data.$stack.push(item);

				ret += t(null, data, _tags, _texts);

				data.$stack.pop();
			}

			_tags[0] = tag0;
			data.$stack = __$stack;

			return ret;
		};
	}

	function loop(data, i, end, match, tags, texts) {
		if (!data)
			return compileLoop(i, end, match, tags, texts);

		if (!Array.isArray(data.$stack))
			throw new Error('no data.$stack');

		var loopData = getData(match[1], data, true), $value = match[2], $index = match[3], ret = '';
		tags = tags.slice(i, end + 1);
		tags[0] = tags[0].replace(rloop_g, '');
		texts = texts.slice(i, end + 1 - 1);

		for (var j = 0, len = loopData.length; j < len; j++) {
			data.$stack.push({
				value : loopData[j],
				index : j,
				$value : $value,
				$index : $index
			});

			ret += t(null, data, tags, texts);

			data.$stack.pop();
		}

		return ret;
	}

	function t(str, data, tags, texts) {
		var __$stack;
		if (data) {
			__$stack = data.$stack;
			data.$stack = data.$stack || [];
		}

		tags = tags || str.match(rtag);
		var len1 = tags.length;

		if (!texts) {
			texts = str.split(rtag);
			if (texts.length === len1 + 1) {
				texts.shift();
				texts.pop();
			}
		}

		var len2 = texts.length,
			i = -1, tag, end, ret = [], gaurd = 1000;

		while (++i < len2) {
			tag = tags[i];

			if (tag[1] !== '/' && (match = rloop.exec(tag))) {
				end = getTagEndIndex(tags, i);
				ret.push(loop(data, i, end, match, tags, texts));
				i = end;
				continue;
			}
			ret.push(tag, texts[i]);

			if (--gaurd < 0)
				break;
		}

		if (gaurd < 0)
			throw new Error('loop too many times');

		if (len2 + 1 === len1)
			ret.push(tags[len2]);

		if (!data) {
			return compileResult(ret);
		}
		else {
			ret = ret.join('').replace(rloop_g, '')
				.replace(rdata, function (all, a, match) {
					return !a
						? escape(getData(match, data))
						: a === '!'
						? getData(match, data)
						: a === '%'
						? notEscape(getData(match, data))
						: getData(match, data);
				});
			data.$stack = __$stack;
			return ret;
		}
	}

	function compileResult(ret) {
		var i = -1, len = ret.length, one, fn, str = '', compiled = [];

		while (++i < len) {
			one = ret[i];
			if (typeof one === 'function') {
				compiled.push(str, one);
				str = '';
			}
			else
				str += one;
		}

		if (str)
			compiled.push(str);

		return function (data) {
			var i = -1, ret = compiled, l = ret.length, one, result = '';

			while(++i < l) {
				one = ret[i];
				if (typeof one === 'function')
					result += one(data);
				else
					result += one;
			}

			return result;
		};
	}

	module.exports = t;

})(this);