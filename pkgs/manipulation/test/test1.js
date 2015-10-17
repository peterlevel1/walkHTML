
require.setBaseDir('..');

require([
	'../assert/index',
	'../simple_test/index',
	'./mnp_moves'
]);

require.ready(function (_) {
	var assert = _.assert;
	var test = _.module('simple_test');
	var Unit = test.Unit;

	var mnpMovesTest = new Unit('mnp_moves', {
		"text" : function () {
			var text1 = _('#div-1').text();
			assert.ok(!!text1, 'get string');

			_('#div-1').text('bbbbbbbbbbbbbbbb');

			var text2 = _('#div-1').text();
			assert.ok(text2.trim() === 'bbbbbbbbbbbbbbbb', 'set string done');

			_('#div-1').text('cccc').each(function () {
				assert.ok(_(this).text().trim() === 'cccc', 'support chain');
			});
		},

		"append" : function () {

			_('#div-1').append('<div id="append-1">appended div</div>');
			assert.ok(!!_('#append-1').length, 'get append div');

			var children = _('#div-1').children();
			assert.ok(
				children[children.length - 1] === _('#append-1')[0],
				'yes appended string!' );

			var div = document.createElement('div');
			div.text = 'ppp';
			div.setAttribute('id', 'div-111');
			_('#div-1').append(div);
			assert.ok(!!_('#div-111').length, 'get append div dom node');

			var children = _('#div-1').children();

			assert.ok(
				!!children[children.length - 1].nodeType,
				'yes, appended got nodeType!' );
			assert.ok(
				children[children.length - 1] === _('#div-111')[0],
				'yes, appended dom node!' );
		}
	});

	var html;

	mnpMovesTest.beforeEach(function () {
		html = _('#div-1').html();
	});

	mnpMovesTest.afterEach(function () {
		_('#div-1').html(html);
	});

	// console.log(mnpMovesTest.__beforeEach);
	 mnpMovesTest.start();
});