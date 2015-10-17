define([
	'ninja',
	'vars'
], function (_, vars) {

	return {
		strundefined : vars.strundefined,
		rnotwhite : vars.rnotwhite,
		hasOwn : vars.hasOwn,
		slice : vars.slice,
		//----------------------
		rkeyEvent : /^key/,
		rmouseEvent : /^(?:mouse|pointer|contextmenu)|click/,
		rfocusMorph : /^(?:focusinfocus|focusoutblur)$/,
		rtypenamespace : /^([^.]*)(?:\.(.+)|)$/,
		//----------------------
		returnTrue : vars.returnTrue,
		returnFalse : vars.returnFalse,

		safeActiveElement : function () {
			try {
				return vars.document.activeElement;
			} catch ( err ) { }
		},

		removeDomEvent : function( elem, type, handle ) {
			if ( elem.removeEventListener ) {
				elem.removeEventListener( type, handle, false );
			}
		}
	};
});