define([
	'ninja', 
	'promise',
	'./plusready'
], function (_, Promise) {
	
// 锁定只能竖屏显示
//plus.screen.lockOrientation( "portrait-primary" );
//plus.screen.unlockOrientation();

//AC
//plus.accelerometer.getCurrentAcceleration
//plus.accelerometer.watchAcceleration
//plus.accelerometer.clearWatch
//plus.accelerometer.Acceleration
//plus.accelerometer.AccelerometerOption
//plus.accelerometer.AccelerometerSuccessCallback
//plus.accelerometer.AccelerometerErrorCallback
//
//======================================================================
//accelerometer
//	Accelerometer模块管理设备加速度传感器，用于获取设备加速度信息，包括x（屏幕水平方向）、y（垂直屏幕水平方向）、z（垂直屏幕平面方向）三个方向的加速度信息。通过plus.accelerometer获取设备加速度传感器管理对象。
//
//方法：
//	getCurrentAcceleration : 获取当前设备的加速度信息
//	watchAcceleration : 监听设备加速度变化信息
//	clearWatch : 关闭监听设备加速度信息
	var accelerometer = {};
	var AC = plus.accelerometer;
	var one;
	var timer;
	var logError = function (e) {
		e = _.isString(e) 
			? new Error(e) 
			: e; 
		outLine(e.message);
		return e; 
	};
	
	accelerometer.get = function (done, fail) {
		fail = fail || logError; 
		
		new Promise(function(s, f) {
			AC.getCurrentAcceleration(function (_ac) {
				try {
					
				outLine(Object.keys(_ac));
				one = _ac; 
				s(_ac);
				} catch (e) {alert(e); }
			}, f);
		})
		.then(done, fail);
	};
	
	accelerometer.watch = function (frequency, progress, fail) {
		var opts = {
			frequency : 500
		};
		
		if (_.isNumber(frequency) && frequency > 0) {
			opts.frequency = frequency;
		}
		else {
			fail = progress;
			progress = frequency;
		}
		
		fail = fail || logError;
		
		accelerometer.clearTimer();
		timer = AC.watchAcceleration(progress, fail, opts);
	};
	
	accelerometer.clearTimer = function () {
		if (timer) {
			AC.clearWatch(timer);
			timer = null;
		}
	};
	
	accelerometer.clear = function () {
		accelerometer.clearTimer();
		one = null;
	};
	
	return accelerometer;
});