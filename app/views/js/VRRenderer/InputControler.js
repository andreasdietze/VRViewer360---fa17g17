// Note: grid has overlay intersection if fps is active
var InputControler = function(main) 
{
	//console.log("Called InputControler");
	
    this.threeRenderer 			= main;

    // Standing position
	this.bodyPosition 			= null; 
    
    // Mouse manual controls position
	this.onMouseDownMouseX 		= 0;
	this.onMouseDownMouseY 		= 0;
	// Longitude
	this.lon 					= 0;
	// Latitude
	this.lat 					= 0;
	// Angle of twist
	this.phi 					= 0;
	this.theta 					= 0;
	this.onPointerDownPointerX 	= 0
	this.onPointerDownPointerY 	= 0;
	this.onPointerDownLon 		= 0;
    this.onPointerDownLat 		= 0;

    // Checks if input is allowed
	this.isUserInteracting 		= false;
    
    // Raycaster for mouse intersections
    this.mouse 					= new THREE.Vector2();
    this.lastMove 				= Date.now();
    this.raycaster 				= new THREE.Raycaster();

	// Make a copy of 'this' because within a Event-Callback 
	// the keyword 'this' calles the event itself.
    var that = this;

	// Mouse events
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
}

// Update the first person controls.
// Used sample:
// https://github.com/timoxley/threejs/blob/master/examples/webgl_panorama_equirectangular.html
InputControler.prototype.updateFPSControls = function()
{
	// If orbit camera is not active
	if(!this.threeRenderer.isOrbitActive)
	{
		// Update rotation
		this.lat = Math.max( -85, Math.min( 85, this.lat ) );
		this.phi = THREE.Math.degToRad( 90 - this.lat );
		this.theta = THREE.Math.degToRad( this.lon );

		// Set target to look at
		if(this.threeRenderer.camera != 'undefined')
		{
			// Update target vector
			this.threeRenderer.camera.target.x = 500 * Math.sin( this.phi ) * Math.cos( this.theta );
			this.threeRenderer.camera.target.y = 500 * Math.cos( this.phi );
			this.threeRenderer.camera.target.z = 500 * Math.sin( this.phi ) * Math.sin( this.theta );
		}

		// Set look at target
		this.threeRenderer.camera.lookAt( this.threeRenderer.camera.target );
	}
}

