// Simple JavaScript Templating

define([
	'ninja'
], function (_) {

var buildFragment = (function () {

	var	wrapMap = {
		// Support : IE9
		option     : [ 1, "<select multiple='multiple'>", "</select>" ],
		optgroup   : [ 1, "<select multiple='multiple'>", "</select>" ],
		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead      : [ 1, "<table>", "</table>" ],
		tbody      : [ 1, "<table>", "</table>" ],
		tfoot      : [ 1, "<table>", "</table>" ],
		colgroup   : [ 1, "<table>", "</table>" ],
		caption    : [ 1, "<table>", "</table>" ],
		col        : [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr         : [ 2, "<table><tbody>", "</tbody></table>" ],
		td         : [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		th         : [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		//----------------------------------------------------------------
		_default   : [ 0, "", "" ]
	};

	var rtagName = /<([\w]+)/i;

	var rxhtml = /<|&#?\w+;?/;

	var rxhtmlTag =  /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi;

	var handleScript = function (fragment, scripts) {
		return fragment;
	};

	var appendOrNot = function (node, selection, ignored) {
		var toAppend = false;

		if (!selection || selection.indexOf(node) < 0) {
			toAppend = true;
		}
		else if (ignored) {
			ignored.push(node);
		}

		return toAppend;
	};

	var htmlPrefilter = function (html) {
		return html.replace( rxhtmlTag, "<$1></$2>" );
	};

	function buildFragment(str, context, scripts, selection, ignored) {
		context = context || document;

		var fragment = context.createDocumentFragment(),
			tmp,
			tagName,
			wrap,
			index,
			len,
			node;

		if (typeof str === 'object') {
			if (str.nodeType === 1) {
				if (appendOrNot(str, selection, ignored)) {
					fragment.appendChild(str);
				}
			}
			else if (_.isArraylike(str)) {
				index = -1;
				len = str.length;
				while (++index < len) {
					if (
						typeof (node = str[index]) === 'object' &&
						node.nodeType === 1 && appendOrNot(node, selection, ignored)
					) {
						fragment.appendChild(node);
					}
				}
			}
		}
		else if (typeof str === 'string') {
			if (!rxhtml.test(str)) {
				tmp = context.createTextNode(str);
			}
			else {
				tmp = fragment.appendChild( context.createElement('div') );
				tagName = (rtagName.exec(str) || ['', ''])[1].toLowerCase();
				wrap = wrapMap[tagName] || wrapMap._default;
				tmp.innerHTML = wrap[1] + htmlPrefilter(str) + wrap[2];
				index = wrap[0] + 1;

				while (index--) {
					tmp = tmp.firstChild;
				}
				fragment.textContent = '';
			}

			fragment.appendChild(tmp);
		}

		return handleScript(fragment, scripts);
	}

	return buildFragment;

})();

var path = _.path;
var util = _;
var cache = {};
var I_MAX = 50;
var added = 0;
var noop = function () {};
var tmpl = {};
//*********************************************
tmpl.settings = {
	frontend : true,
	escape : true
};
tmpl.regexp = {
	interpolate : /\{\{([^\}\(]+)(\(([\s\S]*?)\)|)\}\}/g
};
tmpl.regexpHooks = {};

tmpl.genController = genController;
tmpl.prevCompile = prevCompile;
tmpl.buildFragment = buildFragment;

tmpl.escape = escape;
tmpl.unescape = unescape;
/**
 * for debug usage
 */
tmpl.getCache = function (id) {
	return id
		? cache[id]
		: cache;
};

tmpl.clearCache = function (id) {
	if (id) {
		if (cache[id]) {
			delete cache[id];
			added--;
		}
	}
	else {
		added = 0;
		cache = {};
	}
};

//@override;
tmpl.getView = getView;

/**@override;
 * get a id, but may not be exists or valid
 */
function getView(id, context) {
	return  (context && typeof context.nodeType === 1
		? context
		: document).querySeletor(id);
}

/**
 * escape the given string with special mark str
 */
function escape(str) {
	return (str + '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g,'&#x2F;');
}

/**
 * unescape the given string with special mark str
 */
function unescape(str) {
	return (str + '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#x27;/g, "'")
		.replace(/&#x2F;/g,'/');
}

/**
 * 1) lock str
 * 2) provided with json obj, then get target string
 */
function prevCompile(str, view, settings) {
	settings = settings || {};
	return function (obj) {
		return settings.handle
			? settings.handle(str)
			: str.replace(settings.regexp || tmpl.regexp.interpolate,
				settings.regexpCallback ||
				settings.replaceString ||
				function (all, capture, isFn, args) {
					var val;
					return !obj || !(val = getOpt(obj, capture))
						? ''
						: isFn && typeof val === 'function'
						? val(pickArgs(settings, args), obj) + ''
						: settings.escape
						? tmpl.escape(val + '')
						: val + '';
				});
	};
}

function pickArgs(settings, args) {
	if (!args) {
		return;
	}

	if (settings.pickArgs) {
		return settings.pickArgs(args);
	}
	return defaultPickArgs(settings, args);
}

function defaultPickArgs(settings, args) {
	return args.split(/, */);
}

function getOpt(obj, capture) {
	var parts = capture.split('.');
	if (parts.length === 1) {
		return obj[capture];
	}

	var part;
	var val = obj;
	var i = 0;
	var l = parts.length;

	for ( ; i < l; i++) {
		part = parts[i];
		if (val[part]) {
			val = val[part];
		}
		else {
			return;
		}
	}

	return val;
}

/**
 * if done:
 * 1) if no data, callback will receive the compiled {Function}
 * 2) if data, callback will receive the compiled {String}
 */
function genController(id, settings, render) {
	var view = tmpl.getView(id);
	if (!view) {
		return;
	}

	var opts = util.extend({}, tmpl.settings);
	settings = settings && util.isObject(settings)
		? util.extend(opts, settings)
		: opts;

	var html = view.innerHTML;
	view.innerHTML = '';

	return {
		id : id,
		view : view,
		controller : tmpl.prevCompile(html, settings),
		render : render || defaultRender(view)
	};
};

function defaultRender(view) {
	return function (html) {
		view.innerHTML = html;
	};
}

return tmpl;

});
