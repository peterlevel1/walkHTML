
require.setBaseDir('..');

require([
	'./template_micro'
]);

require.ready(function (_) {
	var tmpl = _.module('template_micro');

	var results = document.getElementById("results");

	results.innerHTML = tmpl("item_tmpl", {
		from_user : 'aaa',
		text : 'bbb'
	});
});