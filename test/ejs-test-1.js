
var ejs = require('../pkgs/ejs/index.js');
var fs = require('fs');
var getContent = function (filename, callback) {
	fs.readFile(filename, 'utf8', callback);
};

getContent('./ejs-test-1.html', function (err, str) {
	if (err) {
		throw err;
	}
	// console.log(str2);
	console.time('ejs');
	var i = -1;
	var len = 1;
	var str2;
	while (++i < len) {
		str2 = ejs.render(str, {
	  	arr : [
	  		{	x : 'arr:0:x', y : 'arr:0:y', z : 'arr:0:z' },
	  		{	x : 'arr:1:x', y : 'arr:1:y', z : 'arr:1:z' },
	  		{	x : 'arr:2:x', y : 'arr:2:y', z : 'arr:2:z' }
	  	]
		});
	}
	console.timeEnd('ejs');
	// console.log(str);
})