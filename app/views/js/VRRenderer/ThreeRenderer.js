/*
* Class ThreeRenderer:
* Management of the 3D-Renderer for a VR and non-VR 
* presentation. Also manages the user input by the
* Oculus Rift Touch Controller and loads the active estate.
*/
var ThreeRenderer = function()
{
	console.log("Init Renderer");

	//**********************************//
	//			Launch Settings			//
	//**********************************//

	// Enable or disable VR: no VR device attached.
	// This flag can also be true without any VR 
	// device attached to the presentation system.
	// however, it will display a 'No VR Device found' message. 
	this.isVRActive 			= true;

	// Enable or disable orbit camera: the camera
	// settings and input controls used by this 
	// flag are used for debug and demonstration purposes
	this.isOrbitActive 			= false;

	// Enable or disable 3D-Grid: for debug purposes
	this.isGridVisible 			= false;

	// Enable or disable visibility of doormarkers
	this.isDoorMarkerVisible 	= true;

	//**********************************//
	//			Render Settings			//
	//**********************************//

	// The HTML canvas rendertarget
	this.canvas 				= null;

	// THREE.js scene object
	this.scene 					= null;

	// THREE.js camera object
	this.camera 				= null;

	// THREE.js render object
	this.renderer 				= null;

	// Field of View: default settings are for a
	// non-VR presentation. If a VR-Device is available the
	// application will handle the FOV for a stereoscoptic 
	// projection (FOV = 120°, 60° per eye)
	this.FOV 					= 75;

	// Client width
	this.cSizeX 				= window.innerWidth;

	// Client height
	this.cSizeY 				= window.innerHeight;

	// Light vector: light direction
	this.lightDir 				= null;

	//**********************************//
	//			App-Objects				//
	//**********************************//

	// Visual grid for orientation
	this.grid 					= null;

	// Non-VR input management
	this.inputControler 		= new InputControler(this);

	// VR controller
	this.controller 			= null;

	// Is a VR divices avaiable (internal flag)? 
	this.isVRAvailable			= false;

	// Copy of 'this'
	var that 					= this;

	// Array for intersections with VR-Intersection ray
	this.intersectsVR = [];

	//**********************************//
	//	Init VR- and THREE Renderer		//
	//**********************************//

	// If we use vr, check for availability
	if(this.isVRActive)
	{
		// Set vr availability to true
		that.isVRAvailable = true;

		// If exception is catched by vr availability check, set vr availability to false
		WEBVR.checkAvailability().catch( function( message ){
			console.log("Checking VR-Avaibility");
			document.body.appendChild( WEBVR.getMessageContainer( message ))
			that.isVRAvailable = false;
		})
	}

	// Init Three.js (cb: detectAndSetVRRenderer)
	this.initTJS(function(renderer){
		//  This button is important. It toggles between normal in-browser view
		//  and the brand new WebVR in-your-googles view!
		if(that.isVRActive) {
			WEBVR.getVRDisplay( function( display ){
				//console.log(renderer);
				renderer.vr.setDevice( display )
				document.body.appendChild( WEBVR.getButton( display, renderer.domElement ))
			})
		}
	});

	// Try to connect VR-Controller
	this.connectVRController(this.scene, this.renderer, this);

	// Create and load the estate for presentation
	this.estate = new Estate(this.scene, this.isDoorMarkerVisible);
	this.estate.loadEstate();

	// Set update callback
	this.animate();
}

