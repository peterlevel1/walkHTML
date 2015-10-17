define([
	'ninja',
	'./de_deps'
], function (_, deDeps) {

var deSpecial = {
	load: {
		// Prevent triggered image.load events from bubbling to window.load
		noBubble: true
	},
	focus: {
		// Fire native event if possible so blur/focus sequence is correct
		trigger: function() {
			if ( this !== deDeps.safeActiveElement() && this.focus ) {
				this.focus();
				return false;
			}
		},
		delegateType: "focusin"
	},
	blur: {
		trigger: function() {
			if ( this === deDeps.safeActiveElement() && this.blur ) {
				this.blur();
				return false;
			}
		},
		delegateType: "focusout"
	},
	click: {
		// For checkbox, fire native event so checked state will be right
		trigger: function() {
			if ( this.type === "checkbox" && this.click && this.nodeName === 'INPUT' ) {
				this.click();
				return false;
			}
		},

		// For cross-browser consistency, don't fire native .click() on links
		_default: function( event ) {
			return event.target.nodeName === 'A';
		}
	},

	beforeunload: {
		postDispatch: function( event ) {

			// Support: Firefox 20+
			// Firefox doesn't alert if the returnValue field is not set.
			if ( event.result !== undefined && event.originalEvent ) {
				event.originalEvent.returnValue = event.result;
			}
		}
	}
};
// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
_.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	deSpecial[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !_.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

return deSpecial;

});