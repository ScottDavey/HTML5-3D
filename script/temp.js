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
		F: 70,
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
			Input.Mouse.pos.x = e.clientX;
			Input.Mouse.pos.y = e.clientY;
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

/************************
*****  SOUND CLASS  *****
************************/
function Sound (path, isLooping, preloaded, hasControls, vol) {
	this.vol			= vol;
	this.audEl			= document.createElement('audio');
	this.audEl.volume 	= this.vol;
	this.audEl.setAttribute('src', path);
	this.audEl.setAttribute('preload', preloaded);
	this.audEl.setAttribute('controls', hasControls);
	if (isLooping) this.audEl.setAttribute('loop', true);
}

Sound.prototype.Play = function () {
	this.audEl.play();
};

Sound.prototype.Stop = function () {
	this.audEl.pause();
};

Sound.prototype.SetVolume = function (vol) {
	this.audEl.volume = vol;
};

Sound.prototype.IsPlaying = function () {
	return !this.audEl.paused;
};


/************************
*****  PLAYER CLASS  *****
************************/
function Player (objects) {
	this.objects 	= objects;
	this.pos 		= new THREE.Vector3();
	this.cubit		= {};
	this.raycaster	= {};
	this.spotLight	= {};
	this.movementZ	= 0;
	this.movementX	= 0;
	this.velocity	= new THREE.Vector3();
	this.friction	= 0.68;
	this.gravity	= -15;
	this.fallSpeed	= 10;
	this.walkSpeed	= 5;
	this.runSpeed	= 10;
	this.isRunning	= false;
	this.canJump	= true;
	this.jumpPower	= -100;
	this.prevTime	= performance.now();
	this.footClock	= {};
	this.footsteps	= [];
	this.walk1		= {};
	this.walk2		= {};
	this.walk3		= {};
	this.walk4		= {};
	this.walk5		= {};
	this.walk6		= {};
	this.walk7		= {};
	this.walk8		= {};
	this.walk9		= {};
	this.walk10		= {};
}

Player.prototype.Initialize = function () {
	this.pos.set(-10, 11, 85);

	this.cubit = new THREE.Mesh(new THREE.BoxGeometry(5, 11, 5), new THREE.MeshStandardMaterial({color:0x000000}));
	this.cubit.position.copy(this.pos);
	//main.game.level.scene.add(this.cubit);

	// Raycaster
	this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

	// SOUNDS
	this.footClock		= new THREE.Clock();
	this.lastFootPlayed	= 0;
	this.footCounter 	= 0;
	this.footSpeed		= 0.5;
	this.walk1			= new Sound('sounds/SFX_Footsteps/Hardwood/1.mp3', false, true, false, 0.5);
	this.walk2			= new Sound('sounds/SFX_Footsteps/Hardwood/2.mp3', false, true, false, 0.5);
	this.walk3			= new Sound('sounds/SFX_Footsteps/Hardwood/3.mp3', false, true, false, 0.5);
	this.walk4			= new Sound('sounds/SFX_Footsteps/Hardwood/4.mp3', false, true, false, 0.5);
	this.walk5			= new Sound('sounds/SFX_Footsteps/Hardwood/5.mp3', false, true, false, 0.5);
	this.walk6			= new Sound('sounds/SFX_Footsteps/Hardwood/6.mp3', false, true, false, 0.5);
	this.footsteps.push(this.walk1);
	this.footsteps.push(this.walk2);
	this.footsteps.push(this.walk3);
	this.footsteps.push(this.walk4);
	this.footsteps.push(this.walk5);
	this.footsteps.push(this.walk6);
};

Player.prototype.GetInput = function () {

	if (Input.Keys.GetKey(Input.Keys.W)) this.movementZ = -1;
	if (Input.Keys.GetKey(Input.Keys.S)) this.movementZ = 1;
	if (Input.Keys.GetKey(Input.Keys.A)) this.movementX = -1;
	if (Input.Keys.GetKey(Input.Keys.D)) this.movementX = 1;
	if (Input.Keys.GetKey(Input.Keys.SHIFT)) {
		this.isRunning = true;
	} else {
		this.isRunning = false;
	}
	if (this.canJump && Input.Keys.GetKey(Input.Keys.SPACE)) {
		this.pos.y += this.jumpPower;
		this.canJump = false;
	}

};

