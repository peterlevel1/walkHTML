define([
	'ninja',
	'./de_deps',
	'./de_special',
	'./de_hooks',
	'./de_src',

	'support',
	'data_priv',
	'vars',

	'../../parts/init'
], function (_, deDeps, deSpecial, deHooks, SrcDomEvents, support, dataPriv, vars) {

var domEvents;

function assignTask(elem) {
	return function (e) {
		if ( typeof _ === vars.strundefined || domEvents.triggered === e.type ) {
			return;
		}
		return domEvents.dispatch.apply( elem, arguments );
	}
}

domEvents = {

	removeDomEvent : deDeps.removeDomEvent,

	global : {},

	add : function ( elem, types, handler, data, selector ) {
		var i,
			origType,
			type,
			namespace,
			handleObj,
			handlers,
			//----------------
			events,
			elemData = dataPriv.get(elem),
			handleObjIn;

		// Caller can pass in an object of custom data in lieu of the handler
		if (typeof handler === 'object' && handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		if ( (!elem || !dataPriv.acceptData(elem)) ||
				 (typeof types !== 'string') ||
				 (typeof handler !== 'function') ||
				 (selector && typeof selector !== 'string') ) { return; }
		//***********************************************************

		elemData.events = elemData.events || {};
		events = elemData.events;

		if (!elemData.handle) {
			elemData.handle = assignTask(elem);
		}

		if ( !handler.guid ) {
			handler.guid = _.guid++;
		}

		types = types.split(/\s+/);
		i = types.length;

		while (i--) {
			type = types[i].split('.');

			namespace = type[1];
			origType = type = type[0];

			if (!type) {
				continue;
			}
			// If event changes its type, use the special event handlers for the changed type
			special = deSpecial[ type ] || {};
			// If selector defined, determine special event api type, otherwise given type
			if (selector) {
				type = special.delegateType || special.bindType || type;
			}
			// Update special based on newly reset type
			special = deSpecial[ type ] || {};

			handleObj = _.extend({
				selector: selector,
				needsContext: selector && _.expr.match.needsContext.test( selector ),
				//--------------------
				type: type,
				origType: origType,
				data: data,
				namespace: namespace,
				//--------------------
				handler: handler,
				guid: handler.guid
			}, handleObjIn);

			// Init the event handler queue if we're the first
			if ( !(handlers = events[type]) ) {
				handlers = events[type] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if (!special.setup ||
					special.setup.call( elem, data, namespace, elemData.handle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, elemData.handle, false );
					}
				}
			}

			if (special.add) {
				special.add.call( elem, handleObj );
				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if (selector) {
				handlers.splice(handlers.delegateCount++, 0, handleObj);
			} else {
				handlers.push(handleObj);
			}
			// Keep track of which events have ever been used, for event optimization
			domEvents.global[ type ] = true;
		}
	},

	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = dataPriv.hasData( elem ) && dataPriv.get( elem ),
			delegateQueue, selfQueue, handlers, single;

		if ( !elemData || !(events = elemData.events)) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = (types || '').split(/\s+/) || [''];
		t = types.length;

		while ( t-- ) {
			tmp = types[t].split('.');
			origType = type = tmp[0];
			namespace = tmp[1];

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for (type in events) {
					single = namespace ? type + '.' + namespace : type;
					domEvents.remove( elem, single, handler, selector, true );
				}
				continue;
			}

			special = deSpecial[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			if (!(handlers = events[type])) {
				continue;
			}

			// Remove matching events
			origCount = j = handlers.length;

			while ( j-- ) {
				handleObj = handlers[j];
				if (
					( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !namespace || handleObj.namespace === namespace ) &&
					( !selector || selector === handleObj.selector ||
						( selector === "**" && handleObj.selector ) )
				) {
					handlers.splice( j, 1 );
					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if (origCount && !handlers.length) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					deDeps.removeDomEvent( elem, type, elemData.handle );
				}
				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( _.isEmptyObject(events) ) {
			dataPriv.remove( elem, "handle events" );
		}
	},

	dispatch: function( e ) {

		// Make a writable _.Event from the native event object
		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = vars.slice.call( arguments ),
			events = dataPriv.get( this, "events" ),
			special = deSpecial[ e.type ] || {},
			type = special.delegateType || special.bindType || e.type,
			handlers;

		if (!events || !(handlers = events[type])) {
			return;
		}

		e = deHooks.fix( e );
		// Use the fix-ed _.Event rather than the (read-only) native event
		args[0] = e;
		e.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, e ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = domEvents.handlers.call( this, e, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !e.isPropagationStopped() ) {
			e.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !e.isImmediatePropagationStopped() ) {
				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !e.namespace || e.namespace === handleObj.namespace ) {

					e.handleObj = handleObj;
					e.data = handleObj.data;

					ret = ((deSpecial[handleObj.origType] || {}).handle ||
								handleObj.handler)
								.apply(matched.elem, args);

					if ( ret !== undefined ) {
						if ( (e.result = ret) === false ) {
							e.preventDefault();
							e.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, e );
		}

		return e.result;
	},

	handlers: function( e, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && ( !event.button || event.type !== "click" ) ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								_( sel, this ).indexOf( cur ) > -1 :
								_.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = vars.hasOwn.call( event, "type" )
				? event.type
				: event,
			namespace,
			namespaces = vars.hasOwn.call( event, "namespace" )
				? event.namespace.split(".")
				: [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( deDeps.rfocusMorph.test( type + domEvents.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespace = namespaces.shift();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a _.Event object, Object, or just an event type string
		event = event[ _.expando ] ?
			event :
			new SrcDomEvents( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for _ (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespace;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			_.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = deSpecial[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !_.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !deDeps.rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}
			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// _ handler
			handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] && dataPriv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}
			// Native handler
			handle = ontype && cur[ ontype ];

			if ( handle && handle.apply && dataPriv.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				dataPriv.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && _.isFunction( elem[ type ] ) && !_.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}
					// Prevent re-triggering of the same event, since we already bubbled it above
					//!!! -> prevent the dispatch mode
					domEvents.triggered = type;
					elem[ type ]();
					domEvents.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = _.extend(
			new SrcDomEvents(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			domEvents.trigger( e, null, elem );
		} else {
			domEvents.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};


// Support: Firefox, Chrome, Safari
// Create "bubbling" focus and blur events
if ( !support.focusinBubbles ) {
	_.each({ focus: "focusin", blur: "focusout" }, function(orig, fix) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
				domEvents.simulate( fix, event.target, domEvents.fix( event ), true );
			};

		deSpecial[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = dataPriv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					dataPriv.remove( doc, fix );

				} else {
					dataPriv.access( doc, fix, attaches );
				}
			}
		};
	});
}

return domEvents;

});