(function(){
	var AXIS = {
		NONE: "none", 
		HORIZONTAL: "horizontal", 
		VERTICAL: "vertical", 
		BOTH: "both"
	};
	function Camera(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight)
	{
		this.xView = xView || 0;
		this.yView = yView || 0;
		this.xDeadZone = 0;
		this.yDeadZone = 0;
		this.wView = canvasWidth;
		this.hView = canvasHeight;
		this.axis = AXIS.BOTH;	
		this.followed = null;
		this.viewportRect = new Game.Rectangle(this.xView, this.yView, this.wView, this.hView);
		this.worldRect = new Game.Rectangle(0, 0, worldWidth, worldHeight);		
	}
	Camera.prototype.follow = function(gameObject, xDeadZone, yDeadZone)
	{		
		this.followed = gameObject;	
		this.xDeadZone = xDeadZone;
		this.yDeadZone = yDeadZone;
	}
	Camera.prototype.update = function()
	{
		if(this.followed != null)
		{		
			if(this.axis == AXIS.HORIZONTAL || this.axis == AXIS.BOTH)
			{		
				if(this.followed.x - this.xView  + this.xDeadZone > this.wView)
					this.xView = this.followed.x - (this.wView - this.xDeadZone);
				else if(this.followed.x  - this.xDeadZone < this.xView)
					this.xView = this.followed.x  - this.xDeadZone;
			}
			if(this.axis == AXIS.VERTICAL || this.axis == AXIS.BOTH)
			{
				if(this.followed.y - this.yView + this.yDeadZone > this.hView)
					this.yView = this.followed.y - (this.hView - this.yDeadZone);
				else if(this.followed.y - this.yDeadZone < this.yView)
					this.yView = this.followed.y - this.yDeadZone;
			}			
		}
		this.viewportRect.set(this.xView, this.yView);
		if(!this.viewportRect.within(this.worldRect))
		{
			if(this.viewportRect.left < this.worldRect.left)
				this.xView = this.worldRect.left;
			if(this.viewportRect.top < this.worldRect.top)
				this.yView = this.worldRect.top;
			if(this.viewportRect.right > this.worldRect.right)
				this.xView = this.worldRect.right - this.wView;
			if(this.viewportRect.bottom > this.worldRect.bottom)
				this.yView = this.worldRect.bottom - this.hView;
		}		
	}
Game.Camera = Camera;
})();