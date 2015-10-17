define([
	'ninja',
	'./mnp_deps',
	'./mnp_buildFragment',

	'../../parts/native_selector',
	'../../parts/util'
], function (_, mnpDeps, buildFragment) {

var rscriptTypeMasked = /^true\/(.*)/;

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript(elem) {
	elem.type = (elem.getAttribute( "type" ) !== null) + "/" + elem.type;
	return elem;
}

function restoreScript(elem) {
	var match = rscriptTypeMasked.exec(elem.type);

	if (match) {
		elem.type = match[1];
	}
	else {
		elem.removeAttribute("type");
	}

	return elem;
}

function handleDomStructure(collection, arg, callback, ignore) {

	var argType = typeof arg,
		len = collection.length,
		i = 0,
		fragment, first, scripts, script, doc, lenScripts;
// console.log(collection);
	if (!len) {
		return collection;
	}

	if (argType === 'function') {
		return collection.each(function (node, index) {
			var self = collection.eq(index),
				eachForIndex = arg.call(this, index);
			handleDomStructure(self, eachForIndex, callback, ignore);
		});
	}

	fragment = buildFragment(arg, collection[ 0 ].ownerDocument, false, collection, ignore);
	first = fragment.firstChild;

	if (!first) {
		if (!ignore) {
			return collection;
		}
	}

	scripts = _.map(mnpDeps.getAll(first, "script"), disableScript);
	lenScripts = scripts.length;

	for ( ; i < len; i++) {
		callback.call(collection[ i ], first, i);
	}

	if (!lenScripts) {
		return collection;
	}

	doc = scripts[ scripts.length - 1 ].ownerDocument;
	// Reenable scripts
	_.each(scripts, restoreScript);

	// Evaluate executable scripts on first document insertion
	for (i = 0; i < lenScripts; i++) {
		script = scripts[ i ];
		if (
			rscriptType.test(script.type || "") &&
			_.contains(doc, script)
		) {
			if (script.src) {
				// Optional AJAX dependency, but won't run scripts if not present
				if (_._evalUrl) {
					_._evalUrl(script.src);
				}
			}
			else {
				_.globalEval(script.textContent.replace(rcleanScript, ""));
			}
		}
	}

	return collection;
}

return handleDomStructure;

});