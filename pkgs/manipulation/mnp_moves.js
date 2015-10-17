define([
	'ninja',
	'./mnp_deps',
	'./mnp_addDel',
	'./mnp_handleDomStructure',
	'./mnp_parseHTML',
	'../../parts/access',

	'../../parts/native_selector',
	'../../parts/util',
	'../../parts/travel'
], function (_, mnpDeps, addDel, handleDomStructure, parseHTML, access) {

function manipulationTarget( who, elem ) {
	if ( _.nodeName( who, "table" ) &&
		_.nodeName( elem.nodeType !== 11 ? elem : elem.firstChild, "tr" ) ) {

		return who.getElementsByTagName( "tbody" )[ 0 ] || who;
	}

	return who;
}

// Argument "data" should be string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
_.parseHTML = parseHTML;

_.fn.extend( {
	detach: function( selector ) {
		return addDel.remove( this, selector, true );
	},

	remove: function( selector ) {
		return addDel.remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				_.text( this ) :
				this.empty().each( function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				} );
		}, null, value, arguments.length );
	},

	append: function() {

		return handleDomStructure( this, arguments[0], function (elem) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return handleDomStructure( this, arguments[0], function (elem) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return handleDomStructure( this, arguments[0], function (elem) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return handleDomStructure( this, arguments[0], function (elem) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				addDel.cleanData( mnpDeps.getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = !!dataAndEvents;
		deepDataAndEvents = !!deepDataAndEvents;

		return this.map( function() {
			return addDel.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !mnpDeps.rnoInnerhtml.test( value ) &&
				!mnpDeps.wrapMap[ ( mnpDeps.rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = mnpDeps.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							addDel.cleanData( mnpDeps.getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return handleDomStructure( this, arguments[0], function( elem ) {
			var parent = this.parentNode;
			//-------------------------------
			if ( ignored.indexOf(this) < 0 ) {
			// ignored.indexOf(this) > 0 : this === elem
			//-------------------------------
				addDel.cleanData( mnpDeps.getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

_.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function(original, name) {
	_.fn[ name ] = function (selector) {
		var elems,
			ret = [],
			insert = _( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			_( insert[ i ] )[ original ]( elems );
			// Support: Android<4.1, PhantomJS<2
			// .get() because push.apply(_, arraylike) throws on ancient WebKit
			ret.push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});

});