$(document).ready(function(){
	// Helper-Object: set url to sfsuse or localhost
	var ajaxURL = new AJAXSettings().getAJAXURL();
	//Prüfe, ob User bereits angemeldet
	var cookieArray = Cookies.get('UserID');
	var userObject = null;
	var valid = 1;

	if(typeof(cookieArray) != "undefined") {
		userObject = JSON.parse(cookieArray.substring(2));
	}

	if(userObject != null){
		$("#logDropping").show();
		$("#nlogDropping").hide();
	} else {
		$("#logDropping").hide();
		$("#nlogDropping").show();
	}

	function checkValidateSearchFormNav() {
		if (isNaN($('#nav_qm').val()) && $('#nav_qm').val() != "") {
			valid = 0;
			alert("Square Meter must be a number");
		};
		if (isNaN($('#nav_preis').val()) && $('#nav_preis').val() != ""){
			valid = 0;
			alert("Price must be a number");
		};
		if (parseInt($('#nav_qm').val()) < 0) {
			valid = 0;
			alert("Square Meter can not have a negative value");
		};
		if (parseInt($('#nav_preis').val()) < 0) {
			valid = 0;
			alert("Price can not have a negative value");
		};
	}

	//Löst die Suche aus
	$("#nav_bt_search").click(function() {

		valid = 1;
		checkValidateSearchFormNav();

		var angebot_art = document.getElementById("nav_angebot_art").value;
		var ort = document.getElementById("nav_ort").value;
		var objektart = document.getElementById("nav_objektart").value;
		var qm = document.getElementById("nav_qm").value;
		if (qm == "") {qm=10000;}
		var preis = document.getElementById("nav_preis").value;
		if (preis == "") {preis=50000000;}
		var zimmeranzahl = document.getElementById("nav_zimmeranzahl").value;

		if (valid == 1) {
			$.ajax
			(
				{
					type: "POST",
					url: ajaxURL + "/fa17g17/estatesearch/buffersearch",
					contentType	: 'application/json',
					data: JSON.stringify(
					{
							"angebot_art": angebot_art,
							"ort": ort,
							"objektart": objektart,
							"qm": qm,
							"preis": preis,
							"zimmeranzahl": zimmeranzahl
					}),
					success: function (data) {
						console.log("SUCCESS-CB");
	          if(data.buffered == "true"){
	            window.location.href = "/fa17g17/search";
						}
					},
					error: function (err) {
						console.log("ERROR-CB");
					}
				}
			).done (
				function () {
					console.log("DONE-CB");
				}
			);
		}
	});
});
