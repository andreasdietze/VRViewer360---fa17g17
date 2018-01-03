
var AJAXSettings = function(){
	this.AJAXURL = this.setAJAXURL();
}

AJAXSettings.prototype.setAJAXURL = function(){
	// Set the URL:
	// 0: URL is "http://127.0.0.1:17017/...."
	// 1: URL is "https://sfsuse.com/...."
	// 2: URL is "http://192.168.0.100:17017/ (David)"
	// 3: URL is "http://192.168.178.29:17017/ (David)"
	return 1;
}

AJAXSettings.prototype.getAJAXURL = function(){
	var url = "";
	if(this.AJAXURL === 0)
		return url = "http://127.0.0.1:17017"
	else if (this.AJAXURL === 1)
		return url = "https://sfsuse.com";
	else if (this.AJAXURL === 2)
		return url = "http://192.168.0.100:17017"
	else
		return url = "http://192.168.178.29:17017";
}
