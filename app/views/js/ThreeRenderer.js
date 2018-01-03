var ThreeRenderer = function()
{
	// Renderer
	console.log("Init Renderer");
	this.canvas 	= null;
	this.scene 		= null; 
	this.camera 	= null;
	this.renderer 	= null;

	// Additional Objects
	this.loader		= null;
	this.dirLight 	= null;
	this.cSizeX		= null;
	this.cSizeY 	= null;
	this.grid 		= null;

	// Scene Objects
	// Inner world sphere - switches texture
	this.innerspheregeometry = null;
	this.innerspherematerial = null;
	this.innerspheremesh = null;

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

	// Init Three.js
	this.initTJS();

	// Init Spheres
	this.initSpheres();

	// Set controls
	this.isOrbitActive = true;
	if(this.isOrbitActive)
	{
		this.setOrbitControls();
	}

	var that = this;
	document.addEventListener('mousedown', function (event){
		that.onDocumentMouseDown(event, that)
	}, false );

	document.addEventListener('mouseup',  function (event){
		that.onDocumentMouseUp(event, that)
	}, false );

	document.addEventListener('mousemove', function (event){
		that.onDocumentMouseMove(event, that)
	}, false );

	document.addEventListener('mousewheel', function (event){
		that.onDocumentMouseWheel(event, that)
	}, false );

	document.addEventListener('DOMMouseScroll', function (event){
		that.onDocumentMouseWheel(event, that)
	}, false );
	

	this.mouse = new THREE.Vector2();
	this.raycaster = new THREE.Raycaster();

	// Set update callback
	this.animate();
}

ThreeRenderer.prototype.initTJS = function()
{
	// Get canvas
	this.canvas = document.getElementById('myCanvasElement');

	// Create Scene
	this.scene = new THREE.Scene();

	// Init camera - standard perspective camera if rift is disabled
	this.cSizeX = 800;
	this.cSizeY = 600;
	this.camera = new THREE.PerspectiveCamera
	( 
		75, 
		//window.innerWidth / window.innerHeight,
		this.cSizeX / this.cSizeY, 
		1, 
		10000 
	);
	this.camera.position.y = 150;
	this.camera.position.z = 350;
	this.camera.target 		= new THREE.Vector3( 0, 0, 0 );

	// Init renderer
	this.renderer = new THREE.WebGLRenderer
	({ 
		canvas 		: this.canvas,
		antialias	: true
	});
	this.renderer.setSize(this.cSizeX, this.cSizeY);
	this.renderer.setClearColor(0xFFFFFF);

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

	this.grid = new GridGenerator(this);
	this.scene.add(this.grid.createGrid(gridSettings));
}

ThreeRenderer.prototype.initSpheres = function ()
{
	// Load panorama file path into string array
	for( var i = 0; i < 7; i++){
		this.panoramas[i] = "img/pano/pano" + i + ".jpg";
		console.log("Loaded into " + i + " " + this.panoramas[i]);
	}

	this.bodyPosition  		= new THREE.Vector3(0, 15, 0);
	this.velocity      		= new THREE.Vector3();

	// Small panorama sphere - world inside world
	this.innerspheregeometry = new THREE.SphereGeometry(200, 320, 320);//(20, 32, 32);
	this.innerspherematerial = new THREE.MeshBasicMaterial
	(
		{
			map: THREE.ImageUtils.loadTexture("img/pano/pano0.jpg"), side:THREE.DoubleSide //, wireframe:true
			//("http://www.html5canvastutorials.com/demos/assets/crate.jpg")  // Test URL 
		} 
	);
	
	this.innerspheremesh 	= new THREE.Mesh(this.innerspheregeometry, this.innerspherematerial);

	// Invert the geometry on the x-axis so that all of the faces point inward
	this.innerspheregeometry.applyMatrix( new THREE.Matrix4().makeScale(-1,1,1));  

	this.innerspheremesh.position.copy(new THREE.Vector3(0,15,0));

	this.scene.add(this.innerspheremesh); 

	this.camera.position.set(this.bodyPosition.x, this.bodyPosition.y, this.bodyPosition.z);

	this.doorMarker = new DoorMarker
	(
		new THREE.Vector3(-80, -20, -175),	// Position
		new THREE.Vector3(-10, 30, 0), 		// Orientation
		new THREE.Vector3(2.5,3,1),			// Scale
		this.scene							// Scene
	);	
	
	console.log(this.scene);
}

ThreeRenderer.prototype.animate = function()
{
	if(!this.isOrbitActive)
	{
		this.lat = Math.max( -85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );
		this.theta = THREE.Math.degToRad( this.lon );

		// Set target to look at
		if(this.camera != 'undefined')
		{
			this.camera.target.x = 500 * Math.sin( this.phi ) * Math.cos( this.theta );
			this.camera.target.y = 500 * Math.cos( this.phi );
			this.camera.target.z = 500 * Math.sin( this.phi ) * Math.sin( this.theta );
		}

		this.camera.lookAt( this.camera.target );
	}

	// Resize
	this.cSizeX 		= 800; //(this.uploadPan.clientHeight / 3) * 4;
	this.cSizeY 		= 600; //this.uploadPan.clientHeight;
	this.camera.aspect 	= this.cSizeX / this.cSizeY;

	this.camera.updateProjectionMatrix();
	this.renderer.setSize(this.cSizeX, this.cSizeY);

	requestAnimationFrame( ThreeRenderer.prototype.animate.bind (this) );

	this.render();
}

