var fs = require('fs');
var getContent = function (filename, callback) {
	fs.readFile(filename, 'utf8', callback);
};
var htmlToArray = require('../libs/htmlToArray.js');

getContent('./2.html', function (err, str) {
	if (err) {
		throw err;
	}

	var ret = htmlToArray(str);
	console.log(ret);

});