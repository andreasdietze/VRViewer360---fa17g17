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
		"img/pano/pano0.jpg",	// Sphere texture (room texture)
		0						// Marker setup
	);
}

Estate.prototype.updateEstateOne = function(intersects)
{
    if(intersects[0].object.name == 0)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/pano8.jpg",	// sphere texture (room texture)
            1						// Marker Setup
        );
        this.actualRoom.sphereMat.needUpdate = true;
        console.log(this.actualRoom);
    }

    if(intersects[0].object.name == 1)
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/pano2.jpg",	// sphere texture (room texture)
            2						// Marker Setup
        );
        this.scene.add(this.actualRoom);
        this.actualRoom.sphereMat.needUpdate = true;
    }

    if( intersects[0].object.name == 2 ||
        intersects[0].object.name == 3 ||
        intersects[0].object.name == 4 || 
        intersects[0].object.name == 5 )
    {
        this.actualRoom.removeRoomFromScene();
        this.actualRoom = new Room
        (
            this.scene,				// THREE scene
            "img/pano/pano0.jpg",	// sphere texture (room texture)
            0						// Marker Setup
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