Player.prototype.ApplyPhysics = function () {
	var speed, delta, time;

	time = performance.now();
	delta = (time - this.prevTime) / 1000;

	// HORIZONTAL MOVEMENT
	if (this.isRunning) {
		speed = this.runSpeed;
		this.footSpeed = 0.4;
	} else {
		speed = this.walkSpeed;
		this.footSpeed = 0.65;
	}

	// HORIZONTAL MOVEMENT
	this.velocity.x *= this.friction;
	this.velocity.x += this.movementX * speed * delta;
	this.velocity.z *= this.friction;
	this.velocity.z += this.movementZ * speed * delta;

	this.pos.x += this.velocity.x;
	this.pos.z += this.velocity.z;

	if (this.canJump && (this.movementX != 0 || this.movementZ != 0)) this.PlayMovementSound();

	// VERTICAL MOVEMENT
	//this.velocity.y = THREE.Math.clamp(this.velocity.y + this.gravity * delta, -this.fallSpeed, this.fallSpeed);
	//this.pos.y += this.velocity.y;

	//this.HandleCollision();

	this.prevTime = time;
};

Player.prototype.HandleCollision = function () {

	if (this.pos.y < 11) {
		this.velocity.y = 0;
		this.canJump = true;
	}

	/*var intersections, isOnObjects;

	this.raycaster.ray.origin.copy(this.pos);
	this.raycaster.ray.origin.y -= 10;
	intersections = this.raycaster.intersectObjects(this.objects);
	isOnObjects = intersections.length > 0;

	if (isOnObjects) {
		this.velocity.y = Math.max(0, this.velocity.y);
		this.canJump = true;
	}

	if (this.pos.y < 10 ) {
		this.velocity.y = 0;
		this.pos.y = 10;
		this.canJump = true;
	}*/

};

Player.prototype.PlayMovementSound = function () {
	if (!this.footClock.running) {
		this.footClock.start();
	}

	if ((this.footClock.getElapsedTime() - this.lastFootPlayed) >= this.footSpeed){
		this.footsteps[this.footCounter].Play();
		this.lastFootPlayed = this.footClock.getElapsedTime();
		//this.footClock.stop();
		this.footCounter = (this.footCounter < this.footsteps.length - 1) ? this.footCounter + 1 : 0;
	}

};

Player.prototype.update = function () {
	this.GetInput();
	this.ApplyPhysics();

	this.cubit.position.copy(this.pos);

	this.movementX = 0;
	this.movementZ = 0;
};

Player.prototype.draw = function () {

};

/************************
*****  LEVEL CLASS  *****
************************/
function Level (game) {
	this.game 				= game;
	this.camera 			= {};
	this.controls 			= {};
	this.mouse				= {};
	this.raycaster			= {};
	this.scene 				= {};
	this.player 			= {};
	this.bulb 				= {};
	this.batteryPower		= 100;
	this.lastBatteryTick	= performance.now() / 1000;
	this.batteryPowerEl		= document.getElementById('battery_power');
	this.batteries			= [];
	this.numBatteries		= random(5, 10);
	this.batterySound		= new Sound('sounds/SFX_Battery_Refill.mp3', false, true, true, 0.5);
	this.flashLight			= new THREE.Object3D();
	this.flashLightSound	= new Sound('sounds/SFX_FlashLight_Click.mp3', false, true, false, 0.3);
	this.flashLightFullPower= 3000;
	this.flashLightCurPower	= this.flashLightFullPower;
	this.spotLight			= {};
	this.isFKeyLocked 		= false;
	this.fKeyLockStart 		= 0;
	this.spHelper			= {}
	this.hemiLight			= {};
	this.pointLight			= {};
	this.isPointLightOff	= false;
	this.pointLightOffStart = 0;
	this.pointLight2 		= {};
	this.pointLight3 		= {};
	this.pointLight4 		= {};
	this.floor 				= {};
	this.ceiling			= {};
	this.walls				= [];
	this.objects			= [];
	this.monster			= {};
	this.music				= {};
	this.ambience 			= {};

}

