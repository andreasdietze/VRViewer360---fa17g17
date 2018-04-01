// Renderer
var ThreeRenderer = function()
{
	console.log("Init Renderer");

	// Launch settings
	this.isVRActive 			= false;
	this.isOrbitActive 			= false;
	this.isGridVisible 			= false;
	this.isDoorMarkerVisible 	= false;
	this.test 					= false;

	// Renderer, scene, camera and spaces
	this.canvas 				= null;
	this.scene 					= null; 
	this.camera 				= null;
	this.renderer 				= null;
	this.FOV 					= 75;
	this.cSizeX 				= window.innerWidth;
	this.cSizeY 				= window.innerHeight;

	// Visual grid for orientation
	this.grid 					= null;

	// Non-VR input management
	this.inputControler 		= new InputControler(this);

	// VR controller
	this.controller 			= null;

	// Copy of 'this'
	var that 					= this;

	// If we use vr, check for availability
	if(this.isVRActive)
	{
		WEBVR.checkAvailability().catch( function( message ){
			console.log("Checking VR-Avaibility");
			document.body.appendChild( WEBVR.getMessageContainer( message ))
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

	// Try to connect VR-Controller and setup dat GUI
	this.connectVRController(this.scene, this.renderer, this);

	// Init Estate/Rooms
	this.estate = new Estate(this.scene, this.isDoorMarkerVisible);
	this.estate.loadEstate();

	document.addEventListener('keydown', function (event){
		that.onKeyDown(event)
	}, false );

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
	this.cSizeX		= window.innerWidth;  //800;
	this.cSizeY 	= window.innerHeight; //600;
	if(this.isVRActive)
		this.FOV = 120;
	else 
		this.FOV = 75;
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
	this.renderer.setSize(this.cSizeX, this.cSizeY);
	this.renderer.setClearColor(0xFFFFFF);
	
	// VR settings
	this.renderer.vr.enabled = true;
	this.renderer.vr.standing = true;

	// Set inspectors (camera) position (to be on eye hight)
	if(this.isOrbitActive)
	{
		this.inputControler.setOrbitControls();
	
		this.inputControler.bodyPosition = new THREE.Vector3(0, 0, 350);
		this.camera.position.set( this.inputControler.bodyPosition.x, this.inputControler.bodyPosition.y, this.inputControler.bodyPosition.z );
	}
	else 
	{
		this.inputControler.bodyPosition = new THREE.Vector3(0, 15, 0);
		this.camera.position.set( this.inputControler.bodyPosition.x, this.inputControler.bodyPosition.y, this.inputControler.bodyPosition.z );
		
		// TODO: Look at specific target when lauchning
		this.camera.target 		= new THREE.Vector3( 0, 0, -1 );
		this.camera.lookAt(this.camera.position, this.camera.target, new THREE.Vector3(1000,1,0));
	}

	// Add world grid.
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

	// Grid interferes with raycaster fps cam
	if(this.isGridVisible)
	{
		this.grid = new GridGenerator(this);
		this.scene.add(this.grid.createGrid(gridSettings));
	}

	// Callback
	detectAndSetVRRenderer(this.renderer);

	//var torus = new THREE.Mesh(
		
		//new THREE.TorusKnotGeometry( 0.4, 0.15, 256, 32 ),
		//new THREE.MeshStandardMaterial({ roughness: 0.01, metalness: 0.2 })
	//)
	//torus.position.set( -0.25, 1.4, -1.5 )
	//torus.castShadow    = true
	//torus.receiveShadow = true
	//this.scene.add( torus )

	//  DAT GUI for WebVR is just one of the coolest things ever.
	//  Huge, huge thanks to Jeff Nusz / http://custom-logic.com
	//  and Michael Chang / http://minmax.design for making this!!
	//  https://github.com/dataarts/dat.guiVR

	dat.GUIVR.enableMouse( this.camera )
	//console.log(dat.GUIVR);
	//var gui = dat.GUIVR.create( 'Settings' )
	//gui.position.set( 0.2, 0.8, -1 )
	//gui.rotation.set( Math.PI / -6, 0, 0 )
	//this.scene.add( gui )
	//gui.add( torus.position, 'x', -1, 1 ).step( 0.001 ).name( 'Position X' )
	//gui.add( torus.position, 'y', -1, 2 ).step( 0.001 ).name( 'Position Y' )
	//gui.add( torus.rotation, 'y', -Math.PI, Math.PI ).step( 0.001 ).name( 'Rotation' ).listen()
	//castShadows( gui )
}

// Updates the logic of the graphical application and triggers
// rendering of scene content.
ThreeRenderer.prototype.animate = function()
{
	// Update first person controls
	if(!this.isOrbitActive)
		this.inputControler.updateFPSControls();

	// Resize
	this.resize();

	// Update raycaster and intersected objects
	this.inputControler.updateRaycaster();
	
	// Set the mouse curser if a marker is intersected
	this.inputControler.handleMouseCurserState();

	// Save instance to the class
	var that = this;

	//  Here’s VRController’s UPDATE goods right here:
	//  This one command in your animation loop is going to handle
	//  all the VR controller business you need to get done!
	THREE.VRController.update();

	// Handle update
	requestAnimationFrame
	(
		// Update callback 
		function() 
		{
			// Trigger update function
			that.animate ();
		} 
	);

	// Blind is slow in chrome
	// https://stackoverflow.com/questions/10697748/how-do-i-use-requestanimationframe-to-call-my-js-prototype
	//requestAnimationFrame( ThreeRenderer.prototype.animate.blind (this) );
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

			color: meshColorOff
		}),
		controllerMesh = new THREE.Mesh(

			new THREE.CylinderGeometry( 0.005, 0.05, 0.1, 6 ),
			controllerMaterial
		),
		handleMesh = new THREE.Mesh(

			new THREE.BoxGeometry( 0.03, 0.1, 0.03 ),
			controllerMaterial
		)

		controllerMaterial.flatShading = true;
		controllerMesh.rotation.x = -Math.PI / 2;
		handleMesh.position.y = -0.05;
		controllerMesh.add( handleMesh );
		that.controller.userData.mesh = controllerMesh;//  So we can change the color later.
		that.controller.add( controllerMesh );
		//castShadows( controller )
		//receiveShadows( controller )

		that.initVRIntersectionRay(that.controller, controllerMesh, that);

		// Allow this controller to interact with DAT GUI.
		var guiInputHelper = dat.GUIVR.addInputObject( that.controller );
		scene.add( guiInputHelper );

		// Button events. How easy is this?!
		// We’ll just use the “primary” button -- whatever that might be ;)
		// Check out the THREE.VRController.supported{} object to see
		// all the named buttons we’ve already mapped for you!
		that.controller.addEventListener( 'primary press began', function( event ){
			event.target.userData.mesh.material.color.setHex( meshColorOn );
			guiInputHelper.pressed( true );

			that.isUserInteracting = true;
			//console.log(that.controller);

			// Controller position
			var conVec = new THREE.Vector3(0,0,0);
			conVec.x = that.controller.gamepad.pose.position[0];
			conVec.y = that.controller.gamepad.pose.position[1];
			conVec.z = that.controller.gamepad.pose.position[2];

			// Controller orientation 
			var quad = new THREE.Quaternion
			(
				that.controller.gamepad.pose.orientation[0],	// x
				that.controller.gamepad.pose.orientation[1],	// y
				that.controller.gamepad.pose.orientation[2],	// z
				that.controller.gamepad.pose.orientation[3]		// w
			);

			// Set rotation (direction) matrix by controller orientation
			var matrix = new THREE.Matrix4();
			matrix.setRotationFromQuaternion(quad);

			// Mult mat with vec which aims at z neg (view direction)
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

			// Add arrow to scene
			//that.scene.add(helperArrow);

			//console.log(that.intersectsVR);
			if(that.intersectsVR.length > 0)
			{
				for(var i = 0; i < that.intersectsVR.length; i++)
				{
					if(that.intersectsVR[i].object.geometry.type === 'PlaneGeometry')
						that.estate.updateEstate(that.intersectsVR[i].object);
				}
			}
		})

		that.controller.addEventListener( 'primary press ended', function( event ){
			event.target.userData.mesh.material.color.setHex( meshColorOff );
			guiInputHelper.pressed( false );
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