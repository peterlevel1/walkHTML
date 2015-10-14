(function (root) {

	var rdocDef = /<[\!\?]?(doctype|xml)([^>]*?)>/i,
		rcomment = /<\!--(?:[\s\S]*?)-->/g,
		rotherXmlDef = /<\?[^>]*?\?>/,
		rtag = /<[^>]+>/g;
		// rtag = /<\/?[\w]+( +[a-z][^>]+| +)\/?>/g;

	function htmlToArray(str, isXML) {
		str = str.trim().replace(rcomment, '');

		var	docDef = rdocDef.exec(str),
			words, l, atag, len, ret = [], i = -1, otherXmlDef, one,
			gaurd = 100000;

		if (docDef) {
			str = str.slice(docDef[0].length).trim();
		}
		if (isXML || (docDef && docDef[1] === 'xml')) {
			while ((one = str.match(rotherXmlDef))) {
				(otherXmlDef = otherXmlDef || []).push(one[0]);
				str = str.slice(one[0].length).trim();
			}
		}
		docDef = (docDef && docDef[0]) || null;

		words = str.split(rtag);
		words.shift();
		words.pop();
		l = words.length;

		atag = str.match(rtag);
		len  = atag.length;

		while(++i < len) {
			ret.push(atag[i]);
			if (i < l) ret.push(words[i]);
			if (--gaurd < 0) break;
		}

		if (gaurd < 0) throw new Error('loop too many times');
		ret.helper = { docDef : docDef, otherXmlDef : otherXmlDef };
		ret.tags = atag;
		ret.words = words;
		ret.sourceString = str;

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