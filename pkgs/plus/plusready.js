define(function () {
	var markPlus = false;
	window.require.setReady('plusready', false);
	
	if (window.plus) {
		markPlus = true;	
		window.require.setReady('plusready', true);
	}
	else {
		document.addEventListener("plusready", function () {
			if (window.plus) {
				window.require.setReady('plusready', true);
				markPlus = true;
			}
		}, false);
		
	}
	
	setTimeout(function () {
		if (!markPlus) {
			outSet('plus not already after 1000ms not ready');
		}
	}, 1000);
});
