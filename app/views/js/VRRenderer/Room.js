/*
* Class Room:
* A Room consists of a sphere object and several
* DoorMarkers handled by a RoomMarkerFactory.
* Each marker provides access to another room of
* a estate.
*
* @param {THREE.Scene}      scene
* Due to a Room.js object is a THREE.Object3D object, it
* has to be added to the a THREE.Scene object to be interactive
* (intersection with THREE.Raycaster) and renderable.
*
* @param {string}           texturePath
* Location string for the sphere texture.
*
* @param {int}              markerSetup
* Pree defined Room setup.
*/
var Room = function (scene, texturePath, markerSetup)
{
    // THREE.js scene object
    this.scene          = scene;

    // Public vars
    this.sphereGeo      = null;
    this.sphereMat      = null;
    this.sphereMesh     = null;
    this.texturePath    = texturePath;
    this.markerSetup    = markerSetup;

    // DoorMarkerFacroty
    this.doorMarkerFactory = null;

    // For test room
    this.panoramas      = [];

    //this.createTestRoom();

    this.create(texturePath);
}

// Creates a test scenario with a sphere and default 
// door marker factory with two markers at. By pressing 
// on one of the markers, the  texture of the sphere is 
// changed sequentially.
Room.prototype.createTestRoom = function () 
{
    // Load panorama file path into string array (Test)
	for( var i = 0; i < 7; i++){
		this.panoramas[i] = "img/pano/pano" + i + ".jpg";
		console.log("Loaded into " + i + " " + this.panoramas[i]);
	}

	// Create panorama sphere 
    this.sphereGeo = new THREE.SphereGeometry
    (
        200, // radius — sphere radius. Default is 1.
        32,  // widthSegments — number of horizontal segments. Minimum value is 3, and the default is 8.
        32   // heightSegments — number of vertical segments. Minimum value is 2, and the default is 6.
             // phiStart — specify horizontal starting angle. Default is 0.
             // phiLength — specify horizontal sweep angle size. Default is Math.PI * 2.
             // thetaStart — specify vertical starting angle. Default is 0.
             // thetaLength — specify vertical sweep angle size. Default is Math.PI.
    );

    // Set material
	this.sphereMat = new THREE.MeshBasicMaterial
	(
		{
            map: THREE.ImageUtils.loadTexture("img/pano/pano0.jpg"),
            side:THREE.DoubleSide //, wireframe:true
			//("http://www.html5canvastutorials.com/demos/assets/crate.jpg")  // Test URL 
		} 
	);
    
    // Create the mesh
	this.spehreMesh = new THREE.Mesh(this.sphereGeo, this.sphereMat);

	// Invert the geometry on the x-axis so that all of the faces point inward
	this.sphereGeo.applyMatrix( new THREE.Matrix4().makeScale(-1,1,1));  

    // Setup mesh transformation (ensure that initialy every sphere is at 0,0,0)
    this.spehreMesh.position.copy(new THREE.Vector3(0,0,0));
    
    // Create default DoorMarkerFacroty without any door markers
    this.doorMarkerFactory = new DoorMarkerFactory();

    // Add some markers
    this.doorMarkerFactory.addMarker
    (
        new DoorMarker
        (
            0,                                  // ID
            new THREE.Vector3(-80, -20, -175),	// Position
            new THREE.Vector3(-10, 30, 0), 		// Orientation
            new THREE.Vector3(2.5,3,1),			// Scale
            this.scene							// Scene
        )
    );

    this.doorMarkerFactory.addMarker
    (
        new DoorMarker
        (
            0,                                  // ID
            new THREE.Vector3(180, -35, -45),	// Position
            new THREE.Vector3(0, 104 , 0),	    // Orientation
            new THREE.Vector3(5.5,5,1),			// Scale
            this.scene							// Scene
        )
    );

    // Add mesh to scene
	this.scene.add(this.spehreMesh); 
}

