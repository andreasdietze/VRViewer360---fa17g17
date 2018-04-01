/*
* Class Estate:
* A Estate consists of one room which will be updated
* when triggering a door marker.
*
* @param {THREE.Scene}      scene
* To add and remove rooms from the scene.
*/
var Estate = function(scene, isDoorMarkerVisible)
{
    // Params
    this.scene = scene;

    // The actual room to be displayed
    this.actualRoom = null;

    // Test scene
    this.panocounter = null;

    this.isDoorMarkerVisible = isDoorMarkerVisible;
}

// Init the initial room for a estate
Estate.prototype.loadEstate = function ()
{
	// We start with the demo launch room
	this.actualRoom = new Room
	(
		this.scene,				// THREE scene
		"img/pano/i0.jpg",	    // Sphere texture (room texture)
        0,						// Marker setup
        this.isDoorMarkerVisible    // Visibility
	);
}

Estate.prototype.updateEstate = function(object)
{
    // To entrence (from outside)
    if(object.name == 0)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i1.jpg",	    // sphere texture (room texture)
            1,						// Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.actualRoom.sphereMat.needUpdate = true;
        console.log(this.actualRoom);
    }

    // To mid (from entrence)
    if(object.name == 1)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i2.jpg",	    // sphere texture (room texture)
            2,						// Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.actualRoom.sphereMat.needUpdate = true;
        console.log(this.actualRoom);
    }

    // Back to outside
    if(object.name == 2)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i0.jpg",	    // sphere texture (room texture)
            0,						// Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // Back to entrence
    if(object.name == 3)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i1.jpg",	    // sphere texture (room texture)
            1,						// Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // To living
    if(object.name == 4)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i3.jpg",	    // sphere texture (room texture)
            3,					    // Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

     // To second floor / stage
     if(object.name == 5)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,			    // THREE scene
            "img/pano/i5.jpg",	    // sphere texture (room texture)
            5,					    // Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // Back to mid
    if(object.name == 6)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i2.jpg",	    // sphere texture (room texture)
            2,						// Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // To kitchen
    if(object.name == 7)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i4.jpg",	    // sphere texture (room texture)
            4,						// Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // Back to living
    if(object.name == 8)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i3.jpg",	    // sphere texture (room texture)
            3,						// Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // --- second floor / stage
    if(object.name == 9)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i2.jpg",	    // sphere texture (room texture)
            2,						// Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // To bath
    if(object.name == 10)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i7.jpg",	    // sphere texture (room texture)
            7,						// Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // To guest room
    if(object.name == 11)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i6.jpg",	    // sphere texture (room texture)
            6,						// Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // Back to floor
    if(object.name == 12 || object.name == 13)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i5.jpg",	    // sphere texture (room texture)
            5,						// Marker Setup
            this.isDoorMarkerVisible    // Visibility
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }
}