(function (root) {
	var rtag = /<[^>]+>/g;
	var rdata = /\{\{(!)?([^\}]+)\}\}/g;
	var rloop = /\{\{ ?loop\:([^ }]+) ?(?:([^ }]+) ?([^ }]+)?|) ?\}\}/;
	var rloop_g = / *?\{\{ ?loop\:[^}]+\}\} *?/g;
	var rgetData = /[$\w-]+/g;
	var rtagName = /[a-zA-Z]+/;
	var singles = 'br link hr img meta base input'.split(' ');

	function isObject(obj) {
		return obj != null && typeof obj === 'object';
	}

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

		var $len = !noStack && data.$stack && data.$stack.length;
		var $data;
		var $one;

		var len = match.length;
		var one;

		for (var i = 0; i < len; i++) {
			one = match[i];

			if (!isObject(data))
				break;

			if (!$len || i > 0) {
				data = data[one];
			}
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

	function isSingle(tag, tagName) {
		return tag[tag.length - 2] === '/' || ~singles.indexOf(tagName);
	}

	function getTagEndIndex(tags, i) {
		var target = tags[i].match(rtagName)[0];
		if (isSingle(tags[i], target))
			return i;

		var tag;
		var tagName;
		var startTagName;
		var endTagName;
		var stack = [target];
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

		if (stack.length) {
			throw new Error('target is not two closed: ' + target);
		}

		return i;
	}

	function compileLoop(i, end, match, tags, texts) {
		var $value = match[2];
		var $index = match[3];
		var _tags = tags.slice(i, end + 1);
		var _texts = texts.slice(i, end);
		var item = {
			value : null,
			index : null,
			$value : $value,
			$index : $index
		};

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

		var loopData = getData(match[1], data, true);
		var $value = match[2];
		var $index = match[3];
		var ret = '';

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

			if (--gaurd < 0) break;
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
			else {
				str += one;
			}
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

	// var str2 =
	// 		'<div>'
	// 			+ '<div ---="1" {{ loop:arr $v1 $i }} >'
	// 				+ '<div ---="2" {{ loop:arr $v2 $i }} >'
	// 					+	'<div ---="3-1" {{ loop:arr2 $v3-1 }} >'
	// 						+ 'value = {{ $value.y }} -- {{ $v1.x }}'
	// 					+ '</div>'
	// 					+	'<div ---="3-2" {{ loop:arr2 $v3-2 }} >'
	// 						+ 'value = {{ $value.y }} -- {{ a.x }}'
	// 					+ '</div>'
	// 				+ '</div>'
	// 			+ '</div>'
	// 	+ '</div>';

	// var fn = t(str2);
	// // console.log(fn);

	// var data = {
	// 	a : {
	// 		x : 'ax ax ax'
	// 	},
	// 	arr : [
	// 		{ x : 'arr:x 0' },
	// 		{ x : 'arr:x 1' }
	// 	],
	// 	arr2 : [
	// 		{ y : 'arr:y 0' },
	// 		{ y : 'arr:y 1' }
	// 	]
	// };
	// var str = fn(data);
	// console.log(str);
	// var str =
	// 		'<div>'
	// 	+		'<ul>'
	// 	+			'<li {{ loop:arr }} >'
	// 	+				'{{ $value.x }} {{ a.x }}'
	// 	+			'</li>'
	// 	+		'</ul>'
	// 	+	'</div>';

	// var ret1 = t(str, {
	// 	a : {
	// 		x : 'ax ax ax'
	// 	},
	// 	arr : [
	// 		{ x : 'arr:x 0' },
	// 		{ x : 'arr:x 1' },
	// 		{ x : 'arr:x 2' }
	// 	]
	// });
	// console.log(ret1);

// <div>
// 	<div ---="1">
// 		<div ---="2">
// 			index = 0
// 		</div>
// 		<div ---="2">
// 			index = 1
// 		</div>
// 		<div ---="2">
// 			index = 2
// 		</div>
// 	</div>

// 	<div ---="1">
// 		<div ---="2">
// 			index = 1
// 		</div>
// 		<div ---="1">
// 			<div ---="2">
// 				index = 2
// 			</div>
// 		</div>
// </div>


/*

	var tags = [
		'<div>',
			'<ul>',
				'<li>',
					'<link rel="stylesheet" href="#" />',
				'</li>',
			'</ul>',
		'</div>'
	];

	// var end = getTagEndIndex(tags, 3);
	// var match = rtag.exec('<ul>');
	// console.log(end);

	var rtag1 = /<(\/)?([a-zA-Z]+) ?([^>]+)?>/;
	// var rtag2 = /<(\/)?([a-zA-Z]+) ?([^>]+\/?)?>/g;
	// var str = '<link rel="stylesheet" href="" />'
	// var match = rtag2.exec(str);
	// console.log(match);

	var str = '<link  >';
	var match = rtag.exec(str);
	// console.log(match);
	var str2 = '{{ loop:data.a val index }}';
	var match2 = rloop.exec(str2);
	// console.log(match2);
	var str3 = 'a.b.c';
	var obj3 = {
		a : {
			b : {
				c : 1
			}
		}
	};
	// var data3 = getData(str3, obj3);
	// console.log(data3);

	var str4 = '$aaa.a[1].x';
	var loopData4 = {
		//$val
		value : {
			a : [
				{ x : '....' },
				{ x : 'str4' }
			]
		},
		//$index
		index : 0
	};
	var data4 = getData(str4, null, loopData4, '$aaa');
	// console.log(data4);
*/