Level.prototype.Initialize = function () {
	var objLoader, mtlLoader;
	this.scene 		= new THREE.Scene();
	//this.scene.fog	= new THREE.Fog(0x000000, 0, 100);

	// Camera / Controls
	this.camera 	= new THREE.PerspectiveCamera(75, main.ASPECT_RATIO, 1, 1000);
	this.controls = new THREE.PointerLockControls(this.camera);
	this.controls.enabled = false;
	this.scene.add(this.controls.getObject());

	// LIGHTS
	//this.bulb 		= new THREE.PointLight(0xffeedd, 0.5, 150);

	this.flashLight = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 7, 20), new THREE.MeshPhongMaterial({color:0x000000, specular:0xAAAAAA, shininess:20}));
	this.flashLight.rotateX(Math.PI/2);
	this.camera.add(this.flashLight);
	this.flashLight.position.copy(this.camera.position);

	this.spotLight = new THREE.SpotLight(0xffffff, 400);
	this.spotLight.power = this.flashLightFullPower;
	this.spotLight.angle = 0.6;
	this.spotLight.decay = 2;
	this.spotLight.penumbra = 0.3;
	this.spotLight.distance = 100;
	this.spotLight.castShadow = true;
	this.spotLight.shadow.mapSize.width = 2048;
	this.spotLight.shadow.mapSize.height = 2048;
	this.spotLight.shadow.camera.far = 200;
	this.spotLight.shadow.camera.fov = 75;

	this.flashLight.add(this.spotLight);
	this.flashLight.add(this.spotLight.target);

	this.pointLight	= new THREE.PointLight(0xFF9329, 50, 200, 1.5);
	this.pointLight.position.set(26, 15, -86);
	this.pointLight.castShadow = true;
	this.pointLight.shadow.camera.far = 200;

	this.hemiLight = new THREE.AmbientLight(0xFF9329, 0.1);

	this.LoadGeometry();

	/*mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath('models/');
	mtlLoader.load('forest-monster-final.mtl', function (materials) {
		var objLoader;

		materials.preload();

		objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.setPath('models/');
		objLoader.load('forest-monster-final.obj', function (object) {
			var newModel = object;
			newModel.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					 child.castShadow = true;
					 child.receieveShadow = true;
				}
		 	});
		 	object.scale.x = object.scale.y = object.scale.z = 0.5;
			object.position.set(20, 0, -50);
			main.game.level.scene.add(object);
		});

	});*/

	this.player = new Player(this.objects);
	this.player.Initialize();
	this.controls.getObject().position.copy(this.player.pos);

	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();

	this.music			= new Sound('sounds/MUSIC_Haunted_House.mp3', true, true, false, 0.2);
	this.ambience		= new Sound('sounds/SFX_House_Ambience.mp3', true, true, false, 0.6);

	this.music.Play();
	this.ambience.Play();

	// Add components
	// this.scene.add(this.hemiLight);
	this.scene.add(this.pointLight);
	//this.scene.add(this.bulb);

};

