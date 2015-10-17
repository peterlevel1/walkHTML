define([
	'../../ninja',
	'../promise/index'
], function (util, Promise) {

var test = {};
var noop = util.noop;

test.log = function () {
	console.log.apply(console, arguments);
};

//***************************************************
var Unit = test.Unit = function Unit(name, obj) {
	var self = this;

	if (!util.isString(name)) {
		throw new Error('test.Unit: must has a testName');
	}

	//********************
	this.testName = name;
	this.target = (util.isObject(obj) && obj) || {};
	this.isUnitTest = true;
	//********************
	this.keys   = [];
	this.stack  = [];
	this.failKeys = [];
	this.passKeys = [];
	this.aFail  = [];
	this.shouldNumber = 0;
	this.iRet   = 0;
	this.iPass  = 0;
	this.iFail  = 0;
	this.primaryInfo = '';
	//********************
	this.hasStart = false;
	this.units = null;
	this.callback = null;
	this.hasAutoAdd = false;

	//*************************************************
	if (!util.isEmptyObject(this.target)) {
		util.each(this.target, self.add.bind(self));
	}
};

Unit.prototype.start = function start(callback) {
	var self = this;

	if (self.hasStart) {
		throw new Error('start : start can only be fired for 1 time !');
	}
	if (!self.hasAutoAdd) {
		self._autoAddOnlyOnce();
	}

	self.hasStart = true;

	if (!callback) {
		if (self.callback) {
			callback = self.callback;
			self.callback = null;
		}
		else {
			callback = noop;
		}
	}

	util.series(
		self.stack,
		function (one, next) {
			fireHook(self, 'before', function () {
				self._test(one, next);
			});
		},
		unitStartPrevCallback(self, callback)
	);
};

function unitStartPrevCallback(unit, callback) {
	return function _unitStartPrevCallback() {
		var self = unit;

		if (self.isUnitTest) {
			self._printResult();
		}
		if (self.isUnitTest && !self.units) {
			if (self.aFail.length > 0) {
				self._printError();
			}
		}

		if (self.shouldNumber !== self.iRet) {
			var info = 'ERROR : UNEXPECT !' + '\n';

			if (self.isUnitTest) {
				info += '@TESTNAME : ' + self.testName + '\n';
			}
			if (self.units) {
				info += '@MODULE : ' + self.units.unitsName + '\n';
			}

			info += 'shouldNumber !== iRet' + '\n';
			info += 'shouldNumber : ' + self.shouldNumber + '\n';
			info += 'iRet : ' + self.iRet + '\n';

			throw new Error(info);
		}

		try {
			if (callback) {
				callback();
			}
		}
		catch (e) {
			throw e;
		}
	};
}

Unit.prototype.add = function (fn, assertWords) {
	if (!this.target[assertWords]) {
		this.target[assertWords] = fn;
	}
	return this;
};

Unit.prototype.autoStart = function (callback) {
	if (!this.hasAutoAdd) {
		this._autoAddOnlyOnce();
	}
	this.start(callback);
};

Unit.prototype.beforeEach = function (fn) {
	if (this.__beforeEach) {
		return;
	}
	this.__beforeEach = fn;
};

Unit.prototype.afterEach = function (fn) {
	if (this.__afterEach) {
		return;
	}
	this.__afterEach = fn;
};

Unit.prototype._autoAddOnlyOnce = function _autoAddOnlyOnce() {
	if (this.hasAutoAdd) {
		throw new Error('Unit.prototype.autoAdd : \nhasAutoAdd is true ! \nfor clear idea :\n manualAdd or autoAdd, but not both !');
	}
	if (!this.isUnitTest) {
		throw new Error('Unit.prototype.autoAdd : this : not a unit test !');
	}
	if (this.stack.length > 0) {
		throw new Error('Unit.prototype._autoAddOnlyOnce : this.stack should be empty !');
	}

	this.hasAutoAdd = true;

	var self = this;

	util.each(this.target, function (fn, assertWords) {
		if (typeof fn === 'function') {
			self.stack.push({assertWords : assertWords, fn : fn});
		}
		else {
			throw new Error('Unit.prototype._autoAddOnlyOnce : assertWords ' + assertWords + ' : \n@value is not function ! ');
		}
	});

	this.keys = util.keys(this.target);
	this.shouldNumber = this.keys.length;

	return this;
};

function fireHook(who, beforeOrAfter, callback) {
	beforeOrAfter = beforeOrAfter === 'after' ?
		'__afterEach' :
		'__beforeEach';

	var done = function (err) {
		callback.call(who, err);
	};

	if (who[beforeOrAfter]) {
		if (who[beforeOrAfter].length) {
			who[beforeOrAfter](done);
		}
		else {
			try {
				who[beforeOrAfter]();
			} catch (err) {
				done(err);
				return;
			}
			done();
		}
	}
	else {
		done();
	}
}

Unit.prototype._handleTestResult = function _handleTestResult(testResult, assertWords, next) {

	testResult = testResult === void 0 ?
		(util.assert ? util.assert.collect() : testResult) :
		testResult;

	if (testResult === true) {
		this.iPass++;
		this.passKeys.push(assertWords);
		fireHook(this, 'after', next);
	}
	else {
		if (testResult === false) {
			this._handleErrorResult('Error : COMMON_ERROR: false ', assertWords, next);
		}
		else if (util.isError(testResult) || typeof testResult === 'string') {
			this._handleErrorResult(testResult, assertWords, next);
		}
		else {
			throw new Error('{@important} Error: fail to capture: ' + assertWords + '\n' + testResult);
		}
	}
};

Unit.prototype._handleErrorResult = function _handleErrorResult(e, assertWords, next) {
	var info = [
		'@ASSERT_WORDS : ',
		assertWords,
		'@AT : ' + (this.iRet - 1),
		'@TEST : ' + this.testName,
		(this.units ? '@MODULE : ' + this.units.unitsName  : ''),
		e + '',
		'----------------------------------------'
	];
	info = '\n' + info.join('\n') + '\n';
	this.iFail++;
	this.failKeys.push(assertWords);
	this.aFail.push(info);

	fireHook(this, 'after', next);
};

Unit.prototype._printResult = function _printResult() {
	var self = this;
	var info = '';

	if (self.isUnitTest) {
		info += '@TEST : ' + self.testName + '\n';
	}
	if (!!self.units) {
		info += '@MODULE : ' + self.units.unitsName + '\n';
	}

	info += 'all : ' + self.iRet + '\n';
	info += '\tpass : ' + self.iPass + '\n';
	info += '\tfail : ' + self.iFail + '\n';

	if (self.passKeys.length > 0) {
		info += '\n' + '\t\t\t\t@passTests are : \n\t\t\t\t' + (self.passKeys.join('\n\t\t\t\t')) + '\n';
	}
	if (self.failKeys.length > 0) {
		info += '\n' + '\t\t\t\t@failTests are : \n\t\t\t\t' + (self.failKeys.join('\n\t\t\t\t')) + '\n';
	}

	info += '\n*****************************************\n';

	self.primaryInfo = info;
	test.log(self.primaryInfo);
};

Unit.prototype._printError = function _printError() {
	util.each(this.aFail, function (e) {
		test.log(e);
	});
};

Unit.prototype._test = function _test(one, next) {
	var assertWords = one.assertWords,
		fn = one.fn,
		testResult,
		self = this;

	self.iRet++;

	if (fn.length >= 1) {
		new Promise(fn)
			.always(function (testResult) {
				self._handleTestResult(testResult, assertWords, next);
			});
		return;
	}

	try {
		testResult = fn();
		self._handleTestResult(testResult, assertWords, next);
	}
	catch (e) {
		self._handleTestResult(e, assertWords, next);
	}
};

test.Module = function (unitsName, obj) {

	var result = {};
	Unit.call(result, unitsName);
	//---
	result.isUnitTest = false;
	result.testName = null;
	result.target = null;
	//+++
	result.unitsName = unitsName || 'NO_MODULE_TEST_NAME';
	result.failUnits = [];
	result.isModuleTest = true;
	result.units = [];

	//*************************************
	var units = result.units;
	units.unitsName = result.unitsName;

	result.add = function (obj) {
		if (util.isObject(obj)) {
			return result._addObj(obj);
		}
		else if (util.isArray(obj)) {
			return result._addArray(obj);
		}
		else if (typeof obj === 'function') {
			return result._addFunction(obj);
		}
		else {
			throw new Error('test.Module: result.add: [obj -> type]: wrong type');
		}
	};

	result._addObj = function (unit) {
		if (unit.isUnitTest && !~units.indexOf(unit)) {
			unit.units = units;
			units.push(unit);
		}
		return result;
	};

	result._addArray = function (units) {
		util.each(units, function (unit) {
			if (util.isObject(unit)) {
				result._addObj(unit);
			}
		});
		return result;
	};

	result._addFunction = function (fn) {
		if (fn.length >= 1) {
			return new Promise(fn)
				.then(function(obj) {
					return result.add(obj);
				}, function (e) {
					throw e;
				});
		}
		else {
			return result.add(fn());
		}
	};

	result.start = function (callback) {
		if (result.hasStart) {
			throw new Error('no no no ! the module test can only be 1 time !');
		}

		result.hasStart = true;

		test._start(units, function () {

			util.each(units, function (unit) {
					result.iRet  += unit.iRet;
					result.iPass += unit.iPass;
					result.iFail += unit.iFail;
					result.passKeys.concat(unit.passKeys);
				if (unit.aFail.length > 0) {
					result.failUnits.push(unit);
					result.aFail.concat(unit.aFail);
					result.failKeys.concat(unit.failKeys);
				}
			});

			var info = '';
			info += 'MODULE Tests : ' + result.unitsName + '\n';
			info += 'all : ' + result.iRet + '\n';
			info += '\tpass : ' + result.iPass + '\n';
			info += '\tfail : ' + result.iFail + '\n';

			result.primaryInfo = info;
			test.log(result.primaryInfo);

			if (result.failUnits.length > 0) {
				util.each(result.failUnits, function (unit) {
					unit._printError();
				});
			}

			if (callback) {
				callback();
			}
			else if (result.callback) {
				callback = result.callback;
				result.callback = null;
				callback();
			}
		});
	};

	if (obj) {
		return result.add(obj);
	}

	return result;
};

test._start = function _start(units, callback) {
	util.series(units, function(unit, next) {
		if (unit.hasStart) {
			return next(new Error('test: ' + unit.name + ' :has start already !'));
		}

		if (unit.isUnitTest) {
			unit.units = units;
			unit.autoStart(next);
		} else if (unit.isModuleTest) {
			unit.start(next);
		}
	}, callback);
};

return test;
});