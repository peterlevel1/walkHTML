require.config({
	baseUrl : '..'
});

require(['./mnp_moves', '../dom_events/de_moves', 'assert', 'test']);

require.ready(function (_) {

	var assert = _.module('assert');

	// var html = _('.li-1').html();

	// _('.li-1').append('<div id="div-new-1">new div: append</div>');
	// assert.ok(_('#div-new-1')[0] === _('.li-1 div').last()[0]);

	// _('.li-1').prepend('<div id="div-new-2">new div: prepend</div>');
	// assert.ok(_('#div-new-2')[0] === _('.li-1 div').first()[0]);

	// _('.li-1').after('<div id="div-new-3">new div: after</div>');
	// assert.ok(_('#div-new-3')[0] === _('.li-1').next()[0]);

	// _('.li-1').before('<div id="div-new-4">new div: before</div>');
	// assert.ok(_('#div-new-4')[0] === _('.li-1').prev()[0]);

	// _('.li-1').empty();
	// assert.ok(!_('.li-1 div')[0]);

	// _('.li-1').html(html);
	// assert.ok(!!_('.li-1 span')[0]);

	// assert.expect(2);

	_('.li-1').click(function (e) {
		// assert.ok(true);
		console.log(1);
		return false;
	});
	// _('.li-1').trigger('click');

	// var nli = _('.li-1').clone();
	// _('#ul-1').append(nli);

	// _(_('.li-1')[1]).trigger('click');

	// var nli2 = _(_('.li-1')[0]).clone(true);
	// _('#ul-1').append(nli);
	// nli2.detach();
	// _('#ul-1').append(nli2);

	// var nli2 = _(_('.li-1')[0]).clone(true);
	// // nli2.detach();
	// // nli2.remove();
	// // _('#ul-1').append(nli2);

	// nli2.appendTo(_('#ul-1'));

	// var nli2 = _(_('.li-1')[0]).clone(true);
	// nli2.prependTo(_('#ul-1'));


	// nli2.appendTo(_('#ul-1'));
	// nli2.appendTo(_('#ul-1'));
	// _(_('.li-1')[2]).trigger('click');

	// console.log(assert.collect());
	// var li2 = _('.li-2');
	// _('.li-2').replaceWith('<li class="li-2">aaaaaaaaaa</li>');

	// _('.li-4').replaceAll(_('.li-2')[0]);

	// assert.ok(!!_('.li-1 span')[0]);

	var a = _('<div/>').append('<span>new 1</span>').replaceAll(_('.li-2'));
	console.log(a);
})