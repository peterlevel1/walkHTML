;(function (global, undefined) {

var nodejsRequire;
var isFE = typeof module === 'undefined';

var _ = (function (global) {

	var Ninja = function (selector, context) {
		return new Ninja.fn.init(selector, context);
	};

	Ninja.fn = Ninja.prototype = {};
	Ninja.fn.constructor = Ninja;

	if (!isFE) {
		module.exports = Ninja;
		nodejsRequire = require;
	}
	else {
		global.Ninja = Ninja;
	}

	return Ninja;

})(this);

;(function (_, undefined) {

var core_toString = {}.toString;
var core_hasOwn = {}.hasOwnProperty;

_.checkData = function (data, check) {
  return typeof check === 'function' ? function (obj) {
  		return check(obj, data);
  	} : function (obj) {
    	return core_toString.call(obj) === "[object " + data + "]";
  	};
};

var class2type = {};

;(function (class2type) {
	var i = 0,
 		types = "Boolean String Number Function Object Array RegExp Date Buffer Error Arguments".split(' '),
		len = types.length,
		type;

	for ( ; i < len && (type = types[i]); i++) {
		class2type['[object ' + type + ']'] = type.toLowerCase();
		switch (type) {
			case 'Number'   :
			case 'Boolean'  :
			case 'String'   :
			case 'Object'   :
			case 'Array'    :
			case 'Error'    :
			case 'Function' : break;
			default         : _['is' + type] = _.checkData(type); break;
		}
	}
})(class2type);

_.type = function (obj) {
	if ( obj == null ) {
		return obj + "";
	}
	// Support: Android<4.0, iOS<6 (functionish RegExp)
	return typeof obj === "object" || typeof obj === "function" ?
		class2type[ core_toString.call(obj) ] || "object" :
		typeof obj;
};

_.isNumber = function (obj) {
	return typeof obj === 'number' && !isNaN(obj);
};

_.isBoolean = function (obj) {
	return typeof obj === 'boolean';
};

_.isString = function (obj) {
	return ('' + obj) === obj;
};

_.isObject = function (obj) {
	return _.type(obj) === 'object';
};

_.isArray = Array.isArray || function () {
	return _.type(obj) === 'array';
};

_.isError = function (e) {
	return e && (core_toString.call(e) === "[object Error]" || e instanceof Error);
};

_.isFunction = function( obj ) {
	return _.type(obj) === "function";
};

_.isArraylike = function (obj) {

	if (_.isArray(obj)) {
		return true;
	}
	else if (
		!obj ||
		obj.length === void 0 ||
		_.type(obj) === 'function' ||
		_.isWindow(obj)
	) {
		return false;
	}

	var length = obj.length;

	if (obj.nodeType === 1 && length) {
		return true;
	}

	return length === 0 ||
		typeof length === 'number' && length > 0 && (length - 1) in obj;
};

_.isDomNode = function (obj) {
	return typeof obj.nodeType !== 'undefined';
};

_.isWindow = function (obj) {
	return !!obj && obj.window === obj;
};

_.isEmptyObject = function (obj) {
	if (_.isObject(obj)) {
		for (var prop in obj) {
			return false;
		}
		return true;
	}
	return false;
};

_.isPlainObject = function (obj) {
	return !!obj &&
		_.isObject(obj) &&
		!_.isDomNode(obj) &&
		!_.isWindow(obj) &&
		!!obj.constructor &&
		core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
};

_.hasError = function (e) {
	return _.isError(e) || e === false;
};

_.isUndefined = function (un) {
	return un === void 0;
};

_.isNull = function (o) {
	return o === null;
};

_.isNullOrUndefined = function (o) {
	return o == null;
};

_.isNumeric = function (o) {
	// parseFloat NaNs numeric-cast false positives (null|true|false|"")
	// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
	// subtraction forces infinities to NaN
	// adding 1 corrects loss of precision from parseFloat (#15100)
	return !_.isArray(o) && (o - parseFloat(o) + 1) >= 0;
};

})(_);

;(function (_) {

_.keys = Object.keys || function (obj) {
  var keys = [];
  for (var k in obj) {
  	if (obj.hasOwnProperty(k)) {
  		keys.push(k);
  	}
  }
  return keys;
};

_.each = function (obj, callback, args) {
	var i = 0,
		key,
		keys,
		value,
		length;

	if (args) {
		if (_.isArraylike(obj)) {
			length = obj.length;
			for ( ; i < length; i++) {
				if (callback.call(args, obj[i], i, obj) === false) {
					break;
				}
			}
		}
		else {
			keys = _.keys(obj);
			length = keys.length;
			for ( ; i < length; i++) {
				key = keys[i];
				if (callback.call(args, obj[key], key, obj) === false) {
					break;
				}
			}
		}
	}
	else {
		if (_.isArraylike(obj)) {
			length = obj.length;
			for ( ; i < length; i++) {
				if (callback(obj[i], i, obj) === false) {
					break;
				}
			}
		}
		else {
			keys = _.keys(obj);
			length = keys.length;
			for ( ; i < length; i++) {
				key = keys[i];
				if (callback(obj[key], key, obj) === false) {
					break;
				}
			}
		}
	}

	return obj;
};

_.filter = function (obj, iterator, args) {
	var arrayLike = _.isArraylike(obj),
		result = arrayLike ? [] : {};
	args = args || {};

	_.each(obj, function (value, index, obj) {
    if (iterator.call(this, value, index, obj) === true) {
    	if (arrayLike) {
    		result.push(value);
    	}
    	else {
    		result[index] = value;
    	}
    }
  }, args);

  return result;
};

_.map = function (obj, iterator, args) {
	var result = _.isArraylike(obj) ? [] : {};
	args = args || {};
	_.each(obj, function (value, index, obj) {
    result[index] = iterator.call(this, value, index, obj);
  }, args);
  return result;
};

_.some = function (obj, iterator, args) {
	var result = false;
	args = args || {};
	_.each(obj, function (value, index, obj) {
    if (iterator.call(this, value, index, obj) === true) {
    	result = true;
    	return false;
    }
  }, args);
  return result;
};

_.every = function (obj, iterator, args) {
	var result = true;
	args = args || {};
	_.each(obj, function (value, index, obj) {
    if (iterator.call(this, value, index, obj) === false) {
    	result = false;
    	return false;
    }
  }, args);
  return result;
};

_.reduce = function (obj, iterator, memo, args) {
	args = args || {};
  _.each(obj, function (x, i, a) {
    memo = iterator.call(this, memo, x, i, a);
  }, args);
  return memo;
};

})(_);

;(function (_) {

_.noop = function () {};

_.log = function () {
	console.log.apply(console, arguments);
};

var core_hasOwn = {}.hasOwnProperty;
var core_slice = [].slice;
var core_push = [].push;

_.defaults = function (obj, opts) {
	if (!opts || !_.isPlainObject(opts)) {
		return false;
	}

	var prop,
		value,
		overWrite;

	for (prop in opts) {
		if (core_hasOwn.call(opts, prop)) {
			value = opts[prop];
			if (_.isUndefined(obj[prop]) && !_.isUndefined(value)) {
				obj[prop] = value;
			}
			else if (!_.isUndefined(obj[prop]) && !_.isUndefined(value)) {
				(overWrite || (overWrite = {}))[prop] = value;
			}
		}
	}

	return !overWrite ? true : overWrite;
};

_.inherits = function (subClass, superClass) {
	subClass.super_    = superClass;
	subClass.prototype = Object.create(superClass.prototype, {
		constructor: {
			value        : subClass,
			enumerable   : false,
			writable     : true,
			configurable : true
		}
	});
};

_.extend = _.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// Skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !_.isFunction(target) ) {
		target = {};
	}

	// Extend _ itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( _.isPlainObject(copy) || (copyIsArray = _.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && _.isArray(src) ? src : [];

					} else {
						clone = src && _.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = _.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

_.onlyOnce = function (callback) {
	var name = (callback && callback.name) || 'NO_NAME';
	return function () {
		if (callback === null) {
			throw new Error("callback " + name + " has already been called.");
		}
		callback.apply(null, core_slice.call(arguments));
		callback = null;
	};
};

var SIG_STOP = 1;

_.series = function(arr, iterator, callback) {
	arr = arr.slice();

	var	done = _.onlyOnce(callback);

	if (!arr.length) {
		return done(null);
	}

	var	complete = 0,
		results = [];

	(function next(error, value) {
		if (complete > 0) {
			results.push(value);
		}

		if (_.hasError(error)) {
			done(error);
		}
		else if (error === SIG_STOP || complete >= arr.length) {
			done(null, results);
		}
		else {
			iterator(arr[complete++], next);
		}
	})();

	return arr;
};

/**
 * @param: done {Function} : 1st time: hold it, but should'nt set next
 * @param: next {Function} : iterate the walk route, with {done} as the last
 */

_.seriesCallback = function (next, done) {
	return function (error, value) {
		if (_.hasError(error)) {
			done(error);
		}
		else {
			if (next) {
				next(null, value);
			}
			else {
				done(null, value);
			}
		}
	};
};

_.parellel = function (arr, iterator, callback) {
	arr = arr.slice();

	var done = _.onlyOnce(callback);

	if (!arr.length) {
		return done(null);
	}

	var	length = arr.length,
		complete = 0,
		hasError = false,
		hasDone = false,
		results = [],
		next = function (error, value) {
			complete++;
			results.push(value);

			if (_.hasError(error)) {
				hasError = true;
				done(error);
			}
			else if (error === SIG_STOP || complete >= length) {
				hasDone = true;
				done(null, results);
			}
		},
		progress = function (value) {
			if (!hasError && !hasDone) {
				iterator(value, next);
			}
		};

	return _.each(arr, progress);
};

_.parellelCallback = _.seriesCallback;

var __cwd = '';

_.cwd = function () {
  return __cwd;
};

_.setCwd = function (dir) {
  __cwd = dir;
};

})(_);


;(function (_) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

//------------------------------
var process = {
	platform : 'win32'
};
var rfileOrHttp = /^([A-Z]\:|file\:|http\:)([\/]+)/i;
var rfile = /^(file\:)([\/]+)/i;
var rhttp = /^(http\:)([\/]+)/i;
//------------------------------

var util = _;
var isWindows = process.platform === 'win32';

// resolves . and .. elements in a path array with directory names there
// must be no slashes or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {

  var res = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];

    // ignore empty parts
    if (!p || p === '.') {
      continue;
    }

    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop();
      } else if (allowAboveRoot) {
        res.push('..');
      }
    } else {
      res.push(p);
    }
  }

  return res;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/|[A-Z]\:|file\:\/\/\/|http\:\/\/)?([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var posix = {};


function posixSplitPath(filename) {
  return splitPathRe.exec(filename).slice(1);
}

// path.resolve([from ...], to)
// posix version
posix.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : util.cwd();

    // Skip empty and invalid entries
    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/' || rfileOrHttp.test(path);
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(resolvedPath.split('/'),
                                !resolvedAbsolute).join('/');
  //-----------
  resolvedPath = resolvedPath.replace(rfile, '$1///').replace(rhttp, '$1//');

  return ((resolvedAbsolute && !rfileOrHttp.test(resolvedPath) ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
posix.normalize = function(path) {

  var isAbsolute = posix.isAbsolute(path),
     //if src path trail has /, so the last step must add this /
     trailingSlash = path.substr(-1) === '/';

  path = normalizeArray(path.split('/'), !isAbsolute).join('/');
  //-----------
  path = path.replace(rfile, '$1///').replace(rhttp, '$1//');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute && !rfileOrHttp.test(path) ? '/' : '') + path;
};

// posix version
posix.isAbsolute = function(path) {
  return typeof path === 'string' && (path.charAt(0) === '/' || rfileOrHttp.test(path));
};

// posix version
posix.join = function() {
  var path = '';
  for (var i = 0; i < arguments.length; i++) {
    var segment = arguments[i];
    if (!util.isString(segment)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    if (segment) {
      if (!path) {
        path += segment;
      } else {
        path += '/' + segment;
      }
    }
  }

  return posix.normalize(path);
};


// path.relative(from, to)
// posix version
posix.relative = function(from, to) {
  from = posix.resolve(from).substr(1);
  to = posix.resolve(to).substr(1);
  var i;

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') {
      	break;
      }
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') {
      	break;
      }
    }

    if (start > end) {
    	return [];
    }
    return arr.slice(start, end + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};


posix._makeLong = function(path) {
  return path;
};


posix.dirname = function(path) {
  var result = posixSplitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


posix.basename = function(path, ext) {
  var f = posixSplitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


posix.extname = function(path) {
  return posixSplitPath(path)[3];
};


posix.format = function(pathObject) {
  if (!util.isObject(pathObject)) {
    throw new TypeError(
        "Parameter 'pathObject' must be an object, not " + typeof pathObject
    );
  }

  var root = pathObject.root || '';

  if (!util.isString(root)) {
    throw new TypeError(
        "'pathObject.root' must be a string or undefined, not " +
        typeof pathObject.root
    );
  }

  var dir = pathObject.dir ? pathObject.dir + posix.sep : '';
  var base = pathObject.base || '';
  return dir + base;
};


posix.parse = function(pathString) {
  if (!util.isString(pathString)) {
    throw new TypeError(
        "Parameter 'pathString' must be a string, not " + typeof pathString
    );
  }
  var allParts = posixSplitPath(pathString);
  if (!allParts || allParts.length !== 4) {
    throw new TypeError("Invalid path '" + pathString + "'");
  }
  allParts[1] = allParts[1] || '';
  allParts[2] = allParts[2] || '';
  allParts[3] = allParts[3] || '';


  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, allParts[1].length - 1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
  };
};


posix.sep = '/';
posix.delimiter = ':';

 _.path = posix;

})(_);

;(function (global, _, undefined) {
var path = _.path,
	series = _.series,
	parellel = _.parellel,
	rfid = /([\s\S]+)(?:@([\s\S]+|))$/,
	readysLen = 0,
	readys = {},
	isAllReady = false,
	isDomReady = false,
	hasManualSetBase = false,

	util = {
		toAbsFile : function (file, ext, dir) {
			file = util.getFileName(file);
			ext = ext || '.js';

			var noExt = !(new RegExp(ext + '$').test(file));

			file = noExt ? file + ext : file;
			file = !path.isAbsolute(file) ?
				path.join(dir || Module.curDir || _.cwd(), file) :
				file;

			if (!path.isAbsolute(file)) {
				throw new Error('file is not absolute: ' + file);
			}
			return file;
		},

		fileToFid : function (url, ext, dir, name) {
			if (path.isAbsolute(url) && rfid.test(url)) {
				return url;
			}

			var parts = rfid.exec(url) || [],
				file = parts[1] || url,
				id = parts[2],
				fid;

			file = util.toAbsFile(file, ext, dir);
			id = name || id || '@' + define.genModuleName(file);
			fid = file + (id[0] !== '@' ? '@' + id : id);

			return fid;
		},

		getFileName : function (fid) {
			return /@.+$/.test(fid) ?
				fid.replace(rfid, '$1') :
				fid;
		},

		getId : function (url, addPrefix) {
			var id = (rfid.exec(url) || [])[2] || '';
			return !addPrefix ? id : (id && '@' + id) || '';
		},

		noop : 	_.noop,

		error : function  (e) {
			throw new Error(e);
		}
	},

	//wwwReg = /^((?:https?|www|localhost)\:\/\/[^\/]+)\/?(.+)/,
	winLoc = window.location.toString(),

	map = {
		files : {},
		mods : {},
		depsInner : {},
		alias: {},
		//set process cwd for nodejs path
		gurl : winLoc,
		//gurl : (isFE && window.location.toString().replace(wwwReg, '$1')) || __filename,
		//can set another base dirname with flex require modules
		gdir : path.dirname(winLoc)
	};

//map.gdir = wwwReg.test(map.gurl) ? map.gurl : path.dirname(map.gurl);
//map.gdir = map.gdir;
_.setCwd(map.gdir);
//console.log(wwwReg.test(map.gurl));

function define(name, deps, factory) {

	var len = arguments.length;

	switch (len) {
		case 0 :
			throw new Error('define: no arguments');
		case 1 :
			if (_.isArray(name)) {
				factory = void 0;
				deps = name;
			}
			else {
				factory = name;
				deps = null;
			}
			name = define.genModuleName();
			break;
		case 2 :
			factory = deps;
			if (_.isString(name)) {
				deps = null;
			}
			else if (_.isArray(name)) {
				deps = name;
				name = define.genModuleName();
			}
			break;
	}

	if (!name || typeof name !== 'string') {
		throw new Error('define: no name or name not string');
	}
	if (deps && !_.isArray(deps)) {
		throw new Error('define: deps not array');
	}
	if (deps && !deps.length) {
		deps = null;
	}

	new Module(name, deps, factory);
}

define.genModuleName = function (url) {
	var name,
		dirname,
		filename = !url ? Module.curFile : url;

	if (!filename || typeof filename !== 'string') {
		throw new Error('define.genModuleName: no filename or not string: ' + filename);
	}

	filename = util.getFileName(filename);
	name = path.basename(filename).replace(path.extname(filename), '');

	if (name === 'index') {
		dirname = path.dirname(filename);
		name = path.basename(dirname).replace(path.extname(dirname), '');
	}

	return name;
};

function Module(name, deps, factory) {
	name = util.getFileName(name);
	name = !path.isAbsolute(name) ? name : define.genModuleName(name);

	var opts = require.opts || {},
		options = opts.options || { extname : '.js' },
		extname = options.extname,
		isInner = map.depsInner[Module.curFile],
		fid = isInner ?
			Module.curFile + '@' + name :
			util.fileToFid(Module.curFile, extname, Module.curDir, name),
		filename = util.getFileName(fid),
		dirname = path.dirname(filename),
		toAbs;

	if (filename !== Module.curFile) {
		console.log(filename, fid, name);
		throw new Error('Module: filename !== Module.curFile');
	}
	if (Module.mods[fid]) {
		throw new Error('Module: fid repeat: ' + fid);
	}
	Module.mods[fid] = this;

	if (deps) {
		toAbs = isInner ?
			Module.toDepsInner(filename) :
			Module.toAbsFile(extname, dirname);
	}

	_.extend(this, {
		id : Module.imid++,
		guid : File.ifile + '@' + name,
		fid : fid,
		name : name,
		factory : factory,
		exports : null,
		loaded : false,
		dirname : dirname,
		filename : filename,
		parents : [],
		children : [],
		childs : [],
		deps : deps && deps.map(toAbs),
		depsLoaded : !deps,
		extname : extname,
		file : null,
		isTarget : false
	});

	this.init();
}

_.extend(Module, {
	imid : 0,
	moduleIndex : 0,
	mods : {},
	targets : [],
	fileStack : [],
	dirStack : [],
	curDir : map.gdir,
	prevDir : null,
	curFile : map.gurl,
	prevFile : null,
	factories : {},

	setTarget : function (mod, url) {
		mod.isTarget = Module.targets.indexOf(mod.fid) > -1 ||
			Module.targets.indexOf(mod.filename) > -1 ||
			( url && (url === mod.fid) );
	},

	resetTargets : function (url) {
		_.each(Module.mods, function (mod) {
			Module.setTarget(mod, url);
		});
	},

	setFile : function (file) {
		Module.prevFile = Module.curFile;
		Module.curFile = file;
	},

	backFile : function () {
		Module.curFile = Module.prevFile;
		Module.prevFile = null;
	},

	setDir : function (dir) {
		Module.prevDir = Module.curDir;
		Module.curDir = dir;
	},

	backDir : function () {
		Module.curDir = Module.prevDir;
		Module.prevDir = null;
	},

	toAbsFile : function(ext, curDir) {
		return function (url) {
			//if url no ./, this fn would try to find the alias
			return map.alias[url] || util.toAbsFile(url, ext, curDir);
		};
	},

	toDepsInner : function (filename) {
		return function (name) {
			return filename + '@' + name;
		};
	},

	setExports : function (mod, factory, deps) {
		var	exports,
			result,
			req,
			obj;

		if (!_.isFunction(factory)) {
			mod.exports = factory;
		}
		else {
			req = mod.require.bind(mod);

			if (deps) {
				obj = { require : req };
				mod.exports = factory.apply(obj, deps);
			}
			else {
				mod.exports = exports = {};
				result = factory(req, exports, mod);
				mod.exports = !_.isEmptyObject(exports) ?
					exports :
					!_.isEmptyObject(mod.exports) ?
						mod.exports :
						result;
			}
		}
	},

	genExports : function (name, done, fail, options) {
		var mod,
			fid,
			factory,
			deps,
			exports,
			result,
			id,
			filename,
			base;
		// fail = fail || util.error;
		options = options || {};

		if (typeof name === 'object') {
			mod = name;
		}
		else if (typeof name === 'string') {
			filename = util.toAbsFile(name);
			base = define.genModuleName(filename);
			fid = options.fid ?
				options.fid :
				util.fileToFid(
					options.filename || filename,
					options.extname || '.js',
					options.dirname || _.cwd(),
					options.name || base || null
				);
			mod = Module.mods[fid];
		}

		if (mod === void 0 || !mod.fid || !Module.mods[mod.fid]) {
			return fail ? fail() : void 0;
		}

		mod.isTarget = true;

		if (mod.loaded) {
			return done ? done(mod.exports, mod) : mod.exports;
		}

		Module.factories[mod.fid] = Module.factories[mod.fid] || mod.factory;

		if (!mod.deps || mod.depsLoaded) {
			factory = mod.factory;
			deps = mod.deps;
			mod.factory = null;
			mod.deps = null;
			Module.setExports(mod, factory, deps);
		}
		else {
			require.loadings.push(mod.filename);

			return require.loadDependences(mod, function (mod) {

				var index = require.loadings.indexOf(mod.filename);
				if (index < 0) {
					throw new Error('require.accessModuleExports: require.curLoadingUrls: mod.name: ' + mod.name + ' : index < 0: ' + mod.filename);
				}
				require.loadings.splice(index, 1);

				mod.depsLoaded = true;
				return Module.genExports(mod, done);
			});
		}

		require.setReady(mod.fid, true);
		mod.loaded = true;

		return done ? done(mod.exports, mod) : mod.exports;
	}
});


Module.prototype = {

	constructor : Module,

	init : function () {
		var filename = this.filename;

		if (!(File.files[filename])) {
			File.files[filename] = new File(filename);
		}
		File.files[filename].setModule(this);
		Module.setTarget(this);
		require.setReady(this.fid, false);
	},

	genExports : function (next, fail, options) {
		if (this.loaded) {
			return !next ? this.exports : next();
		}

		var self = this,
			done = function (exports, mod) {
				require.setReady(mod.fid, true);
				self.file.checkLoaded();
				next();
			};
		Module.genExports(self, done, fail, options);
	},

	require : function (url, done, fail, options) {
		var fid, file, id, mod, self = this;

		options = _.isPlainObject(options) ? options : {};

		if (options.fid) {
			fid = options.fid;
		}
		else {
			if (path.isAbsolute(url)) {
				fid = url;
			}
			else if (/^[^\.]/.test(url)) {
				fid = self.filename + '@' + url;
			}
			else {
				file = util.toAbsFile(util.getFileName(url), null, self.dirname);
				id = util.getId(url, false) || define.genModuleName(file);
				fid = file + '@' + id;
			}
		}

		mod = Module.mods[fid];

		if (mod) {
			if (mod.loaded) {
				return done ? done(mod.exports, mod) : mod.exports;
			}
			if (!~self.childs.indexOf(fid)) {
				self.childs.push(fid);
			}

			return Module.genExports(mod, function (exports, mod) {

				if (
					require.debugType === 'escape' &&
					~mod.childs.indexOf(self.fid) &&
					~self.childs.indexOf(mod.fid)
				) {
					console.warn(self.name + '<--->' + mod.name);
					console.warn(self.fid + '<--->' + mod.fid);
					console.warn('should not fire directly! just use each other in a callback with require');
					throw new Error('==========redeps==========');
				}

				return done ? done(exports, mod) : exports;
			});
		}
	},

	resolveRecursive : function (mod) {},
	findParent : function (name) {},
	findChild : function (name) {},
	findBrother : function (name) {}
};

function File(filename) {
	this.filename = filename;
	this.dirname = path.dirname(filename);
	this.modules = {};
	this.stack = [];
	this.fids = [];
	this.loaded = false;
	this.exports = null;
	this.resolved = false;
	this.children = null;
	this.parents = null;
	this.isEmpty = false;
}

File.files = {};
File.ifile = 0;

File.prototype = {
	constructor : File,

	setModule : function (mod) {
		if (this.modules[mod.name]) {
			throw new Error('File.setModule: name repeat: ' + this.filename + ' ' + mod.name);
		}
		if (this.filename !== mod.filename) {
			throw new Error('File.setModule: this.filename !== mod.filename');
		}

		this.modules[mod.name] = mod;
		this.stack.push(mod);
		this.fids.push(mod.fid);
		mod.file = this;
	},

	collectExports : function () {
		var arr = [],
			obj = _.map(this.modules, function (mod) {
				if (mod.loaded) {
					this.push(mod.exports);
					return mod.exports;
				}
			}, arr);
		return { obj : obj, arr : arr	};
	},

	checkLoaded : function () {
		if (this.resolved) {
			return;
		}
		this.loaded = this.stack.every(function (mod) {
			return mod.loaded;
		});
		if (!this.loaded) {
			return;
		}

		this.resolved = true;
		this.exports = this.stack.length === 1 ?
			this.collectExports().arr[0] :
			this.collectExports().obj;

		if (this.stack.length === 1) {
			var one = this.stack[0] || {};
			this.children = one.children;
			this.parents = one.parents;
			return;
		}

		var name = define.genModuleName(this.filename),
			fid = this.filename + '@' + name;

		if (!Module.mods[fid]) {
			var children = [],
				parents = [],
				dir,
				file,
				mod;

			_.each(this.stack, function (mod) {
				children = children.concat(mod.children);
				parents = parents.concat(mod.parents);
			});
			this.children = children;
			this.parents = parents;

			dir = Module.curDir;
			file = Module.curFile;
			Module.curDir = this.dirname;
			Module.curFile = this.filename;

			mod = new Module(name, null, null, null);

			Module.curDir = dir;
			Module.curFile = file;

			mod.loaded = true;
			mod.isTarget = true;
			mod.factory = null;
			mod.exports = this.exports;
			mod.parents = parents;
			mod.children = children;
			require.setReady(fid, true);
		}
	},

	genOne : function (url, done, fail, options) {
		var fid, mod;

		if (typeof url === 'string') {
			if (rfid.test(url)) {
				fid = url;
			}
			else {
				fid = util.fileToFid(url);
			}
			mod = Module.mods[fid];
		}
		else if (typeof url === 'object' &&
			url.fid && Module.mods[url.fid]) {
			mod = url;
		}

		if (mod) {
			var ret = mod.loaded ?
				mod.exports :
				mod.genExports(function () {
					self.checkLoaded();
					done.apply(null, arguments);
				});

			return !ret ? true : ret;
		}
	},

	genAllExports : function (done, fail, options) {
		_.each(this.modules, function (mod) {
			mod.isTarget = true;
		});
		this.genExports(done, fail, options);
	},

	genExports : function (done, fail, options) {
		options = options || {};
		done = done || util.noop;
		fail = fail || util.error;

		var self = this,
			iterator = function (mod, next) {
				if (mod.isTarget) {
					if (mod.loaded) {
						next();
					}
					else {
						mod.genExports(next, fail, options);
					}
				}
				else {
					next();
				}
			},
			callback = function (e) {
				if (_.hasError(e)) {
					return fail(e);
				}

				var results = self.collectExports(),
					isMany = self.stack.length > 1,
					mods =  !isMany ? self.stack[0] : self.stack.slice(),
					exports = options.exportsType === 'object' ? results.obj :
									 !isMany ? results.arr[0] : results.arr.slice();

				self.checkLoaded();
				done(exports, mods);
			};
		series(self.stack, iterator, callback);
	}
};

function require(url, done, fail, options) {
	var opts, deps, id;

	if (_.isPlainObject(url)) {
		opts    = url;
		url     = opts.url;
		deps    = opts.deps;
		done    = opts.done;
		fail    = opts.fail;
		options = opts.options || { extname : '.js' };
	}
	else {
		options = _.isPlainObject(options) ? options :
						  _.isPlainObject(fail) ? fail :
						  _.isPlainObject(done) ? done : { extname : '.js' };
		fail = (_.isFunction(fail) && fail) || null;
		done = (_.isFunction(done) && done) || null;

		if (_.isArray(url)) {
			deps = url.map(function (url) {
				return map.alias[url] || util.toAbsFile(url, options.extname, Module.curDir || _.cwd()) + util.getId(url, true);
			});
			url = null;
		}
		else if (_.isString(url)) {
			url = map.alias[url] || util.toAbsFile(url, options.extname, Module.curDir || _.cwd()) + util.getId(url, true);
			deps = null;
		}
		else {
			throw new Error('require: wrong type for url');
		}
	}

	return require.load(url || deps, done, fail, options);
}

_.extend(require, {
	expando   : 'amd-ninja-require-1.0.0-' + (new Date()),
	cbs       : [],
	isLoading : false,
	loadings  : [],
	stack     : [],
	opts      : null,
	last      : void 0,
	debugType : 'escape',//escape ...
	//====================================================
	//for debug usage
	getDada   : function () {
		return {
			map : map,
			Module: Module,
			File : File,
			require : require,
			define : define,
			isAllReady : isAllReady,
			isDomReady : isDomReady,
			readys : readys
		};
	},
	//
	config : function (opts) {
		//@String
		//hasManualSetBaseDir
		if (opts.baseUrl && !hasManualSetBase) {
			hasManualSetBase = true;
			Module.curDir = path.isAbsolute(opts.baseUrl)
				? opts.baseUrl
				: path.join(_.cwd(), opts.baseUrl);
		}
		//@String
		//escape: escaping single file require redeps directly by mod.childs
		if (opts.debugType) {
			require.debugType = opts.debugType;
		}
		//@String
		//define(name, ([deps] -> changeTo require inner mods), factory)
		if (opts.depsInner) {
			var depsInner = path.isAbsolute(opts.depsInner)
				? opts.depsInner
				: path.join(Module.curDir, opts.depsInner);
			map.depsInner[depsInner] = true;
		}
		//@Object
		if (opts.alias) {
			var alias = _.map(opts.alias, function (value, alias) {
				//alias: no -> './', just a name
				return path.isAbsolute(value)
					? value
					: path.join(Module.curDir, value);
			});
			_.defaults(map.alias, alias);
		}
	},

	load : function (url, done, fail, options) {
		if (typeof url === 'string') {
			return require.loadOne(url, done, fail, options);
		}
		else if (_.isArray(url)) {
			return require.loadMany(url, done, fail, options);
		}
	},

	loadOne : function(url, done, fail, options) {
		Module.targets.push(url);
		Module.resetTargets(url);

		var filename = util.getFileName(url),
			dirname = path.dirname(filename),
			ofile = File.files[filename],
			mod,
			id,
			opts,
			results;

		if (ofile) {
			ofile.checkLoaded();

			mod = Module.mods[url] || Module.mods[filename + '@' + define.genModuleName(filename)];
			if (mod) {
				if (mod.loaded) {
					return done ? done(mod.exports, mod) : mod.exports;
				}
				else {
					return ofile.genOne(mod, done, fail, options);
				}
			}

			if (filename === url) {
				if (ofile.loaded) {
					results = ofile.collectExports();
					results = options.exportsType === 'object' ?
						results.obj :
						results.arr;

					return done ? done(results, ofile.modules) : results;
				}
				else {
					return ofile.genAllExports(done, fail, options);
				}
			}

			throw new Error('repeat require file, and fail to resolve: ' + url);
		}

		Module.setDir(dirname);
		Module.setFile(filename);
		require.setReady(url, false);
		require.setReady(filename, false);
		opts = {
			url      : url,
			filename : filename,
			dirname  : dirname,
			done     : done,
			fail     : fail,
			options  : options
		};
		require.opts = opts;

		if (isFE) {
			require.simpleLoadScript(opts);
		}
		else {
			throw new Error('require.load: nodejs not support yet !');
		}

	},
	//
	simpleLoadScript :  function (opts) {
		var options = opts.options,
			head = document.querySelector('head'),
			baseElement = head.querySelector('base'),
			element = document.createElement(options.tag || 'script'),
			filename = path.relative(_.cwd(), opts.filename),
			skips;

		if (options.attributes) {
			skips = ['tag', 'onload', 'onerror', 'ninja-module-index', 'src', 'async', 'type', 'href', 'rel'];
			_.each(options.attributes, function (v, k) {
				if (!~skips.indexOf(k)) {
					this.setAttribute(k, v);
				}
			}, element);
		}

		if (!options.tag || options.tag === 'script') {
			element.src = filename;
			element.type = options.type || 'text/javascript';
			element.async = options.async || true;
		}
		else if (options.tag === 'link') {
			element.href = filename;
			element.type = 'text/css';
			element.rel = 'stylesheet';
		}

		element.setAttribute('ninja-module-index', Module.moduleIndex++);
		element.setAttribute('charset', options.charset || 'utf-8');

    if (baseElement) {
      head.insertBefore(element, baseElement);
    }
    else {
      head.appendChild(element);
    }

		element.onload = require.onLoadScript(element, opts.done, opts);
		element.onerror = require.onLoadScriptError(element, opts.fail, opts);
	},

	onLoadScript : function(script, done, opts) {
		return function (e) {
			script.onload  = null;
			script.onerror = null;
			// require.isLoading = false;
			require.opts = null;

			var ofile = File.files[opts.filename],
				options = opts.options,
				onDone = function (exports, mod) {
					File.ifile++;
					Module.backDir();
					Module.backFile();
					require.setReady(opts.url, true);
					require.setReady(opts.filename, true);

					if (done) {
						done(exports, mod);
					}
					if (!require.last || require.last === opts.filename) {
						require.last = null;
						require.setReady(require.expando, true);
					}
				},
				onFail = util.error;

			if (!ofile) {
				ofile = File.files[opts.filename] = new File(opts.filename);
				ofile.loaded = true;
				ofile.resolved = true;
				ofile.isEmpty = true;
				onDone(null, null);
			}
			else {
				options.exportsType = options.exportsType || 'array';
				ofile.genExports(onDone, onFail, options);
			}

			return false;
		};
	},

	removeElement : function (element) {
		element.onload  = null;
		element.onerror = null;
		document.querySelector('head').removeChild(element);
	},

	onLoadScriptError : function (script, fail, opts) {
		return function (e) {
			require.removeElement(script);
			if (fail) {
				fail(new Error(opts.url));
			}
			throw new Error(opts.url);
		};
	},

	loadMany : function (deps, done, fail, options) {
		fail = fail || util.error;
		require.last = deps[deps.length - 1];

		var	loadEach = function (depUrl, next) {
				require(depUrl, function (exports) {
					next(null, exports)
				}, fail, options);
			},
			onLoadDone = function (e, results) {
				if (_.hasError(e)) {
					fail(e);
				}
				else if (done) {
					done(results);
				}
			};
		series(deps, loadEach, onLoadDone);
	},

	loadDependences : function (mod, done, options) {
		options = options || {};

		var deps = mod.deps,
			isInner = map.depsInner[mod.filename],
			req = isInner ? mod.require.bind(mod) :	require,
			fail = util.error,
			loadDeps = function () {
				series(deps, loadEach, function (e) {
					if (e) {
						fail(e.message);
					}
					else {
						done(mod);
					}
				});
			},
			loadEach = function (url, next) {
				var filename = util.getFileName(url),
					whenLoad, info;

				if (~require.loadings.indexOf(filename) && !isInner) {
					info = 'loadWholeMod: redeps: ' + '\n' +
						' --- ' + '[mod.name]' + ' --- ' + '\n' + mod.name + '\n' +
						' --- ' + '[mod.filename]' + ' --- ' + '\n' + mod.filename + '\n' +
						' --- ' + '[deps]' + ' --- ' + '\n' + deps.join('\n') + '\n' +
						' --- ' + '[require.loadings]' + ' --- '+ '\n' + require.loadings.join('\n') + '\n';
					console.warn(info);
					return fail(info);
				}

				whenLoad = function (exports, subMod) {
					if (subMod) {
						if (subMod.parents) {
							subMod.parents.push(mod.fid);
							mod.children.push(subMod.fid);
						}
						else if (_.isPlainObject(subMod) || _.isArray(subMod)) {
							_.each(subMod, function (subMod) {
								subMod.parents.push(this.fid);
								this.children.push(subMod.fid);
							}, mod);
						}
					}

					if (!mod.deps) {
						throw new Error('loadDependences: whenLoad: mod.deps should not falsy: ' + mod.fid);
					}
					mod.deps.push(exports);

					next();
				};

				req(url, whenLoad, fail, options);
			};

		mod.deps = [];
		loadDeps();
	},

	setReady : function (other, isReady) {
		if (isAllReady) {
			return;
		}

		if (typeof other === 'string') {
			if (readys[other] === void 0) {
				readys[other] = false;
				readysLen++;
			}

			if (isReady === true && readys[other] === false) {
				readys[other] = true;
				require.completeReady();
			}
		}
		else if (_.isPlainObject(other)) {
			_.each(other, function (v, key) {
				require.setReady(key, v);
			});
		}
		else if (_.isArray(other)) {
			_.each(other, function (key) {
				require.setReady(key);
			});
		}
	},

	toReady : function (fn) {
		if (_.isFunction(fn)) {
			require.cbs.push(fn);
		}
	},

	setReadyForNinja : function (_) {
		var mods = {};
		_.each(Module.mods, function (mod, k) {
			var name = (rfid.exec(k) || [])[2];
			if (!name) {
				throw new Error('no name: ' + k);
			}
			if (this[name] && name !== 'loader') {
				throw new Error('repeat name: ' + name);
			}
			this[name] = mod.exports;
		}, mods);

		_.module = function (name) {
			return !name ? mods : mods[name];
		};
	},

	fireReady : function () {
		var cbs = require.cbs.slice();
		require.cbs = [];

		if (isAllReady && cbs.length) {
			cbs.unshift(require.setReadyForNinja);
			Module.setDir(_.cwd());
			Module.setFile(map.gurl);
			_.each(cbs, function (cb) {
				cb(_);
			});
		}
	},

	completeReady : (function (readys) {
		var isBindFns = false,

			completeDomReady = function () {
				if (!isDomReady) {
					isDomReady = true;
					offDomCompleted();
				}
			},

			allReady = function () {
				if (!isAllReady) {
					isAllReady = true;
					require.fireReady();
				}
			},

			offDomCompleted = function () {
				if (isBindFns) {
					isBindFns = false;
					document.removeEventListener( "DOMContentLoaded", completeDomReady, false );
					window.removeEventListener( "load", completeDomReady, false );
				}
			},

			watchDomCompleted = function () {
				if ( document.readystate === "complete" ) {
					setTimeout(completeDomReady);
				}
				else {
					isBindFns = true;
					document.addEventListener( "DOMContentLoaded", completeDomReady, false );
					window.addEventListener( "load", completeDomReady, false );
				}
			},

			completeReady = function () {
				var noOthers = readysLen === 0;

				if (!noOthers) {
					noOthers = _.every(readys, function (v) {
						return v === true;
					});
					if (noOthers) {
						readysLen = 0;
					}
				}

				if (noOthers && isDomReady) {
					allReady();
				}
			};
		completeReady.init = watchDomCompleted;

		return completeReady;
	})(readys),

	ready : function (fn) {
		if (!isAllReady) {
			require.toReady(fn);
		}
		else {
			fn(_);
		}
	}
});

	if (isFE) {
		require.completeReady.init();
	}
	else {
		isDomReady = true;
		_.require = require;
	}
	require.setReady(require.expando, false);

	if (isFE) {

		(function () {
			var head = document.querySelector('head');
			var	scripts = head.querySelectorAll('script');
			var	ninjaScript = _.filter(scripts, function (script) {
				return !!(script.getAttribute('src')
					|| '')
					.match(/ninja_core/);
			});

			if (ninjaScript.length !== 1) {
				throw new Error('ninja_core is not only one');
			}
			ninjaScript = ninjaScript[0];

			var	ninjaBaseUrl = path.isAbsolute(ninjaScript.src)
					? path.dirname(ninjaScript.src)
					: path.dirname(path.join(_.cwd(), ninjaScript.src));
			var	main;
			var	appUrl;

			require.config({
				alias : {
					ninja       : path.join(ninjaBaseUrl, './ninja.js'),
					vars        : path.join(ninjaBaseUrl, './deps/vars.js'),
					support     : path.join(ninjaBaseUrl, './deps/support.js'),
					data_priv   : path.join(ninjaBaseUrl, './deps/data_priv.js'),
					data_user   : path.join(ninjaBaseUrl, './deps/data_user.js'),
					assert      : path.join(ninjaBaseUrl, './pkgs/assert/index.js'),
					test        : path.join(ninjaBaseUrl, './pkgs/simple_test/index.js'),
					promise     : path.join(ninjaBaseUrl, './pkgs/promise/index.js'),
					events      : path.join(ninjaBaseUrl, './pkgs/events/index.js')
				}
			});

			if (!(main = ninjaScript.getAttribute('main'))) {
				return;
			}

			appUrl = path.relative(_.cwd(),
				util.getFileName(!path.isAbsolute(main)
					? path.join(map.gdir, main)
					: main));
			head
				.appendChild(document.createElement('script'))
				.setAttribute('src', appUrl);
		})();
	}
	else {
		require.config({
			alias : {
				ninja     : path.join(__dirname, './ninja.js'),
				vars      : path.join(__dirname, './deps/vars.js'),
				support   : path.join(__dirname, './deps/support.js'),
				data_priv : path.join(__dirname, './deps/data_priv.js'),
				data_user : path.join(__dirname, './deps/data_user.js')
			}
		});
	}
//	console.log(_.cwd());
//	console.log(window.location);
	define.amd = {};
	global.define = define;
	global.require = require;

})(this, _);

})(this);