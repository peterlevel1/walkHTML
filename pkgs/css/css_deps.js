define([
	'../../deps/vars'
], function (vars) {

var cssDeps = {

	rnumnonpx : new RegExp( "^(" + vars.pnum + ")(?!px)[a-z%]+$", "i" ),

	rnumsplit : new RegExp( "^(" + vars.pnum + ")(.*)$", "i" ),

	rcssNum : new RegExp( "^(?:([+-])=|)(" + vars.pnum + ")([a-z%]*)$", "i" ),

	rmargin : /^margin/,

	emptyStyle : vars.document.createElement( "div" ).style,

	cssExpand : ["Top", "Right", "Bottom", "Left"],

	horizontal : ["Right", "Left"],

	vertical : ["Top", "Bottom"],

	rdisplayswap : /^(none|table(?!-c[ea]).+)/,

	cssShow : {
		position: "absolute",
		visibility: "hidden",
		display: "block"
	},

	cssNormalTransform : {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes : [ "Webkit", "Moz", "ms" ],

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		"float": "cssFloat"
	}
};

return cssDeps;

});