// Settings of THREE OrbitControls
InputControler.prototype.setOrbitControls = function()
{
	this.activeControls = new THREE.OrbitControls
	(
		this.threeRenderer.camera,
		this.threeRenderer.renderer.domElement
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
InputControler.prototype.onDocumentMouseDown = function ( event ) 
{
	event.preventDefault();

	switch(event.button)
	{
		case 0: // left
			// Enable mouse move input
			this.isUserInteracting = true;

			// Update non THREE mouse controls on button press
			if(!this.threeRenderer.isOrbitActive)
			{
				this.onPointerDownPointerX = event.clientX;
				this.onPointerDownPointerY = event.clientY;
			
				this.onPointerDownLon = this.lon;
				this.onPointerDownLat = this.lat;
			}

			break;

		case 1: // middle
			break;

		case 2: // right
			break;
	}
}

// Mouse-Up-Event: Lock user input (mouse) once if button was released and check intersections
InputControler.prototype.onDocumentMouseUp = function( event ) 
{
	// If we got intersections
	if(this.intersects.length > 0)
	{
		// Checks only for the closest intersected object. In any case a doormarker
		// is closer to the user than the room sphere.
		// Note: Supports all geometries which have a special name 
		// including experimental doormarkers.
		if( this.intersects[0].object.geometry.name !== "undefined")
			this.threeRenderer.estate.updateEstate(this.intersects[0].object);
	}

	// Lock mouse move input
	this.isUserInteracting = false;
}

// Mouse-Move-Event: While lift mouse button is pressed, update mouse user input
InputControler.prototype.onDocumentMouseMove = function( event )
{
	// if (Date.now() - this.lastMove < 60) { // 60/30 frames a second
    //     return;
    // } else {
    //     this.lastMove = Date.now();
	// }

	// Update non THREE mouse controls on mouse move
	if (this.isUserInteracting && !this.threeRenderer.isOrbitActive) 
	{
		this.lon = ( this.onPointerDownPointerX - event.clientX ) * 0.1 + this.onPointerDownLon;
		this.lat = ( event.clientY - this.onPointerDownPointerY ) * 0.1 + this.onPointerDownLat;
	}

	// Get mouse position between -1 and 1 for both axis
	this.mouse = this.updateMouseVector(event);
}

// Mouse-Wheel-Event: Update user input from mouse wheel (zoom)
// Also handles DOMMouseScroll for different browser support
InputControler.prototype.onDocumentMouseWheel = function( event ) 
{
	// WebKit
	if ( event.wheelDeltaY ) 
	{
		this.threeRenderer.camera.fov -= event.wheelDeltaY * 0.05;

		if(this.threeRenderer.camera.fov > 75)
			this.threeRenderer.camera.fov = 75;

		if(this.threeRenderer.camera.fov < 33)
			this.threeRenderer.camera.fov = 33;

	// Opera / Explorer 9
	} 
	else if ( event.wheelDelta ) 
	{
		this.threeRenderer.camera.fov -= event.wheelDelta * 0.05;

		if(this.threeRenderer.camera.fov > 75)
			this.threeRenderer.camera.fov = 75;

		if(this.threeRenderer.camera.fov < 33)
			this.threeRenderer.camera.fov = 33;

	// Firefox
	}
	else if ( event.detail ) 
	{
		this.threeRenderer.camera.fov += event.detail * 1.0;

		if(this.threeRenderer.camera.fov > 75)
			this.threeRenderer.camera.fov = 75;

		if(this.threeRenderer.camera.fov < 33)
			this.threeRenderer.camera.fov = 33;

	} // end if mouse wheel

	// Update projection with new FOV
	this.threeRenderer.camera.updateProjectionMatrix();
}

// Compute 2D mouse vector for 3D raycast picking. The mouse
// vector is normalized and then mapped from [0, 1] to [-1, 1].
// It also respects the browser scroll offset and the canvas position
InputControler.prototype.updateMouseVector = function( event )
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
	mouse.x     = event.clientX - this.threeRenderer.canvas.offsetLeft + scrollOffsetX;
	mouse.y     = event.clientY - this.threeRenderer.canvas.offsetTop  + scrollOffsetY;

	// Normalize mouse coordinates
	mouse.x     /= this.threeRenderer.canvas.width;
	mouse.y     /= this.threeRenderer.canvas.height;

	// MouseVec to normalVec: maps mouse vector from [0, 1] to [-1, 1]
	mouse.x     =   mouse.x * 2  - 1;
	mouse.y     = -(mouse.y * 2) + 1;

	return mouse;
}

InputControler.prototype.updateRaycaster = function()
{
	// Update the picking ray with the camera and mouse position
	this.raycaster.setFromCamera( this.mouse, this.threeRenderer.camera );

	// Calculate objects intersecting the picking ray
	this.intersects = this.raycaster.intersectObjects( this.threeRenderer.scene.children, true );
}

// If the mouse is over an doormarker, the mouse curser should 
// change to a pointer. Else the curser should be default
InputControler.prototype.handleMouseCurserState = function() 
{
	// If there are intersections
	if(this.intersects.length > 0)
	{
		// Handle only plane geometries (door markers) and sphere geometries which do not have the name "Room"
		if(this.intersects[0].object.geometry.type === 'PlaneGeometry')
			document.body.style.cursor = 'pointer';	
		else if (this.intersects[0].object.geometry.type == "SphereGeometry" && this.intersects[0].object.name != "Room")
			document.body.style.cursor = 'pointer';	
		else 
			document.body.style.cursor = 'default';

	}
}