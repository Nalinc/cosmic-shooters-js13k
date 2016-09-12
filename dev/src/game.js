var canvas,room,camera,ctx,keys,localPlayer,bullet,quadTree,remotePlayers,socket;
function init(nick, shiptype) {
	sessionStorage.cosmicAttacks = sessionStorage.cosmicAttacks || 0;
	sessionStorage.cosmicDeaths = sessionStorage.cosmicDeaths || 0;
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	document.getElementById("info").style.display='block';
	keys = new Keys();
	quadTree = new QuadTree({x:0,y:0,width:5000,height:3000});
	room = {
		width: 5000,
		height: 3000,
		map: new Game.Map(5000, 3000)
	};
	room.map.generate();
	var startX = Math.round(Math.random()*(canvas.width/2)),
		startY = Math.round(Math.random()*(canvas.height/2));
		localPlayer = new Game.Player(nick,startX, startY, null, shiptype,'player');
	camera = new Game.Camera(0, 0, canvas.width, canvas.height, room.width, room.height);		
	camera.follow(localPlayer, canvas.width/2, canvas.height/2);
	socket = io.connect(window.location.hostname);
	remotePlayers = [];
	setEventHandlers();
	setInterval(function(){
		if(!localPlayer.alive){
			sessionStorage.cosmicDeaths = parseInt(sessionStorage.cosmicDeaths) + 1;
			setTimeout(function(){
				if (confirm('You were hit by an enemy bullet, wanna continue?')) {
					localPlayer.isColliding = false;
					localPlayer.alive = true;
					localPlayer.type = 'player';
					localPlayer.collidableWith = (localPlayer.type=='player')?'enemybullet':'playerbullet';
					socket.emit("rejoin");
				} else {
					location.reload();	
				}				
			})
		}
	},5000)
};
var setEventHandlers = function() {
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);
	var el = document.getElementById("gameCanvas");
	el.addEventListener("touchstart", function(){
		localPlayer.fireTap = true;
	}, false);
	el.addEventListener("touchend", function(){
		localPlayer.fireTap = false;
	}, false);
	window.addEventListener("resize", onResize, false);
	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnect);
	socket.on("new player", onNewPlayer);
	socket.on("move player", onMovePlayer);
	socket.on("rejoin", onRejoin);
	socket.on("remove player", onRemovePlayer);
};
function onKeydown(e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};
function onKeyup(e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};
function onResize(e) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};
function onSocketConnected() {
	console.log("Connected to socket server");
	socket.emit("new player", {nick: localPlayer.getNick(), x: localPlayer.getX(), y: localPlayer.getY(), angle: localPlayer.getAngle(), type: localPlayer.getShipType()});
};
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);
	var newPlayer = new Game.Player(data.nick, data.x, data.y, data.angle, data.type,'enemy');
	newPlayer.id = data.id;
	remotePlayers.push(newPlayer);
};
function onMovePlayer(data) {
	var movePlayer = playerById(data.id);
	if (!movePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};
	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
	movePlayer.setAngle(data.angle);
	movePlayer.setShipType(data.type);
	if(data.isFiring){
		movePlayer.fire(movePlayer.getX()-camera.xView,movePlayer.getY()-camera.yView,movePlayer.getAngle());
	}
};
function onRejoin(data) {
	var rejoinedPlayer = playerById(data.id);
	console.log(rejoinedPlayer)
	if (!rejoinedPlayer) {
		console.log("Player not found: "+data.id);
		return;
	};
	rejoinedPlayer.isColliding = false;
	rejoinedPlayer.alive = true;
	rejoinedPlayer.type = 'enemy';
	rejoinedPlayer.collidableWith = (rejoinedPlayer.type=='player')?'enemybullet':'playerbullet';
};
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};
function detectCollision() {
	var objects = [];
	quadTree.getAllObjects(objects);
	for (var x = 0, len = objects.length; x < len; x++) {
		quadTree.findObjects(obj = [], objects[x]);
		for (y = 0, length = obj.length; y < length; y++) {
			if(objects[x].type=='enemybullet'||obj[y].type=='enemybullet');
			if (objects[x].alive && obj[y].alive && 
				objects[x].collidableWith === obj[y].type &&
				(objects[x].x < obj[y].x + obj[y].width &&
			     objects[x].x + objects[x].width > obj[y].x &&
				 objects[x].y < obj[y].y + obj[y].height &&
				 objects[x].y + objects[x].height > obj[y].y))
			{
				if(objects[x].type=="playerbullet"||obj[y].type=="playerbullet")
					sessionStorage.cosmicAttacks = parseInt(sessionStorage.cosmicAttacks) + 2;
				objects[x].isColliding = true;
				objects[x].alive = false;
				if(objects[x].shipType){
					objects[x].collidableWith = 'none';
					objects[x].type = 'dead';
				}
				else if(obj[y].shipType){
					obj[y].collidableWith = 'none';
					obj[y].type = 'dead';
				}
				obj[y].alive = false;
				obj[y].isColliding = true;
				Game.createExplosion(obj[y].x, obj[y].y, "#525252");
				Game.createExplosion(obj[y].x, obj[y].y, "#FFA318");
			}
		}
	}
};
function animate() {
	update();
	draw();
	window.requestAnimFrame(animate);
};
function update() {
	if (localPlayer.update(keys, room.width, room.height)) {
		camera.update();
		socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY(), angle: localPlayer.getAngle(), type: localPlayer.getShipType(), isFiring: localPlayer.isFiring});
	};
};
function updateParticle (frameDelay)
{
	for (var i=0; i<particles.length; i++)
	{
		var particle = particles[i];		
		particle.update();
		particle.draw(ctx);
	}
}
function draw() {
	quadTree.clear();
	quadTree.insert(localPlayer);
	quadTree.insert(localPlayer.bulletPool.getPool());
	quadTree.insert(remotePlayers);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	room.map.draw(ctx, camera.xView, camera.yView);		
	if(!localPlayer.isColliding)
		localPlayer.draw(ctx, camera.xView, camera.yView);
	localPlayer.bulletPool.animate(ctx,camera.xView, camera.yView);
	updateParticle()
    ctx.restore();
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		quadTree.insert(remotePlayers[i].bulletPool.getPool());
		if(!remotePlayers[i].isColliding)
			remotePlayers[i].draw(ctx,camera.xView, camera.yView);
			remotePlayers[i].bulletPool.animate(ctx,camera.xView, camera.yView);
	};
	document.getElementById("attacks").innerHTML = sessionStorage.cosmicAttacks/2;
	document.getElementById("deaths").innerHTML = sessionStorage.cosmicDeaths;
	detectCollision();
};
function playerById(id) {
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
		if (remotePlayers[i].id == id)
			return remotePlayers[i];
	};	
	return false;
};