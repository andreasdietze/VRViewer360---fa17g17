	console.log('ajax imported!');
	$('#new-offer').click(function (){
		console.log('ajax call started!');
		$.ajax
		(
			{
				type		: "POST",
				url			: "https://sfsuse.com/fa17g17/estatehandling/create",
				contentType	: 'application/json',
				data		: JSON.stringify
				(
					{
						// Infos zur Immobilie
						// "user":userObject.id,
						"title": $('#title').val(),
						"desc": $('#desc').val(),
						"condition": $('#condition').val(), // Bau-zustand
						// Die Features sind ein Array aus strings
						"features": $('#features').val(),
						"address": $('#address').val(), // Straﬂe
						"postal": $('#postal').val(),
						"country": $('#country').val(),
						"floors": $('#floors').val(),
						"rooms": $('#rooms').val(),
						"size": $('#size').val(),
						// Offer Information wie Pricing
						"price": $('#price').val(),
						"bail": $('#bail').val(), // Kaution
						"provision": $('#provision').val(),
						"utilities": $('#utilities').val(), // Nebenkosten
						"startdate": $('#startdate').val(),
						"enddate": $('#enddate').val(),
					}
				),
				success		: function (data)
				{
					console.log("SUCCESS-CB");
					console.log(data);
					if(data.update == "true"){
						window.location.href = "/fa17g17/Dashboard/Offers";
						console.log(data);
					} else {
						$('#error-offer-submit').val(data.message);
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
	});