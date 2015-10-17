require.config({
	baseUrl : '..'
});

require(['./de_moves', 'assert', 'test']);

require.ready(function (_) {
	// _('.active').on('click', function (e) {
	// 	console.log('click');
	// 	return false;
	// });
	// _('.active').on('mouseenter', function (e) {
	// 	console.log('mouseenter');
	// 	return false;
	// });
	// _('.active').on('mouseenter.aaa', function (e) {
	// 	console.log('mouseenter.aaa');
	// 	return false;
	// });
	var assert = _.module('assert');
	var test = _.module('simple_test');
	var Unit = test.Unit;

new Unit('eventTest', {

	'.active: on mouseenter triggered' : function () {

		assert.expect(3);

		_('.active').on('mouseenter', null, {ha : true}, function (e, data) {
			assert.ok(true);
			assert.deepEqual(data, {x : 1});
			//****************************************
			assert.deepEqual(e.data, {ha : true});
			_('.active').off('mouseenter');
		});

		_('.active').trigger('mouseenter', {x : 1});
		_('.active').trigger('mouseenter', {x : 1});
		_('.active').trigger('mouseenter', {x : 1});
		_('.active').trigger('mouseenter', {x : 1});
		_('.active').trigger('mouseenter', {x : 1});
	},

	'.active: trigger data type' : function () {

		//@Object
		_('.active').on('mouseenter', function (e, data) {
			assert.deepEqual(data, {x : 1});
			_('.active').off('mouseenter');
		});
		_('.active').trigger('mouseenter', {x : 1});

		//@Array
		_('.active').on('mouseenter', function (e, data, data2) {
			assert.deepEqual(data, {x : 1});
			assert.deepEqual(data2, {x : 2});
			_('.active').off('mouseenter');
		});
		_('.active').trigger('mouseenter', [{x : 1}, {x : 2}]);

		//@Array
		_('.active').on('mouseenter', function (e, data, data2, data3) {
			assert.deepEqual(data, {x : 1});
			assert.deepEqual(data2, {x : 2});
			assert.deepEqual(data3, {x : 3});
			_('.active').off('mouseenter');
		});
		_('.active').trigger('mouseenter', [{x : 1}, {x : 2}, {x : 3}]);

	},

	'.active: on mouseenter + mouseenter.aaa' : function () {
		assert.expect(6);

		//**********************************
		_('.active').on('mouseenter', function (e) {
			assert.ok(true);
		});
		_('.active').on('mouseenter.aaa', function (e) {
			assert.ok(true);
		});

		_('.active').trigger('mouseenter');
		_('.active').off('mouseenter');

		_('.active').trigger('mouseenter');

		//******************************************
		_('.active').on('mouseenter.bbb', function (e) {
			assert.ok(true);
		});
		_('.active').on('mouseenter.aaa', function (e) {
			assert.ok(true);
		});

		_('.active').trigger('mouseenter.aaa');
		_('.active').off('mouseenter.aaa');

		_('.active').trigger('mouseenter.bbb');
		_('.active').off('mouseenter.bbb');

		_('.active').trigger('mouseenter');

		//**********************************
		_('.active').on('mouseenter.aaa', function (e) {
			assert.ok(true);
		});
		_('.active').on('click.aaa', function (e) {
			assert.ok(true);
		});

		_('.active').trigger('mouseenter');
		_('.active').trigger('click');

		_('.active').off('.aaa');

		_('.active').trigger('mouseenter');
		_('.active').trigger('click');
	},

	'.active :on(object) + data' : function () {
		assert.expect(4);

		_('.active').on({
			'mouseenter' : function (e) {
				assert.ok(true);
				assert.deepEqual(e.data, {x : 1});
			},
			'mouseleave' : function (e) {
				assert.ok(true);
				assert.deepEqual(e.data, {x : 1});
			}
		}, {x : 1});

		_('.active').trigger('mouseenter');
		_('.active').trigger('mouseleave');
		_('.active').off('mouseenter mouseleave');

		//***********test unbind***********************
		_('.active').trigger('mouseenter');
		_('.active').trigger('mouseleave');
	},

	'#ul-1 :on(object) + data + selector' : function () {
		_('#ul-1').on({
			'click' : function (e) {
				console.log(e.data);
				console.log(e.target !==_('#ul-1')[0]);
				console.log(e.target === _('#ul-1 .active')[0]);
				console.log(e.target);
				console.log(_('#ul-1 .active')[0]);
				_('#ul-1').off('click');
			}
		}, '.active', {x : 1});
		return true;
	}
})
.start();

});