Level.prototype.LoadGeometry = function () {
	var floorMat, ceilMat, textureLoader, wallMat, wall, w, walls, rFront, rBack, rLeft, rRight, wallHeight, fireplaceMantle, window, windowMat, b, battery;

	textureLoader = new THREE.TextureLoader();

	// FLOOR - Hardwood
	floorMat = new THREE.MeshPhongMaterial({color:0xffffff, specular:0xffffff, shininess:45, reflectivity:10, bumpScale:0.01});
	textureLoader.load( "images/Wood_Floor_5.jpg", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set(3, 4);
		floorMat.map = map;
		floorMat.needsUpdate = true;
	});
	textureLoader.load( "images/Wood_Floor_5.png", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set(3, 4);
		floorMat.bumpMap = map;
		floorMat.needsUpdate = true;
	});
	this.floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(70, 190), floorMat);
	this.floor.receiveShadow = true;
	this.floor.rotation.x = -Math.PI / 2.0;
	this.objects.push(this.floor);
	this.scene.add(this.floor);

	// CEILING
	ceilMat = new THREE.MeshPhongMaterial({color: 0xffffff, specular:0xffffff, shininess:10, reflectivity:0, bumpScale: 0.025});
	textureLoader.load( "images/Ceiling_Drywall_2.jpg", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set(20, 20);
		ceilMat.map = map;
		ceilMat.needsUpdate = true;
	});
	textureLoader.load( "images/Ceiling_Drywall_2.png", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set(20, 20);
		ceilMat.bumpMap = map;
		ceilMat.needsUpdate = true;
	});
	this.ceiling = new THREE.Mesh(new THREE.PlaneBufferGeometry(70, 190), ceilMat);
	this.ceiling.receiveShadow = true;
	this.ceiling.rotation.x = Math.PI / 2.0;
	this.ceiling.position.y = 25;
	this.scene.add(this.ceiling);

	rFront 		= 0;
	rBack		= Math.PI;
	rLeft		= (Math.PI/2);
	rRight		= (-Math.PI/2);
	wallHeight	= 25;

	walls = [
		// OUTER WALLS + WINDOW WELLS
		{ width: 9, position: new THREE.Vector3(-30.5, wallHeight, -95), rotateY: rFront },								// Back Wall
		{ width: 17, height: 2.5, position: new THREE.Vector3(-17.5, 23.75, -95), rotateY: rFront },					// Back Wall (left window top)
		{ width: 1, height: 15, position: new THREE.Vector3(-26, 15, -95.5), rotateY: rLeft },							// Back Wall (left window well)
		{ width: 1, height: 17, position: new THREE.Vector3(-17.5, 22.5, -95.5), rotateY: rLeft, rotateX: (Math.PI/2) },// Back Wall (top window well)
		{ width: 1, height: 15, position: new THREE.Vector3(-9, 15, -95.5), rotateY: rRight },							// Back Wall (right window well)
		{ width: 1, height: 17, position: new THREE.Vector3(-17.5, 7.5, -95.5), rotateY: rLeft, rotateX: (-Math.PI/2) },// Back Wall (bottom window well)
		{ width: 17, height: 7.5, position: new THREE.Vector3(-17.5, 3.75, -95), rotateY: rFront },						// Back Wall (left window bottom)
		{ width: 20, position: new THREE.Vector3(1, wallHeight, -95), rotateY: rFront },								// Back Wall (middle section)
		{ width: 18, height: 2.5, position: new THREE.Vector3(20, 23.75, -95), rotateY: rFront },						// Back Wall (right window top)
		{ width: 1, height: 22.5, position: new THREE.Vector3(11, 11.25, -95.5), rotateY: rLeft },						// Back Wall (left window well)
		{ width: 1, height: 18, position: new THREE.Vector3(20, 22.5, -95.5), rotateY: rLeft, rotateX: (Math.PI/2) },	// Back Wall (top window well)
		{ width: 1, height: 22.5, position: new THREE.Vector3(29, 11.25, -95.5), rotateY: rRight },						// Back Wall (right window well)
		{ width: 1, height: 18, position: new THREE.Vector3(20, 0, -95.5), rotateY: rLeft, rotateX: (-Math.PI/2) },		// Back Wall (bottom window well)
		{ width: 4, position: new THREE.Vector3(31, wallHeight, -95), rotateY: rFront },								// Back Wall
		{ width: 2, position: new THREE.Vector3(34, wallHeight, -93), rotateY: rFront },								// Back Wall (right corner extrusion)
		{ width: 2, position: new THREE.Vector3(33, wallHeight, -94), rotateY: rRight },								// Back Wall (right corner extrusion)

		{ width: 80, position: new THREE.Vector3(-35, wallHeight, 55), rotateY: rLeft },								// Left Side (entry)
		{ width: 10, position: new THREE.Vector3(-35, wallHeight, 10), rotateY: rLeft },								// Left Side (left of windows)
		{ width: 15, height: 2.5, position: new THREE.Vector3(-35, 23.75, -2.5), rotateY: rLeft },						// Left Side (left window top)
		{ width: 1, height: 15, position: new THREE.Vector3(-35.5, 15, 5), rotateY: rBack },							// Left Side (left window well)
		{ width: 1, height: 15, position: new THREE.Vector3(-35.5, 22.5, -2.5), rotateY: 0, rotateX: (Math.PI/2) },		// Left Side (top window well)
		{ width: 1, height: 15, position: new THREE.Vector3(-35.5, 15, -10), rotateY: rFront },							// Left Side (right window well)
		{ width: 1, height: 15, position: new THREE.Vector3(-35.5, 7.5, -2.5), rotateY: 0, rotateX: (-Math.PI/2) },		// Left Side (bottom window well)
		{ width: 15, height: 7.5, position: new THREE.Vector3(-35, 3.75, -2.5), rotateY: rLeft },						// Left Side (left window bottom)
		{ width: 7, position: new THREE.Vector3(-35, wallHeight, -13.5), rotateY: rLeft },								// Left Side (between windows)
		{ width: 15, height: 2.5, position: new THREE.Vector3(-35, 23.75, -24.5), rotateY: rLeft },						// Left Side (right window top)
		{ width: 1, height: 15, position: new THREE.Vector3(-35.5, 15, -17), rotateY: rBack },							// Left Side (left window well)
		{ width: 1, height: 15, position: new THREE.Vector3(-35.5, 22.5, -24.5), rotateY: 0, rotateX: (Math.PI/2) },	// Left Side (top window well)
		{ width: 1, height: 15, position: new THREE.Vector3(-35.5, 15, -32), rotateY: rFront },							// Left Side (right window well)
		{ width: 1, height: 15, position: new THREE.Vector3(-35.5, 7.5, -24.5), rotateY: 0, rotateX: (-Math.PI/2) },	// Left Side (bottom window well)
		{ width: 15, height: 7.5, position: new THREE.Vector3(-35, 3.75, -24.5), rotateY: rLeft },						// Left Side (right window bottom)
		{ width: 63, position: new THREE.Vector3(-35, wallHeight, -63.5), rotateY: rLeft },								// Left Side (the rest)

		{ width: 30, position: new THREE.Vector3(-20, wallHeight, 95), rotateY: rBack },								// Front Wall (no garage)
		{ width: 75, position: new THREE.Vector3(-5, wallHeight, 57.5), rotateY: rRight },								// Right Wall (entry)
		{ width: 2, height: 18, position: new THREE.Vector3(-4, 9, 20), rotateY: rBack },								// Front Kitchen Wall
		{ width: 7, position: new THREE.Vector3(-3, wallHeight, 23.5), rotateY: rLeft },								// Front Kitchen Wall
		{ width: 38, position: new THREE.Vector3(16, wallHeight, 27), rotateY: rBack },									// Front Kitchen Wall
		{ width: 122, position: new THREE.Vector3(35, wallHeight, -34), rotateY: rRight },								// Right Wall (rear)

		// INNER WALLS
		{ width: 20, position: new THREE.Vector3(-25, wallHeight, 85), rotateY: rLeft },								// Closet

		{ width: 7, position: new THREE.Vector3(-21.5, wallHeight, 75), rotateY: rFront },								// Powder Room
		{ width: 5, position: new THREE.Vector3(-18, wallHeight, 72.5), rotateY: rLeft },								// Powder Room
		{ width: 2, height: 18, position: new THREE.Vector3(-19, 9, 70), rotateY: rBack },								// Powder Room
		{ width: 3, position: new THREE.Vector3(-20, wallHeight, 71.5), rotateY: rRight },								// Powder Room
		{ width: 15, position: new THREE.Vector3(-27.5, wallHeight, 73), rotateY: rBack },								// Powder Room
		{ width: 15, position: new THREE.Vector3(-27.5, wallHeight, 57), rotateY: rFront },								// Powder Room
		{ width: 3, position: new THREE.Vector3(-20, wallHeight, 58.5), rotateY: rRight },								// Powder Room
		{ width: 2, height: 18, position: new THREE.Vector3(-19, 9, 60), rotateY: rFront },								// Powder Room
		{ width: 5, position: new THREE.Vector3(-18, wallHeight, 57.5), rotateY: rLeft },								// Powder Room
		{ width: 17, position: new THREE.Vector3(-26.5, wallHeight, 55), rotateY: rBack },								// Powder Room
		{ width: 10, height: 7, position: new THREE.Vector3(-18, 21.5, 65), rotateY: rLeft },							// Powder Room (Doorway - top)
		{ width: 2, height: 10, position: new THREE.Vector3(-19, 18, 65), rotateY: 0, rotateX: (Math.PI/2) },			// Powder Room (Doorway - top)
		{ width: 10, height: 7, position: new THREE.Vector3(-20, 21.5, 65), rotateY: rRight },							// Powder Room (Doorway - top)

		{ width: 17, position: new THREE.Vector3(-26.5, wallHeight, 47), rotateY: rFront },								// Stairs
		{ width: 2, position: new THREE.Vector3(-18, wallHeight, 46), rotateY: rLeft },									// Stairs
		{ width: 5, position: new THREE.Vector3(-20.5, wallHeight, 45), rotateY: rBack },								// Stairs
		{ width: 30, position: new THREE.Vector3(-23, wallHeight, 30), rotateY: rLeft },								// Stairs
		{ width: 12, position: new THREE.Vector3(-29, wallHeight, 15), rotateY: rBack },								// Stairs

		{ width: 2, height: 18, position: new THREE.Vector3(5, 9, -15), rotateY: rBack },								// Kitchen Islands (end face)
		{ width: 17, position: new THREE.Vector3(6, wallHeight, -6.5), rotateY: rLeft },								// Kitchen Islands
		{ width: 9, position: new THREE.Vector3(1.5, wallHeight, 2), rotateY: rFront },									// Kitchen Islands
		{ width: 8, position: new THREE.Vector3(-3, wallHeight, 6), rotateY: rLeft },									// Kitchen Islands
		{ width: 10, position: new THREE.Vector3(-5, wallHeight, 5), rotateY: rRight },									// Kitchen Islands
		{ width: 15, position: new THREE.Vector3(4, wallHeight, -7.5), rotateY: rRight },								// Kitchen Islands
		{ width: 10, position: new THREE.Vector3(0, wallHeight, 0), rotateY: rBack },									// Kitchen Islands
		{ width: 2, height: 18, position: new THREE.Vector3(-4, 9, 10), rotateY: rFront },								// Kitchen Islands (start face)
		{ width: 10, height: 7, position: new THREE.Vector3(-3, 21.5, 15), rotateY: rLeft },							// Kitchen Islands (Right Entry Wall - Doorway - top)
		{ width: 2, height: 10, position: new THREE.Vector3(-4, 18, 15), rotateY: 0, rotateX: (Math.PI/2) },			// Kitchen Islands (Right Entry Wall - Doorway - top)
		{ width: 10, height: 7, position: new THREE.Vector3(-5, 21.5, 15), rotateY: rRight },							// Kitchen Islands (Right Entry Wall - Doorway - top)

		{ width: 20, height: 7, position: new THREE.Vector3(6, 21.5, -25), rotateY: rLeft },							// Kitchen Islands (Dinig Island - Doorway - top)
		{ width: 2, height: 20, position: new THREE.Vector3(5, 18, -25), rotateY: 0, rotateX: (Math.PI/2) },			// Kitchen Islands (Dinig Island - Doorway - top)
		{ width: 20, height: 7, position: new THREE.Vector3(4, 21.5, -25), rotateY: rRight },							// Kitchen Islands (Dinig Island - Doorway - top)

		{ width: 10, position: new THREE.Vector3(4, wallHeight, -40), rotateY: rRight },								// Dining Island
		{ width: 2, height: 18, position: new THREE.Vector3(5, 9, -35), rotateY: rFront },								// Dining Island
		{ width: 15, position: new THREE.Vector3(6, wallHeight, -42.5), rotateY: rLeft },								// Dining Island
		{ width: 2, position: new THREE.Vector3(5, wallHeight, -50), rotateY: rBack },									// Dining Island
		{ width: 3, position: new THREE.Vector3(4, wallHeight, -48.5), rotateY: rRight },								// Dining Island
		{ width: 10, position: new THREE.Vector3(-1, wallHeight, -45), rotateY: rFront },								// Dining Island
		{ width: 2, height: 18, position: new THREE.Vector3(-6, 9, -46), rotateY: rRight },								// Dining Island
		{ width: 10, position: new THREE.Vector3(-1, wallHeight, -47), rotateY: rBack },								// Dining Island

		{ width: 17, height: 7, position: new THREE.Vector3(-14.5, 21.5, -45), rotateY: rFront },						// Dining Island (Fireplace Wall - Doorway - top)
		{ width: 2, height: 17, position: new THREE.Vector3(-14.5, 18, -46), rotateY: rLeft, rotateX: (Math.PI/2) },	// Dining Island (Fireplace Wall - Doorway - top)
		{ width: 17, height: 7, position: new THREE.Vector3(-14.5, 21.5, -47), rotateY: rBack },						// Dining Island (Fireplace Wall - Doorway - top)

		{ width: 12, position: new THREE.Vector3(-29, wallHeight, -45), rotateY: rFront },								// Fireplace Wall
		{ width: 2, height: 18, position: new THREE.Vector3(-23, 9, -46), rotateY: rLeft },								// Fireplace Wall
		{ width: 12, position: new THREE.Vector3(-29, wallHeight, -47), rotateY: rBack },								// Fireplace Wall

		{ width: 4.5, height: 10, position: new THREE.Vector3(-32.75, 5, -62.75), rotateY: rFront },					// Fireplace
		{ width: 14.5, height: 10, position: new THREE.Vector3(-30.5, 5, -70), rotateY: rLeft },						// Fireplace
		{ width: 4.5, height: 10, position: new THREE.Vector3(-32.75, 5, -77.25), rotateY: rBack }						// Fireplace
	];

	wallMat = new THREE.MeshStandardMaterial({roughness: 1.5, color: 0xAAAAAA, bumpScale: 0.05, metalness: 0.1});
	for (w = 0; w < walls.length; w++) {
		wall = new THREE.Mesh(new THREE.PlaneBufferGeometry(walls[w].width, (typeof walls[w].height !== 'undefined' ? walls[w].height : 50)), wallMat);
		wall.position.copy(walls[w].position);
		wall.rotateY(walls[w].rotateY);
		if (typeof walls[w].rotateX !== 'undefined') wall.rotateX(walls[w].rotateX);
		wall.receiveShadow = true;
		wall.castShadow = true;
		this.objects.push(wall);
		this.scene.add(wall);
	}

	// FIREPLACE MANTLE
	fireplaceMantle = new THREE.Mesh(new THREE.BoxBufferGeometry(5, 0.5, 15), new THREE.MeshStandardMaterial({roughness: 1.5, color: 0xAAAAAA, bumpScale: 0.05, metalness: 0.1}));
	fireplaceMantle.position.set(-32.5, 10.25, -70);
	fireplaceMantle.castShadow = true;
	fireplaceMantle.receieveShadow = true;
	this.scene.add(fireplaceMantle);

	// WINDOWS
	windowMat = new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x000000, reflectivity: 30, shininess: 80, bumpScale: 0.01 });
	textureLoader.load( "images/window.jpg", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set(2, 2);
		windowMat.map = map;
		windowMat.needsUpdate = true;
	});
	textureLoader.load( "images/window.png", function( map ) {
		map.wrapS = THREE.RepeatWrapping;
		map.wrapT = THREE.RepeatWrapping;
		map.anisotropy = 4;
		map.repeat.set(2, 2);
		windowMat.bumpMap = map;
		windowMat.needsUpdate = true;
	});
	// Back Left
	window = new THREE.Mesh(new THREE.PlaneBufferGeometry(17, 15), windowMat);
	window.position.set(-17.5, 15, -95.5);
	window.rotateY(rFront);
	window.receiveShadow = true;
	window.castShadow = true;
	this.scene.add(window);
	// Back Right
	window = new THREE.Mesh(new THREE.PlaneBufferGeometry(18, 22.5), windowMat);
	window.position.set(20, 11.25, -95.5);
	window.rotateY(rFront);
	window.receiveShadow = true;
	window.castShadow = true;
	this.scene.add(window);
	// Left left
	window = new THREE.Mesh(new THREE.PlaneBufferGeometry(15, 15), windowMat);
	window.position.set(-35.5, 15, -2.5);
	window.rotateY(rLeft);
	window.receiveShadow = true;
	window.castShadow = true;
	this.scene.add(window);
	// Left Right
	window = new THREE.Mesh(new THREE.PlaneBufferGeometry(15, 15), windowMat);
	window.position.set(-35.5, 15, -24.5);
	window.rotateY(rLeft);
	window.receiveShadow = true;
	window.castShadow = true;
	this.scene.add(window);

	// Batteries
	for (b = 0; b < this.numBatteries; b++) {
		battery = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1, 8), new THREE.MeshPhongMaterial({color:0xF0EE23, specular:0xB7D151, shininess:20, reflectivity:20}));
		battery.position.set(random(-30, 30), 3, random(-90, 90));
		battery.rotateX(Math.PI/2);
		this.scene.add(battery);
		this.batteries.push(battery);
	}

};

