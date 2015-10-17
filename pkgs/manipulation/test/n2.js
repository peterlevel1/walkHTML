	var deSame = function (arr, fn, sorted) {
		var ret = arr.slice(),
			i = ret.length;

		fn = typeof fn === 'function' && fn;

		if (!sorted) {
			ret.sort(fn);
		}

		while (i--) {
			if (i > 0) {
				if (
					(fn && fn(ret[i], ret[i - 1]) === 0) ||
					(!fn && ret[i] === ret[i - 1])
				) {
					ret.splice(i, 1);
				}
			}
		}

		return ret;
	};
var arr = [{x : 1}, {x : 2}, {x : 2}, {x : 3}];

var arr2 = deSame(arr, function (a, b) {
	return a.x - b.x;
}, true);

console.log(arr2);