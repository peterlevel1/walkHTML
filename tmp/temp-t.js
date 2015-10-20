	// var str2 =
	// 		'<div>'
	// 			+ '<div ---="1" {{ loop:arr $v1 $i }} >'
	// 				+ '<div ---="2" {{ loop:arr $v2 $i }} >'
	// 					+	'<div ---="3-1" {{ loop:arr2 $v3-1 }} >'
	// 						+ 'value = {{ $value.y }} -- {{ $v1.x }}'
	// 					+ '</div>'
	// 					+	'<div ---="3-2" {{ loop:arr2 $v3-2 }} >'
	// 						+ 'value = {{ $value.y }} -- {{ a.x }}'
	// 					+ '</div>'
	// 				+ '</div>'
	// 			+ '</div>'
	// 	+ '</div>';

	// var fn = t(str2);
	// // console.log(fn);

	// var data = {
	// 	a : {
	// 		x : 'ax ax ax'
	// 	},
	// 	arr : [
	// 		{ x : 'arr:x 0' },
	// 		{ x : 'arr:x 1' }
	// 	],
	// 	arr2 : [
	// 		{ y : 'arr:y 0' },
	// 		{ y : 'arr:y 1' }
	// 	]
	// };
	// var str = fn(data);
	// console.log(str);
	// var str =
	// 		'<div>'
	// 	+		'<ul>'
	// 	+			'<li {{ loop:arr }} >'
	// 	+				'{{ $value.x }} {{ a.x }}'
	// 	+			'</li>'
	// 	+		'</ul>'
	// 	+	'</div>';

	// var ret1 = t(str, {
	// 	a : {
	// 		x : 'ax ax ax'
	// 	},
	// 	arr : [
	// 		{ x : 'arr:x 0' },
	// 		{ x : 'arr:x 1' },
	// 		{ x : 'arr:x 2' }
	// 	]
	// });
	// console.log(ret1);

// <div>
// 	<div ---="1">
// 		<div ---="2">
// 			index = 0
// 		</div>
// 		<div ---="2">
// 			index = 1
// 		</div>
// 		<div ---="2">
// 			index = 2
// 		</div>
// 	</div>

// 	<div ---="1">
// 		<div ---="2">
// 			index = 1
// 		</div>
// 		<div ---="1">
// 			<div ---="2">
// 				index = 2
// 			</div>
// 		</div>
// </div>


/*

	var tags = [
		'<div>',
			'<ul>',
				'<li>',
					'<link rel="stylesheet" href="#" />',
				'</li>',
			'</ul>',
		'</div>'
	];

	// var end = getTagEndIndex(tags, 3);
	// var match = rtag.exec('<ul>');
	// console.log(end);

	var rtag1 = /<(\/)?([a-zA-Z]+) ?([^>]+)?>/;
	// var rtag2 = /<(\/)?([a-zA-Z]+) ?([^>]+\/?)?>/g;
	// var str = '<link rel="stylesheet" href="" />'
	// var match = rtag2.exec(str);
	// console.log(match);

	var str = '<link  >';
	var match = rtag.exec(str);
	// console.log(match);
	var str2 = '{{ loop:data.a val index }}';
	var match2 = rloop.exec(str2);
	// console.log(match2);
	var str3 = 'a.b.c';
	var obj3 = {
		a : {
			b : {
				c : 1
			}
		}
	};
	// var data3 = getData(str3, obj3);
	// console.log(data3);

	var str4 = '$aaa.a[1].x';
	var loopData4 = {
		//$val
		value : {
			a : [
				{ x : '....' },
				{ x : 'str4' }
			]
		},
		//$index
		index : 0
	};
	var data4 = getData(str4, null, loopData4, '$aaa');
	// console.log(data4);
*/