/*
* Class DoorMarker:
* Discribes a single DoorMarker-Object (FactoryEntity) for the
* DoorMarkerFactory. DoorMarkers are the relevant objects to
* trigger an event which switches trough the rooms of an estate
* by clicking at one of the doors inside the 360 degree panorama
* of a room.
*
* @param {THREE.Vector3}    position
* The position of a door marker object
*
* @param {THREE.Vector3}    orientation
* The orientation of a door marker object given in degrees
*
* @param {THREE.Vector3}    scale
* The scale of the door marker object
*
* @param {THREE.Scene}      scene
* Due to a DoorMarker.js object is a THREE.Object3D object, it
* has to be added to the a THREE.Scene object to be interactive
* (intersection with THREE.Raycaster) and renderable.
*/
var DoorMarker = function(position, orientation, scale, scene)
{
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

    // Create the visible marker object
    this.createMarker(scene);
}

DoorMarker.prototype.createMarker = function(scene)
{
    // Create plane geometry
    // Info: leaving heightSegments emtpy ends up in
    // a striped pattern.
    var geometry = new THREE.PlaneGeometry
    ( 
        5,  // width — Width along the X axis. Default is 1.
        20, // height — Height along the Y axis. Default is 1.
        1   // widthSegments — Optional. Default is 1.
            // heightSegments — Optional. Default is 1. 
    );

    // Set material
    var material = new THREE.MeshBasicMaterial
    ( 
        {
            color       : 0x00ff00,             // Green color
            side        : THREE.DoubleSide,     // No backface culling
            wireframe   : true,                 // Optional wireframe
            transparent : true,                 // In any case, it has transparency
            opacity     : 0.35 // 0.35          // Level of visibility form 0 - 1
        } 
    );

    // Create the mesh
    var plane = new THREE.Mesh( geometry, material );

    // Setup mesh transformation
    plane.position.copy(this.position);
    
    plane.rotation.x = this.orientation.x;
    plane.rotation.y = this.orientation.y;
    plane.rotation.z = this.orientation.z;

    plane.scale.copy(this.scale);

    // Add mesh to scene
    this.scene.add( plane );
}