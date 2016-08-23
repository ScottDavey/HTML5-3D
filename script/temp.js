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

/***********************
*****  GAME CLASS  *****
***********************/
function Game () {
	this.isRunning				= true;
	this.fps					= 0;
	this.camera					= new THREE.PerspectiveCamera(70, main.CANVAS_WIDTH, main.CANVAS_HEIGHT, 1, 1000);
	this.scene					= new THREE.Scene();
	this.plan 					= {};
	this.cube 					= {};
}

Game.prototype.Initialize = function () {
	var geoBox, geoPlane, i, hex, matBox, matPlane;
	this.camera.position.y 	= 150;
	this.camera.position.z 	= 500;
	// CUBE
	geoBox				= new THREE.BoxGeometry(200, 200, 200);
	for (i = 0; i < geoBox.faces.length; i+=2) {
		hex = Math.random() * 0xffffff;
		geoBox.faces[i].color.setHex(hex);
		geoBox.faces[i+1].color.setHex(hex);
	}
	matBox				= new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, overdraw: 0.5 });
	this.cube 				= new THREE.Mesh(geoBox, matBox);
	this.cube.position.y 	= 150;
	this.scene.add(this.cube);
	// PLANE
	geoPlane				= new THREE.PlaneBufferGeometry(200, 200);
	geoPlane.rotateX(-Math.PI / 2);
	matPlane				= new THREE.MeshBasicMaterial({color:0x0E0E0E, overdraw: 0.5});
	this.plane				= new THREE.Mesh(geoPlane, matPlane);
	this.scene.add(this.plane)
	GameTime.update();
};

Game.prototype.update = function () {
	this.fps = fps.getFPS();
	this.plane.rotation.y = this.cube.rotation.y += (5 - this.cube.rotation.y) * 0.05;
};

Game.prototype.draw = function () {

	// main.context.clearRect(0, 0, main.CANVAS_WIDTH, main.CANVAS_HEIGHT);
	// DrawText('FPS: ' + this.fps, (main.CANVAS_WIDTH / 2 - 50), 20, 'normal 14pt Consolas, Trebuchet MS, Verdana', '#FFFFFF');
	main.renderer.render(this.scene, this.camera);
};

/*****************
*****  MAIN  *****
*****************/
var main = {
	init: function () {
		var wrapper;
		this.isRunning 				= true;
		this.CANVAS_WIDTH			= 1080;
		this.CANVAS_HEIGHT			= 720;
		this.WORLD_WIDTH 			= 4320;
		this.WORLD_HEIGHT 			= 2160;
		// this.canvas					= document.getElementById('viewport');
		// this.canvas.width			= this.CANVAS_WIDTH;
		// this.canvas.height			= this.CANVAS_HEIGHT;
		// this.context				= this.canvas.getContext('2d');
		this.container				= document.getElementById('thing');
		this.renderer				= new THREE.CanvasRenderer();
		this.game 					= new Game();

		// Update Renderer Setting
		this.renderer.setClearColor(0xf0f0f0);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
		this.container.appendChild(this.renderer.domElement);

		// Adjust webpage styles
		// wrapper = document.getElementById('wrapper');
		// wrapper.style.width			= this.CANVAS_WIDTH + 'px';
		// wrapper.style.height		= this.CANVAS_HEIGHT + 'px';

		// Create event listeners
		window.addEventListener('keyup', function (e) { Input.Keys.onKeyUp(e); }, false);
		window.addEventListener('keydown', function (e) { Input.Keys.onKeyDown(e); }, false);
		// this.canvas.addEventListener('mousemove', function (e) { Input.Mouse.OnMouseMove.SetPosition(e); }, false);
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