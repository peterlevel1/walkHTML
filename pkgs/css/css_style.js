define([
	'../../ninja',
	'./css_deps',
	'./css_hooks',
	'../../deps/support',
	'../../deps/data_priv',
	'../../parts/native_selector'//isHidden
], function (_, cssDeps, cssHooks, support, dataPriv) {

var cssStyle = {

	get : function( elem, name, extra, styles ) {
		// Don't set styles on text and comment nodes
		if (cssStyle.filterElem(elem) === false) {
			return;
		}

		if (styles === true) {
			return cssStyle.getStyleValue(elem, name, extra);
		}

		var val,
			num,
			hook,
			origName = _.camelCase( name );

		// Make sure that we're working with the right name
		name = cssStyle.fixName(origName);
		// Gets hook for the prefixed version, then unprefixed version
		hook = cssHooks[name] || cssHooks[origName];

		// If a hook was provided get the computed value from there
		if ( hook && "get" in hook ) {
			val = hook.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = cssStyle.curCSS( elem, name, styles );
		}

		// Convert "normal" to computed value
		if ( val === "normal" && name in cssDeps.cssNormalTransform ) {
			val = cssDeps.cssNormalTransform[ name ];
		}

		// Make numeric if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || _.isNumeric( num ) ? num || 0 : val;
		}

		return val;
	},

	// Get and set the style property on a DOM Node
	set : function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if (cssStyle.filterElem(elem) === false || value === void 0) {
			return;
		}

		var ret,
			type,
			hook,
			origName = _.camelCase(name),
			style = elem.style;

		// Make sure that we're working with the right name
		name = cssStyle.fixName(origName);
		// Gets hook for the prefixed version, then unprefixed version
		hook = cssHooks[fixedName] || cssHooks[origName];
		// Check if we're setting a value
		type = typeof value;

		// Convert "+=" or "-=" to relative numbers (#7345)
		if (
			type === "string" &&
			(ret = cssDeps.rcssNum.exec(value)) &&
			ret[1]
		) {
			value = cssStyle.adjustCSS( elem, name, ret );
			// Fixes bug #9237
			type = "number";
		}

		// Make sure that null and NaN values aren't set (#7116)
		if (value == null || value !== value) {
			return;
		}

		// If a number was passed in, add the unit (except for certain CSS properties)
		if ( type === "number" ) {
			value += (ret && ret[3]) ||
				(cssDeps.cssNumber[ origName ] ? "" : "px");
		}

		// Support: IE9-11+
		// background-* props affect original clone's values
		if ( !support.clearCloneStyle &&
			value === "" && name.indexOf( "background" ) === 0 ) {

			style[name] = "inherit";
		}

		// If a hook was provided, use that value, otherwise just set the specified value
		if (!hook || !( "set" in hook ) ||
			( value = hook.set( elem, value, extra ) ) !== undefined ) {

			style[name] = value;
		}
	},

	fixName : function (origName) {
		return cssDeps.cssProps[ origName ] ||
			( cssDeps.cssProps[ origName ] = cssStyle.vendorPropName( origName ) || origName );
	},

	filterElem : function (elem) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return false;
		}
		return true;
	},

	curCSS : function ( elem, name, computed ) {
		var width,
			minWidth,
			maxWidth,
			ret,
			style = elem.style;

		computed = computed || cssStyle.getComputedStyle( elem );

		// Support: IE9
		// getPropertyValue is only needed for .css('filter') (#12537)
		if ( computed ) {
			ret = computed.getPropertyValue( name ) || computed[ name ];

			if ( ret === "" && !_.contains( elem.ownerDocument, elem ) ) {
				ret = cssStyle.get( elem, name, void 0, true );
			}

			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if (
				!support.pixelMarginRight() &&
				cssDeps.rnumnonpx.test( ret ) &&
				cssDeps.rmargin.test( name )
			) {
				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret !== undefined ?
			// Support: IE9-11+
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	},

	getStyleValue : function (elem, name, extra) {
		var origName = _.camelCase(name),
			fixedName = fixedName || cssStyle.fixName(origName),
			hook = cssHooks[fixedName] || cssHooks[origName];

		// If a hook was provided get the non-computed value from there
		if ( hook && "get" in hook &&
			( ret = hook.get( elem, false, extra ) ) !== undefined ) {

			return ret;
		}
		// Otherwise just get the value from the style object
		return elem.style[fixedName];
	},

	isHidden : function( elem, el ) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return cssStyle.get( elem, "display" ) === "none" ||
			_.expr.filters.hidden(elem) ||
			!_.contains( elem.ownerDocument, elem );
	},
	//generate the condition, then get, and reset the style after get value;
	swap :	function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	},

	getComputedStyle : function( elem ) {
		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	},

	// Return a css property mapped to a potentially vendor prefixed property
	vendorPropName : function ( name ) {
		// Shortcut for names that are not vendor prefixed
		if ( name in cssDeps.emptyStyle ) {
			return name;
		}
		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssDeps.cssPrefixes.length;

		while ( i-- ) {
			name = cssDeps.cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	},

	setPositiveNumber : function ( elem, value, subtract ) {
		var matches = cssDeps.rnumsplit.exec( value );
		return matches ?
			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
			value;
	},

	showHide : function ( elements, show ) {
		var display, elem,
			values = [],
			index = 0,
			length = elements.length;

		// Determine new display value for elements that need to change
		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}

			display = elem.style.display;
			if ( show ) {
				if ( display === "none" ) {

					// Restore a pre-hide() value if we have one
					values[ index ] = dataPriv.get( elem, "display" ) || "";
				}
			} else {
				if ( display !== "none" ) {
					values[ index ] = "none";

					// Remember the value we're replacing
					dataPriv.set( elem, "display", display );
				}
			}
		}

		// Set the display of the elements in a second loop
		// to avoid the constant reflow
		for ( index = 0; index < length; index++ ) {
			if ( values[ index ] != null ) {
				elements[ index ].style.display = values[ index ];
			}
		}

		return elements;
	},

	adjustCSS : function ( elem, prop, valueParts, tween ) {
		var adjusted,
			scale = 1,
			maxIterations = 20,
			currentValue = tween ?
				function() { return tween.cur(); } :
				function() { return cssStyle.get( elem, prop, "" ); },
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( cssDeps.cssNumber[ prop ] ? "" : "px" ),

			// Starting value computation is required for potential unit mismatches
			initialInUnit = ( cssDeps.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				cssDeps.rcssNum.exec( cssStyle.get( elem, prop ) );

		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];

			// Make sure we update the tween properties later on
			valueParts = valueParts || [];

			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;

			do {

				// If previous iteration zeroed out, double until we get *something*.
				// Use string for doubling so we don't accidentally see scale as unchanged below
				scale = scale || ".5";

				// Adjust and apply
				initialInUnit = initialInUnit / scale;
				cssStyle.set( elem, prop, initialInUnit + unit );

			// Update scale, tolerating zero or NaN from tween.cur()
			// Break the loop if scale is unchanged or perfect, or if we've just had enough.
			} while (
				scale !== ( scale = currentValue() / initial ) &&
				scale !== 1 &&
				--maxIterations
			);
		}

		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;

			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}
};

return cssStyle;

});