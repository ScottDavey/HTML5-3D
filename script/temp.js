/**********************
*****  ULILITIES  *****
**********************/
var Vector2 = function(x, y) {
    this.x = x;
    this.y = y;
};

Vector2.prototype.Add = function (vector) {
	return new Vector2(this.x + vector, this.y + vector);
};

Vector2.prototype.Subtract = function (vector) {
	return new Vector2(this.x - vector, this.y - vector);
};

Vector2.prototype.Multiply = function (vector) {
	return new Vector2(this.x * vector, this.y * vector);
};

Vector2.prototype.Multiply = function (vector) {
	return new Vector2(this.x * vector, this.y * vector);
};

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function SecondsToTime (s) {
	var h, m, s;
	s = Number(s);
	h = Math.floor(s / 3600);
	m = Math.floor(s % 3600 / 60);
	s = Math.floor(s % 3600 % 60);
	return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

var fps = {
	startTime : 0,
	frameNumber : 0,
	getFPS : function () {
		var d, currentTime, result;
		this.frameNumber++;
		d 			= new Date().getTime();
		currentTime = (d - this.startTime) / 1000;
		//result 		= Math.floor(this.frameNumber / currentTime);
		result			= (this.frameNumber / currentTime).toFixed(2);

		if (currentTime > 1) {
			this.startTime 		= new Date().getTime();
			this.frameNumber 	= 0;
		}

		return result;
	}
};

var GameTime = {
	startTime: 		new Date().getTime() / 1000,
	elapsed: 		0,
	lastUpdate: 	0,
	totalGameTime: 	0,
	getElapsed: function () {
		return GameTime.elapsed;
	},
	getLastUpdate: function () {
		return GameTime.lastUpdate;
	},
	getTotalGameTime: function () {
		return GameTime.totalGameTime;
	},
	getCurrentGameTime: function () {
		return new Date().getTime() / 1000;
	},
	update: function () {
		var curTime;
		curTime					= GameTime.getCurrentGameTime();
		GameTime.elapsed		= curTime - GameTime.lastUpdate;
		GameTime.totalGameTime	= curTime - GameTime.startTime;
		GameTime.lastUpdate		= curTime;
	}
};

var DrawText = function (string, x, y, font, color) {
	main.context.save();
	main.context.font = font;
	main.context.fillStyle = color;
	main.context.fillText(string, x, y);
	main.context.restore();
};

/*******************************************
**************  INPUT OBJECT  **************
*******************************************/
var Input = {
	Keys: {
		_isPressed: {},
		W: 87,
		A: 65,
		S: 83,
		D: 68,
		SPACE: 32,
		R: 82,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		SHIFT: 16,
		ESCAPE: 27,
		GetKey: function (keyCode) {
			return Input.Keys._isPressed[keyCode];
		},
		onKeyDown: function (e) {
			Input.Keys._isPressed[e.keyCode] = true;
		},
		onKeyUp: function (e) {
			delete Input.Keys._isPressed[e.keyCode];
		}
	},
	Mouse: {
		_isPressed: {},
		pos: new Vector2(0, 0),
		LEFT: 0,
		MIDDLE: 1,
		RIGHT: 2,
		GetButton: function (button) {
			return Input.Mouse._isPressed[button];
		},
		GetPosition: function () {
			return Input.Mouse.pos;
		},
		OnMouseDown: function (e) {
			Input.Mouse.pos.x = e.offsetX;
			Input.Mouse.pos.y = e.offsetY;
			Input.Mouse._isPressed[e.button] = true;
		},
		OnMouseUp: function (e) {
			delete Input.Mouse._isPressed[e.button];
		},
		OnMouseMove: {
			pos: new Vector2(0, 0),
			GetPosition: function () { return Input.Mouse.OnMouseMove.pos; },
			SetPosition: function (e) {
				Input.Mouse.OnMouseMove.pos.x = e.offsetX;
				Input.Mouse.OnMouseMove.pos.y = e.offsetY;
			}
		}
	}
};

/*************************
*****  PLAYER CLASS  *****
*************************/
function Player (level) {
	this.level 		= level;
	this.pos 	= new THREE.Vector3(0, 0, 0);
	console.log(this.pos);
}

/************************
*****  LEVEL CLASS  *****
************************/
function Level (game) {
	this.game 		= game;
	this.scene 		= {};
	this.camera 	= {};
	this.controls 	= {};
	this.floor 		= {};
	this.player		= {};

	this.Initialize();
}

Level.prototype.Initialize = function () {
	this.scene 		= new THREE.Scene();
	this.camera 	= new THREE.PerspectiveCamera(70, main.CANVAS_WIDTH / main.CANVAS_HEIGHT, 1, 1000);
	this.controls 	= new THREE.OrbitControls(this.camera, main.renderer.domElement);
	this.player 	= new Player(this);
	this.floor 		= new THREE.Mesh(new THREE.BoxGeometry(2000, 1, 2000), new THREE.MeshBasicMaterial({color: 0xffffff, overdraw: 0.5}));

	// Camera / Controls
	this.camera.position.set(0, 475, 425);
	this.camera.rotation.x = -Math.PI / 4;
	this.controls.target.set(this.player.pos.x, this.player.pos.y, 0);
	this.controls.update();

	// Add components
	this.scene.add(this.camera);
	this.scene.add(this.floor);
};

Level.prototype.update = function () {

};

Level.prototype.draw = function () {
	main.renderer.render(this.scene, this.camera);
};

/***********************
*****  GAME CLASS  *****
***********************/
function Game () {
	this.isRunning				= true;
	this.fps					= 0;
	this.level 					= {};
}

Game.prototype.Initialize = function () {
	var geoBox, matBox, geoPlane, matPlane;

	this.level = new Level(this);
	/*
	// Scene
	this.scene = new THREE.Scene();
	
	// Camera
	this.camera = new THREE.PerspectiveCamera(70, main.CANVAS_WIDTH / main.CANVAS_HEIGHT, 1, 4000);
	this.camera.position.set(0, 475, 425);
	this.camera.rotation.x 	= -70;

	this.controls = new THREE.OrbitControls(this.camera, main.renderer.domElement);
	this.controls.target.set(0, 1, 0);
	this.controls.update();

	// FLOOR
	matPlane 	= new THREE.MeshPhongMaterial();
	matPlane.color.set(0x808080);
	geoPlane 	= new THREE.BoxGeometry(2000,1,2000);
	this.plane 	= new THREE.Mesh(geoPlane, matPlane);
	this.plane.recieveShadow = true;
	this.plane.position.set(0, -0.05, 0);

	// LIGHTS
	this.ambientLight 		= new THREE.AmbientLight(0xffffff, 0.1)
	this.spotLight 			= new THREE.SpotLight(0xffffff, 1);
	this.spotLight.position.set(15, 400, 35);
	this.spotLight.castShadow = true;
	this.spotLight.angle = Math.PI / 4;
	this.spotLight.penumbra = 0.05;
	this.spotLight.decay = 2;
	this.spotLight.distance = 200;
	this.spotLight.shadow.mapSize.width = 1024;
	this.spotLight.shadow.mapSize.height = 1024;
	this.spotLight.shadow.camera.near = 1;
	this.spotLight.shadow.camera.far = 200;
	this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
	
	// ADD COMPONENTS
	this.scene.add(this.camera);
	this.scene.add(this.plane);
	this.scene.add(this.ambientLight);
	this.scene.add(this.spotLight);
	this.scene.add(this.spotLightHelper);*/

	GameTime.update();

};

Game.prototype.update = function () {
	this.fps = fps.getFPS();

	this.level.update();

	/*
	// POINT LIGHT MOVEMENT
	if (Input.Keys.GetKey(Input.Keys.UP)) {
		this.pLightMoveZ = -1;
		console.log(this.plane.position);
	} else if (Input.Keys.GetKey(Input.Keys.DOWN)) {
		this.pLightMoveZ = 1;
		console.log(this.plane.position);
	}

	if (Input.Keys.GetKey(Input.Keys.LEFT)) {
		this.pLightMoveX = -1;
		console.log(this.plane.position);
	} else if (Input.Keys.GetKey(Input.Keys.RIGHT)) {
		this.pLightMoveX = 1;
		console.log(this.plane.position);
	}

	if (Input.Keys.GetKey(Input.Keys.R) && Input.Keys.GetKey(Input.Keys.SHIFT)) {
		this.pLightMoveY = -1;
		console.log(this.plane.position);
	} else if (Input.Keys.GetKey(Input.Keys.R)) {
		this.pLightMoveY = 1;
		console.log(this.plane.position);
	}

	this.plane.position.z += this.pLightMoveZ * 5;
	this.plane.position.x += this.pLightMoveX * 5;
	this.plane.position.y += this.pLightMoveY * 5;
	
	this.pLightMoveX	= 0;
	this.pLightMoveY	= 0;
	this.pLightMoveZ	= 0;
	

	// CUBE MOVEMENT
	if (Input.Keys.GetKey(Input.Keys.W)) {
		this.cameraMoveZ = -1;
	} else if (Input.Keys.GetKey(Input.Keys.S)) {
		this.cameraMoveZ = 1;
	}

	if (Input.Keys.GetKey(Input.Keys.A)) {
		this.cameraMoveX = -1;
	} else if (Input.Keys.GetKey(Input.Keys.D)) {
		this.cameraMoveX = 1;
	}

	if (Input.Keys.GetKey(Input.Keys.SPACE) && Input.Keys.GetKey(Input.Keys.SHIFT)) {
		this.cameraMoveY = -1;
	} else if (Input.Keys.GetKey(Input.Keys.SPACE)) {
		this.cameraMoveY = 1;
	}

	this.cube.position.z += this.cameraMoveZ * 5;
	this.cube.position.x += this.cameraMoveX * 5;
	this.cube.position.y += this.cameraMoveY * 5;

	if (this.cube.position.y <= 0) this.cube.position.y = 0; 
	
	this.cameraMoveX	= 0;
	this.cameraMoveY	= 0;
	this.cameraMoveZ	= 0;*/
};

Game.prototype.draw = function () {

	this.level.draw();
	// main.context.clearRect(0, 0, main.CANVAS_WIDTH, main.CANVAS_HEIGHT);
	// DrawText('FPS: ' + this.fps, (main.CANVAS_WIDTH / 2 - 50), 20, 'normal 14pt Consolas, Trebuchet MS, Verdana', '#FFFFFF');
};

/*****************
*****  MAIN  *****
*****************/
var main = {
	init: function () {
		var wrapper;
		this.isRunning 				= true;
		this.CANVAS_WIDTH			= window.innerWidth - 50;
		this.CANVAS_HEIGHT			= window.innerHeight - 60;
		this.WORLD_WIDTH 			= 4320;
		this.WORLD_HEIGHT 			= 2160;
		this.canvas					= {};
		this.context				= {};
		this.container				= document.getElementById('wrapper');
		this.renderer				= new THREE.CanvasRenderer();
		this.game 					= new Game();

		// Update Renderer Setting
		this.renderer.setClearColor(0x000000);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
		this.container.appendChild(this.renderer.domElement);

		this.canvas 				= document.getElementsByTagName('canvas')[0];
		this.context 				= this.canvas.getContext('2d');

		// Adjust webpage styles
		wrapper = document.getElementById('wrapper');
		wrapper.style.width			= this.CANVAS_WIDTH + 'px';
		wrapper.style.height		= this.CANVAS_HEIGHT + 'px';

		// Create event listeners
		window.addEventListener('keyup', function (e) { Input.Keys.onKeyUp(e); }, false);
		window.addEventListener('keydown', function (e) { Input.Keys.onKeyDown(e); }, false);
		this.canvas.addEventListener('mousemove', function (e) { Input.Mouse.OnMouseMove.SetPosition(e); }, false);
		// this.canvas.addEventListener('mousedown', function (e) { Input.Mouse.OnMouseDown(e); }, false);
		// this.canvas.addEventListener('mouseup', function (e) { Input.Mouse.OnMouseUp(e); }, false);

		this.game.Initialize();

		main.run();
	},
	run: function () {
		if (main.isRunning) {
			GameTime.update();
			main.game.update();
			main.game.draw();
		}
		requestAnimationFrame(main.run);
	}
};