ThreeRenderer.prototype.render = function()
{
	this.renderer.render( this.scene, this.camera );
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

// Update user input (mouse) if left or right mouse button is pressed
// Update user input (mouse) once if middle mouse button is pressed
// and switch panorama
ThreeRenderer.prototype.onDocumentMouseDown = function ( event, that ) 
{
	event.preventDefault();

	//console.log(that.onPointerDownPointerX);
	switch(event.button)
	{
		case 0: // left
			that.isUserInteracting = true;

			// Update non THREE mouse controls on button press
			if(!this.isOrbitActive)
			{
				that.onPointerDownPointerX = event.clientX;
				that.onPointerDownPointerY = event.clientY;
			
				that.onPointerDownLon = that.lon;
				that.onPointerDownLat = that.lat;
			}

			// Get mouse position between -1 and 1 for both axis
			this.mouse = this.updateMouseVector(event);

			// Update the picking ray with the camera and mouse position
			this.raycaster.setFromCamera( this.mouse, this.camera );

			// Calculate objects intersecting the picking ray
			var intersects = this.raycaster.intersectObjects( this.scene.children, true );
	
			if(intersects.length > 0)
			{
				if(intersects[0].object.geometry.type === 'PlaneGeometry')
				{
					intersects[0].object.material.color.set( 0xff0000 );
					that.panocounter++;
		
					if(that.panocounter > 6) 
						that.panocounter = 0; 
		
					// Switch panoramas
					console.log(that.innerspheremesh);
					that.innerspheremesh.material.map = THREE.ImageUtils.loadTexture(that.panoramas[that.panocounter]);
					that.innerspheremesh.material.needUpdate = true;
		
					console.log('Src in panoramas : ' + that.panoramas[that.panocounter]);
					console.log('Panocounter: ' + that.panocounter);
				}
			}
			break;

		case 1: // middle
			// Switch between panoramas
			console.log(that.camera);
			that.panocounter++;

			if(that.panocounter > 6) 
				that.panocounter = 0; 

			// Switch panoramas
			console.log(that.innerspheremesh);
			that.innerspheremesh.material.map = THREE.ImageUtils.loadTexture(that.panoramas[that.panocounter]);
			that.innerspheremesh.material.needUpdate = true;

			console.log('Src in panoramas : ' + that.panoramas[that.panocounter]);
			console.log('Panocounter: ' + that.panocounter);
			break;

		case 2: // right
		//riftEnabled = true;
			break;
	}
}

// Lock user input (mouse) once if button was released
ThreeRenderer.prototype.onDocumentMouseUp = function(event, that) 
{
	that.isUserInteracting = false;
}

// While lift mouse button is pressed, update mouse user input
ThreeRenderer.prototype.onDocumentMouseMove = function(event, that)
{
	// Update non THREE mouse controls on mouse move
	if (that.isUserInteracting && !that.isOrbitActive) 
	{
		that.lon = ( that.onPointerDownPointerX - event.clientX ) * 0.1 + that.onPointerDownLon;
		that.lat = ( event.clientY - that.onPointerDownPointerY ) * 0.1 + that.onPointerDownLat;
	}
}

// Update user input from mouse wheel
ThreeRenderer.prototype.onDocumentMouseWheel = function(event, that) 
{
	// WebKit
	if ( event.wheelDeltaY ) 
	{

		that.camera.fov -= event.wheelDeltaY * 0.05;
		// fovrange -= event.wheelDeltaY * 0.05;
		// fovscale -= event.wheelDeltaY * 0.0005;
		// console.log("Increased RiftFOV by : " + fovscale);
		// console.log("Increased FOV by : " + fovrange);
		// console.log("FOV : " + finalfov);

	// Opera / Explorer 9
	} 
	else if ( event.wheelDelta ) 
	{

		that.camera.fov -= event.wheelDelta * 0.05;
		// fovrange -= event.wheelDelta * 0.05;
		// fovscale -= event.wheelDelta * 0.0005;
		// console.log("Increased RiftFOV by : " + fovscale);
		// console.log("Increased FOV by : " + fovrange);
		// console.log("FOV : " + finalfov);

	// Firefox
	}
	else if ( event.detail ) 
	{

		that.camera.fov += event.detail * 1.0;
		// fovrange += event.detail * 1.0;
		// fovscale += event.detail * 0.01;
		// console.log("Increased RiftFOV by : " + fovscale);
		// console.log("Increased FOV by : " + fovrange);
		// console.log("FOV : " + finalfov);

	} // end if mouse wheel

	// Update projection with new FOV
	that.camera.updateProjectionMatrix();
	//riftCam = new THREE.OculusRiftEffect(renderer);
}

ThreeRenderer.prototype.updateMouseVector = function(event)
{
	// Init vector2D for mouse
	var mouse = new THREE.Vector2(0,0,0);

	// Get scroll offset by the different browsers
	var scrollOffsetX = (window.pageXOffset ||
						 window.scrollX     ||
						 document.documentElement.scrollLeft);

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

