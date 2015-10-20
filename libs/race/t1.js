var t = require('../t.js');
exports.name = 't';

var i;
var len = 10000;
exports.loopTime = len;

var result;
var str =
						'<div nt-master="ninja-1">'
	+ '\n' + 		'<div {{ loop:arr }}>'
	+ '\n' + 			'=== repeat-1 : {{ $value.x }}'
	+ '\n' + 			'<ul>'
	+ '\n' + 				'=== repeat-2 : {{! $value.y }}'
	// + '\n' + 				'<li>'
	// + '\n' + 					'=== repeat-3 : {{ $value.z }}'
	// + '\n' + 				'</li>'
	+ '\n' + 			'</ul>'
	+ '\n' + 		'</div>'
	+ '\n' + 	'</div>';

var data = {
	arr : [
		{	x : 'arr:0:x', y : 'arr:0:y<', z : 'arr:0:z' },
		{	x : 'arr:1:x', y : 'arr:1:y', z : 'arr:1:z' },
		{	x : 'arr:2:x', y : 'arr:2:y', z : 'arr:2:z' }
	]
};

i = -1;
exports.renderTime = +(new Date());

while (++i < len) {
	result = t(str, data);
}

exports.renderTime = +(new Date()) - exports.renderTime;

var fn = t(str);


i = -1;
// console.time('tmpl: compiled fn: ');

exports.compileTime = +(new Date());

while (++i < len) {
	result = fn(data);
}
// console.log(result);
exports.compileTime = +(new Date()) - exports.compileTime;
exports.result = result;

console.log(exports);