define([
	'ninja',
], function (_) {

var rnotwhite = /\S+/;

function Data () {
	Object.defineProperty( this.cache = {}, 0, {
		get: function () {
			return {};
		}
	});

	this.expando = (_.expando || 'ninja-1.0.0') + '-' + Data.uid++;
}

Data.uid = 1;

Data.acceptData = function (owner) {
	return owner.nodeType === 1 || owner.nodeType === 9 || owner.nodeType === void 0;
};

Data.prototype = {
	constructor : Data,

	acceptData : Data.acceptData,

	key: function (owner) {
		if (!Data.acceptData(owner)) {
			return 0;
		}

		var descriptor = {},
			unlock = owner[this.expando];

		if (!unlock) {
			unlock = Data.uid++;

			try {
				descriptor[this.expando] = { value: unlock };
				Object.defineProperties(owner, descriptor);
			}
			catch (e) {
				descriptor[this.expando] = unlock;
				_.extend(owner, descriptor);
			}
		}

		if (!this.cache[unlock]) {
			this.cache[unlock] = {};
		}

		return unlock;
	},

	set: function (owner, data, value) {
		var prop,
			unlock = this.key(owner),
			cache = this.cache[unlock];

		if (typeof data === "string") {
			cache[data] = value;
		}
		else {
			if (_.isEmptyObject(cache)) {
				_.extend(this.cache[unlock], data);
			}
			else {
				for (prop in data) {
					cache[prop] = data[prop];
				}
			}
		}

		return cache;
	},

	get: function (owner, key) {
		var cache = this.cache[this.key(owner)];

		return key === undefined ?
			cache :
			cache[key];
	},

	access: function (owner, key, value) {
		var stored;

		if ( key === undefined ||
				(typeof key === "string" && value === undefined) ) {

			stored = this.get(owner, key);

			return stored !== undefined ?
				stored :
				this.get(owner, _.camelCase(key));
		}

		this.set(owner, key, value);

		return value !== undefined ? value : key;
	},

	remove: function (owner, key) {
		var i,
			name,
			camel,
			unlock = this.key(owner),
			cache = this.cache[unlock];

		if (key === undefined) {
			this.cache[unlock] = {};
		}
		else {
			if (_.isArray(key)) {
				name = key.concat(key.map(_.camelCase));
			}
			else {
				camel = _.camelCase(key);
				if (key in cache) {
					name = [key, camel];
				}
				else {
					name = camel in cache ?
						[camel] :
						(camel.match(rnotwhite) || []);
				}
			}

			i = name.length;
			while (i--) {
				delete cache[name[ i ]];
			}
		}
	},

	hasData: function (owner) {
		return !_.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},

	discard: function (owner) {
		var unlock = owner[this.expando];
		if (unlock) {
			delete this.cache[unlock];
		}
	}
};

return Data;
});
