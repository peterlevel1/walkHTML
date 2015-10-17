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
	console.timeEnd('buildTree');

	var readyRender = tree.renderStack.slice();
	// console.log(tree);

	new Controller({
		name : 'master',
	  node : tree[0],
	  $node : master,
	  tree : tree,
	  walk : true,
	  data : {
	  	x : 1,
	  	o : ['a123456 5555', 'b', 'c', 'd'],
	  	y : {
	  		a : 'y.a!!!!: is here'
	  	}
	  },
	  methods : {
	  	repeat : function () {},
	  	hello : function () {},
	  	ii : function () {},
	  	iii : function (text) {
	  		return 'iii: 2: ' + text;
	  	},
	  	ppp : function (text) {
	  		return 'ppp: 3: ' + text;
	  	},
	  }
	})
});