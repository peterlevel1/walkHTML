require.config({
	baseUrl : '..'
});

require(['./pkgs/events/index', './libs/buildTree']);

require.ready(function (_) {
	var EE = _.module('events');
	var buildTree = _.module('buildTree');
	var master = document.querySelector('body');
	var html = master.innerHTML;
	console.time('buildTree');
	var tree = buildTree(html);
	console.timeEnd('buildTree');

	var readyRender = tree.renderStack.slice();

	var cmd;
	var endIndex;
	var startIndex;
	var fn;

	var c = {
		'heihei' : {
			node : null,

			data : {
				o : {
					y : [1, 2, 3, 4, 5, 6, 7]
				}
			},

			methods : {
				repeat : function (node, arr) {
					return function (a) {
						var b = a[0];
						var ret = arr.map(function (one, index) {
							var str = b.replace('$index', index).replace('$val', one);
							return node.tagString.replace('{{ninja}}', str);
						}).join('');

						// readyRender =
						// 	tree.renderStack.slice(0, node.istackStart)
						// 	.concat(ret)
						// 	.concat(tree.renderStack.slice(node.istackEnd + 1));
						var query =
							cmd.node.tagName +
							'[' +
							'nt-cmd="' +
							cmd.node.attributes['nt-cmd'] +
							'"]';
						var target = master.querySelector(query);
						target.innerHTML = ret;
						console.log(target);
					};
				}
			}
		}
	};


	tree.renderStack.forEach(function (one, index) {
		if (endIndex && index > endIndex) {
			cmd = null;
			startIndex = null;
			endIndex = null;
			fn = null;
		}

		var attributes;
		if (tree.indexMap[index]) {
			attributes = tree.indexMap[index].attributes;
			if (!cmd) {
				cmd = attributes['nt-cmd'] && c[attributes['nt-cmd']];
				if (cmd) {
					endIndex = tree.indexMap[index].istackEnd;
					startIndex = tree.indexMap[index].istackStart;
					cmd.node = tree.indexMap[index];
					console.log(startIndex, endIndex, index);
					return;
				}
			}
			else if (attributes['nt-repeat']) {
				fn = cmd.methods.repeat;
				if (fn) {
					var data = cmd.data;
					var stack = attributes['nt-repeat'].split('.');
					var i = -1;
					while (++i < stack.length) {
						data = data[stack[i]];
					}
					if (data) {
						fn = fn(tree.indexMap[index], data);
					}
					else {
						fn = null;
					}
					return;
				}
			}
		}

		if (cmd && index % 2 && /\{\{/.test(one) && fn) {
			var arr = [];
			var r = /\{\{([^\}]*)?\}\}/g;
			var a;
			while ((a = r.exec(one))) {
				arr.push(a[1]);
			};

			fn(arr);
		}
	});

	console.log(fn);
	// master.innerHTML = readyRender.join('');

	// var ev = new EE;
	// ev.on('aa', function (data) {
	// 	console.log(data);
	// });
	// ev.emit('aa', { x : 1 });
});