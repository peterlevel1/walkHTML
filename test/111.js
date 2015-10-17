var rmethods = /--([\w]+)(?:([^-"'}]+|))/g;
var str = '--ppp --iii';
var one;
while ((one = rmethods.exec(str))) {
	console.log(one);
}