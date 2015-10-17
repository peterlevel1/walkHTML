define([
	'ninja',
	'data_priv',

	'../../parts/native_selector',
	'../../parts/util'
], function (_, dataPriv) {

var mnpDeps = {
	rcheckableType    : /^(?:checkbox|radio)$/i,
	rscriptType       : /^$|\/(?:java|ecma)script/i,
	rtagName          : /<([\w:-]+)/,

	//----------------------- bug -----------------------
	rxhtmlTag         : /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,
	//----------------------- bug -----------------------

	// Support : IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https ://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml      : /<script|<style|<link/i,
	// checked ="checked" or checked
	rchecked          : /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked : /^true\/(.*)/,
	rcleanScript      : /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	rhtml             : /<|&#?\w+;?/,

	// We have to close these tags to support XHTML (#13200)
	wrapMap : {
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
	},

	getAll : function (context, tag) {
		if (!context) {
			return [];
		}

		// Support: IE9-11+
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( tag || "*" ) :
				typeof context.querySelectorAll !== "undefined" ?
					context.querySelectorAll( tag || "*" ) :
				[];

		return tag === undefined || tag && _.nodeName( context, tag ) ?
			_.merge( [ context ], ret ) :
			ret;
	},

	htmlPrefilter: function( html ) {
		return html.replace( mnpDeps.rxhtmlTag, "<$1></$2>" );
	},

	setGlobalEval : function ( elems, refElements ) {
		var i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}
};

	return mnpDeps;
});