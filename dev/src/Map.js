window.Game = {};
window.	motionDetect= {};
var bgimg = new Image();
	bgimg.src = window.starImage;
(function(){
	function Rectangle(left, top, width, height){
		this.left = left || 0;
		this.top = top || 0;
	    this.width = width || 0;
		this.height = height || 0;
		this.right = this.left + this.width;
		this.bottom = this.top + this.height;
	}
	Rectangle.prototype.set = function(left,top,width,height){
		this.left = left;
	    this.top = top;
	    this.width = width || this.width;
	    this.height = height || this.height
	    this.right = (this.left + this.width);
	    this.bottom = (this.top + this.height);
	}
	Rectangle.prototype.within = function(r) {
		return (r.left <= this.left && 
				r.right >= this.right &&
				r.top <= this.top && 
				r.bottom >= this.bottom);
	}		
	Rectangle.prototype.overlaps = function(r) {
		return (this.left < r.right && 
				r.left < this.right && 
				this.top < r.bottom &&
				r.top < this.bottom);
	}
Game.Rectangle = Rectangle;
})();
(function(){
	function Map(width, height){
		this.width = width;
		this.height = height;
		this.image = null;
	}
	Map.prototype.generate = function(){
		var ctx = document.createElement("canvas").getContext("2d");
		ctx.canvas.width = this.width;
		ctx.canvas.height = this.height;		
		var rows = ~~(this.width/44) + 1;
		var columns = ~~(this.height/44) + 1;
	    var ptrn = ctx.createPattern(bgimg, 'repeat');
	    ctx.fillStyle = ptrn;
		var color = "red";
		ctx.save();
		for (var x = 0, i = 0; i < rows; x+=44, i++) {
			ctx.beginPath();			
			for (var y = 0, j=0; j < columns; y+=44, j++) {
			    ctx.fillRect(x,y,40,40);
			}
			ctx.closePath();			
		}		
		ctx.restore();	
		this.image = new Image();
		this.image.src = ctx.canvas.toDataURL("image/png");
		ctx = null;
	}
	Map.prototype.draw = function(context, xView, yView){
		var sx, sy, dx, dy;
	    var sWidth, sHeight, dWidth, dHeight;
		sx = xView;
		sy = yView;
		sWidth =  context.canvas.width;
		sHeight = context.canvas.height;
		if(this.image.width - sx < sWidth){
			sWidth = this.image.width - sx;
		}
		if(this.image.height - sy < sHeight){
			sHeight = this.image.height - sy; 
		}
		dx = 0;
		dy = 0;
		dWidth = sWidth;
		dHeight = sHeight;
		context.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
	}
Game.Map = Map;
})();
