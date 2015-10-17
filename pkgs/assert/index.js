define(['../../ninja'], function (_) {

//***********************************************************
//   --------------!!! no: Buffer util.inspect !!!-------
//***********************************************************

// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';
//***********************************************************
// UTILITY
// ninja go first!
var util = _;
//***********no Buffer************
// var b = require('buffer');
//********************************
var pSlice = Array.prototype.slice;
// output right message
var report = function (message) {
	console.log(message);
};
//***********************************************************

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

//***********************************************************
// var assert = module.exports = ok;
var assert = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })


assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;
  Error.captureStackTrace(this, stackStartFunction);
};
// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

//***********************
//no util.inspect
//***********************
function getMessage(self, __message) {
  // return truncate(util.inspect(self.actual, {depth: null}), 128) + ' ' +
  //        self.operator + ' ' +
  //        truncate(util.inspect(self.expected, {depth: null}), 128);

  var	actual = typeof self.actual === 'object' ?
  			Object.prototype.toString.call(self.actual) :
  			'' + self.actual,
		expected = typeof self.expected === 'object' ?
			Object.prototype.toString.call(self.expected) :
			'' + self.expected,
		message =
			'======AssertionError======' + '\n' +
			actual + ' ' + self.operator + ' ' + expected + ' : ';
  // report(message);
  return message + (__message || '') + '\n';
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  // throw new assert.AssertionError({
  //   message: message,
  //   actual: actual,
  //   expected: expected,
  //   operator: operator,
  //   stackStartFunction: stackStartFunction
  // });

  var err = new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });

  return getMessage(err, message);
  // return err;
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) {
    return fail(value, true, message, '==', assert.ok);
  }
  else {
  	// report(message);
    return true;
  }
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) {
    return fail(actual, expected, message, '==', assert.equal);
  }
  else {
  	// report(message);
    return true;
  }
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    return fail(actual, expected, message, '!=', assert.notEqual);
  }
  else {
  	// report(message);
    return true;
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    return fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
  else {
  	// report(message);
    return true;
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;
  }
	//***********************************************************
	// --------------------!!! no Buffer !!!--------------------
	//***********************************************************
	//else if (b.Buffer.isBuffer(actual) && b.Buffer.isBuffer(expected)) {
  //  if (actual.length != expected.length) return false;
  //  for (var i = 0; i < actual.length; i++) {
  //    if (actual[i] !== expected[i]) return false;
  //  }
  //  return true;
  //}
  //***********************************************************

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual !== 'object' && typeof expected !== 'object') {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return util.isArguments(object);
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  var aIsArgs = isArguments(a),
      bIsArgs = isArguments(b);
  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
    return false;
  if (aIsArgs) {
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = Object.keys(a),
        kb = Object.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    return fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
  else {
  	// report(message);
    return true;
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    return fail(actual, expected, message, '===', assert.strictEqual);
  }
  else {
  	// report(message);
    return true;
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    return fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
  else {
  	// report(message);
    return true;
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    return fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    return fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    // throw actual;
    return fail(
      actual,
      expected,
      message,
      'shouldThrow: ' + shouldThrow,
      util.noop
    );
  }

  // report(message);
  return true;
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  return _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  return _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

//------------------------------------------------
var keys = util.keys(assert),
  results = [],
  targetExpected = 0,
  curExpected = 0,
  toAdd = false;

util.assert = {};

util.assert.expect = function (n) {
  if (util.isNumber(n) && (n = ~~n) > 0) {
    toAdd = true;
    targetExpected = n;
  }
};

util.each(keys, function (method) {
  var fn = assert[method];

  util.assert[method] = function () {
    var args = pSlice.call(arguments),
      last = args[args.length - 1],
      message,
      callback = (util.isFunction(last) && last) || void 0,
      result;

    if (callback) {
      args.pop();
    }

    result = fn.apply(assert, args);

    if (callback) {
      message = typeof args[args.length - 1] === 'string' ?
        args[args.length - 1] :
        '';
      callback(result, message, args.slice());
    }

    results.push(result);

    if (toAdd) {
      curExpected++;
    }

    return result;
  };
});

util.assert.collect = function (onlyArray, save) {
  var arr = results.slice();
  if (!onlyArray) {
    arr = util.reduce(arr, function (memo, v) {
      if (typeof v === 'string') {
        memo.push(v);
      }
      return memo;
    }, []);

    if (arr.length) {
      arr = arr.join('\n');
    }
    else {
      arr = true;
    }
  }

  if (!save) {
    results = [];
  }

  var a = targetExpected;
  var b = curExpected;
  targetExpected = 0;
  curExpected = 0;

  if (toAdd) {
    toAdd = false;
    if (a !== b) {
      throw new Error('expected is wrong: '
        + 'expected: '
        + a
        + ', cur expected: '
        + b);
    }
  }

  return arr;
};

//------------------------------------------------
return util.assert;
});