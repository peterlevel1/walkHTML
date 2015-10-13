var rattr = / +([\w-]+)(?:=\"([^\"]*?)\"|)?/g;
var makeAttributes = function (str) {
	var one;
	var ret = {};
	while ((one = rattr.exec(str))) {
		ret[one[1]] = one[2] || true;
	}
	return ret;
};

var str = '<html nt-app>';
var ret = makeAttributes(str);
console.log(ret);