// Init canvas, scene, renderer, grid and camera inclusive controls
ThreeRenderer.prototype.initTJS = function(detectAndSetVRRenderer)
{
	// Get canvas
	this.canvas = document.getElementById('myCanvasElement');

	// Create Scene
	this.scene = new THREE.Scene();

	// Init camera - standard perspective camera if rift is disabled
	this.cSizeX		= window.innerWidth;
	this.cSizeY 	= window.innerHeight;

	// FOV is greater if VR is active (60 per eye)
	if(this.isVRActive && this.isVRAvailable)
		this.FOV = 120;
	else // FOV settings for non-VR
		this.FOV = 75;

	// Setup perspective camera
	this.camera = new THREE.PerspectiveCamera
	( 
		this.FOV, 
		//window.innerWidth / window.innerHeight,
		this.cSizeX / this.cSizeY, 
		0.1, 
		10000 
	);

	// Init renderer
	this.renderer = new THREE.WebGLRenderer
	({ 
		canvas 		: this.canvas,
		antialias	: true
	});

	// Set render width and height
	this.renderer.setSize(this.cSizeX, this.cSizeY);

	// Set clear color (white)
	this.renderer.setClearColor(0xFFFFFF);

	// Set a light (white)
	var dirLight = new THREE.DirectionalLight
	(
		0xffffff, 		// color
		1.0				// Intensity			
	);

	// Set light direction
	var pos = new THREE.Vector3 (1, 1, 0);
	dirLight.position.x = pos.x
	dirLight.position.y = pos.y;
	dirLight.position.z = pos.z;

	// Add light to scene
	this.scene.add(dirLight);
	
	// VR settings
	if(this.isVRActive)
	{
		this.renderer.vr.enabled = true;
		this.renderer.vr.standing = true;
	}

	// Set inspectors (camera) position (to be on eye hight)
	if(this.isOrbitActive)
	{
		// Orbit controls are used for debug and internal 
		// feature demonstration purposes
		this.inputControler.setOrbitControls();
	
		// Setup user position (camera position)
		this.inputControler.bodyPosition = new THREE.Vector3(0, 0, 350);
		this.camera.position.set
		( 
			this.inputControler.bodyPosition.x,
			this.inputControler.bodyPosition.y,
			this.inputControler.bodyPosition.z
		);
	}
	else 
	{
		// Setup user position for first person user input: this 
		// is the non-VR input for using the application
		this.inputControler.bodyPosition = new THREE.Vector3(0, 15, 0);
		this.camera.position.set
		( 
			this.inputControler.bodyPosition.x,
			this.inputControler.bodyPosition.y,
			this.inputControler.bodyPosition.z
		);
		
		// Setup camera target
		this.camera.target = new THREE.Vector3( 0, 0, -1 );

		// Look at specific target at launch (neg. z)
		this.camera.lookAt(this.camera.target);

		// Look at target (3D-Object to target)
		/*this.camera.lookAt
		(
			this.camera.position,
			this.camera.target
			new THREE.Vector3(1000,1,0)
		);*/
	}

	// Add world grid
	var gridSettings = 
	{
		position 	: new THREE.Vector3( 0, 0, 0 ),
		size 		: 1000,
		segments 	: 100,
		name 		: 'WorldGrid',
		gridColor 	: 0x666666,
		borderColor : 0x666666,
		xAxisColor 	: 0xff4444,
		yAxisColor 	: 0x44ff44,
		zAxisColor 	: 0x4444ff,
		lineWidth 	: 10
	};

	// Grid interferes with raycaster fps camera
	if(this.isGridVisible)
	{
		this.grid = new GridGenerator(this);
		this.scene.add(this.grid.createGrid(gridSettings));
	}

	// Callback from initTJS
	detectAndSetVRRenderer(this.renderer);
}

// Updates the logic of the graphical application and triggers
// rendering of scene content.
ThreeRenderer.prototype.animate = function()
{
	// Update first person controls
	if(!this.isOrbitActive)
		this.inputControler.updateFPSControls();

	// Resize only if no VR-Device is attached 
	// (three exception/ render context exception)
	if(!this.isVRActive)
		this.resize();

	// Update raycaster and intersected objects
	this.inputControler.updateRaycaster();
	
	// Set the mouse curser if a marker is intersected
	this.inputControler.handleMouseCurserState();

	if(this.isVRActive)
	{
		// Upate the ray and raycaster by controller input
		this.updateRaycasterVR();

		// Change ray color when intersecting any doormarker
		this.handleVRPointerState();
	}

	//  Here’s VRController’s UPDATE goods right here:
	//  This one command in your animation loop is going to handle
	//  all the VR controller business you need to get done!
	THREE.VRController.update();
	
	// Save instance of the class
	var that = this;

	// Bind is slow in chrome
	// https://stackoverflow.com/questions/10697748/how-do-i-use-requestanimationframe-to-call-my-js-prototype
	//requestAnimationFrame( ThreeRenderer.prototype.animate.bind (this) );

	// Handle update
	requestAnimationFrame
	(
		// Update callback 
		function() 
		{
			// Trigger update function recursive
			that.animate ();
		} 
	);

	// Render the scene
	this.render();
}

// Draw function - Render scene content
ThreeRenderer.prototype.render = function()
{	
	this.renderer.render( this.scene, this.camera );
}

