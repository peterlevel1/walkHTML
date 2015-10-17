define([
	'ninja',
	'./mnp_deps',

	'../../parts/native_selector'
], function (_, mnpDeps) {

var	wrapMap = mnpDeps.wrapMap;
var rtagName = /<([\w]+)/i;
var rxhtml = /<|&#?\w+;?/;
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

//createDocumentFragment有什么作用呢？
//调用多次document.body.append(),每次都要刷新页面一次。
//效率也就大打折扣了，
//而使用document_createDocumentFragment()创建一个文档碎片，
//把所有的新结点附加在其上，
//然后把文档碎片的内容一次性添加到document中，
//这也就只需要一次页面刷新就可。
//他支持以下DOM2方法:
//cloneNode, hasAttributes, hasChildNodes, insertBefore,
//normalize, removeChild, replaceChild.
//也支持以下DOM2属性:
//attributes, childNodes, firstChild, lastChild,
//localName, namespaceURI, nextSibling, nodeName,
//nodeType, nodeValue, ownerDocument, parentNode,
//prefix, previousSibling, textContent.
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
			tmp.innerHTML = wrap[1] + mnpDeps.htmlPrefilter(str) + wrap[2];
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

});