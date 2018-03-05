/*
* Class Estate:
* A Estate consists of one room which will be updated
* when triggering a door marker.
*
* @param {THREE.Scene}      scene
* To add and remove rooms from the scene.
*/
var Estate = function(scene)
{
    // Params
    this.scene = scene;

    // The actual room to be displayed
    this.actualRoom = null;

    // Test scene
    this.panocounter = null;
}

// Init a Estate (just rooms for now)
// TODO: Estate class and RoomFactory
Estate.prototype.loadEstateOne = function ()
{
	// We start with the demo launch room
	this.actualRoom = new Room
	(
		this.scene,				// THREE scene
		"img/pano/i4.jpg",	// Sphere texture (room texture)
		4						// Marker setup
	);
}

Estate.prototype.updateEstateOne = function(intersects)
{
    // To mid (from entrence)
    if(intersects[0].object.name == 1)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i2.jpg",	// sphere texture (room texture)
            2						// Marker Setup
        );
        this.actualRoom.sphereMat.needUpdate = true;
        console.log(this.actualRoom);
    }

    // Back to entrence
    if(intersects[0].object.name == 2)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i1.jpg",	// sphere texture (room texture)
            1						// Marker Setup
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // To living
    if( intersects[0].object.name == 3)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i3.jpg",	// sphere texture (room texture)
            3						// Marker Setup
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // Back to mid
    if( intersects[0].object.name == 4)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i2.jpg",	// sphere texture (room texture)
            2						// Marker Setup
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // To kitchen
    if( intersects[0].object.name == 5)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i4.jpg",	// sphere texture (room texture)
            4						// Marker Setup
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    // Back to living
    if( intersects[0].object.name == 6)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i3.jpg",	// sphere texture (room texture)
            3						// Marker Setup
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }
}

Estate.prototype.updateEstateOneVR = function(object)
{
    if(object.name == 1)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i2.jpg",	    // sphere texture (room texture)
            2						// Marker Setup
        );
        this.actualRoom.sphereMat.needUpdate = true;
        console.log(this.actualRoom);
    }

    if(object.name == 2)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i3.jpg",	    // sphere texture (room texture)
            3						// Marker Setup
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    if( object.name == 3 ||
        object.name == 4 ||
        object.name == 5 || 
        object.name == 6 )
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/i1.jpg",	    // sphere texture (room texture)
            1						// Marker Setup
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }
}


Estate.prototype.updateTestEstate = function()
{

    // Switch between panoramas
    this.panocounter++;

    if(this.panocounter > 6) 
        this.panocounter = 0; 

    // Switch panoramas
    this.actualRoom.sphereMat.map = THREE.ImageUtils.loadTexture(this.actualRoom.panoramas[this.panocounter]);
    this.actualRoom.sphereMat.needUpdate = true;

    console.log('Src in panoramas : ' + this.actualRoom.panoramas[this.panocounter]);
    console.log('Panocounter: ' + this.panocounter);
}