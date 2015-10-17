require.config({
	baseUrl : '..'
});

require(['./pkgs/events/index', './libs/buildTree', './libs/controller']);

require.ready(function (_) {

	var EE = _.module('events');
	var Controller = _.module('controller');
	var buildTree = _.module('buildTree');
	var master = document.querySelector('body');
	var html = master.innerHTML;

	console.time('buildTree');
	var tree = buildTree(html);
	// console.time('Controller');
	var c = new Controller({
		name : 'master',
	  node : tree[0],
	  $node : master,
	  tree : tree,
	  walk : true,
	  data : {
	  	arr : [
	  		{	x : 'arr:0:x', y : 'arr:0:y', z : 'arr:0:z' },
	  		{	x : 'arr:1:x', y : 'arr:1:y', z : 'arr:1:z' },
	  		{	x : 'arr:2:x', y : 'arr:2:y', z : 'arr:2:z' }
	  	],
	  	obj : {
	  		prop : 'obj.prop: is here',
	  		x : 'xxx',
	  		y : 'yyy'
	  	},
	  	obj2 : {
	  		aaa : 'obj-2: x'
	  	}
	  },
	  methods : {
	  	say : function (ioI) {
	  		// console.log('say:', ioI);
	  		return 'say:' + ioI;
	  	},
	  	hello : function (ioI) {
	  		// console.log('hello:', ioI);
	  		// console.log(this);
	  		return 'hello:' + ioI;
	  	}
	  }
	});
	// console.timeEnd('Controller');
	console.timeEnd('buildTree');

	//test handleMoveArgs
	//var rarg = /--([\w]+)([^-"'}]+|)/g;
	//var str = '--say obj';
	//var one = rarg.exec(str);
	//var moves = c.handleMoveArgs([], one);
	//console.log(moves);

	//test ''.split(/\s+/)
	//console.log(''.split(/\s+/));
	//['']

	// c.climbingData = true;
	// c.parent = {
	// 	data : {
	// 		aaa : {
	// 			x : 1
	// 		}
	// 	}
	// };
	// var data = Controller.getValue(c, 'aaa');
	// console.log(data);
	// var moves = c.parseMoves('--data aaa --say obj.x --hello obj.y');
	// console.log(moves);
	// var value = c.runTuples('p', moves);
	// console.log(value);
});

/*
		<div nt-move="--data obj">
			=== obj : {{ --ioI x --hello }} === {{ --ioI y }} ===
		</div>
*/