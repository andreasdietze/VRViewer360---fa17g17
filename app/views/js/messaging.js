// ***********************************
// messaging.js
// Autor: Andreas 95%
// Contributor: Max 5%
// ***********************************

$(document).ready(function () {

	// Helper-Object: Ueberprueft Dateien auf Zulaessigkeit
	var fileTypeChecker = new FileTypeChecker();

	// Msg enhält dateien ?
	var msgHasFiles = false;

	// Enthaelt alle zulaessigen Dateireferenzen fuer Upload
	var allFiles = [];

	// Helper-Object: setzt URL auf sfsuse.com oder localhost
	var ajaxURL = new AJAXSettings().getAJAXURL();

	//Pruefe, ob User bereits angemeldet
	var cookieArray = Cookies.get('UserID');
	var userObject = null;

	if(typeof(cookieArray) != "undefined") {
		userObject = JSON.parse(cookieArray.substring(2));
	}

	// Lokale Dateien oder vom Server, sonst sfsuse
	var local;
	if(ajaxURL === 'http://127.0.0.1:17017')
		local = true;
	else
		local = false;

	// URI fuer lokale und web Pfade
	var attachURL		= '';
	if(local)
		attachURL = ajaxURL + "\\fa17g17\\DL\\";
	else
		attachURL = ajaxURL + "/fa17g17/DL/";

	// Nachrichten-Button Styles
	$(".buttom-btn-small").click(function(){
		$(".top-btn").addClass('top-btn-show');
		$(".contact-form-page").addClass('show-profile');
		$(".message-block").css('position','inherit');
		$(this).addClass('buttom-btn-hide')
	});

	$(".buttom-btn").click(function(){
		$(".top-btn").addClass('top-btn-show');
		$(".contact-form-page").addClass('show-profile');
		$(".message-block").css('position','inherit');
		$(this).addClass('buttom-btn-hide')
	});

	$(".top-btn").click(function(){
		$(".buttom-btn").removeClass('buttom-btn-hide');
		$(".buttom-btn-small").removeClass('buttom-btn-hide');
		$(".message-block").css('position','relative');
		$(".contact-form-page").removeClass('show-profile');
	});

    // $("#sidebar").mCustomScrollbar({ 
        // theme: "minimal"
    // });

    $('#sidebarCollapse').on('click', function () {
        // open or close navbar
        $('#sidebar').toggleClass('active');
        // close dropdowns
        $('.collapse.in').toggleClass('in');
        // and also adjust aria-expanded attributes we use for the open/closed arrows
        // in our CSS
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });
	
	$( function() {
		$( "#singleValueFilter" ).datepicker();
	});

	// Initialisierung der Filterbar
	initFilerBar();
	
	// Initialisierung der Nachrichtenanzeige
	renderMessages
	(
		"date",	// Filter nach Datum
		null,	// Kein spezieller Suchbegriff
		"DSC",	// Sortiere absteigend
		false	// Repraesentiert ein Update - NEIN - Initialer Aufruf
	);

	// Filter Bar Init ------------------------------------
	function initFilerBar() {
		console.log("Function initFilerBar entered!");
		
		// Root Element der Filterbar
		var filterBar		=	$("#navbar-filter");

		// Erzeugen der Filterbar form Elements
		var attachString 	=
			"<form class='navbar-form' id='filter-bar-form' role='search'>" +
			"<div class='form-group'>" +
				"<select name='filter_type' id='filter_type' class='form-control'>" +
					"<option selected='selected' value='date'>Date</option>" +
					"<option value='title'>Title</option>" +
					"<option value='receiver'>Receiver</option>" +
				"</select>" +
			"</div>" +
			// Date - Settings
			"<span id='filter-date'>" +
				"<div class='form-group'>" +
					"<input type='text' class='form-control' name='date-field' id='singleValueFilter' placeholder='date'>" +
				"</div>" +
				"<div class='form-group'>" +
					"<select name='received' class='form-control' id='dateFilter'>" +
						"<option value='DESC'>Newest</option>" +
						"<option value='ASC'>Oldest</option>" +
					"</select>" +
				"</div>" +
			"</span>" +
			"<button type='button' id='btn-filter-pending' class='btn btn-default'>Update</button>" +
			"</form>";

		// Hinzufuegen des Filterbar form Elements
		filterBar.append(attachString);
		
		// Hinzufuegen der Eventlistener fuer die eben hinzugefuegten HTML-Elemente
		document.getElementById("filter_type").addEventListener("change", updateFilterBar, false);
	}

	// Filter Bar Update ------------------------------------
	// Aktualisiert Filterbar anhand der ausgwaehlten Filterkritaerien
	function updateFilterBar() {
		console.log("Function updateFilterBar entered!");
		
		// Filterparameter
		var selection = document.getElementById("filter_type").value;
		//console.log(selection);

		// Filtern nach Auswahl (Datum, Titel oder Empfaenger)
		switch(selection) {
			case 'date' :	// Datumsfilter
			
				// Root Elemente der Filterbar
				var filtertype = $("#navbar-filter");
				var filterform = $("#filter-bar-form");
				
				// Loeschen des Filterbar form Elements
				filterform.remove();
				
				// Erzeugen der Filterbar form Elements
				var attach =
					"<form class='navbar-form' id='filter-bar-form' role='search'>" +
					"<div class='form-group'>" +
						"<select name='filter_type' id='filter_type' class='form-control'>" +
							"<option selected='selected' value='date'>Date</option>" +
							"<option value='title'>Title</option>" +
							"<option value='receiver'>Receiver</option>" +
						"</select>" +
					"</div>" +
					// Date - Settings
					"<span id='filter-date'>" +
						"<div class='form-group'>" +
							"<input type='text' class='form-control' name='date-field' id='singleValueFilter' placeholder='date'>" +
						"</div>" +
						"<div class='form-group'>" +
							"<select name='received' class='form-control' id='dateFilter'>" +
								"<option value='DESC'>Newest</option>" +
								"<option value='ASC'>Oldest</option>" +
							"</select>" +
						"</div>" +
					"</span>" +
					"<button type='button' id='btn-filter-pending' class='btn btn-default'>Update</button>" +
					"</form>"

				// Hinzufuegen des Filterbar form Elements
				filtertype.append(attach);
				
				// Setzen der Elemente anhand des eben hinzugefuegten HTML-Codes
				filterform = $("#filter-bar-form");
				selection = document.getElementById("filter_type").value;
				
				// Hinzufuegen der Eventlistener fuer die eben hinzugefuegten HTML-Elemente
				document.getElementById("filter_type").addEventListener("change", updateFilterBar, false);
				document.getElementById("btn-filter-pending").addEventListener("click", filterMessages, false);
			break;

			case 'title':	// Titelfilter
			
				// Root Elemente der Filterbar
				var filtertype = $("#navbar-filter");
				var filterform = $("#filter-bar-form");

				// Loeschen des Filterbar form Elements
				filterform.remove();
				
				// Erzeugen der Filterbar form Elements
				var attach =
					"<form class='navbar-form' id='filter-bar-form' role='search'>" +
					"<div class='form-group'>" +
						"<select name='filter_type' id='filter_type' class='form-control'>" +
							"<option value='date'>Date</option>" +
							"<option selected='selected' value='title'>Title</option>" +
							"<option value='receiver'>Receiver</option>" +
						"</select>" +
					"</div>" +
					// Titel - Settings
					"<span id='filter-date'>" +
						"<div class='form-group'>" +
							"<input type='text' class='form-control' name='date-field' id='singleValueFilter' placeholder='titel'>" +
						"</div>" +
						"<div class='form-group'>" +
							"<select name='received' class='form-control' id='dateFilter'>" +
								"<option value='DESC'>ABC</option>" +
								"<option value='ASC'>CBA</option>" +
							"</select>" +
						"</div>" +
					"</span>" +
					"<button type='button' id='btn-filter-pending' class='btn btn-default'>Update</button>" +
					"</form>"

				// Hinzufuegen des Filterbar form Elements
				filtertype.append(attach);
				
				// Setzen der Elemente anhand des eben hinzugefuegten HTML-Codes
				filterform = $("#filter-bar-form");
				selection = document.getElementById("filter_type").value;
				
				// Hinzufuegen der Eventlistener fuer die eben hinzugefuegten HTML-Elemente
				document.getElementById("filter_type").addEventListener("change", updateFilterBar, false);
				document.getElementById("btn-filter-pending").addEventListener("click", filterMessages, false);
			break;

			case 'receiver':	// Empfaengerfilter
			
				// Root Elemente der Filterbar
				var filtertype = $("#navbar-filter");
				var filterform = $("#filter-bar-form");

				// Loeschen des Filterbar form Elements
				filterform.remove();
				
				// Erzeugen der Filterbar form Elements
				var attach =
					"<form class='navbar-form' id='filter-bar-form' role='search'>" +
					"<div class='form-group'>" +
						"<select name='filter_type' id='filter_type' class='form-control'>" +
							"<option value='date'>Date</option>" +
							"<option value='title'>Title</option>" +
							"<option selected='selected' value='receiver'>Receiver</option>" +
						"</select>" +
					"</div>" +
					// Receiver - Settings
					"<span id='filter-date'>" +
						"<div class='form-group'>" +
							"<input type='text' class='form-control' name='date-field' id='singleValueFilter' placeholder='email'>" +
						"</div>" +
						"<div class='form-group'>" +
							"<select name='received' class='form-control' id='dateFilter'>" +
								"<option value='DESC'>ABC</option>" +
								"<option value='ASC'>ZYX</option>" +
							"</select>" +
						"</div>" +
					"</span>" +
					"<button type='button' id='btn-filter-pending' class='btn btn-default'>Update</button>" +
					"</form>"

				// Hinzufuegen des Filterbar form Elements
				filtertype.append(attach);
				
				// Setzen der Elemente anhand des eben hinzugefuegten HTML-Codes
				filterform = $("#filter-bar-form");
				selection = document.getElementById("filter_type").value;
				
				// Hinzufuegen der Eventlistener fuer die eben hinzugefuegten HTML-Elemente
				document.getElementById("filter_type").addEventListener("change", updateFilterBar, false);
				document.getElementById("btn-filter-pending").addEventListener("click", filterMessages, false);
			break; 
			
			default: // Setze Auswahl auf Datum
				selection = 'date';
		}
	}

	// Filter Bar Logic ------------------------------------
	document.getElementById("btn-filter-pending").addEventListener("click", filterMessages, false);
	
	// Aufruf des Nachrichtenfilters
	function filterMessages() {
		console.log("Function filterMessages entered!");

		// Ziehe Filterparameter
		var filterType = document.getElementById("filter_type").value;
		var singleValueFilter = document.getElementById("singleValueFilter").value;
		var filterDate = document.getElementById("dateFilter").value;
		console.log(filterType);
		console.log(singleValueFilter);
		console.log(filterDate);

		// Zeige gefilterte Nachrichten an
		renderMessages
		(
			filterType,			// Filtern nach Filtertyp
			singleValueFilter,	// Filtern nach speziellem Kritaerium 
			filterDate,			// Aufsteigend oder absteigend sortieren
			true				// Ist ein Update (Filteraufruf)
		);
	}

	// Send Messages ------------------------------------
	document.getElementById("sendMSGButton").addEventListener("click", sendMessage, false);
	
	// Sendet eine Nachricht an das back end
	function sendMessage () {
		console.log("Function sendMessage entered!");
		
		// Intern
		var senderId		= userObject.id; 	
		var senderNick 		= userObject.user;	//'admin@admin2.de';
		
		// Formatiertes Datum
		var d = new Date();
		var formattedDate	= d.getFullYear()	+ "-" + d.getMonth()	+ "-" + d.getDate();
		var formattedTime	= d.getHours()		+ ":" + d.getMinutes()	+ ":" + d.getSeconds();

		// Input by user
		var receiverNick	= document.getElementById('exampleInputText').value;
		var subjectType		= document.getElementById("subject_type").value;
		var topic			= document.getElementById('exampleInputEmail1').value;
		var msg				= document.getElementById('exampleInputMessage').value;
		var attachments		= allFiles;

		// Validation of invalid characters
		var regex = new RegExp("<|>");
		results = regex.exec(msg);
		if(results != null ) {
			msg = msg.replace('<','');
			msg = msg.replace('>','');
		}
		var regex = new RegExp("<|>");
		results = regex.exec(topic);
		if(results != null ) {
			topic = topic.replace('<','');
			topic = topic.replace('>','');
		}
		
		// Validation of the text
		if( msg == '' ) {
			$('#exampleInputMessage').css('border-color', 'red');
		} else {
			$.ajax
			(
				{
					type		: "POST",
					url			: ajaxURL + "/fa17g17/messaging/send",
					contentType	: 'application/json',
					data		:
					JSON.stringify
					(
						{
							"SenderID"		: senderId,
							"SenderNick"	: senderNick,
							"ReceiverNick"	: receiverNick,
							"Subject"		: subjectType,
							"Topic"			: topic,
							"Message"		: msg,
							"Date"			: formattedDate,
							"Time"			: formattedTime,
							"HasFiles"		: msgHasFiles,
							"IsLocal"		: local,
							"Attachments"	: attachments
						}
					),
					success		: function (data)
					{
						console.log("SUCCESS-CB");
						
						if(data.send == "true"){
							alert("Nachricht gesendet an " + receiverNick);
							window.location.href = "/fa17g17/Dashboard/Messages";
						} else {
							alert("Could not send message. No user with that email.");
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
					
					// Eingabefelder updaten
					document.getElementById('exampleInputText').value		= "";
					document.getElementById('exampleInputEmail1').value		= "";
					document.getElementById('exampleInputMessage').value	= "";
					
				}
			);
		}
	}

	// Render Messages ------------------------------------
	// Zeigt alle (gefilterten) Nachrichten an. 
	function renderMessages
	(
		filterType,			// Filtern nach Datum, Titel oder Empfaenger
		singleValueFilter,	// Filtern nach speziellem Titel oder speziellem Empfaenger
		dateFilter,			// Aufsteigend oder absteigend sortiert
		isNew				// Initialer Abruf der Nachrichten oder Update (filter)
	) {
		console.log("Function renderMessages entered!");
		
		// Intern
		var userId 		= userObject.id;
		console.log(userId);

		if(singleValueFilter === null) {
			singleValueFilter = "";
			console.log("Single value is not defined!");
		}
		else
			console.log("Single value is " + singleValueFilter);

		$.ajax
		(
			{
				type		: "POST",
				url			: ajaxURL + "/fa17g17/messaging/render",
				contentType	: 'application/json',
				data		: JSON.stringify
				(
					{
						"UserId" : userId,
						"FilterType":filterType,
						"SingleFilter": singleValueFilter,
						"FilterDate" : dateFilter
					}
				),
				success		: function (data)
				{
					console.log("SUCCESS-CB");
					// Alle Daten erhalten, nun filtern
					//console.log(data.FORUser);
					//console.log(data.FROMUser);

					unwrapAndStyle(data, isNew);

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

	// Loescht eine Nachricht zur entsprechenden Nachrichten-ID
	function deleteMessage() {
		console.log("Function deleteMessage entered!");
		
		// Nachrichten-ID
		var msgId = this.name;
		console.log(msgId);

		$.ajax
		(
			{
				type		: "POST",
				url			: ajaxURL + "/fa17g17/messaging/delete",
				contentType	: 'application/json',
				data		: JSON.stringify
				(
					{
						"MSGId"  : msgId
					}
				),
				success		: function (data)
				{
					console.log("SUCCESS-CB");
					console.log(data);
					
					if(data.deleted == "true"){
						window.location.href = "/fa17g17/Dashboard/Messages";
					} else {
						alert("Could not delete your estate. Please try again later!!!");
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

	// Gefilterte Nachrichten anzeigen
	function unwrapAndStyle(data, isNew) {
		console.log("Function unwrapAndStyle entered!");
		
		//console.log(data);
		var container	= 	$("#message-block-Content"); //$("#content");
		var targetFOR	=	$("#message-block-FOR");
		var targetFROM	=	$("#message-block-FROM");
		var textFOR		=	"";
		var textFROM	=	"";

		// Loesche alle Nachrichten, Filterfunktion
		if(isNew) {
			// Loesche alle Nachrichten
			targetFOR.remove();
			targetFROM.remove();

			// Erzeuge Elternelemente neu
			var appendString =
				'<div id="message-block-Content">' +
					'<div id="message-block-FOR" class="panel-group message-block">' +
						'<div class="panel message-group" style="text-align:center">For User' +
							'<span id="toggle_collapse_Button" class="glyphicon glyphicon-plus" style="float: right; cursor: pointer;" data-toggle="collapse" data-target="#wrapper-messages-FOR"></span>' +
						'</div>' +
						'<div id="wrapper-messages-FOR"></div>' +
					'</div>' +
					'<div id="message-block-FROM" class="panel-group message-block">' +
						'<div class="panel message-group" style="text-align:center">From User' +
							'<span id="toggle_collapse_Button" class="glyphicon glyphicon-plus" style="float: right; cursor: pointer;" data-toggle="collapse" data-target="#wrapper-messages-FROM"></span>' +
						'</div>' +
						'<div id="wrapper-messages-FROM"></div>' +
					'</div>' +
				'</div>';

			// Elternelemente zum Message-Container hinzufügen
			container.append(appendString);

			// Elternelementvariablen updaten
			targetFOR	=	$("#message-block-FOR");
			targetFROM	=	$("#message-block-FROM");
			//targetFOR	=	$("#wrapper-messages-FOR");
			//targetFROM	=	$("#wrapper-messages-FROM");
		}
		// FUER User
		if(data.FORUser) {
			
			// Erzeuge Subject-Panel Buy-Rent Requests
			textFOR += "<div class='panel message-group'>" +
					"<div class='panel-heading message-heading' style='text-align:center'>Buy-Rent Requests</div>";

			for(var i = 0; i < data.FORUser.length; i++) {
				//console.log(data.FORUser);
				
				// Filtern nach Subject - Buy-Rent Requests
				if(data.FORUser[i].nachricht_beschreibung === "KaufenMieten") {
					
					// Absendedatum und Absendezeit
					var dateTime = data.FORUser[i].date.split("T");
					var date = dateTime[0];
					var timeString = dateTime[1].split(".");
					var time = timeString[0];
					var finalDateTime = date + " " + time;
					
					// Erzeugen der loeschen IDs fuer Delete-Button
					var deleteId = 'deleteMsgButton' + data.FORUser[i].id;
					
					// Dateien von dieser Nachricht 
					var attachments = data.FORUser[i].attachfile;
					var attachFileName;
					
					// Falls keine Dateien vorhanden sind
					var hideAttachments = 'hidden';
					
					// Download IDs 
					var downloadId = [];
					var fileCount = 0;
					
					// Download URLs
					var param = [];
					
					// Wenn Dateien vorhanden sind
					if(data.FORUser[i].attachfile) {
						
						// Trenne Dateien (multiple Fileupload)
						attachFileName = data.FORUser[i].attachfile.split(',');
						fileCount = attachFileName.length;
						hideAttachments = 'visible'

						// Erzeugen der download IDs fuer alle Dateien
						for(var j = 0; j < fileCount; j++) {
							downloadId.push('downloadAttachmentButton' + data.FORUser[i].id + '_' + j);
							//console.log(downloadId);
						}

					}
					else attachFileName = '';
					//console.log(attachFileName);

					// Erzeugen der download URLs fuer alle Dateien
					for(var j = 0; j < fileCount; j++) {
						if(local) 
							param.push(attachURL + data.FORUser[i].absender_id + "\\" + attachFileName[j]);
						else 
							param.push(attachURL + data.FORUser[i].absender_id + "/" + attachFileName[j]);
					}
					//console.log(param);

					// Erstellen der Nachricht 
					textFOR  +=
					"<div class='panel message-group'>" +
					"<div class='panel-heading message-heading'>'" + data.FORUser[i].Titel + "'</div>" +
					"<div class='panel-info'>SenderID: '" + data.FORUser[i].absender_email + "'</div>" +
					"<div class='panel-info'>ReceiverID:'" + data.FORUser[i].empfanger_email + "'</div>" +
					"<div class='panel-info'>Date:'" + finalDateTime + "'</div>" +
					"<div class='panel-body message-body'>'" + data.FORUser[i].nachricht + "'</div>" +
					
					// Reply Button 
					"<button class='buttom-btn-small' value=" + data.FORUser[i].absender_email + ":" + data.FORUser[i].nachricht_beschreibung + ":" + data.FORUser[i].Titel.split(' ').join('+') + ">Reply</button>" +
					
					// Delete Button 
					"<button id='"+ deleteId + "' name='" + data.FORUser[i].id + "'>Delete</button>";
					
					// Download Buttons und URLs fuer alle Anhaenge
					for(var j = 0; j < fileCount; j++) {
						textFOR  += "<a href='" + param[j] + "' target='__blan'>" +
						"<button id='"+ downloadId[j] + "' name='" + data.FORUser[i].id + "' class='panel-info' style='visibility:" + hideAttachments + "' value='" + attachFileName[j] + "'>'" + attachFileName[j] + "'</button>" +
						"</a>";
					}

					textFOR  += "</div>";

				}
			};
			textFOR += "</div>";

			// Erzeuge Subject-Panel Inspection Requests
			textFOR += "<div class='panel message-group'>" +
					"<div class='panel-heading message-heading' style='text-align:center; margin-top:10px;'>Inspection Requests</div>";

			for(var i = 0; i < data.FORUser.length; i++) {
				if(data.FORUser[i].nachricht_beschreibung === "Besichtigung") {
					var dateTime = data.FORUser[i].date.split("T");
					var date = dateTime[0];
					var timeString = dateTime[1].split(".");
					var time = timeString[0];
					var finalDateTime = date + " " + time;
					var deleteId = 'deleteMsgButton' + data.FORUser[i].id;
					var attachments = data.FORUser[i].attachfile;
					var attachFileName;
					var hideAttachments = 'hidden';
					var downloadId = [];
					var fileCount = 0;
					var param = [];

					if(data.FORUser[i].attachfile) {
						attachFileName = data.FORUser[i].attachfile.split(',');
						fileCount = attachFileName.length;
						hideAttachments = 'visible'

						for(var j = 0; j < fileCount; j++)
							downloadId.push('downloadAttachmentButton' + data.FORUser[i].id + '_' + j);

					}
					else attachFileName = '';

					for(var j = 0; j < fileCount; j++) {
						if(local)
							param.push(attachURL + data.FORUser[i].absender_id + "\\" + attachFileName[j]);
						else
							param.push(attachURL + data.FORUser[i].absender_id + "/" + attachFileName[j]);
					}

					textFOR  +=
					"<div class='panel message-group'>" +
					"<div class='panel-heading message-heading'>'" + data.FORUser[i].Titel + "'</div>" +
					"<div class='panel-info'>SenderID: '" + data.FORUser[i].absender_email + "'</div>" +
					"<div class='panel-info'>ReceiverID:'" + data.FORUser[i].empfanger_email + "'</div>" +
					"<div class='panel-info'>Date:'" + finalDateTime + "'</div>" +
					"<div class='panel-body message-body'>'" + data.FORUser[i].nachricht + "'</div>" +
					"<button class='buttom-btn-small' value=" + data.FORUser[i].absender_email + ":" + data.FORUser[i].nachricht_beschreibung + ":" + data.FORUser[i].Titel.split(' ').join('+') + ">Reply</button>" +
					"<button id='"+ deleteId + "' name='" + data.FORUser[i].id + "'>Delete</button>";
					for(var j = 0; j < fileCount; j++) {
						textFOR  += "<a href='" + param[j] + "' target='__blan'>" +
						"<button id='"+ downloadId[j] + "' name='" + data.FORUser[i].id + "' class='panel-info' style='visibility:" + hideAttachments + "' value='" + attachFileName[j] + "'>'" + attachFileName[j] + "'</button>" +
						"</a>";
					}

					textFOR  += "</div>";

				}
			};
			textFOR += "</div>";

			// Erzeuge Subject-Panel Information Requests
			textFOR += "<div class='panel message-group'>" +
					"<div class='panel-heading message-heading' style='text-align:center; margin-top:10px;'>Information Requests</div>";

			for(var i = 0; i < data.FORUser.length; i++) {
				if(data.FORUser[i].nachricht_beschreibung === "Information") {
					var dateTime = data.FORUser[i].date.split("T");
					var date = dateTime[0];
					var timeString = dateTime[1].split(".");
					var time = timeString[0];
					var finalDateTime = date + " " + time;
					var deleteId = 'deleteMsgButton' + data.FORUser[i].id;
					var attachments = data.FORUser[i].attachfile;
					var attachFileName;
					var hideAttachments = 'hidden';
					var downloadId = [];
					var fileCount = 0;
					var param = [];

					if(data.FORUser[i].attachfile) {
						attachFileName = data.FORUser[i].attachfile.split(',');
						fileCount = attachFileName.length;
						hideAttachments = 'visible'

						for(var j = 0; j < fileCount; j++)
							downloadId.push('downloadAttachmentButton' + data.FORUser[i].id + '_' + j);

					}
					else attachFileName = '';

					for(var j = 0; j < fileCount; j++) {
						if(local)
							param.push(attachURL + data.FORUser[i].absender_id + "\\" + attachFileName[j]);
						else
							param.push(attachURL + data.FORUser[i].absender_id + "/" + attachFileName[j]);
					}

					textFOR  +=
					"<div class='panel message-group'>" +
					"<div class='panel-heading message-heading'>'" + data.FORUser[i].Titel + "'</div>" +
					"<div class='panel-info'>SenderID: '" + data.FORUser[i].absender_email + "'</div>" +
					"<div class='panel-info'>ReceiverID:'" + data.FORUser[i].empfanger_email + "'</div>" +
					"<div class='panel-info'>Date:'" + finalDateTime + "'</div>" +
					"<div class='panel-body message-body'>'" + data.FORUser[i].nachricht + "'</div>" +
					"<button class='buttom-btn-small' value=" + data.FORUser[i].absender_email + ":" + data.FORUser[i].nachricht_beschreibung + ":" + data.FORUser[i].Titel.split(' ').join('+') + ">Reply</button>" +
					"<button id='"+ deleteId + "' name='" + data.FORUser[i].id + "'>Delete</button>";
					for(var j = 0; j < fileCount; j++) {
						textFOR  += "<a href='" + param[j] + "' target='__blan'>" +
						"<button id='"+ downloadId[j] + "' name='" + data.FORUser[i].id + "' class='panel-info' style='visibility:" + hideAttachments + "' value='" + attachFileName[j] + "'>'" + attachFileName[j] + "'</button>" +
						"</a>";
					}

					textFOR  += "</div>";
				}
			};
			textFOR += "</div>";

			// Erzeuge Subject-Panel Other Requests
			textFOR += "<div class='panel message-group'>" +
					"<div class='panel-heading message-heading' style='text-align:center; margin-top:10px;'>Other Requests</div>";

			for(var i = 0; i < data.FORUser.length; i++) {
				if(data.FORUser[i].nachricht_beschreibung === "Anderer") {
					var dateTime = data.FORUser[i].date.split("T");
					var date = dateTime[0];
					var timeString = dateTime[1].split(".");
					var time = timeString[0];
					var finalDateTime = date + " " + time;
					var deleteId = 'deleteMsgButton' + data.FORUser[i].id;
					var attachments = data.FORUser[i].attachfile;
					var attachFileName;
					var hideAttachments = 'hidden';
					var downloadId = [];
					var fileCount = 0;
					var param = [];

					if(data.FORUser[i].attachfile) {
						attachFileName = data.FORUser[i].attachfile.split(',');
						fileCount = attachFileName.length;
						hideAttachments = 'visible'

						for(var j = 0; j < fileCount; j++)
							downloadId.push('downloadAttachmentButton' + data.FORUser[i].id + '_' + j);

					}
					else attachFileName = '';

					for(var j = 0; j < fileCount; j++) {
						if(local)
							param.push(attachURL + data.FORUser[i].absender_id + "\\" + attachFileName[j]);
						else
							param.push(attachURL + data.FORUser[i].absender_id + "/" + attachFileName[j]);
					}

					textFOR  +=
					"<div class='panel message-group'>" +
					"<div class='panel-heading message-heading'>'" + data.FORUser[i].Titel + "'</div>" +
					"<div class='panel-info'>SenderID: '" + data.FORUser[i].absender_email + "'</div>" +
					"<div class='panel-info'>ReceiverID:'" + data.FORUser[i].empfanger_email + "'</div>" +
					"<div class='panel-info'>Date:'" + finalDateTime + "'</div>" +
					"<div class='panel-body message-body'>'" + data.FORUser[i].nachricht + "'</div>" +
					"<button class='buttom-btn-small' value=" + data.FORUser[i].absender_email + ":" + data.FORUser[i].nachricht_beschreibung + ":" + data.FORUser[i].Titel.split(' ').join('+') + ">Reply</button>" +
					"<button id='"+ deleteId + "' name='" + data.FORUser[i].id + "'>Delete</button>";
					for(var j = 0; j < fileCount; j++) {
						textFOR  += "<a href='" + param[j] + "' target='__blan'>" +
						"<button id='"+ downloadId[j] + "' name='" + data.FORUser[i].id + "' class='panel-info' style='visibility:" + hideAttachments + "' value='" + attachFileName[j] + "'>'" + attachFileName[j] + "'</button>" +
						"</a>";
					}

					textFOR  += "</div>";
				}
			};
			textFOR += "</div>";

		};

		// VON User
		if(data.FROMUser) {
			
			// Erzeuge Subject-Panel Buy-Rent Requests
			textFROM += "<div class='panel message-group'>" +
					"<div class='panel-heading message-heading' style='text-align:center'>Buy-Rent Requests</div>";

			for(var i = 0; i < data.FROMUser.length; i++) {
				if(data.FROMUser[i].nachricht_beschreibung === "KaufenMieten") {
					var dateTime = data.FROMUser[i].date.split("T");
					var date = dateTime[0];
					var timeString = dateTime[1].split(".");
					var time = timeString[0];
					var finalDateTime = date + " " + time;
					var deleteId = 'deleteMsgButton' + data.FROMUser[i].id;
					var attachments = data.FROMUser[i].attachfile;
					var attachFileName;
					var hideAttachments = 'hidden';
					var downloadId = [];
					var fileCount = 0;
					var param = [];

					if(data.FROMUser[i].attachfile) {
						attachFileName = data.FROMUser[i].attachfile.split(',');
						fileCount = attachFileName.length;
						hideAttachments = 'visible'

						for(var j = 0; j < fileCount; j++)
							downloadId.push('downloadAttachmentButton' + data.FROMUser[i].id + '_' + j);

					}
					else attachFileName = '';

					for(var j = 0; j < fileCount; j++) {
						if(local)
							param.push(attachURL + data.FROMUser[i].absender_id + "\\" + attachFileName[j]);
						else
							param.push(attachURL + data.FROMUser[i].absender_id + "/" + attachFileName[j]);
					}

					textFROM  +=
					"<div class='panel message-group'>" +
					"<div class='panel-heading message-heading'>'" + data.FROMUser[i].Titel + "'</div>" +
					"<div class='panel-info'>SenderID: '" + data.FROMUser[i].absender_email + "'</div>" +
					"<div class='panel-info'>ReceiverID:'" + data.FROMUser[i].empfanger_email + "'</div>" +
					"<div class='panel-info'>Date:'" + finalDateTime + "'</div>" +
					"<div class='panel-body message-body'>'" + data.FROMUser[i].nachricht + "'</div>" +
					"<button class='buttom-btn-small' value=" + data.FROMUser[i].empfanger_email + ":" + data.FROMUser[i].nachricht_beschreibung + ":" + data.FROMUser[i].Titel.split(' ').join('+') + ">Reply</button>" +
					"<button id='"+ deleteId + "' name='" + data.FROMUser[i].id + "'>Delete</button>";
					for(var j = 0; j < fileCount; j++) {
						textFROM  += "<a href='" + param[j] + "' target='__blan'>" +
						"<button id='"+ downloadId[j] + "' name='" + data.FROMUser[i].id + "' class='panel-info' style='visibility:" + hideAttachments + "' value='" + attachFileName[j] + "'>'" + attachFileName[j] + "'</button>" +
						"</a>";
					}

					textFROM  += "</div>";
				}
			};
			textFROM += "</div>";

			// Erzeuge Subject-Panel Inspection Requests
			textFROM += "<div class='panel message-group'>" +
					"<div class='panel-heading message-heading' style='text-align:center; margin-top:10px;'>Inspection Requests</div>";

			for(var i = 0; i < data.FROMUser.length; i++) {
				if(data.FROMUser[i].nachricht_beschreibung === "Besichtigung") {
					var dateTime = data.FROMUser[i].date.split("T");
					var date = dateTime[0];
					var timeString = dateTime[1].split(".");
					var time = timeString[0];
					var finalDateTime = date + " " + time;
					var deleteId = 'deleteMsgButton' + data.FROMUser[i].id;
					var attachments = data.FROMUser[i].attachfile;
					var attachFileName;
					var hideAttachments = 'hidden';
					var downloadId = [];
					var fileCount = 0;
					var param = [];

					if(data.FROMUser[i].attachfile) {
						attachFileName = data.FROMUser[i].attachfile.split(',');
						fileCount = attachFileName.length;
						hideAttachments = 'visible'

						for(var j = 0; j < fileCount; j++)
							downloadId.push('downloadAttachmentButton' + data.FROMUser[i].id + '_' + j);

					}
					else attachFileName = '';

					for(var j = 0; j < fileCount; j++) {
						if(local)
							param.push(attachURL + data.FROMUser[i].absender_id + "\\" + attachFileName[j]);
						else
							param.push(attachURL + data.FROMUser[i].absender_id + "/" + attachFileName[j]);
					}

					textFROM  +=
					"<div class='panel message-group'>" +
					"<div class='panel-heading message-heading'>'" + data.FROMUser[i].Titel + "'</div>" +
					"<div class='panel-info'>SenderID: '" + data.FROMUser[i].absender_email + "'</div>" +
					"<div class='panel-info'>ReceiverID:'" + data.FROMUser[i].empfanger_email + "'</div>" +
					"<div class='panel-info'>Date:'" + finalDateTime + "'</div>" +
					"<div class='panel-body message-body'>'" + data.FROMUser[i].nachricht + "'</div>" +
					"<button class='buttom-btn-small' value=" + data.FROMUser[i].empfanger_email + ":" + data.FROMUser[i].nachricht_beschreibung + ":" + data.FROMUser[i].Titel.split(' ').join('+') + ">Reply</button>" +
					"<button id='"+ deleteId + "' name='" + data.FROMUser[i].id + "'>Delete</button>";
					for(var j = 0; j < fileCount; j++) {
						textFROM  += "<a href='" + param[j] + "' target='__blan'>" +
						"<button id='"+ downloadId[j] + "' name='" + data.FROMUser[i].id + "' class='panel-info' style='visibility:" + hideAttachments + "' value='" + attachFileName[j] + "'>'" + attachFileName[j] + "'</button>" +
						"</a>";
					}

					textFROM  += "</div>";
				}
			};
			textFROM += "</div>";

			// Erzeuge Subject-Panel Information Requests
			textFROM += "<div class='panel message-group'>" +
					"<div class='panel-heading message-heading' style='text-align:center; margin-top:10px;'>Information Requests</div>";

			for(var i = 0; i < data.FROMUser.length; i++) {
				if(data.FROMUser[i].nachricht_beschreibung === "Information") {
					var dateTime = data.FROMUser[i].date.split("T");
					var date = dateTime[0];
					var timeString = dateTime[1].split(".");
					var time = timeString[0];
					var finalDateTime = date + " " + time;
					var deleteId = 'deleteMsgButton' + data.FROMUser[i].id;
					var attachments = data.FROMUser[i].attachfile;
					var attachFileName;
					var hideAttachments = 'hidden';
					var downloadId = [];
					var fileCount = 0;
					var param = [];

					if(data.FROMUser[i].attachfile) {
						attachFileName = data.FROMUser[i].attachfile.split(',');
						fileCount = attachFileName.length;
						hideAttachments = 'visible'

						for(var j = 0; j < fileCount; j++)
							downloadId.push('downloadAttachmentButton' + data.FROMUser[i].id + '_' + j);

					}
					else attachFileName = '';

					for(var j = 0; j < fileCount; j++) {
						if(local)
							param.push(attachURL + data.FROMUser[i].absender_id + "\\" + attachFileName[j]);
						else
							param.push(attachURL + data.FROMUser[i].absender_id + "/" + attachFileName[j]);
					}

					textFROM  +=
					"<div class='panel message-group'>" +
					"<div class='panel-heading message-heading'>'" + data.FROMUser[i].Titel + "'</div>" +
					"<div class='panel-info'>SenderID: '" + data.FROMUser[i].absender_email + "'</div>" +
					"<div class='panel-info'>ReceiverID:'" + data.FROMUser[i].empfanger_email + "'</div>" +
					"<div class='panel-info'>Date:'" + finalDateTime + "'</div>" +
					"<div class='panel-body message-body'>'" + data.FROMUser[i].nachricht + "'</div>" +
					"<button class='buttom-btn-small' value=" + data.FROMUser[i].empfanger_email + ":" + data.FROMUser[i].nachricht_beschreibung + ":" + data.FROMUser[i].Titel.split(' ').join('+') + ">Reply</button>" +
					"<button id='"+ deleteId + "' name='" + data.FROMUser[i].id + "'>Delete</button>";
					for(var j = 0; j < fileCount; j++) {
						textFROM  += "<a href='" + param[j] + "' target='__blan'>" +
						"<button id='"+ downloadId[j] + "' name='" + data.FROMUser[i].id + "' class='panel-info' style='visibility:" + hideAttachments + "' value='" + attachFileName[j] + "'>'" + attachFileName[j] + "'</button>" +
						"</a>";
					}

					textFROM  += "</div>";
				}
			};
			textFROM += "</div>";

			// Erzeuge Subject-Panel Other Requests
			textFROM += "<div class='panel message-group'>" +
					"<div class='panel-heading message-heading' style='text-align:center; margin-top:10px;'>Other Requests</div>";

			for(var i = 0; i < data.FROMUser.length; i++) {
				if(data.FROMUser[i].nachricht_beschreibung === "Anderer") {
					var dateTime = data.FROMUser[i].date.split("T");
					var date = dateTime[0];
					var timeString = dateTime[1].split(".");
					var time = timeString[0];
					var finalDateTime = date + " " + time;
					var deleteId = 'deleteMsgButton' + data.FROMUser[i].id;
					var attachments = data.FROMUser[i].attachfile;
					var attachFileName;
					var hideAttachments = 'hidden';
					var downloadId = [];
					var fileCount = 0;
					var param = [];

					if(data.FROMUser[i].attachfile) {
						attachFileName = data.FROMUser[i].attachfile.split(',');
						fileCount = attachFileName.length;
						hideAttachments = 'visible'

						for(var j = 0; j < fileCount; j++)
							downloadId.push('downloadAttachmentButton' + data.FROMUser[i].id + '_' + j);

					}
					else attachFileName = '';

					for(var j = 0; j < fileCount; j++) {
						if(local)
							param.push(attachURL + data.FROMUser[i].absender_id + "\\" + attachFileName[j]);
						else
							param.push(attachURL + data.FROMUser[i].absender_id + "/" + attachFileName[j]);
					}

					textFROM  +=
					"<div class='panel message-group'>" +
					"<div class='panel-heading message-heading'>'" + data.FROMUser[i].Titel + "'</div>" +
					"<div class='panel-info'>SenderID: '" + data.FROMUser[i].absender_email + "'</div>" +
					"<div class='panel-info'>ReceiverID:'" + data.FROMUser[i].empfanger_email + "'</div>" +
					"<div class='panel-info'>Date:'" + finalDateTime + "'</div>" +
					"<div class='panel-body message-body'>'" + data.FROMUser[i].nachricht + "'</div>" +
					"<button class='buttom-btn-small' value=" + data.FROMUser[i].empfanger_email + ":" + data.FROMUser[i].nachricht_beschreibung + ":" + data.FROMUser[i].Titel.split(' ').join('+') + ">Reply</button>" +
					"<button id='"+ deleteId + "' name='" + data.FROMUser[i].id + "'>Delete</button>";
					for(var j = 0; j < fileCount; j++) {
						textFROM  += "<a href='" + param[j] + "' target='__blan'>" +
						"<button id='"+ downloadId[j] + "' name='" + data.FROMUser[i].id + "' class='panel-info' style='visibility:" + hideAttachments + "' value='" + attachFileName[j] + "'>'" + attachFileName[j] + "'</button>" +
						"</a>";
					}

					textFROM  += "</div>";
				}
			};
			textFROM += "</div>";
		}

		//console.log(textFOR);
		//console.log(textFROM);
		//console.log(targetFOR);
		//console.log(targetFROM);

		targetFOR.append(textFOR);
		targetFROM.append(textFROM);

		// Add listener to each message FOR user
		for(var i = 0; i < data.FORUser.length; i++) {
			var addListenerId = 'deleteMsgButton' + data.FORUser[i].id;
			//console.log(addListenerId);
			document.getElementById(addListenerId).addEventListener('click', deleteMessage, false);
		}

		// Add listener to each message FROM user
		for(var i = 0; i < data.FROMUser.length; i++) {
			var addListenerId = 'deleteMsgButton' + data.FROMUser[i].id;
			//console.log(addListenerId);
			document.getElementById(addListenerId).addEventListener('click', deleteMessage, false);
		}

		// Handle message window for reply button 
		$(".buttom-btn-small").click(function(){
			$(".top-btn").addClass('top-btn-show');
			$(".contact-form-page").addClass('show-profile');
			$(".message-block").css('position','inherit');
			$(this).addClass('buttom-btn-hide');

			//Hole die Werte der Nachricht und setze diese als Default für die Antwortnachricht
			console.log(this.value);
			var messageInfoArray = this.value.split(":");
			$('#exampleInputText').val(messageInfoArray[0]);
			$('#subject_type').val(messageInfoArray[1]);
			$('#exampleInputEmail1').val(messageInfoArray[2].split('+').join(' '));

			//console.log(this);
		});
	}

	// File upload messages ------------------------------------
	document.getElementById("uploadMessageButton").addEventListener("click", renderUploads, false);
	
	// Handhabung des Dateiuploads
	function renderUploads() {
		console.log("Function renderUploads entered!");
		
		// Aktualisieren der Dateiauswahl
		document.getElementById("fileInputMSG").addEventListener('change', function (evt){

			// Dateien aus event auslesen
			var files = evt.target.files;
			console.log(files);
			
			// Nur erlaubte Dateitypen akzeptieren
			for(var i = 0; i < files.length; i++){
				// Trenne Dateienamen und Dateityp
				var nameAndPostfix = files[i].name.split(".");
				console.log(nameAndPostfix);
				
				// Dateityp der aktuell zu ueberpruefenden Datei
				var postfix = nameAndPostfix[nameAndPostfix.length - 1];
				
				// Ueberpruefe, ob der Dateityp zulaessig ist
				var fileTypeIsValid = fileTypeChecker.checkFileType(postfix);
				
				// Fuege Attribute isValid mit entsprechendem Wert hinzu
				if(fileTypeIsValid)
					files[i].isValid = true;
				else 
					files[i].isValid = false;
			}
			
			// Verarbeite Dateien
			for(var i = 0; i < files.length; i++){
				(function(file) {
					// Verarbeite nur zulaessige Dateien
					if(file.isValid) {
						// Ein Objekt um Dateien einzulesen
						var senddata = new Object();
						var reader = new FileReader();

						// Auslesen der Datei-Metadaten
						senddata.name = file.name;
						senddata.date = file.lastModified;
						senddata.size = file.size;
						senddata.type = file.type;

						// Wenn der Dateiinhalt ausgelesen wurde
						reader.onload = function(e) {
							senddata.fileData = e.target.result;
						}

						// Die Datei einlesen und in eine Data-URL konvertieren
						reader.readAsDataURL(file);

						// Nachricht enhaelt Dateien
						msgHasFiles = true;

						// Dateien ins Dateiarray einfuegen
						allFiles.push(senddata);
					}

				})(files[i]);	// Closure
			};
			console.log(allFiles);

		}, false);
	}

	//Wandelt die deutschen Topics in englische um, damit diese ordnungsgemäß
	//in der Nachrichtenbox angezeigt werden können.
	function languageExplosion(value) {
		var toEnglish = "";
		if (value == "KaufenMieten"){
			toEnglish = "Buy or Rent Request";
		} else if (value == "Besichtigung"){
			toEnglish = "Inspection Date Request";
		} else if (value == "Information"){
			toEnglish = "Information Request";
		} else if (value == "Andere"){
			toEnglish = "Other Subject";
		}
		return toEnglish;
	}
});