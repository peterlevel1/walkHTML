define([
	'ninja',
	'data_priv'
], function (_, dataPriv) {

function getClass(one) {
	return one.nodeType !== 1
		? false
		: (one.getAttribute
			&& one.getAttribute('class'))
			|| one.className;
}

var atbClass = {
	hasClass : function (one, className) {
		var srcClass;
		return !(srcClass = getClass(one))
			? false
			: (' ' + srcClass.trim() + ' ')
				.indexOf(className.trim() + ' ') > 0;
	},

	toggleClass : function (ones, className) {
		var type = typeof className;
		return _.each(ones, function (one) {
			var srcClass = getClass(one);
			if (!srcClass) {
				return;
			}
			var readyClass = ' ' + srcClass.trim() + ' ';

			if (type === 'string') {
				className = className.trim() + ' ';
				readyClass = readyClass.indexOf(className) > 0
					? readyClass.replace(className + ' ', '')
					: readyClass + className;

				readyClass = readyClass.trim();

				if (readyClass !== srcClass) {
					one.setAttribute('class', srcClass.trim());
				}
			}
		});
	},

	removeClass : function (ones, className) {
		return _.each(ones, function (one) {
			if (className === void 0) {
				if (one.removeAttribute) {
					one.removeAttribute('class');
				}
				return;
			}

			var srcClass;
			if (!(srcClass = getClass(one))) {
				return;
			}

			var readyClass = ' ' + srcClass.trim() + ' ';
			var target = className.trim().split(/[\s\t]+/);
			var len = target.length;
			var single;

			while (len--) {
				single = target[len] + ' ';
				if (readyClass.indexOf(single) > 0) {
					readyClass = readyClass.replace(single, '');
				}
			}

			readyClass = readyClass.trim();

			if (readyClass !== srcClass) {
				if (readyClass === '') {
					one.removeAttribute('class');
				}
				else {
					one.setAttribute('class', readyClass);
				}
			}
		});
	},

	addClass : function (ones, className) {
		return _.each(ones, function (one) {
			var srcClass;
			if ((srcClass = getClass(one)) === false || !className) {
				return;
			}

			var readyClass = ' ' + srcClass.trim() + ' ';
			var target = className.trim().split(/[\s\t]+/);
			var len = target.length;
			var single;

			while (len--) {
				single = target[len] + ' ';
				if (readyClass.indexOf(single) < 0) {
					readyClass += single;
				}
			}

			readyClass = readyClass.trim();

			if (readyClass !== srcClass) {
				one.setAttribute('class', readyClass);
			}
		});
	}
};

return atbClass;

});