// Resize function - Resize sceen if window spaces transform
ThreeRenderer.prototype.resize = function()
{
	// Get actual browser window spaces
	this.cSizeX		= window.innerWidth;
	this.cSizeY 	= window.innerHeight;

	// Compute aspect
	this.camera.aspect 	= this.cSizeX / this.cSizeY;

	// Update camera and set new render spaces
	this.camera.updateProjectionMatrix();
	this.renderer.setSize(this.cSizeX, this.cSizeY);
}


// Connects the VR-Controller and handles controller button events. Also 
// manages intersections with doormarkers by the VR-Intersection-Ray.
// Used example for VR-Controller input:
// https://raw.githubusercontent.com/stewdio/THREE.VRController/master/index.html
ThreeRenderer.prototype.connectVRController = function(scene, renderer, that){
	// Check this out: When THREE.VRController finds a new controller
	// it will emit a custom “vr controller connected” event on the
	// global window object. It uses this to pass you the controller
	// instance and from there you do what you want with it.
	window.addEventListener( 'vr controller connected', function( event ){
		
		// Here it is, your VR controller instance.
		// It’s really a THREE.Object3D so you can just add it to your scene:
		that.controller = event.detail;
		scene.add( that.controller );

		//console.log(THREE.VRController);

		// For standing experiences (not seated) we need to set the standingMatrix
		// otherwise you’ll wonder why your controller appears on the floor
		// instead of in your hands! And for seated experiences this will have no
		// effect, so safe to do either way:
		that.controller.standingMatrix = renderer.vr.getStandingMatrix();

		// And for 3DOF (seated) controllers you need to set the controller.head
		// to reference your camera. That way we can make an educated guess where
		// your hand ought to appear based on the camera’s rotation.
		that.controller.head = window.camera;

		// Right now your controller has no visual.
		// It’s just an empty THREE.Object3D.
		// Let’s fix that!
		var
		meshColorOff = 0xDB3236, // Red
		meshColorOn  = 0xF4C20D, // Yellow
		controllerMaterial = new THREE.MeshStandardMaterial({

			color: meshColorOff,
			emissive: meshColorOff
		}),
		controllerMesh = new THREE.Mesh(

			new THREE.CylinderGeometry( 0.005, 0.05, 0.1, 6 ),
			controllerMaterial
		),
		handleMesh = new THREE.Mesh(

			new THREE.BoxGeometry( 0.03, 0.1, 0.03 ),
			controllerMaterial
		)

		// Set shading (BRDF)
		controllerMaterial.flatShading = true;

		// Adjust controller mesh and add it to scene
		controllerMesh.rotation.x = -Math.PI / 2;
		handleMesh.position.y = -0.05;
		controllerMesh.add( handleMesh );
		that.controller.userData.mesh = controllerMesh; //  So we can change the color later.
		that.controller.add( controllerMesh );

		// Init vr intersection ray if vr is active
		if(that.isVRActive)
			that.initVRIntersectionRay(that.controller, controllerMesh, that);

		// Primary button pressed event
		that.controller.addEventListener( 'primary press began', function( event ){
			// Set controller color
			event.target.userData.mesh.material.color.setHex( meshColorOn );

			// Set ray color
			that.line.material.color.setHex( 0x00ffff );

			// Enable user interaction
			that.isUserInteracting = true;

			// Get the controller position
			var conVec = new THREE.Vector3(0,0,0);
			conVec.x = that.controller.gamepad.pose.position[0];
			conVec.y = that.controller.gamepad.pose.position[1];
			conVec.z = that.controller.gamepad.pose.position[2];

			// Get the controller orientation
			var quad = new THREE.Quaternion
			(
				that.controller.gamepad.pose.orientation[0],	// x
				that.controller.gamepad.pose.orientation[1],	// y
				that.controller.gamepad.pose.orientation[2],	// z
				that.controller.gamepad.pose.orientation[3]		// w
			);

			// Set rotation matrix by controller orientation
			var matrix = new THREE.Matrix4();
			matrix.setRotationFromQuaternion(quad);

			// Multiply rotation matrix with our view vector which aims at z negative.
			var conDir = new THREE.Vector3( 0, 0, -1 );
			conDir = matrix.multiplyVector3(conDir);

			// Init the raycaster which handels intersections by the vr controller ray
			that.raycasterVR = new THREE.Raycaster(conVec, conDir);

			// Get the intersections with vr controller ray
			that.intersectsVR = that.raycasterVR.intersectObjects( that.scene.children, true );

			// Draw a helper arrow to be sure that ray has correct postition and direction
			var helperArrow = new THREE.ArrowHelper
			(
				that.raycasterVR.ray.direction,		// Direction
				that.raycasterVR.ray.origin,		// Position - Origin
				100,								// Length
				0xffffff							// Color
			);

			// Add arrow to scene (for debug purposes)
			//that.scene.add(helperArrow);

			// If we got intersections
			if(that.intersectsVR.length > 0)
			{
				// Plane geometries are the only objects of interest in VR-Mode
				// Note: no experimental doormarkers
				for(var i = 0; i < that.intersectsVR.length; i++)
				{
					// If we found a doormarker, update the estate based on the found marker
					if(that.intersectsVR[i].object.geometry.type === 'PlaneGeometry')
						that.estate.updateEstate(that.intersectsVR[i].object);
				}
			}
		})

		// Primary button released event
		that.controller.addEventListener( 'primary press ended', function( event ){
			event.target.userData.mesh.material.color.setHex( meshColorOff );
			that.line.material.color.setHex( 0x0000ff );
			that.isUserInteracting = false;
		})

		// Disconnect
		that.controller.addEventListener( 'disconnected', function( event ){
			that.controller.parent.remove( controller );
		})
	})
}

