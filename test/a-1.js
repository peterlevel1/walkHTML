function getProps(obj, str) {
	var arr = str.match(/[\w-]+/g);
	if (!arr) return void 0;
	var i = -1, len = arr.length;
	while (++i < len && (obj = obj[arr[i]]) != null) {}
	return obj;
}

var str = 'a.xA["a-b-1"].a[b]';
var str2 = 'a.a4["a-b-1"].a[d]';

console.log(getProps({
	a : {
		xA : {
			"a-b-1" : {
				a : {
					b : 111111,
					c : 'aaaaaa'
				}
			}
		}
	}
}, str));

console.log(getProps({
	a : {
		xA : {
			"a-b-1" : {
				a : {
					b : 111111,
					c : 'aaaaaa'
				}
			}
		}
	}
}, str2));