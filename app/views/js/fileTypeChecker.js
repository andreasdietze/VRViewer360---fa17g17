// Erlaubte Dateiformate
var allowedFileTypes = [];

// FileTypeChecker Constructor
var FileTypeChecker = function () {
	// Setze erlaubte Dateitypen
	allowedFileTypes = [
		// Zulaessige Bildformate
		'jpeg', 'jpg', 'png', 
		// Andere, zulaessige Dateiformate
		'pdf', 'txt'
	];
}

FileTypeChecker.prototype.checkFileType = function (fileType) {
	// Ueberpruefe, ob der Dateityp zulaessig ist
	for(var j = 0; j < allowedFileTypes.length; j++) {
		if(fileType === allowedFileTypes[j]) {
			// Dateityp ist zulaessig 
			return true;
		}
	}
	
	// Dateityp wird nicht unterstuetzt
	alert("The datatype: " + fileType + " is not supported.");
	return false;
}