// Creates a Room with a specially pre defined marker
// setup constructed by the door marker factory. 
// If there is no marker setup provided by the 
// door marker factory constructor, the room 
// has only a sphere without any door markers.
Room.prototype.create = function (texturePath) 
{
	// Create panorama sphere 
    this.sphereGeo = new THREE.SphereGeometry
    (
        200, // radius — sphere radius. Default is 1.
        32,  // widthSegments — number of horizontal segments. Minimum value is 3, and the default is 8.
        32   // heightSegments — number of vertical segments. Minimum value is 2, and the default is 6.
             // phiStart — specify horizontal starting angle. Default is 0.
             // phiLength — specify horizontal sweep angle size. Default is Math.PI * 2.
             // thetaStart — specify vertical starting angle. Default is 0.
             // thetaLength — specify vertical sweep angle size. Default is Math.PI.
    );

    // Set material
	this.sphereMat = new THREE.MeshBasicMaterial
	(
		{
            map: THREE.ImageUtils.loadTexture(texturePath), // "img/pano/pano0.jpg"
            side:THREE.DoubleSide                           //, wireframe:true
			//("http://www.html5canvastutorials.com/demos/assets/crate.jpg")  // Test URL 
		} 
	);
    
    // Create the mesh
	this.spehreMesh = new THREE.Mesh(this.sphereGeo, this.sphereMat);

	// Invert the geometry on the x-axis so that all of the faces point inward
	this.sphereGeo.applyMatrix( new THREE.Matrix4().makeScale(-1,1,1));  

    // Setup mesh transformation (ensure that initialy every sphere is at 0,0,0)
    this.spehreMesh.position.copy(new THREE.Vector3(0,0,0));
    
    // Handle marker factory
    if(this.markerSetup > -1)
    {
        // Pre defined marker setup
        this.doMarkerSetup(this.markerSetup);
    }
    else 
    {
        // Create default DoorMarkerFacroty without any door markers
        this.doorMarkerFactory = new DoorMarkerFactory();
    }

    this.spehreMesh.name = "Room";

    // Add mesh to scene
	this.scene.add(this.spehreMesh); 
}

// DoorMarkerFactory - Setter
Room.prototype.setDoorMarkerFactory = function (doorMarkerFactory)
{
    this.doorMarkerFactory = doorMarkerFactory;
}

// Execute the pre defined marker setup for each room.
Room.prototype.doMarkerSetup = function(markerSetup)
{
    // Create default DoorMarkerFacroty without any door markers
    this.doorMarkerFactory = new DoorMarkerFactory();

    switch(markerSetup)
    {
        case 0: // Add some markers for setup 0
        this.doorMarkerFactory.addMarker
        (
            new DoorMarker
            (
                0,                                  // ID
                new THREE.Vector3(-80, -20, -175),	// Position
                new THREE.Vector3(-10, 30, 0), 		// Orientation
                new THREE.Vector3(2.5,3,1),			// Scale
                this.scene							// Scene
            )
        );

        this.doorMarkerFactory.addMarker
        (
            new DoorMarker
            (
                1,                                  // ID
                new THREE.Vector3(180, -35, -45),	// Position
                new THREE.Vector3(0, 104 , 0),	    // Orientation
                new THREE.Vector3(5.5,5,1),			// Scale
                this.scene							// Scene
            )
        );
        break;

        case 1: // Add some markers for setup 1
        this.doorMarkerFactory.addMarker
        (
            new DoorMarker
            (
                2,                                  // ID
                new THREE.Vector3(-80, -20, -175),	// Position
                new THREE.Vector3(-10, 30, 0), 		// Orientation
                new THREE.Vector3(2.5,3,1),			// Scale
                this.scene							// Scene
            )
        );

        this.doorMarkerFactory.addMarker
        (
            new DoorMarker
            (
                3,                                  // ID
                new THREE.Vector3(180, -35, -45),	// Position
                new THREE.Vector3(0, 104 , 0),	    // Orientation
                new THREE.Vector3(5.5,5,1),			// Scale
                this.scene							// Scene
            )
        );
        break;

        case 2: // Add some markers for setup 2
        this.doorMarkerFactory.addMarker
        (
            new DoorMarker
            (
                4,                                  // ID
                new THREE.Vector3(-80, -20, -175),	// Position
                new THREE.Vector3(-10, 30, 0), 		// Orientation
                new THREE.Vector3(2.5,3,1),			// Scale
                this.scene							// Scene
            )
        );

        this.doorMarkerFactory.addMarker
        (
            new DoorMarker
            (
                5,                                  // ID
                new THREE.Vector3(180, -35, -45),	// Position
                new THREE.Vector3(0, 104 , 0),	    // Orientation
                new THREE.Vector3(5.5,5,1),			// Scale
                this.scene							// Scene
            )
        );
        break;

        default: markerSetup = 0;
    }
}

// Remove all door markers and the room it self at once
Room.prototype.removeRoomFromScene = function()
{
    // Remove all DoorMarker-Plane objects from the scene
    this.doorMarkerFactory.removeMarkersFromScene();

    // Remove the sphere object from the scene
    //this.scene.remove(this.sphereMesh);
    this.scene.remove(this.scene.getObjectByName("Room"));
}