define([
	'ninja',
	'promise',
	'./plusready'
], function (_, Promise) {

	var path = _.path;
	var factory = Promise.factory;
	var logError = function (info, fail) {
		return function (e) {
			var str = info + ' :' + (_.isError(e) ? e.message : e);
			if (typeof window.outSet === 'function') {
				window.outSet(str);
			}
			else {
				if (fail) {
					fail(str);
				}
				else {
					console.log(str);
				}
			}
			return e;
		};
	};

	var io = plus.io;
	var fs = {};

	fs.DIR_PRIVATE = '_doc/';
	fs.DIR_WWW = '_www/';
	fs.DIR_DOC = '_documents/';
	fs.DIR_DOWNLOAD = '_downloads/';

	/**
	 * @desc check a given object is a entry object
	 * @param {Object} entry
	 * @return {Boolean}
	 */
	fs.isEntry = function (entry) {
		return entry
			&& typeof entry === 'object'
			&& _.isFunction(entry.getMetadata)
			&& entry.isDirectory !== void 0
			&& entry.isFile !== void 0;
	};

	/**
	 * @desc given a str url, get a entry object
	 * @param {String} url
	 * @param {Function} callback
	 * @return void 0
	 */
	fs.getEntry = function (url, callback) {
		io.resolveLocalFileSystemURL(url, function (entry) {
			callback(null, entry);
		}, callback);
	};

	/**
	 * @desc given a [file] str url or entry, get the content of it
	 * @param {String || Object} url
	 * @param {String} mode : defaults: utf8
	 * @param {Function} callback
	 * @return void 0
	 */
	fs.readFile = function (url, mode, callback) {
		if (_.isFunction(mode)) {
			callback = mode;
			mode = 'utf8';
		}

		if (typeof mode !== 'string') {
			mode = 'utf8';
		}

		if (fs.isEntry(url)) {
			return whenReadFile(url);
		}

		io.resolveLocalFileSystemURL(url, whenReadFile, callback);

		function whenReadFile(entry) {
			if (!entry.isFile) {
				return callback(new Error(url + ': is not a file'));
			}

			var reader = new io.FileReader();

			reader.readAsText(entry.toLocalURL(), mode);

			reader.onload = function (event) {
				callback(null, event.target.result);
			};

			reader.onerror = function (event) {
				callback(event.target || event);
			};
		}
	};

	/**
	 * @desc given a [file] str url or entry, write the data to the file
	 * @param {String || Object} url
	 * @param {String} str : the data to write
	 * @param {Function} callback
	 * @return void 0
	 */
	fs.writeFile = function (url, str, callback) {
		if (fs.isEntry(url)) {
			return whenWriteFile(url);
		}

		io.resolveLocalFileSystemURL(url, whenWriteFile, createAndWrite);

		function createAndWrite() {
			var dirname = path.isAbsolute(url)
				? path.dirname(url)
				: (/^([\s\S]+\/)[\s\S]+$/.exec(url) || [])[1];

			if (!dirname) {
				return callback(
					new Error(
					  'fs.writeFile: uncaught error: '
					+ 'url is -> ' + url + ', '
					+ 'file is not exists, '
					+ 'failed to normalize the url to get the dirname, '
					+ 'and get the entry to gen file ......')
				);
			}

			fs.getEntry(dirname, function (err, entry) {
				if (err) {
					return callback(err);
				}
				var opts = { create : true, exclusive : true };
				var basename = path.basename(url);
				var absUrl = entry.toLocalURL() + basename;

				entry.getFile(absUrl, opts, whenWriteFile, callback);
			});
		}


		function whenWriteFile(entry) {
			if (!entry.isFile) {
				return callback(new Error(url + ': is not a file'));
			}

			var absUrl = entry.toLocalURL();
			var writer = new io.FileWriter(absUrl);

			writer.write(str);

			writer.onwrite = function () {
				callback(null);
			};

			writer.onerror = function (event) {
				callback(event.target || event);
			};
		}
	};

	/**
	 * @desc given a str [dir] url or entry, get the entries
	 * @param {String || Object} url
	 * @param {String} mode : only names || all, defaults : only names
	 * @param {Function} callback
	 * @return void 0
	 */
	fs.readdir = function(url, mode, callback) {
		if (_.isFunction(mode)) {
			callback = mode;
			mode = 'only names';
		}

		if (fs.isEntry(url)) {
			return whenReadDir(url);
		}
		io.resolveLocalFileSystemURL(url, whenReadDir, callback);

		function whenReadDir(entry) {
			if (!entry.isDirectory) {
				return callback(new Error(url + ': is not a directory'));
			}
			entry.createReader()
				.readEntries(function (ones) {
					if (mode === 'only names') {
						callback(null, ones.map(function (one) {
							return one.name;
						}));
					}
					else {
						callback(null, {
							dir : entry,
							entries : ones.slice()
						});
					}
				}, callback);
		}
	};

	/**
	 * @desc given a str url or with entry, finally, if exists, get the entry
	 * @param {String || Object} url
	 * @param {Function} callback
	 * @return void 0
	 */
	fs.exsits = function (url, callback) {
		var entry;

		if (fs.isEntry(url)) {
			entry = url;
			url = null;
		}

		if (typeof url === 'string') {
			fs.getEntry(url, callback);
		}
		else if (entry) {
			callback(null, entry);
		}
		else {
			callback(new Error('type error: [arg:entry] is not a entry'));
		}
	};

	return fs;
})
