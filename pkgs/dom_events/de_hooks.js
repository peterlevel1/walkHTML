define([
	'ninja',
	'./de_deps',
	'./de_src'
], function (_, deDeps, SrcDomEvents) {

	// Includes some event props shared by KeyEvent and MouseEvent
	var props = "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" ");

	var fixHooks = {};

	var keyHooks = {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	};

	var mouseHooks = {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX =
						original.clientX
					+ (doc && doc.scrollLeft ||
						body && body.scrollLeft ||
						0)
					- (doc && doc.clientLeft ||
						body && body.clientLeft ||
						0);
				event.pageY =
						original.clientY
					+ (doc && doc.scrollTop ||
						body && body.scrollTop  ||
						0)
					- (doc && doc.clientTop ||
						body && body.clientTop ||
						0);
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which =
						(button & 1
					? 1
					: (button & 2
					? 3
					: (button & 4
					? 2
					: 0)));
			}

			return event;
		}
	};

	function fix( event ) {
		if ( event[ _.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = fixHooks[ type ];

		if ( !fixHook ) {
			fixHooks[ type ] = fixHook =
				deDeps.rmouseEvent.test( type ) ? mouseHooks :
				deDeps.rkeyEvent.test( type ) ? keyHooks :
				{};
		}
		copy = fixHook.props ? props.concat( fixHook.props ) : props;

		event = new SrcDomEvents( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome<28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	}

	return {
		props      : props,
		fixHooks   : fixHooks,
		keyHooks   : keyHooks,
		mouseHooks : mouseHooks,
		fix        : fix
	};
});