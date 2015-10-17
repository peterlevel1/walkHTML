
// var ejs = require('../pkgs/ejs/index.js');
var Controller = require('../libs/controller.js');
var buildTree = require('../libs/buildTree.js');
var fs = require('fs');
var getContent = function (filename, callback) {
	fs.readFile(filename, 'utf8', callback);
};
getContent('./controller-test-1.html', function (err, str) {
	if (err) {
		throw err;
	}
	console.time('controller');
	var i = -1;
	var len = 1;
	var tree;
	var cmd;
	while (++i < len) {
		tree = buildTree(str);
		cmd = new Controller({
			name : 'master',
			tree : tree,
			walk : true,
			data : {
		  	arr : [
		  		{	x : 'arr:0:x', y : 'arr:0:y', z : 'arr:0:z' },
		  		{	x : 'arr:1:x', y : 'arr:1:y', z : 'arr:1:z' },
		  		{	x : 'arr:2:x', y : 'arr:2:y', z : 'arr:2:z' }
		  	]
			}
		});
		// console.log(cmd.$innerHTML);
		// console.log(cmd.$compileArgs);
	}
	console.timeEnd('controller');
	// var str2 = ejs.render(str, {
 //  	arr : [
 //  		{	x : 'arr:0:x', y : 'arr:0:y', z : 'arr:0:z' },
 //  		{	x : 'arr:1:x', y : 'arr:1:y', z : 'arr:1:z' },
 //  		{	x : 'arr:2:x', y : 'arr:2:y', z : 'arr:2:z' }
 //  	]
	// });
	// console.log(str2);
	// console.log(str);
})