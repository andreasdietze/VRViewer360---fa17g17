function addFavoritListeners(immoId, offerId) {
	var ajaxURL = new AJAXSettings().getAJAXURL();
	$('#'+immoId+'toFav').click(function() {
		// Add to favorits Logik
		// Nicht sicher ob das f�r jeden Browser funktioniert
		if($('#'+immoId+'toFav').css('color') == 'rgb(255, 215, 0)') {
			// remove favorit
			console.log('remove from favs');
			$.ajax({
			type		: "POST",
				url			: ajaxURL + "/fa17g17/estatesearch/favour/delete",
				contentType	: 'application/json',
				data		: JSON.stringify
				(
					{
						'angebot_id': offerId
					}
				),
				success		: function (data)
				{
					console.log("SUCCESS-CB");
					// Immobilie wurde von den Favoriten entfernt
					$('#'+immoId+'toFav').css('color','darkgray');

				},
				error		: function (err)
				{
					console.log("ERROR-CB");
					// console.log(err);
				}
			}).done(

			);
		} else {
			// Prevent multiple Requests
			var me = $(this);
			me.data('requestRunning', false);
			if ( me.data('requestRunning') ) {
				return;
			}
			me.data('requestRunning', true);
			
			// add to favorit
			$.ajax({
			type		: "POST",
				url			: ajaxURL + "/fa17g17/estatesearch/favour/insert",
				contentType	: 'application/json',
				data		: JSON.stringify
				(
					{
						'angebot_id': offerId
					}
				),
				success		: function (data)
				{
					console.log("SUCCESS-CB");
					// console.log(data);

					if(data.created == 'true') {
						// Immobilie wurde den Favoriten hinzugef�gt
						$('#'+immoId+'toFav').css('color','gold');
					} else if (data.created == 'false') {
						// Immobilie wurde von den Favoriten entfernt
						// $('#'+immoId+'toFav').css('color','darkgray');
					}
					me.data('requestRunning', false);
					
				},
				error		: function (err)
				{
					console.log("ERROR-CB");
					// console.log(err);
					me.data('requestRunning', false);
				}
			}).done( function() {
					me.data('requestRunning', false);
				}
			);
		}


	});
}

function checkFavoritStatus() {
	console.log('check if in favs')
	var ajaxURL = new AJAXSettings().getAJAXURL();
	$.get( ajaxURL + "/fa17g17/estatesearch/favour/", function( data ) {
		if(data.result == 'true') {
			var obj = data.data;
			for (var i = 0; i<obj.length; i++) {
				$('#' + obj[i].id + 'toFav').css('color', 'gold');
			}
		}
	});
}

// Rendert alle Favoriten in ein element mit der id #favorit-list
function renderAllFavorits() {
	var ajaxURL = new AJAXSettings().getAJAXURL();
	// Add to favorits Logik

	$.get( ajaxURL + "/fa17g17/estatesearch/favour/", function( data ) {
		if(data.result == 'true') {

			var obj = data.data;

			if (obj.length > 0) {
						for (var i = 0; i<obj.length; i++)
						{
							var imgs = [];
							if(obj[i].media){
								imgs = obj[i].media.split(",");
								console.log(imgs[0]);
							}
							
							var source = ajaxURL + "/fa17g17/img/" + imgs[0];
							
							var div_result = "<div class='col-sm-9 well'>"
							+ "<h3 class='estate-heading' style='color: darkgray; padding: 0px 0px; margin: 0px 0px;'>"+ obj[i].angebot_titel
							+ "<span id="+obj[i].id + 'toFav'+" style='float: right; cursor: pointer; color: gold' class='glyphicon glyphicon-star add_to_favorits'></span>"
							+ "</h3>"
							+ "<div class='row'>"
							+ "<div class='col-sm-5'>"
							+ "<a href='/fa17g17/singleOffer?estate_id="+ obj[i].id +"' target='_parent'><img alt='image' class='img-responsive' src='" + source + "'></a>"
							+ "</div>"
							+ "<div class='col-sm-7'>"
							+ "<h4 class='media-heading' style = 'color: red'><i class='glyphicon glyphicon-eur'></i> "+ obj[i].kaufpreis +" <small class='pull-right'>" + obj[i].immobilien_adress + "</small></h4>"
							+ "<h5> <i class='glyphicon glyphicon-home'></i> " + obj[i].qm + " m² | " + obj[i].zimmeranzahl + " Rooms | " + obj[i].ortname + " | " + obj[i].plz + "</h5>"
							+ "<p class='hidden-xs' style='color: darkgray;'>"+ obj[i].beschreibung +"</p>"
							+ "</div>"
							+ "</div>"
							+ "</div>";
							$("#favorit-list").append(div_result);
							addFavoritListeners(obj[i].id, obj[i].angebot_id);
						}
					} else {
						//Keine Favoriten gefunden
						$('#result').append("<p> No Favorits found.</p>");
					}
		}
	});

}
