var r1 = /(i)(?!area|br|col|embed|hr|img|input|link|meta|param)/
var str = 'irab';
console.log(r1.exec(str));

var rtagName = /<([\w:-]+)/;
var r2 = /<(|&#?\w+;)/;

console.log(rtagName.exec('<td></td>'));
console.log(r2.exec('<|'));