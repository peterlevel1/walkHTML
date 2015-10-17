define([
	'ninja',
	'./mnp_deps',
	'data_priv',
	'data_user',
	'../dom_events/de_main',
	'../dom_events/de_special',

	'support',

	'../../parts/init'
], function (_, mnpDeps, dataPriv, dataUser, domEvents, special, support) {

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( dataPriv.hasData( src ) ) {
		pdataOld = dataPriv.access( src );
		pdataCur = dataPriv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					domEvents.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( dataUser.hasData( src ) ) {
		udataOld = dataUser.access( src );
		udataCur = _.extend( {}, udataOld );

		dataUser.set( dest, udataCur );
	}
}

function remove( elem, selector, keepData ) {
	var node,
		nodes = selector ? _.domFilter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = nodes[ i ] ) != null; i++ ) {
		if ( !keepData && node.nodeType === 1 ) {
			cleanData( mnpDeps.getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && _.contains( node.ownerDocument, node ) ) {
				mnpDeps.setGlobalEval( mnpDeps.getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

function clone( elem, dataAndEvents, deepDataAndEvents ) {
	var i, l, srcElements, destElements,
		clone = elem.cloneNode( true ),
		inPage = _.contains( elem.ownerDocument, elem ),
		scripts;

	// Fix IE cloning issues
	if (
		!support.noCloneChecked &&
		( elem.nodeType === 1 || elem.nodeType === 11 ) &&
		!_.isXMLDoc( elem )
	) {
		// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
		destElements = mnpDeps.getAll( clone );
		srcElements = mnpDeps.getAll( elem );
		for ( i = 0, l = srcElements.length; i < l; i++ ) {
			mnpDeps.fixInput( srcElements[ i ], destElements[ i ] );
		}
	}

	// Copy the events from the original to the clone
	if ( dataAndEvents ) {
		if ( deepDataAndEvents ) {
			srcElements = srcElements || mnpDeps.getAll( elem );
			destElements = destElements || mnpDeps.getAll( clone );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				cloneCopyEvent( srcElements[ i ], destElements[ i ] );
			}
		} else {
			cloneCopyEvent( elem, clone );
		}
	}

	// Preserve script evaluation history
	scripts = mnpDeps.getAll( clone, "script" );
	if ( scripts.length > 0 ) {
		mnpDeps.setGlobalEval( scripts, !inPage && mnpDeps.getAll( elem, "script" ) );
	}

	// Return the cloned set
	return clone;
}

function cleanData( elems ) {
	var data, elem, type,
		i = 0;

	for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
		if ( dataPriv.acceptData( elem ) ) {
			if ( ( elem[ dataPriv.expando ] ) && ( data = dataPriv.get(elem)) ) {
				if ( data.events ) {
					for ( type in data.events ) {
						if ( special[ type ] ) {
							domEvents.remove( elem, type );

						// This is a shortcut to avoid _.event.remove's overhead
						} else {
							domEvents.removeDomEvent( elem, type, data.handle );
						}
					}
				}

				// Support: Chrome <= 35-45+
				// Assign undefined instead of using delete, see Data#remove
				elem[ dataPriv.expando ] = undefined;
			}
			if ( elem[ dataUser.expando ] ) {

				// Support: Chrome <= 35-45+
				// Assign undefined instead of using delete, see Data#remove
				elem[ dataUser.expando ] = undefined;
			}
		}
	}
}

var addDel = {
	cloneCopyEvent: cloneCopyEvent,
	remove: remove,
	clone: clone,
	cleanData: cleanData
};

return addDel;

});