Level.prototype.update = function () {
	var totalElapsedSeconds, pointLightStallTime, b, mousePos, mouseIntersects, batteryIndex, batteryDistance;

	totalElapsedSeconds = performance.now() / 1000;

	// Clear locks
	if (this.isFKeyLocked && (totalElapsedSeconds - this.fKeyStart) > 0.5) this.isFKeyLocked = false;

	this.player.update();

	this.controls.getObject().translateX(this.player.velocity.x);
	//this.controls.getObject().translateY(this.player.velocity.y);
	this.controls.getObject().translateZ(this.player.velocity.z);

	//this.bulb.position.copy(this.controls.getObject().position);

	this.flashLight.position.copy(this.camera.position);
	this.flashLight.position.x += 2;
	this.flashLight.position.y -= 3;
	this.flashLight.position.z -= 1;

	if (!this.isFKeyLocked && Input.Keys.GetKey(Input.Keys.F)) {
		this.isFKeyLocked = true;
		this.fKeyStart = performance.now() / 1000;
		if (this.spotLight.power == 0 && this.batteryPower > 0) {
			this.spotLight.power = this.flashLightFullPower;
			this.lastBatteryTick = totalElapsedSeconds;
		} else {
			this.spotLight.power = 0;
		}

		this.flashLightSound.Play();
	}

	// Light Flicker
	pointLightStallTime = Math.random();
	if (this.isPointLightOff && (totalElapsedSeconds - this.pointLightOffStart) > pointLightStallTime) {
		this.isPointLightOff = false;
		this.pointLight.power = 100;
	}

	if (!this.isPointLightOff && random(0, 1000) < 25) {
		this.isPointLightOff = true;
		this.pointLight.power = 0;
		this.pointLightOffStart = performance.now() / 1000;
	}

	// Battery - when flashlight is on, battery drains at a rate of 1% per 3 seconds
	if (this.spotLight.power != 0 && (totalElapsedSeconds - this.lastBatteryTick) >= 3) {
		this.batteryPower -= 1;
		this.flashLightCurPower *= this.batteryPower / 100;
		this.lastBatteryTick = totalElapsedSeconds;
		if (this.batteryPower <= 0) {
			this.flashLightSound.Play();
			this.spotLight.power = 0;
		}
	}

	// Battery Rotation / Hover / Pickup
	batteryIndex = -1;
	batteryDistance = 1000;
	mousePos = Input.Mouse.GetPosition();
	this.mouse.x = 0.0032000000000000917;
	this.mouse.y = -0.010159651669085612;
	this.raycaster.setFromCamera(this.mouse, this.camera);

	for (b = 0; b < this.numBatteries; b++) {
		// Rotate this battery
		this.batteries[b].rotation.z += 0.05;
		// Check if we can grab it
		mouseIntersects = this.raycaster.intersectObject(this.batteries[b]);
		if (mouseIntersects.length > 0) {
			batteryIndex = b;
			batteryDistance = mouseIntersects[0].distance;
		}
	}

	// If it's in grabbing distance, proceed
	if (batteryIndex != -1 && batteryDistance <= 10) {
		// Change the cursor state to let the player know they can grab the battery
		main.game.crosshair.style.backgroundImage = "url('images/cursors/hand.png')";
		if (main.game.cursorState !== 'HAND') main.game.cursorState = 'HAND';
		// Check if the player clicks
		if (Input.Mouse.GetButton(Input.Mouse.LEFT)) {
			// Remove the battery from the scene
			this.scene.remove(this.batteries[batteryIndex]);
			// Increase battery power
			this.batteryPower = THREE.Math.clamp(this.batteryPower + 25, 0, 100);
			// Play battery pickup sound
			this.batterySound.Play();
			// Remove batter from our array
			this.batteries.splice(batteryIndex, 1);
			this.numBatteries--;
		}
	} else if (main.game.cursorState === 'HAND') {
		// If we're not in grabbing range of a batter and if the cursor is in the HAND state, change it back to a DOT
		main.game.cursorState = 'DOT';
		main.game.crosshair.style.backgroundImage = "url('images/cursors/dot.png')";
	}

	this.batteryPowerEl.style.width = 75 * (this.batteryPower / 100) + 'px';

	main.time = Date.now();
};

