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
    // width — Width along the X axis. Default is 1.
    // height — Height along the Y axis. Default is 1.
    // widthSegments — Optional. Default is 1.
    // heightSegments — Optional. Default is 1. 
    var geometry = new THREE.PlaneGeometry( 5, 20, 32 );

    // Set material
    var material = new THREE.MeshBasicMaterial
    ( 
        {
            color       : 0x00ff00,
            side        : THREE.DoubleSide,
            wireframe   : true,
            transparent : true,
            opacity     : 0.35
            
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