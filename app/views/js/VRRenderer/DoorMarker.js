/*
* Class DoorMarker:
* Discribes a single DoorMarker-Object (FactoryEntity) for the
* DoorMarkerFactory. DoorMarkers are the relevant objects to
* trigger an event which switches trough the rooms of an estate
* by clicking at one of the doors inside the 360 degree panorama
* of a room.
*
* @param {int}              id
* The unique name or id for a door marker entity.
*
* @param {THREE.Vector3}    position
* The position of a door marker object.
*
* @param {THREE.Vector3}    orientation
* The orientation of a door marker object given in degrees.
*
* @param {THREE.Vector3}    scale
* The scale of the door marker object
*
* @param {THREE.Scene}      scene
* Due to a DoorMarker.js object is a THREE.Object3D object, it
* has to be added to the a THREE.Scene object to be interactive
* (intersection with THREE.Raycaster) and renderable.
*
* @param {boolean}          isDoorMarkerVisible
* Determines if doormarker plane objects are visible or not.
*
* @param {boolean}          isCurved
* Determines wether a doormarker is sphere like curved or not.
* Note: This is just a example for a more precise impimentation of 
* possible doormarker objects.  
*/
var DoorMarker = function(id, position, orientation, scale, scene, isDoorMarkerVisible, isCurved)
{
    // The name or identification for a door marker entity
    this.id = id; 

    // Set position
    this.position = position;

    // Set rotation, compute the degrees to radian values
    this.orientation = new THREE.Vector3
    (
        Math.PI / 180 * orientation.x,
        Math.PI / 180 * orientation.y,
        Math.PI / 180 * orientation.z
    )

    // Set scale
    this.scale = new THREE.Vector3
    (
        scale.x, scale.y, scale.z
    );

    // Set scene
    this.scene = scene;

    // Plane
    this.plane = null;

    // Sphere (small part of a sphere used as curved plane)
    this.sphere = null;

    // Visibility
    this.isDoorMarkerVisible = isDoorMarkerVisible

    // Curved or planar
    this.isCurved = isCurved;

    // Create the visible marker object as curved plane object
    if(this.isCurved) 
        this.createMarkerCurvedPlane(scene);

    if(!this.isCurved) // Create the visible marker object as plane object
        this.createMarkerPlane(scene);
}

DoorMarker.prototype.createMarkerPlane = function(scene)
{
    var opacity = 0.0;
    if(this.isDoorMarkerVisible)
        opacity = 0.35;

    // Create plane geometry
    // Info: leaving heightSegments emtpy ends up in
    // a striped pattern.
    this.geometry = new THREE.PlaneGeometry
    ( 
        5,  // width — Width along the X axis. Default is 1.
        20, // height — Height along the Y axis. Default is 1.
        1   // widthSegments — Optional. Default is 1.
            // heightSegments — Optional. Default is 1. 
    );

    // Set material
    this.material = new THREE.MeshBasicMaterial
    ( 
        {
            color       : 0x00ff00,             // Green color
            side        : THREE.DoubleSide,     // No backface culling
            wireframe   : true,                 // Optional wireframe
            transparent : true,                 // In any case, it has transparency
            opacity     : opacity               // Level of visibility form 0 - 1
        } 
    );

    // Create the mesh
    this.plane  = new THREE.Mesh( this.geometry, this.material );

    // Setup mesh translation
    this.plane.position.copy(this.position);
    
    // Setup mesh orientation
    this.plane.rotation.x = this.orientation.x;
    this.plane.rotation.y = this.orientation.y;
    this.plane.rotation.z = this.orientation.z;

    // Setup mesh scale
    this.plane.scale.copy(this.scale);

    // Every room has the same name: Room
    // Note: at present, the max amount of concurrent rooms at 
    //       any time is ONE! This saves memory and performance
    //       on less powerful devices.
    this.plane.name = this.id;

    // Add mesh to scene
    this.scene.add( this.plane );
}

// Note: This is just a example marker for a better precision 
DoorMarker.prototype.createMarkerCurvedPlane = function(scene)
{
    var opacity = 0.0;
    if(this.isDoorMarkerVisible)
        opacity = 0.35;

    // Create curved plane geometry
    this.geometry = new THREE.SphereGeometry
	(
        200,            // radius — sphere radius. Default is 1.
        16,             // widthSegments — number of horizontal segments. Minimum value is 3, and the default is 8.
        16,             // heightSegments — number of vertical segments. Minimum value is 2, and the default is 6.
        0,              // phiStart — specify horizontal starting angle. Default is 0.
        Math.PI / 11,   // phiLength — specify horizontal sweep angle size. Default is Math.PI * 2.
        Math.PI / 2.1,  // thetaStart — specify vertical starting angle. Default is 0.
        Math.PI / 7     // thetaLength — specify vertical sweep angle size. Default is Math.PI.
    );
    
    // Set material
    this.material = new THREE.MeshBasicMaterial
    ( 
        {
            color       : 0xffff00,             // Green color
            side        : THREE.DoubleSide,     // No backface culling
            wireframe   : true,                 // Optional wireframe
            transparent : true,                 // In any case, it has transparency
            opacity     : opacity               // Level of visibility form 0 - 1
        } 
    );

    // Create the mesh
	this.sphere = new THREE.Mesh( this.geometry, this.material );

	// 5. Transformation: copy scale from room spehre
	this.sphere.applyMatrix( new THREE.Matrix4().makeScale(1, 1, 1)); //(0.975,0.975,0.975));

	// 4. Transformation: rotate y (left - right)
	this.sphere.applyMatrix( new THREE.Matrix4().makeRotationAxis (new THREE.Vector3(0, 1, 0), Math.PI / 180 * 88 ));

	// 3. Transformation: rotate x (up - down)
	this.sphere.applyMatrix( new THREE.Matrix4().makeRotationAxis (new THREE.Vector3(1, 0, 0), Math.PI / 180 * -19 ));

	// 2. Transformation: rotate z (level of diagonal alignment)
    this.sphere.applyMatrix( new THREE.Matrix4().makeRotationAxis (new THREE.Vector3(0, 0, 1), Math.PI / 180 * 5 ));
    
    // 1. Transformation: translation (position)
	this.sphere.position.copy(new THREE.Vector3(0, 0, 0));

    // Every room has the same name: Room
    // Note: at present, the max amount of concurrent rooms at 
    //       any time is ONE! This saves memory and performance
    //       on less powerful devices.
    this.sphere.name = this.id;

    // Add mesh to scene
    this.scene.add( this.sphere );
}

 // Remove single plane objects from the scene
DoorMarker.prototype.removeFromScene = function()
{
    // In case the non curved planar object is null, remove the curved plane
    if(this.plane == null)
        this.scene.remove(this.sphere);

    // In case the curved plane is null, remove the non curved plane
    if(this.sphere == null)
        this.scene.remove(this.plane);
}