ThreeRenderer.prototype.initVRIntersectionRay = function(controller, controllerMesh, that) {
	// Create material for the aiming direction line / ray
	var lineMat = new THREE.LineBasicMaterial({
		color: 0x0000ff
	});

	// Geometry for the line
	var lineGeo = new THREE.Geometry();
	lineGeo.vertices.push(
		new THREE.Vector3( -1000, 0, 0 ),	// -1000 -> length
		new THREE.Vector3( 0, 0, 0 )
	);

	// Init the line
	that.line = new THREE.Line( lineGeo, lineMat );

	// Set name
	that.line.name = "intersectionRayController"

	// Set position / origin
	that.line.position.x = controllerMesh.position.x;
	that.line.position.y = controllerMesh.position.y;
	that.line.position.z = controllerMesh.position.z;

	// Set orientation and rotate by z 90°
	that.line.rotation.x = controllerMesh.rotation.x;
	that.line.rotation.y = controllerMesh.rotation.y;
	that.line.rotation.z = controllerMesh.rotation.z + (-Math.PI / 2);
	that.line.rotation.w = controllerMesh.rotation.w;

	// Add the line to the vr controller
	controller.add(that.line);
}

// If the mouse is over an doormarker, the mouse curser should 
// change to a pointer. Else the curser should be default
ThreeRenderer.prototype.handleVRPointerState = function() 
{
	// If there are intersections
	if(this.intersectsVR.length > 0)
	{
		// Handle only plane geometry and sphere geometry (curved plane) doormarkers
		if(this.intersectsVR[0].object.geometry.type === 'PlaneGeometry')
			this.line.material.color.setHex( 0x00ff00 );
		else if (this.intersectsVR[0].object.geometry.type == "SphereGeometry" && this.intersectsVR[0].object.name != "Room")
			this.line.material.color.setHex( 0x00ff00 );	
		else if(this.intersectsVR[0].object.name == "Room")
			this.line.material.color.setHex( 0x0000ff );
	}
}

// Update the VR intersection ray and the raycaster 
ThreeRenderer.prototype.updateRaycasterVR = function()
{
	if(this.controller && this.controller.gamepad.pose.position)
	{
		// Controller position
		var conVec = new THREE.Vector3(0,0,0);
		conVec.x = this.controller.gamepad.pose.position[0];
		conVec.y = this.controller.gamepad.pose.position[1];
		conVec.z = this.controller.gamepad.pose.position[2];

		// Controller orientation 
		var quad = new THREE.Quaternion
		(
			this.controller.gamepad.pose.orientation[0],	// x
			this.controller.gamepad.pose.orientation[1],	// y
			this.controller.gamepad.pose.orientation[2],	// z
			this.controller.gamepad.pose.orientation[3]		// w
		);

		// Set rotation (direction) matrix by controller orientation
		var matrix = new THREE.Matrix4();
		matrix.setRotationFromQuaternion(quad);

		// Mult mat with vec which aims at z neg (view direction)
		var conDir = new THREE.Vector3( 0, 0, -1 );
		conDir = matrix.multiplyVector3(conDir);

		// Init the raycaster which handels intersections by the vr controller ray
		this.raycasterVR = new THREE.Raycaster(conVec, conDir);

		// Get the intersections with vr controller ray
		this.intersectsVR = this.raycasterVR.intersectObjects( this.scene.children, true );
	}
}