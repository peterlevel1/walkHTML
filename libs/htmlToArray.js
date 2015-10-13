(function (root) {

	var rdocDef = /<\!?(doctype|xml)([^>]*?)>/i,
		rcomment = /<\!--(?:[\s\S]*?)-->/g,
		rtag = /<[^>]+>/g;
		// rtag = /<\/?[\w]+( +[a-z][^>]+| +)\/?>/g;

	function htmlToArray(str) {
		str = str.trim().replace(rcomment, '');

		var	docDef = (str.match(rdocDef) || [])[0],
			words, l, atag, len, ret = [], i = -1;

		if (docDef) str = str.slice(docDef.length).trim();

		words = str.split(rtag);
		words.shift();
		words.pop();
		l = words.length;

		atag = str.match(rtag);
		len  = atag.length;

		while(++i < len) {
			ret.push(atag[i]);
			if (i < l) {
				ret.push(words[i]);
			}
		}

		if (docDef) ret.docDef = docDef;

		ret.tags = atag;
		ret.words = words;

		return ret;
	}

	if (typeof module === 'object' && module.exports) {
		module.exports = htmlToArray;
	}
	else if (typeof define === 'function' && define.amd) {
		define(function () { return htmlToArray; });
	}
	else {
		root.htmlToArray = htmlToArray;
	}

})(this);