Level.prototype.draw = function () {
	main.renderer.toneMappingExposure = Math.pow(0.68, 5.0);
	main.renderer.shadowMap.enabled = true;
	main.renderer.render(this.scene, this.camera);
};

/***********************
*****  GAME CLASS  *****
***********************/
function Game () {
	this.isRunning				= true;
	this.fps					= 0;
	this.fpsEl					= document.getElementById('fps');
	this.crosshair				= document.getElementById('crosshair');
	this.cursorState			= 'DOT';
	this.level 					= new Level(this);
}

Game.prototype.Initialize = function () {

	this.crosshair.style.top = (main.renderer.domElement.clientHeight / 2) - 28 + 'px';
	this.crosshair.style.left = (main.renderer.domElement.clientWidth / 2) - 70 + 'px';
	this.level.Initialize();

};

Game.prototype.update = function () {
	this.fps = fps.getFPS();
	this.fpsEl.innerHTML = this.fps + ' FPS';

	this.level.update();
};

Game.prototype.draw = function () {
	this.level.draw();
};

/*****************
*****  MAIN  *****
*****************/
var main = {
	init: function () {
		var wrapper;
		this.isRunning 				= true;
		this.CANVAS_WIDTH			= window.innerWidth - 20;
		this.CANVAS_HEIGHT			= window.innerHeight - 8;
		this.ASPECT_RATIO			= this.CANVAS_WIDTH / this.CANVAS_HEIGHT;
		this.canvas					= {};
		this.context				= {};
		this.element				= document.body;
		this.container				= document.getElementById('wrapper');
		this.renderer				= new THREE.WebGLRenderer();
		this.time					= Date.now();
		this.clock					= new THREE.Clock();
		this.game 					= new Game();

		// Update Renderer Setting
		this.renderer.physicallyCorrectLights = true;
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		this.renderer.shadowMap.enabled = true;
		this.renderer.toneMapping = THREE.ReinhardToneMapping;
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
		window.addEventListener('mousedown', function (e) { Input.Mouse.OnMouseDown(e); }, false);
		window.addEventListener('mouseup', function (e) { Input.Mouse.OnMouseUp(e); }, false);
		if ('pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document) {
			main.canvas.addEventListener('click', function (e) {
				document.addEventListener('pointerlockchange', main.pointerLockChange, false);
				document.addEventListener('mozpointerlockchange', main.pointerLockChange, false);
				document.addEventListener('webkitpointerlockchange', main.pointerLockChange, false);
				document.addEventListener( 'pointerlockerror', main.pointerLockError, false );
				document.addEventListener( 'mozpointerlockerror', main.pointerLockError, false );
				document.addEventListener( 'webkitpointerlockerror', main.pointerLockError, false );
				main.canvas.requestPointerLock =	main.canvas.requestPointerLock ||
													main.canvas.mozRequestPointerLock ||
													main.canvas.webkitRequestPointerLock;
				// Ask the browser to lock the pointer
				main.canvas.requestPointerLock();
			}, false);
		}

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
	},
	pointerLockChange: function (event) {
		var element = main.canvas;
		if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
			main.game.level.controls.enabled = true;
		} else {
			main.game.level.controls.enabled = false;
		}
	},
	pointerLockError: function (event) {
		console.error('ERROR');
	}
};