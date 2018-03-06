var ThreeRenderer = function()
{
	// INFO:
	// Klasse für Sphere erstellen (Room, -> enthält mehrere Marker (array) / MarkerManager möglich, hält array einzelne
	// Marker -> Estate enhält array von Rooms -> Room enthält MarkerHandler (DoorMarkerFactory) -> DoorMarkerFactory enthält array von DoorMarkers
	// http://www.dofactory.com/javascript/factory-method-design-pattern
	// Renderer
	console.log("Init Renderer");
	this.test 		= false;
	this.canvas 	= null;
	this.scene 		= null; 
	this.camera 	= null;
	this.renderer 	= null;
	this.vrIsActive = true;
	this.FOV 		= 75;

	// Additional Objects
	this.loader		= null;
	this.dirLight 	= null;
	this.cSizeX		= window.innerWidth;  //null;
	this.cSizeY 	= window.innerHeight; //null;
	this.grid 		= null;

	// Parameter for jump animation
	this.bodyPosition = null; 
	this.velocity = null;
	// Texture array which holds our panoramas
	this.panoramas = [6];
	// Count and switch the panorama (Key: Space)
	this.panocounter = 0;

	// Checks if input is allowed
	this.isUserInteracting = false;
	// Mouse position
	this.onMouseDownMouseX = 0;
	this.onMouseDownMouseY = 0;
	// Longitude
	this.lon = 0;
	// Latitude
	this.lat = 0;
	// Angle of twist
	this.phi = 0;
	this.theta = 0;
	this.onPointerDownPointerX = 0
	this.onPointerDownPointerY = 0;
	this.onPointerDownLon = 0;
	this.onPointerDownLat = 0;

	// Set controls
	this.isOrbitActive = true;

	// Raycaster
	this.mouse = new THREE.Vector2();
	this.lastMove = Date.now();
	this.raycaster = new THREE.Raycaster();

	this.controller = null;
	var that = this;

	// If we use vr, check for availability
	if(this.vrIsActive)
	{
		WEBVR.checkAvailability().catch( function( message ){
			console.log("Checking VR-Avaibility");
			document.body.appendChild( WEBVR.getMessageContainer( message ))
		})
	}

	// Init Three.js (cb: detectAndSetVRRenderer)
	this.initTJS(function(renderer){
		//  This button is important. It toggles between normal in-browser view
		//  and the brand new WebVR in-your-goggles view!
		if(that.vrIsActive) {
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
	this.estate = new Estate(this.scene);
	this.estate.loadEstateOne();
	//this.initEstate();

	// document.addEventListener('mousedown', function (event){
	// 	that.onDocumentMouseDown(event, that)
	// }, false );

	document.addEventListener('mousedown', function (event){
		that.onDocumentMouseDown(event)
	}, false );

	document.addEventListener('mouseup',  function (event){
		that.onDocumentMouseUp(event)
	}, false );

	document.addEventListener('mousemove', function (event){
		that.onDocumentMouseMove(event)
	}, false );

	document.addEventListener('mousewheel', function (event){
		that.onDocumentMouseWheel(event)
	}, false );

	document.addEventListener('DOMMouseScroll', function (event){
		that.onDocumentMouseWheel(event)
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
	if(this.vrIsActive)
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
		this.setOrbitControls();
	
		this.bodyPosition  		= new THREE.Vector3(0, 0, 350);
		this.camera.position.set( this.bodyPosition.x, this.bodyPosition.y, this.bodyPosition.z );
	}
	else 
	{
		this.bodyPosition  		= new THREE.Vector3(0, 15, 0);
		this.camera.position.set( this.bodyPosition.x, this.bodyPosition.y, this.bodyPosition.z );
		
		// TODO: Look at specific target when lauchning
		this.camera.target 		= new THREE.Vector3( 0, 0, -1 );
		this.camera.lookAt(this.camera.position, this.camera.target, new THREE.Vector3(1000,1,0));
		// console.log(this.camera.target);
	}

	// Hey may jump (later in VR ^^)
	this.velocity      		= new THREE.Vector3();

	// Set a light
	var dirLight = new THREE.DirectionalLight
	(
		0xffffff, 		// color
		1.0				// Intensity			
	);

	var pos = new THREE.Vector3 (1, 1, 0);
	dirLight.position.x = pos.x
	dirLight.position.y = pos.y;
	dirLight.position.z = pos.z;
	this.scene.add(dirLight);

	// var light = new THREE.AmbientLight( 0x404040, 3 );
	// scene.add( light );

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
	if(this.isOrbitActive)
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
	console.log(dat.GUIVR);
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
	this.updateFPSControls();

	// Resize
	this.resize();

	// Update raycaster and intersected objects
	this.updateRaycaster();
	
	// Set the mouse curser if a marker is intersected
	this.handleMouseCurserState();

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

ThreeRenderer.prototype.resize = function()
{
	// Resize
	//this.cSizeX 		= 800; //(this.uploadPan.clientHeight / 3) * 4;
	//this.cSizeY 		= 600; //this.uploadPan.clientHeight;
	this.cSizeX		= window.innerWidth;  //800;
	this.cSizeY 	= window.innerHeight; //600;
	this.camera.aspect 	= this.cSizeX / this.cSizeY;

	this.camera.updateProjectionMatrix();
	this.renderer.setSize(this.cSizeX, this.cSizeY);
}

ThreeRenderer.prototype.setOrbitControls = function()
{
	this.activeControls = new THREE.OrbitControls
	(
		this.camera,
		this.renderer.domElement
	);

	this.activeControls.rotateSpeed 		= 1.0;
	this.activeControls.enableDamping 		= true;
	this.activeControls.dampingFactor 		= 1.25;
	this.activeControls.zoomSpeed 			= 1.2;
	this.activeControls.keys 				= [ 65, 83, 68 ];

	this.activeControls.autoRotate 			= false;
	this.activeControls.autoRotateSpeed 	= 0.5;
};

// Mouse-Down-Event: Raycast intersection and room handling (for now)
ThreeRenderer.prototype.onDocumentMouseDown = function ( event ) 
{
	event.preventDefault();

	switch(event.button)
	{
		case 0: // left
			this.isUserInteracting = true;

			// Update non THREE mouse controls on button press
			// if(!this.isOrbitActive)
			// {
			// 	this.onPointerDownPointerX = event.clientX;
			// 	this.onPointerDownPointerY = event.clientY;
			
			// 	this.onPointerDownLon = this.lon;
			// 	this.onPointerDownLat = this.lat;
			// }

			if(this.intersects.length > 0)
			{
				if(this.intersects[0].object.geometry.type === 'PlaneGeometry')
				{
					//console.log(this.intersects[0]);
					//this.intersects[0].object.material.color.set( 0xff0000 );
					
					if(this.test)
					{
						this.estate.updateTestEstate();
					}
					else 
					{
						this.estate.updateEstateOne(this.intersects[0].object);
					}
				}
			}
			
			break;

		case 1: // middle
			if(this.test)
				this.estate.updateTestEstate();
			break;

		case 2: // right
		//riftEnabled = true;
			break;
	}
}

// Mouse-Up-Event: Lock user input (mouse) once if button was released
ThreeRenderer.prototype.onDocumentMouseUp = function( event ) 
{
	this.isUserInteracting = false;
}

// Mouse-Move-Event: While lift mouse button is pressed, update mouse user input
ThreeRenderer.prototype.onDocumentMouseMove = function( event )
{
	// if (Date.now() - this.lastMove < 60) { // 32 frames a second
    //     return;
    // } else {
    //     this.lastMove = Date.now();
	// }

	// Update non THREE mouse controls on mouse move
	if (this.isUserInteracting && !this.isOrbitActive) 
	{
		this.lon = ( this.onPointerDownPointerX - event.clientX ) * 0.1; // + this.onPointerDownLon;
		this.lat = ( event.clientY - this.onPointerDownPointerY ) * 0.1; // + this.onPointerDownLat;
	}

	// Get mouse position between -1 and 1 for both axis
	this.mouse = this.updateMouseVector(event);
}

// Mouse-Wheel-Event: Update user input from mouse wheel (zoom)
// Also handles DOMMouseScroll for different browser support
ThreeRenderer.prototype.onDocumentMouseWheel = function( event ) 
{
	// WebKit
	if ( event.wheelDeltaY ) 
	{
		this.camera.fov -= event.wheelDeltaY * 0.05;
		console.log(this.camera.fov);
		// fovrange -= event.wheelDeltaY * 0.05;
		// fovscale -= event.wheelDeltaY * 0.0005;
		// console.log("Increased RiftFOV by : " + fovscale);
		// console.log("Increased FOV by : " + fovrange);
		// console.log("FOV : " + finalfov);

	// Opera / Explorer 9
	} 
	else if ( event.wheelDelta ) 
	{
		this.camera.fov -= event.wheelDelta * 0.05;
		// fovrange -= event.wheelDelta * 0.05;
		// fovscale -= event.wheelDelta * 0.0005;
		// console.log("Increased RiftFOV by : " + fovscale);
		// console.log("Increased FOV by : " + fovrange);
		// console.log("FOV : " + finalfov);

	// Firefox
	}
	else if ( event.detail ) 
	{
		this.camera.fov += event.detail * 1.0;
		// fovrange += event.detail * 1.0;
		// fovscale += event.detail * 0.01;
		// console.log("Increased RiftFOV by : " + fovscale);
		// console.log("Increased FOV by : " + fovrange);
		// console.log("FOV : " + finalfov);

	} // end if mouse wheel

	// Update projection with new FOV
	this.camera.updateProjectionMatrix();
	//riftCam = new THREE.OculusRiftEffect(renderer);
}

// Compute 2D mouse vector for 3D raycast picking. The mouse
// vector is normalized and then mapped from [0, 1] to [-1, 1].
// It also respects the browser scroll offset and the canvas position
ThreeRenderer.prototype.updateMouseVector = function( event )
{
	// Init vector2D for mouse
	var mouse = new THREE.Vector2(0,0);

	// Get scroll offset by the different browsers
	var scrollOffsetX = 
	(
		window.pageXOffset ||
		window.scrollX     ||
		document.documentElement.scrollLeft
	);

	var scrollOffsetY = (window.pageYOffset ||
						 window.scrollY     || 
						 document.documentElement.scrollTop);

	// Get mouse position inside render area in dependence of the scroll offset
	mouse.x     = event.clientX - this.canvas.offsetLeft + scrollOffsetX;
	mouse.y     = event.clientY - this.canvas.offsetTop  + scrollOffsetY;

	// Normalize mouse coordinates
	mouse.x     /= this.canvas.width;
	mouse.y     /= this.canvas.height;

	// MouseVec to normalVec: maps mouse vector from [0, 1] to [-1, 1]
	mouse.x     =   mouse.x * 2  - 1;
	mouse.y     = -(mouse.y * 2) + 1;

	return mouse;
}

ThreeRenderer.prototype.updateRaycaster = function()
{
	// Update the picking ray with the camera and mouse position
	this.raycaster.setFromCamera( this.mouse, this.camera );

	// Calculate objects intersecting the picking ray
	this.intersects = this.raycaster.intersectObjects( this.scene.children, true );
}

// If the mouse is over an doormarker, the mouse curser should 
// change to a pointer. Else the curser should be default
ThreeRenderer.prototype.handleMouseCurserState = function() 
{
	// If there are intersections
	if(this.intersects.length > 0)
	{
		// Handle only plane geometries (door markers)
		if(this.intersects[0].object.geometry.type === 'PlaneGeometry')
			document.body.style.cursor = 'pointer';	
		else 
			document.body.style.cursor = 'default';
	}
}

// Update the first person controls
ThreeRenderer.prototype.updateFPSControls = function()
{
	// If orbit camera is not active
	if(!this.isOrbitActive)
	{
		// Update rotation
		this.lat = Math.max( -85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );
		this.theta = THREE.Math.degToRad( this.lon );

		// Set target to look at
		if(this.camera != 'undefined')
		{
			// Update target vector
			this.camera.target.x = 500 * Math.sin( this.phi ) * Math.cos( this.theta );
			this.camera.target.y = 500 * Math.cos( this.phi );
			this.camera.target.z = 500 * Math.sin( this.phi ) * Math.sin( this.theta );
		}

		// Set look at target
		this.camera.lookAt( this.camera.target );
	}
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
					{
						if(that.test)
						{
							that.estate.updateTestEstate();
						}
						else 
						{
							that.estate.updateEstateOne(that.intersectsVR[i].object);
						}
					}
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
