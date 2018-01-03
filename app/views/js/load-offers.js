// ***********************************
// load-offers.js
// XSS bauen
// Autor: Max Finsterbusch 70%
// Contributor: David, Andreas 30%
// ***********************************
$(document).ready(function () {
	// ajax Call, der eine Liste von Offers holt
	var ajaxURL = new AJAXSettings().getAJAXURL();

	var cookieArray = Cookies.get('UserID');
	var userObject = null;

	if(typeof(cookieArray) != "undefined") {
		userObject = JSON.parse(cookieArray.substring(2));
	}

	console.log(userObject);
	console.log(userObject.id);
	// userObject.role
	// 2=buyer
	// 3=seller

	$.ajax
			(
				{
					type		: "POST",
					url			: ajaxURL + "/fa17g17/estatehandling/render/offers",
					contentType	: 'application/json',
					data		: JSON.stringify
					(
						{
							"userID": userObject.id
						}
					),
					success		: function (data)
					{
						console.log("SUCCESS-CB");
						if(data.selected == "true"){
							for(var i = 0; i < data.data.Offers.length; i++){
								renderOffer(data.data.Offers[i]);
							}
						}
					},
					error		: function (err)
					{
						console.log("ERROR-CB");
						console.log(err);
					}
				}
			).done
			(
				function ()
				{
					console.log("DONE-CB");
				}
			);

	function renderOffer(estate_json) {

		var agent_buttons = '';
		var edit_button = '';
		var delete_button = '';
		if(userObject.role == 3 && estate_json.active == 0 ) {
			// Die Steuerungsbottons für den Agent
		agent_buttons = '<div class="btn-group">' +
								'<button id="accept_as_agent-' + estate_json.id + '" type="button" name="' + estate_json.id + '" class="btn btn-success">Accept Offer</button>' +
								'<button id="decline_as_agent-' + estate_json.id + '" type="button" name="' + estate_json.id + '" class="btn btn-danger">Decline Offer</button>' +
							'</div>';
		}

		if (userObject.role == 3 && estate_json.active == 1){
			edit_button = '<button id="edit-btn-1" type="submit" class="btn btn-success">Edit Offer</button>';
			delete_button = '<button id="del-btn-' + estate_json.id + '" name="' + estate_json.id + '" type="button" class="btn btn-danger">Delete Offer</button>';
		}
		console.log(estate_json);

		var imgs = [];
		if(estate_json.media){
			imgs = estate_json.media.split(",");
			console.log(imgs[0]);
		}

		var source = ajaxURL + "/fa17g17/img/" + imgs[0];
		var single_offer = '<div class="brdr bgc-fff pad-10 box-shad btm-mrg-20 property-listing" style="background-color: #222; color: white; border-color: #444; border-style: solid;">' +
							   '<div class="media">' +
							   '<h3 class="estate-heading" style="color: darkgray; padding: 4px 4px; margin: 0px 0px;">' + estate_json.angebot_titel + '</h3>' +
							   '<a class="pull-left" href="#" target="_parent">' +
							   '<a href="/fa17g17/singleOffer?estate_id=' + estate_json.id + '" style="float:left; padding-right: 5px;">' +
							   // Files support fehlt noch
							   '<img alt="image" class="img-responsive" src="' + source + '"></a>' +
							   '</a>' +
							   '<div class="clearfix visible-sm"></div>' +
								   '<div class="media-body fnt-smaller">' +
								   '<a href="#" target="_parent"></a>' +
								   '<h4 class="media-heading">' +
								   '<a href="#" target="_parent">' + estate_json.kaufpreis + '$ <small class="pull-right">' + estate_json.immobilien_adress + '</small></a></h4>' +
								   '<ul class="list-inline mrg-0 btm-mrg-10 clr-535353">' +
									   '<li>' + estate_json.qm + ' SqFt</li>' +
									   '<li style="list-style: none">|</li>' +
									   '<li>' + estate_json.features + '</li>' +
								   '</ul>' +
								   '<p class="hidden-xs" style="color: darkgray;">' + estate_json.beschreibung + '</p>' +
								   '<span class="fnt-smaller fnt-lighter fnt-arial">' + estate_json.firstname + ", " + estate_json.lastname + '</span>' +
								   '<form id="form-edit-1" method="GET" action="/fa17g17/Dashboard/editOffer">' +
								   '<input class="hidden" name="estate_id" value="' + estate_json.id + '"></input>' +
										edit_button + delete_button +
								   '</form>' +
								   agent_buttons +
							   '</div>' +
						   '</div>';
		$('#estate-root').append(single_offer);
		$('#del-btn-' + estate_json.id).click(function () {
			deleteEstate(this.name);
		});

		$('#accept_as_agent-' + estate_json.id).click(function () {
			acceptEstate(this.name);
		});

		$('#decline_as_agent-' + estate_json.id).click(function () {
			declineEstate(this.name);
		});

		function deleteEstate(tmp_immo) {
			$.ajax({
				type		: "POST",
				url			: ajaxURL + "/fa17g17/estatehandling/delete",
				contentType	: 'application/json',
				data		: JSON.stringify
				(
					{
						"immoID": tmp_immo,
						"user": userObject.id
					}
				),
				success		: function (data)
				{
					console.log("SUCCESS-CB");
					if(data.deleted == "true"){
						window.location.href = "/fa17g17/Dashboard/Offers";
					} else {
						alert("Could not delete your estate. Please try again later!!!");
					}
				},
				error		: function (err)
				{
					console.log("ERROR-CB");
					console.log(err);
				}
			}).done(
				function () {
					console.log("DONE-CB");
				}
			);
		}

		var data = {
			"immoID": estate_json.id,
			"ownerID": estate_json.besitzer_id,
			"agentID": estate_json.verkaufer_id
		};

		function acceptEstate(tmp_immo){
			if(userObject.role == 3 && estate_json.active == 0) {
				$.ajax
				(
					{
						type		: "POST",
						url			: ajaxURL + "/fa17g17/estatehandling/request/activate",
						contentType	: 'application/json',
						data		: JSON.stringify
						(
							{
								"immoID": estate_json.id,
								"ownerID": estate_json.besitzer_id,
								"agentID": estate_json.verkaufer_id
							}
						),
						success		: function (data)
						{
							console.log("SUCCESS-CB");
							if(data.updated == "true"){
								window.location.href = "/fa17g17/Dashboard/Offers";
							} else {
								console.log("false");
							}
						},
						error		: function (err)
						{
							console.log("ERROR-CB");
							console.log(err);
						}
					}
				).done
				(
					function ()
					{
						console.log("DONE-CB");
					}
				);
			}
		}

		function declineEstate(tmp_immo) {
			if(userObject.role == 3 && estate_json.active == 0) {
				$.ajax
				(
					{
						type		: "POST",
						url			: ajaxURL + "/fa17g17/estatehandling/delete",
						contentType	: 'application/json',
						data		: JSON.stringify
						(
							{
								"immoID": estate_json.id,
								"user":userObject.id
							}
						),
						success		: function (data)
						{
							console.log("SUCCESS-CB");
							if(data.deleted == "true"){
								window.location.href = "/fa17g17/Dashboard/Offers";
							} else {
								console.log("false");
							}
						},
						error		: function (err)
						{
							console.log("ERROR-CB");
							console.log(err);
						}
					}
				).done
				(
					function ()
					{
						console.log("DONE-CB");
					}
				);
			}
		}
	}
});
