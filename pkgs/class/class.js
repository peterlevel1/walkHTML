define(['../ninja'], function (_) {

var initializing = false,
	superPattern = /xyz/.test(function () { xyz; }) ?
		/(\b_super\b|\b_superApply\b)/ :
		/.*/,

	Class = function (Parent, properties) {

		var _super = Parent.prototype,
			proto;

		initializing = true;
		proto = new Parent();
		initializing = false;

		_.each(properties, function (value, name) {
			var doSuperPattern = _.isFunction(value) &&
				_.isFunction(_super[name]) &&
				superPattern.test(value);

			proto[name] = !doSuperPattern ?
				value :
				(function (name, fn) {
					var __super = function() {
							return _super[name].apply(this, arguments);
						},
						__superApply = function( args ) {
							return _super[name].apply(this, args);
						};

					return function () {

						var tmp1 = this._super,
							tmp2 = this._superApply,
							ret;

						this._super = __super;
						this._superApply = __superApply;

						ret = fn.apply(this, arguments);

						this._super = tmp1;
						this._superApply = tmp2;

						return ret;
					};
				})(name, value);
		});

		function Class() {
			if (!initializing && this.init) {
				this.init.apply(this, arguments);
			}
		}

		Class.prototype = proto;
		Class.prototype.constructor = Class;
		Class.super_ = Parent;

		return Class;
	};

return Class;

});