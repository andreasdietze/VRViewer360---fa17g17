// ***********************************
// inputChecker.js
// XSS bauen
// Autor Max Finsterbusch 100%
// ***********************************
// regex checker auf script tags
// input = der Input eines Strings, welcher auf script tags gecheckt werden soll
// @return 1, wenn der input valide ist
// @return 0, wenn der input '<' oder '>' enthält
function checkInputOnCharacters(inputs) {
	if(!(inputs instanceof Array)) {
		inputs = [inputs];
	}
	var regex = new RegExp("<|>");
	for(i = 0; i < inputs.length; i++) {
		results = regex.exec(inputs[i]);
		if (results != null) return 0;
	}
	return 1;
}