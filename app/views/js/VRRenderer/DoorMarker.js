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
*/
var DoorMarker = function(id, position, orientation, scale, scene, isDoorMarkerVisible)
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

    // Visibility
    this.isDoorMarkerVisible = isDoorMarkerVisible

    // Create the visible marker object
    this.createMarker(scene);
}

DoorMarker.prototype.createMarker = function(scene)
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

 // Remove single plane objects from the scene
DoorMarker.prototype.removeFromScene = function()
{
    this.scene.remove(this.plane);
}