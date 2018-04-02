/*
* Class DoorMarkerFactory: base data structure manager for doormarkers.
* Handles any door marker entities for a single room and 
* allowes a simple managment of multiple markers. 
*/
var DoorMarkerFactory = function() 
{
    this.doorMarkers = [];
}

// Add marker to the doorMarkers array
DoorMarkerFactory.prototype.addMarker = function (doorMarker)
{
    if(doorMarker)
        this.doorMarkers.push(doorMarker);
    else 
        console.log("DoorMarker is: " + doorMarker);
}

// Remove marker from the doorMarkers array by index
DoorMarkerFactory.prototype.removeMarker = function(index)
{
    if(index > -1 && index > this.doorMarkers.length - 1)
        this.doorMarkers.splice(index, 1);
    else
        console.log("Index out of bound!");
}

// Get a marker from the doorMarkers array by index
DoorMarkerFactory.prototype.getMarker = function(index)
{
    if(index > -1 && index > this.doorMarkers.length - 1)
        return this.doorMarkers[index];
    else 
    {
        console.log("Index out of bound!");
        return null;
    }
}

// Set a doorMarkers array attribute by index and new doorMarker entity
DoorMarkerFactory.prototype.setMarker = function(index, doorMarker)
{
    if(index > -1 && index > this.doorMarkers.length - 1)
    {
        if(doorMarker)
            this.doorMarkers[i] = doorMarker;
        else 
            console.log("DoorMarker is: " + doorMarker);
    }
    else 
        console.log("Index out of bound!");
}

 // Remove all DoorMarker-Plane objects from the scene
DoorMarkerFactory.prototype.removeMarkersFromScene = function()
{
    for(var i = 0; i < this.doorMarkers.length; i++)
        this.doorMarkers[i].removeFromScene();

    this.clearMarkers();
}

// Clear the door markers array structure to keep any
// factories synchron with the markers in the THREE.scene. 
DoorMarkerFactory.prototype.clearMarkers = function()
{
    // Clear the doorMarkers array
    this.doorMarkers = [];
}