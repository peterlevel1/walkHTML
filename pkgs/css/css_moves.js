define([
	'../ninja',
	'./css_style',
	'../../parts/access',
	'../../parts/init'
], function (_, cssStyle, access) {

_.fn.extend({
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles,
				len,
				map = {},
				i = 0;

			if (_.isArray(name)) {
				styles = cssStyle.getComputedStyle( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = cssStyle.get( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				cssStyle.set(elem, name, value) :
				cssStyle.get(elem, name);
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return cssStyle.showHide( this, true );
	},
	hide: function() {
		return cssStyle.showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( cssStyle.isHidden( this ) ) {
				_( this ).show();
			} else {
				_( this ).hide();
			}
		});
	}
});

// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
_.each({
	Height : "height",
	Width  : "width"
}, function(type, name) {
	_.each({
		padding : "inner" + name,
		content : type,
		""      : "outer" + name
	}, function(funcName, defaultExtra) {
		// Margin is only for outerHeight, outerWidth
		_.fn[ funcName ] = function( margin, value ) {

			var chainable =
				arguments.length &&
				( defaultExtra || typeof margin !== "boolean" );

			var	extra =
				defaultExtra ||
				( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( _.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/_/_/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					cssStyle.get( elem, type, extra ) :

					// Set width or height on the element
					cssStyle.set( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});

});