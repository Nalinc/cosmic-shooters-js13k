var Keys = function(up, left, right, down, space) {
	var up = up || false,
		left = left || false,
		right = right || false,
		down = down || false,
		space = space || false;		
	var onKeyDown = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 32:
				that.space = true;
				break;
			case 37:
				that.left = true;
				break;
			case 38:
				that.up = true;
				break;
			case 39:
				that.right = true;
				break;
			case 40:
				that.down = true;
				break;
		};
	};
	var onKeyUp = function(e) {
		var that = this,
			c = e.keyCode;
		switch (c) {
			case 32:
				that.space = false;
				break;
			case 37:
				that.left = false;
				break;
			case 38:
				that.up = false;
				break;
			case 39:
				that.right = false;
				break;
			case 40:
				that.down = false;
				break;
		};
	};
	return {
		up: up,
		left: left,
		right: right,
		down: down,
		space: space,
		onKeyDown: onKeyDown,
		onKeyUp: onKeyUp
	};
};