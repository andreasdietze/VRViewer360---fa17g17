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
*/
var Room = function (scene)
{
    this.scene      = scene;

    // Public vars
    this.sphereGeo  = null;
    this.sphereMat  = null;
    this.sphereMesh = null;
    this.panoramas  = [];

    this.create();
}

Room.prototype.create = function () 
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

    // Add mesh to scene
	this.scene.add(this.spehreMesh); 
}


