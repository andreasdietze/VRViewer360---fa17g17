$(document).ready(function () {

	// Helper-Object: Ueberprueft Dateien auf Zulaessigkeit
	var fileTypeChecker = new FileTypeChecker();

	// Msg enhält dateien ?
	var msgHasFiles = false;

	// Enthält alle Dateireferenzen
	var allFiles = [];

	// Helper-Object: set url to sfsuse or localhost
	var ajaxURL = new AJAXSettings().getAJAXURL();

	//Prüfe, ob User bereits angemeldet
	var cookieArray = Cookies.get('UserID');
	var userObject = null;

	if(typeof(cookieArray) != "undefined") {
		userObject = JSON.parse(cookieArray.substring(2));
	}

	// Lokale Dateien oder vom Server, else sfsuse
	var local;
	if(ajaxURL === 'http://127.0.0.1:17017')
		local = true;
	else
		local = false;

	var attachURL		= '';
	if(local)
		attachURL = ajaxURL + "\\fa17g17\\DL\\";
	else
		attachURL = ajaxURL + "/fa17g17/DL/";

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

    <!-- $("#sidebar").mCustomScrollbar({ -->
         <!-- theme: "minimal" -->
    <!-- }); -->

    $('#sidebarCollapse').on('click', function () {
        // open or close navbar
        $('#sidebar').toggleClass('active');
        // close dropdowns
        $('.collapse.in').toggleClass('in');
        // and also adjust aria-expanded attributes we use for the open/closed arrows
        // in our CSS
        $('a[aria-expanded=true]').attr('aria-expanded', 'false');
    });

	// Send Messages ------------------------------------
	document.getElementById("sendMSGButton").addEventListener("click", sendMessage, false);

	function sendMessage () {
		console.log("Function renderUploads entered!");
		
		if(userObject != null) {
		  // Intern
		  var senderId			= userObject.id; 	
		  var senderNick		= userObject.user;	//'admin@admin2.de';
		  
		  // Formatiertes Datum
		  var d = new Date();
		  var formattedDate		= d.getFullYear()	+ "-" + d.getMonth()	+ "-" + d.getDate();
		  var formattedTime		= d.getHours()		+ ":" + d.getMinutes()	+ ":" + d.getSeconds();

		  //Setze Empfänger
		  var receiverNick		= document.getElementById('agent_nick').value;
		  var subjectType		= document.getElementById("subject_type").value;
		  var topic				= document.getElementById('exampleInputEmail1').value;
		  var msg				= document.getElementById('exampleInputMessage').value;
		  var attachments		= allFiles;
		  //console.log(attachments);

		  $.ajax
		  (
		    {
		      type			: "POST",
		      url			: ajaxURL + "/fa17g17/messaging/send",
		      contentType	: 'application/json',
		      data			:
		      JSON.stringify
		      (
		        {
		          "SenderID"	: senderId,
		          "SenderNick"	: senderNick,
		          "ReceiverNick": receiverNick,
		          "Subject"		: subjectType,
		          "Topic"		: topic,
		          "Message"		: msg,
		          "Date"		: formattedDate,
		          "Time"		: formattedTime,
				  "HasFiles"	: msgHasFiles,
				  "IsLocal"		: local,
				  "Attachments"	: attachments
		        }
		      ),
		      success		: function (data)
		      {
		        console.log("SUCCESS-CB");
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
		      alert("Nachricht gesendet an " + receiverNick);
		    }
		  );
		} else {
			alert("For this functionality you must be a registered user of this website");
			window.location.href = ajaxURL + "/fa17g17/Login";
		}
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
				(function(file){
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
});
