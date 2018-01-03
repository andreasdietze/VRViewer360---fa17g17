/********************************************
		Einbindung der Abh�ngigkeiten
*********************************************/

//Loading Dependencies for express
var express = require("express");
var formatCurrency = require('format-currency')
var passport = require('passport');
var bCrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var dateFormat = require('dateformat');
var fs = require('fs');


//Loading Dependencies for express
var app = express();
var router = express.Router();
var path = __dirname + '/views';
var dlPath = __dirname + '/DL';

// Extend filesize limit.
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cookieParser());

// access-control-origin-header
app.all
(
	'*',
	function (req, res, next)
	{
		res.header("Access-Control-Allow-Origin", "http://localhost:17017");
		res.header("Access-Control-Allow-Headers", "Content-Type");
		res.header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS, DELETE, POST");
		res.header("Access-Control-Allow-Credentials", "true");
		next();
	}
);

// Test connection
var con = mysql.createConnection({
  host: "localhost",
  user: "fa17g17",
  password: "d795.ze3.K35",
  database: "fa17g17"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

/********************************************
						Passport Konfiguration
*********************************************/

//Setze Cookie und initiiere Session auf Serverseite
app.use(expressSession({
	secret: 'fa17g17',
	cookie: {},
	name: 'MPCook',
	resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


/*
	Die folgenden zwei Funktionen dienen dem Herauslesen von Session-Informationen
	aus dem verschlüsselten Cookie

	Anteile der folgenden zwei Funktionen:
	100% by David Karimi
*/
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
	var userName = id.user;
	var selectQuery = "select id, nickname, password, firstname, lastname, role from user where nickname='" + userName + "'";
	con.query(selectQuery, function (err, result) {
		if (err) return done(err);
		var length = result.length;
		if(length == 1){
			return done(null, result[0].nickname);
		} else {
			return done(null, false);
		}
	});
});

/*
	Definiert den Login. Wurde ein Nutzer gefunden und das richtige Passwort
	verwendet, so wird Passport dies durch die done-Methode signalisiert
	und innerhalb der REST-API kann ein erfolgreicher Login singalisiert
	werden.

	Anteile:
	100% by David Karimi
*/
passport.use('login', new LocalStrategy({
		usernameField: 'user',
		passwordField: 'password',
    passReqToCallback : true
  },
  function(req, username, password, done) {

		//Prüfe, ob Nutzer vorhanden und Passwort korrekt
		var selectQuery = "select id, nickname, password, firstname, lastname, role from user where nickname='" + req.body.user + "'";
		con.query(selectQuery, function (err, result) {
      if (err) {
				return done(err);
			}
			var length = result.length;
			if(length == 1){
				//Prüfe, ob Passwort-Hashes übereinstimmen
				if (!bCrypt.compareSync(password, result[0].password)){
					return done(null, false, {message:"Username or Password incorrect"});
				} else {
					//Definiere Session Inhalte
					var user = {
						"id":result[0].id,
						"user":req.body.user,
						"firstname":result[0].firstname,
						"lastname":result[0].lastname,
						"role":result[0].role
					};
					//Liefere Session Inhalte an Passport zurück
					return done(null, user);
				}
			} else {
				return done(null, false, {message:"Username or Password incorrect"});
			}
    });
	}));

	/*
		Definiert die Anmelderoutine. Dabei wird geprüft, ob bereits ein User mit
		gleicher Mail existiert und falls nicht, so werden Passwörter gehashed und
		die übergebenen Werte in die Datenbank eingetragen. Eine direkte Anmeldung
		nach der Registrierung erfolgt jedoch nicht!!!

		Anteile:
		100% by David Karimi
	*/
	passport.use('signup', new LocalStrategy({
			usernameField: 'email',
	    passwordField: 'password',
	    passReqToCallback : true
	  },
	  function(req, username, password, done) {
			var firstName = req.body.firstName;
			var lastName = req.body.lastName;
			var mail = req.body.email;
			var password = req.body.password;
			var passHash = getPasswordHash(password);
			var street = req.body.street;
			var city = req.body.city;
			var postalCode = req.body.postalcode;

			var jsonData = {
				"firstname":firstName,
				"lastname":lastName,
				"mail":mail,
				"password":passHash,
				"street":street,
				"city":city,
				"postalcode":postalCode
			};

			var checkCityQuery = "select * from ort where ortname='" + city + "' and plz='" + postalCode + "'";
			var insertCityQuery = "INSERT INTO ort (ortname, beschreibung, plz) VALUES ('" + city + "','---','" + postalCode + "')";

			con.query(checkCityQuery, function(err, result) {
				var resultID = 0;
				if (err) {
					console.log(err);
					return done(err);
				} else {
					if(result.length == 1) {
						resultID = result[0].id;
						insertUserAfterCallback(resultID, jsonData, done);
					} else {
						console.log("Create a new city");
						con.query(insertCityQuery, function(err, result2) {
							if (err) {
								console.log(err);
								return done(err);
							} else {
								resultID = result2.insertId;
								insertUserAfterCallback(resultID, jsonData, done);
							}
						});
					}
				}
			});
		}
	));

	/*
		Aufgrund der Verwendung von Call-back-Funktionen im Sign-UP Prozess muss
		das Einfügen eines Nutzers nach Abfrage/Einfügen eines Ortes durch diese
		Funktion aufgerufen werden. Andernfalls kommt es zu dem Fall, dass ein Wert
		von einer Call-back-Funktionen benötigt wird, welcher zu dem Zeitpunkt noch
		nicht bereitsteht (Endet in einem Fehler).

		Anteile:
		100% by David Karimi
	*/
	function insertUserAfterCallback(cityID, userData, done){
		var checkUserQuery = "select id from user where email='" + userData.mail + "'";
	  var insertUserQuery = "INSERT INTO user (nickname, password, firstname, lastname, email, address, ort_id, role)"
	   + "VALUES ('" + userData.mail + "', '" + userData.password + "', '" + userData.firstname + "', '" + userData.lastname + "', '" + userData.mail + "', '"
	   + userData.street + "', " + cityID + ", 2)";

	   console.log(insertUserQuery);
	  	if (cityID != 0) {
	    con.query(checkUserQuery, function(err, result3) {
	      if (err) {
	        console.log(err);
	        return done(err);
	      } else {
	        if (result3.length == 1) {
	          return done(null, false, "User already exists, please specify another mail address");
	        } else {
	          con.query(insertUserQuery, function(err, result4) {
	            if (err) {
	              console.log(err);
	              return done(err);
	            } else {
	              console.log("User Insert at: " + result4.insertId);
	              return done(null, userData.mail, "Successfully created new user: " + userData.mail);
	            }
	          });
	        }
	      }
	    });
	  } else {
	    return done(null, false, "Cannot get city id");
	  }
	}

	/*
		Erzeugt den Hashwert zu einem Passwort. Notwendig im Registrierungsprozess

		Anteile:
		100% by David Karimi
	*/
	function getPasswordHash(password) {
		return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
	}

/********************************************
				URL Zugriff
				Autor: Max Finsterbusch 100%
*********************************************/

//Routes
//router.get("/",function(req,res){
	//req.session.lastURL = req.url;
	//res.sendFile(path + "/index.html");
//});

router.get("/",function(req,res){
	var user = {
		"id": 2,
		"user" : "admin@admin2.de",
		"firstname":"Test",
		"lastname":"User",
		"role":3
	};
	res.cookie("UserID",user);
	req.session.lastURL = req.url;
	res.sendFile(path + "/index.html");
});

router.get("/about",function(req,res){
	res.sendFile(path + "/about.html");
});

// Login
router.get("/Login",function(req,res){
	res.sendFile(path + "/Login.html");
});

// Registry
router.get("/RegistryPage",function(req,res){
	res.sendFile(path + "/RegistryPage.html");
});

// Bio Max
router.get("/aboutMax",function(req,res){
	res.sendFile(path + "/aboutBioMax.html");
});

// Bio David
router.get("/aboutDavid",function(req,res){
	res.sendFile(path + "/view_karimi.html");
});

// Bio Phan
router.get("/aboutPhan",function(req,res){
	res.sendFile(path + "/ptanh.html");
});

// Bio Andreas
router.get("/aboutAndreas",function(req,res){
	res.sendFile(path + "/ad.html");
});

router.get("/contact",function(req,res){
	req.session.lastURL = req.url;
	res.sendFile(path + "/contact.html");
});

// Dashboard Routes
router.get("/dashboard", function(req,res){
	res.sendFile(path + "/Dashboard.html");
});

router.get("/dashboard/messages",function(req,res){
	res.sendFile(path + "/Dashboard/Messages.html");
});

router.get("/dashboard/Favorits",function(req,res){
	res.sendFile(path + "/Dashboard/Favorits.html");
});

router.get("/dashboard/Offers",function(req,res){
	res.sendFile(path + "/Dashboard/Offers.html");
});

router.get("/dashboard/Contacts",function(req,res){
	res.sendFile(path + "/Dashboard/Contacts.html");
});

// Search Routen
router.get("/search",function(req,res){
	req.session.lastURL = req.url;
	res.sendFile(path + "/SearchResult.html");
});

router.get("/dashboard/newOffer",function(req,res){
	res.sendFile(path + "/NewOffer.html");
});

router.get("/dashboard/editOffer",function(req,res){
	res.sendFile(path + "/EditOffer.html");
});
// Single Offer
router.get("/singleOffer",function(req,res){
	req.session.lastURL = req.url;
	res.sendFile(path + "/angebot_profile.html");
});
// Profil Routen
router.get("/seller", function(req,res){
	req.session.lastURL = req.url;
	res.sendFile(path + "/ProfilPage.html");
});

/********************************************
		API - Benutzerverwaltung
*********************************************/
/*
	Führt den Registrierungsprozess anhand der oberhalb definierten Local
	Strategy von Passport durch.

	Anteile:
	100% by David Karimi
*/
router.post('/user/registration', function(req, res, next){
	passport.authenticate('signup', function(err, user, info){
		if(err) console.log(err);
		if(!user){
			return res.json({created:"false", information:"" + info});
		}
		return res.json({created:"true", info});
	})(req, res, next);
});

/*
	Führt die Authentifizierung eines bereits registrierten Nutzers anhand
	der oberhalb definierten Local Strategy aus. Wurde der Nutzer im System gefunden
	und das Passwort korrekt übergeben, so wird für diesen automatisch eine autorisierte
	Session gesetzt und ein Cookie übergeben, welches die Authentifizierung signalisiert.

	Anteile:
	100% by David Karimi
*/
router.post('/user/login', function(req, res, next) {
	passport.authenticate('login', function(err, user, info){
		if(err) console.log(err);
		if(!user){
			return res.json({login:"false", information:"" + info.message});
		}
		req.logIn(user, function(err){
			if(err) return next(err);
			//Speichere Nutzer-JSON im lokalen Client-Cache
			res.cookie("UserID",user);
			req.session.user = user;

			var returnValue = "/fa17g17";
			if (req.session.lastURL == null) {
				req.session.lastURL = null;
				return res.json({login:"true", lastURL:returnValue});
			} else {
				//Wurde der Nutzer zuvor von einer anderen Seite auf den Login verwiesen,
				//so soll dieser auch wieder auf die ursprüngliche Seite weitergeleitet
				//werden.
				returnValue = returnValue.concat(req.session.lastURL);
				req.session.lastURL = null;
				return res.json({login:"true", lastURL:returnValue});
			}
		});
	})(req, res, next);
});

/*
	Meldet einen Nutzer aus seiner laufenden Session ab. Hierzu gehört unter
	anderem das Löschen des Cookies sowie der entsprechende Logout-Befehl
	von Passport. Dieser sorgt dafür, dass die User-Variable aus der Session
	entfernt wird und dadurch eine weitere Identifizierung nicht mehr für die
	laufende Session möglich ist.
	Anteile:
	100% by David Karimi
*/

router.get('/user/logout', function(req, res){
    // Abmeldung vom System
		res.clearCookie("UserID");
		req.logout();
		res.redirect('/fa17g17');
});

/*
	Stellt die Funktion des Dashboards bereits, welche dem Nutzer die Aktualisierung
	seiner Nutzer und Passwortdaten ermöglicht. Hierzu gehören keine Adressdaten
	Anteile:
	100% by David Karimi
*/
router.post('/user/update/credentials', function(req, res){
    // Benutzerdaten aktualisieren
		var userID = req.body.id;
		var mail = req.body.mail;
		var password = bCrypt.hashSync(req.body.password, bCrypt.genSaltSync(10), null);

		var updateQuery = "update user set email='" + mail + "', nickname='" + mail + "', password='" + password + "' where id=" + userID;
		var checkNewMailQuery = "select id from user where id not like " + userID;
		con.query(checkNewMailQuery, function(err, result) {
			if(err){
				console.log(err);
				res.json({update:"false", message:"Failed to update your account details!!! Please contact the administrator"});
			} else {
				var counter = result.length;
				if(counter == 1){
					res.json({update:"false", message:"The mail address you have specified is already taken. Why don't you stay with your current email address?"});
				} else {
					con.query(updateQuery, function(err, result) {
						if(err) {
							console.log(err);
							res.json({update:"false", message:"Failed to update your account details!!! Please contact the administrator"});
						} else {
							res.json({update:"true", message:"Successfully updated your account details"});
						}
					});
				}
			}
		});
});

/*
	Stellt die Funktion im Dashboard bereit, welche dem Nutzer die Aktualisierung
	seiner Adressdaten ermöglicht.

 	Anteile:
 	100% by David Karimi
*/
router.post('/user/update/contactInfo', function(req, res){
    // Benutzerdaten aktualisieren
		var userID = req.body.id;
		var firstname = req.body.firstname;
		var lastname = req.body.lastname;
		var telephone = req.body.telephone;
		var street = req.body.street;
		var city = req.body.city;
		var postalcode = req.body.postalcode;

		var checkCityQuery = "Select id from ort where plz ='" + postalcode + "' and ortname='" + city + "'";
		var insertCityQuery = "insert into ort (ortname, beschreibung, plz) values ('" + city + "','---','" + postalcode + "')";

		con.query(checkCityQuery, function (err, result) {
			if(err) {
				console.log(err);
				res.json({update:"false", message:"Failed to update your account details!!! Please contact the administrator"});
			}
			var cLength = result.length;
			var cityID = -1;
			if(cLength == 1){
				cityID = result[0].id;
			} else {
				con.query(insertCityQuery, function(err, result) {
					if(err){
						console.log(err);
						return done(err);
					} else {
						cityID = result.insertId;
					}
				});
			}

			var updateQuery = "update user set firstname ='" + firstname + "', lastname='" + lastname + "', telephone='" + telephone + "', address='" + street + "', ort_id=" + cityID + " where id=" + userID;
			con.query(updateQuery, function(err, result) {
				if(err) {
					console.log(err);
					res.json({update:"false", message:"Failed to update your account details!!! Please contact the administrator"});
				} else {
					res.json({update:"true", message:"Successfully updated your contact details"});
				}
			});
		});
});

/*
	Stellt die Funktion im Dashboard bereit, welche dem Nutzer die Aktualisierung
	seiner Rolle von Käufer-Standard zu Makler-Käufer ermöglicht.

	Anteile:
	100% by David Karimi
*/
router.post('/user/update/role', function(req,res){
	//Updated die Rolle eines Nutzers
	var userID = req.body.id;
	var agency = req.body.agency;
	var agentID = req.body.agentID;
	var buffer = req.session.user;

	var updateRoleQuery = "update user set agency='" + agency + "', agent_id='" + agentID + "', role=3 where id=" + userID;
	console.log(updateRoleQuery);
	con.query(updateRoleQuery, function(err, result) {
		if (err) {
			console.log(err);
			res.json({update:"false"});
		} else {
			console.log(result);
			req.session.user.role = 3;
			res.cookie("UserID",req.session.user);
			res.json({update:"true", message:"Your role was successfully updated to an agent!!!"});
		}
	});
});

/*
	Liefert alle für einen Nutzer relevanten Informationen zurück. Diese Funktion
	wird im Front End vor allem für die Darstellung des Maklerprofils verwendet.

	Anteile:
 	50% by David Karimi
 	50% by Max Finsterbusch
*/
router.post('/user/profile', function(req, res){
    // Weiterleitung auf die Profilseite eines Nutzers
		var userID = req.body.id;
		var userSelectQuery = "select u.*, o.ortname, o.plz from user u inner join ort o on u.ort_id = o.id where u.id =" + userID;
		var wertungSelectQuery = "select b.id, b.beschreibung, w.wert from bewertung b inner join wertung w on b.wertung_id = w.id where b.user_id =" + userID;
		con.query(userSelectQuery, function(err, result) {
			if(err) console.log(err);
			else {
				if(result.length == 1){
					var rating = 0;
					var comment = "No comments available";
					if(result[0].role == 3){
						con.query(wertungSelectQuery, function(err, result2) {
							if (err) {
								console.log(err);
								res.json({success:"false"});
							} else {
								if(result2.length == 1){
									rating = result2[0].wert;
									comment = result2[0].beschreibung;
								}
							}
						});
					}
					var data = {
						"firstname":result[0].firstname,
						"lastname":result[0].lastname,
						"phone":result[0].telephone,
						"mail":result[0].email,
						"street":result[0].address,
						"city":result[0].ortname,
						"postalcode":result[0].plz,
						"rating":rating,
						"comment":comment,
						"role":result[0].role,
						"agency":result[0].agency,
						"agentID":result[0].agent_id
					};
					res.json({success:"true", data});
				} else {
					res.json({success:"false"});
				}
			}
		});
});

/*
	Liefert alle verfügbaren Estate Agents des Systems zurück. Dient dem auslösen
	eines Offer Requests an einen Makler. Dem Nutzer können durch diese API
	alle verfügbaren Agents gezeigt werden.

	Anteile:
	100% by David Karimi
*/
router.post('/user/agents', function(req, res) {
	var selectAgentsQuery = "select id, firstname, lastname, agency from user where role=3";
	con.query(selectAgentsQuery, function(err, result) {
		if (err) {
			console.log(err);
			res.json({response:"false"});
		} else {
			if (result.length > 0){
				res.json({response:"true", result});
			} else {
				res.json({response:"false"});
			}
		}
	});
});

/*
	Löscht einen Nutzer aus dem System sowie alle Abhängigkeiten, die durch ihn
	auf der Datenbank entstanden sind (Messages, Kontakte...). Die Daten eines
	Nutzers werden beginnend von der tiefsten Ebene aus gelöscht. Wurden alle
	Daten des Nutzers erfolgreich entfernt, so wird im letzten Schritt auch der
	Nutzer selber entfernt. Andernfalls bleibt der Nutzer existent.

	Anteile:
	100% by David Karimi
*/
router.post('/user/delete', function(req, res){
    // Löscht das Konto eines Kundens
		var userID = req.body.id;

		//Tabelle Angebot mit on delete cascade auf Immobilie!!!
		//Tabelle Favorit mit on delete cascade auf Angebot!!!
		//Tabelle Kommentar mit on delete cascade auf Angebot!!!
		var deleteImmoQuery = "delete from immobilien where verkaufer_id=" + userID;

		//Tabelle Kontakt mit on delete cascade auf User!!!
		//Tabelle Nachricht mit on delete cascade auf Kontakt!!!
		//Tabelle Bewertung mit on delete cascade auf User!!!
		var deleteUserQuery = "delete from user where id=" + userID;

		con.query(deleteImmoQuery, function(err, result) {
			if (err) {
				console.log(err);
				res.json({deleted:"false"});
			} else {
				con.query(deleteUserQuery, function(err, result2) {
					if (err) {
						console.log(err);
						res.json({deleted:"false"});
					} else {
						res.clearCookie("UserID");
						req.logout();
						res.json({deleted:"true"});
					}
				});
			}
		});
});

/********************************************
		API - Immobiliensuche
*********************************************/

/*
	Speichert für jeden Nutzer die letzte durchgeführte Suche, um diese einen
	komfortableren Übergang zwischen Seiten durch die Übernahme seiner
	Suchparameter

	Anteile:
	100% by David Karimi
*/
router.post('/estatesearch/buffersearch', function(req, res) {
	var angebot_art = req.body.angebot_art;
	var ort = req.body.ort;
	var objektart = req.body.objektart;
	var qm = parseInt(req.body.qm);
	var preis = parseInt(req.body.preis);
	var zimmeranzahl = parseInt(req.body.zimmeranzahl);

	var buffer = {
		"angebot_art": angebot_art,
		"ort":ort,
		"objektart":objektart,
		"qm":qm,
		"preis":preis,
		"zimmeranzahl":zimmeranzahl
	};
	//Speichere Daten zwischen, damit ein Client nach Weiterleitung auf
	//Suchseite seine Suchdaten wieder abfragen kann
	req.session.search = buffer;
	res.json({buffered:"true"});
});

/*
	Liefert die letzten Suchparameter an den Client zurück, damit diese automatisch
	in der Webseite ausgefüllt werden.

	Anteile:
	100% by David Karimi
*/
router.get('/estatesearch/buffersearch', function(req, res) {
	var buffer = req.session.search;
	if(buffer != undefined){
		res.json({buffered:"true", buffer});
	} else {
		res.json({buffered:"false"});
	}
});

/*
	Stellt die Funktion zur Suche von Immobilien dar. Diese wird von jeder Seite
	aus im Front End bereitgestellt. Durch die vorhergehende BufferSearch werden
	die letzten Suchparameter gespeichert, um eine schnellere Eingabe der Suchparameter
	zu ermöglichen.

 	Anteile:
 	40% by Phan
 	60% by David Karimi
*/
router.post('/estatesearch/search', function(req, res){

	// Suche nach einer Immobilie
	var obj = req.body;
	var angebot_art = obj.angebot_art;
	var ort = obj.ort;
	var objektart = obj.objektart;
	var qm = parseInt(obj.qm);
	var preis = parseInt(obj.preis);
	var zimmeranzahl = parseInt(obj.zimmeranzahl);

	var buffer = {
		"angebot_art": angebot_art,
		"ort":ort,
		"objektart":objektart,
		"qm":qm,
		"preis":preis,
		"zimmeranzahl":zimmeranzahl
	};
	req.session.search = buffer;

	var sql = "SELECT a.angebot_titel, i.id, a.id as angebot_id, a.kaufpreis, i.immobilien_adress, i.qm, i.zimmeranzahl, o.ortname, o.plz, i.beschreibung, i.media"
		+ " FROM fa17g17.immobilien i inner join fa17g17.ort o on immobilien_ort = o.id inner join fa17g17.angebot a on i.id = a.immobilien_id"
		+ " WHERE a.angebots_art like ('%"+angebot_art+"%') and o.ortname like ('%"+ort+"%') and i.immobilien_art like ('%"+objektart+"%')"
		+ " and i.qm <= "+ qm +" and a.mietenpreis <= "+ preis +" and i.zimmeranzahl >= "+zimmeranzahl + " and i.active=1";
	//console.log (sql);
	con.query(sql, function (err, result) {
		  if (err) throw err;
		  //console.log(result);
		  res.send(JSON.stringify(result));
	});
});

/*
	Auf Basis der zuvor angewendeten Suche wendet der Filter nun auf das zurück
	gelieferte Resultset die zusätzliche Filter-Parameter an. Innerhalb des SQL
	Statements werden dafür Sub-Queries verwendet.

	Anteile:
	60% by David Karimi
	40% by Max Finsterbusch
*/
router.post('/estatesearch/filter', function(req, res){
	//Erweiterte Suche nach einer Immobilie:
	//	�	Neue Suche anhand der alten Suchanfrageparameter aufbauen
	//	�	Suche durch hinzugef�gte Suchanfrageparameter erweitern
	//Neue Suchanfrage abfeuern
	var minQm = req.body.minQm;
	if (minQm == "") minQm = 0;

	var maxQm = req.body.maxQm;
	if (maxQm == "") maxQm = 10000;

	var minPreis = req.body.minPreis;
	if (minPreis == "") minPreis = 0;

	var maxPreis = req.body.maxPreis;
	if (maxPreis == "") maxPreis = 50000000;

	var bauJahr = req.body.bauJahr;
	if (bauJahr == "") bauJahr = 1900;

	var heizungs_art = req.body.heizungs_art;
	var agency = req.body.agencyID;
	var buffer = req.session.search;

	var filterQuery = "SELECT * FROM (SELECT a.angebot_titel, i.id, a.id as angebot_id,  a.kaufpreis, i.immobilien_adress, i.qm, i.zimmeranzahl, o.ortname, o.plz, i.beschreibung, i.baujahr, i.heizungs_art, u.agency, i.media" +
										" FROM immobilien i inner join ort o on immobilien_ort = o.id inner join angebot a on i.id = a.immobilien_id inner join user u on u.id = i.verkaufer_id" +
										" WHERE a.angebots_art like ('%" + buffer.angebot_art + "%') and o.ortname like ('%" + buffer.ort + "%') and i.immobilien_art like ('%" + buffer.objektart + "%')" +
										" and i.qm <= " + buffer.qm + " and a.mietenpreis <= " + buffer.preis + " and i.zimmeranzahl >= " + buffer.zimmeranzahl + " and i.active=1)"
										+ " tab where qm between " + minQm + " and " + maxQm + " and kaufpreis between " + minPreis + " and " + maxPreis + " and baujahr >=" + bauJahr + " and heizungs_art like('%" + heizungs_art + "%') and agency like('%" + agency + "%')";
	//console.log("Filter: " + filterQuery);
	con.query(filterQuery, function(err, result) {
		if (err) {
			console.log(err);
			res.json({filtered:"false"});
		} else {
			if (result.length > 0){
				res.json({filtered:"true", data:result});
			} else {
				res.json({filtered:"false"});
			}
		}
	});
});

/*
	Liefert das Profil einer Immobilie zurück. Dies dient vor allem dem Zweck,
	dass die von einer Suche zurückgelieferten Previews nun auf einer eigenen
	Profilseite genauer betrachtet werden können.

	Anteile:
 	50% by David Karimi
 	50% by Max Finsterbusch
*/
router.post('/estatesearch/profile', function(req, res){
  // Anzeigen eines Immobilienprofiles
	var immoID = req.body.immoID;
	var selectImmoQuery = "select i.*, a.id as angebot_id, a.verkaufer_id, a.immobilien_id, a.angebots_art, a.kaution, a.nebenkosten, a.mietenpreis, a.kaufpreis, a.provision, a.startdate, a.enddate, angebot_titel, o.ortname, o.plz, u.firstname, u.lastname, u.nickname, u.agency from immobilien i inner join angebot a on i.id = a.immobilien_id inner join ort o on o.id = i.immobilien_ort inner join user u on u.id = i.verkaufer_id where i.id =" + immoID;
	con.query(selectImmoQuery, function(err, result) {
		if (err) {
			console.log(err);
			res.json({result:"false"});
		} else {
			if (result.length == 1) {
				var opts = { format: '%v %s', symbol: '€', locale: 'de-DE' }
				var opts2 = { format: '%v %s', symbol: '%', locale: 'de-DE' }
				var data = {
					"immo_type":result[0].immobilien_art,
					"immo_address":result[0].immobilien_adress,
					"immo_rooms":result[0].zimmeranzahl,
					"immo_qm":result[0].qm,
					"immo_floors":result[0].etage_anzahl,
					"immo_condition":result[0].bauzustand,
					"immo_features":result[0].features,
					"immo_purpose":result[0].nutzungszweck,
					"immo_desc":result[0].beschreibung,
					"immo_owner":result[0].besitzer_id,
					"immo_heating":result[0].heizungs_art,
					"immo_baujahr":result[0].baujahr,
					"offer_type":result[0].angebots_art,
					"offer_bail":formatCurrency(result[0].kaution, opts),
					"offer_utilcosts":formatCurrency(result[0].nebenkosten, opts),
					"offer_pricing":formatCurrency(result[0].mietenpreis, opts),
					"offer_provision":formatCurrency(result[0].provision, opts2),
					"offer_startdate":dateFormat(result[0].startdate, "yyyy-mm-dd"),
					"offer_enddate":dateFormat(result[0].enddate, "yyyy-mm-dd"),
					"offer_title":result[0].angebot_titel,
					"city_name":result[0].ortname,
					"city_plz":result[0].plz,
					"agent_id":result[0].verkaufer_id,
					"agent_firstname":result[0].firstname,
					"agent_lastname":result[0].lastname,
					"agent_agency":result[0].agency,
					"agent_nick":result[0].nickname,
					"immo_media": result[0].media,
					"angebot_id": result[0].angebot_id
				};
				res.json({result:"true", data});
			} else {
				res.json({result:"false"});
			}
		}
	});
});

/*
	Speichert eine Immobilie als Favorit eines Nutzers.

	Anteile:
 	60% by David Karimi
 	40% by Max Finsterbusch
*/
router.post('/estatesearch/favour/insert', function(req, res){
  // Fügt eine Immobilie den Favoriten eines Users hinzu
	//
	// Identifikation des Users über die userId
	// Identifikation der Estate über die immoId
	//
	// Das json des Response sagt aus, ob zu den Favoriten hinzugefügt oder entfernt wurde
	var userID = req.session.user.id;
	var offerID = req.body.angebot_id;

	var selectFavoriteQuery = "select * from favorit where user_id=" + userID + " and angebot_id=" + offerID;
	var insertFavoriteQuery = "insert into favorit (user_id,angebot_id) values (" + userID + "," + offerID + ")";

	console.log("Insert: " + insertFavoriteQuery);

	con.query(selectFavoriteQuery, function(err, result) {
		if (err) {
			console.log(err);
			res.json({created:"false"});
		} else {
			console.log(result);
			if (result.length == 0) {
				con.query(insertFavoriteQuery, function(err, result2) {
					if (err) {
						console.log(err);
						res.json({created:"false"});
					} else {
						res.json({created:"true"});
					}
				});
			}
		}
	});
});

/*
	Löscht die zu einer Immobilie angelegte Favorite einers Nutzers.

	Anteile:
 	100% by David Karimi
*/
router.post('/estatesearch/favour/delete', function(req, res) {
	//Löscht eine bereits favorisierte Immobilie eines Nutzers
	var userID = req.session.user.id;
	var immoID = req.body.angebot_id;

	var deleteFavoriteQuery = "delete from favorit where user_id=" + userID + " and angebot_id=" + immoID;
	con.query(deleteFavoriteQuery, function(err, result) {
		if (err) {
			console.log(err);
			res.json({deleted:"false"});
		} else {
			res.json({deleted:"true"});
		}
	});
});

/*
	Liefert die zu einem übergebenen Nutzer gehörenden Favoriten. Bestehend aus
	Werten der Tabelle Angebot und Immobilie

	Anteile:
 	60% by David Karimi
 	40% by Max Finsterbusch
*/
router.get('/estatesearch/favour/', function(req, res) {
	var userID = req.session.user.id;
	var selectAllFavoritesQuery = " SELECT a.angebot_titel, i.id, a.id as angebot_id, a.kaufpreis, i.immobilien_adress, i.qm, i.zimmeranzahl, o.ortname, o.plz, i.beschreibung, i.media" +
																" from favorit f inner join angebot a on a.id = f.angebot_id inner join immobilien i on i.id = a.immobilien_id inner join ort o on o.id = i.immobilien_ort" +
																" where f.user_id=" + userID;
	con.query(selectAllFavoritesQuery, function(err, result) {
		if (err) {
			console.log(err);
			res.json({result:"false"});
		} else {
			if (result.length > 0) {
				res.json({result:"true", data:result});
			}
		}
	});
});

/*
	Ruft alle zu einem spezifischen Makler gehörenden Immobilien ab, um diesen
	in seinem Profil listen zu können.

 	Anteile:
 	100% by David Karimi
*/
router.post('/estatesearch/user/profiles', function(req, res) {
	var agentID = req.body.agent_id;
	var selectUserProfilesQuery = "SELECT a.angebot_titel, i.id, a.id as angebot_id, a.kaufpreis, i.immobilien_adress, i.qm, i.zimmeranzahl, o.ortname, o.plz, i.beschreibung, i.media" +
																" from immobilien i inner join angebot a on a.immobilien_id = i.id inner join ort o on i.immobilien_ort = o.id where a.verkaufer_id=" + agentID;

	con.query(selectUserProfilesQuery, function(err, result) {
		if (err) {
			console.log(err);
			res.json({return:"false"});
		} else {
			if(result.length > 0) {
				res.json({return:"true", data:result});
			} else {
				res.json({return:"false"});
			}
		}
	});
});

/********************************************
		API - Nachrichtenaustausch
*********************************************/

/*
	Sendet Nachricht an einen anderen Nutzer. Beide Nutzer müssen einen Nutzeraccount besitzen.
	Zunächst wird geprüft, ob bereits eine Kontakt-Id zwischen diesen beiden Nutzer-Ids besteht.
	Wenn noch keine Kontakt-ID zwischen diesen Nutzern existent ist, so wird sie vom System automatsich angelegt.

	Eine Nachricht enthält:
	- Kategorie (vordefinierte Subjects):
			-> Info:				Std. Nachrichtenaustausch bezüglich Informationen
			-> Besichtigung:		Anfrage zu einem Besichtigungstermin
			-> Kauf-/Mietanfrage:	Interesse an Kauf-/Mietvertrag
			-> Andere: 				Spezielle Anfrage, die nicht in eine der vordefinierten Kategorien passt
	- Empfänger	(Unique NickName, Email)
	- Anhänge	(Anlagen werden hochgeladen, Speicherort-String in DB abgelegt, Zugriff via Speicherort-String aus DB im FS)
	Intern:
	- MSGId				(Id)
	- Kontakt 			(Id)		-> wird angelegt falls nicht vorhanden
	- Absender			(Id)
	- Empfänger			(Id)
	- Kategorie 		(string)
	- Datum				(date)
	- Nachricht			(string)

	Anteile:
	100% by Andreas Dietze
*/
router.post('/messaging/send', function(req, res){
	console.log("messaging/send entered!");

	// Body-Parameter
	var senderID		= req.body.SenderID;
	var senderNick		= req.body.SenderNick;
	var receiverNick	= req.body.ReceiverNick;
	var subjectType		= req.body.Subject;
	var topic			= req.body.Topic;
	var message			= req.body.Message;
	// Date and Time not needed -> done by server
	var msgHasFiles 	= req.body.HasFiles;
	var isLocal			= req.body.IsLocal;
	var attachments		= req.body.Attachments;
	var fileStrings		= [];

	console.log(senderID);
	console.log(receiverNick);
	console.log(subjectType);
	console.log(topic);
	console.log(message);
	//console.log(attachments);
	console.log(msgHasFiles);

	var actualPath 	= '';
	var finalPath	= '';

	if(isLocal)
	{
		// Get current path of server.js
		actualPath = __dirname;
		console.log("RootDir: " + actualPath);
		finalPath = actualPath + "\\DL\\" + senderID + "\\";
		console.log("FinPathDL: " + finalPath);
	}
	else
	{
		// Get current path of server.js
		actualPath = __dirname;
		console.log("RootDir: " + actualPath);
		finalPath = actualPath + "/DL/" + senderID + "/";
		console.log("FinPathDL: " + finalPath);
	}

	if(isLocal)
	{
		// Create DL directory if it does not exist
		if(!fs.existsSync(actualPath + "\\DL\\"))
			fs.mkdirSync(actualPath + "\\DL\\");
	}
	else
	{
		// Create DL directory if it does not exist
		if(!fs.existsSync(actualPath + "/DL/"))
			fs.mkdirSync(actualPath + "/DL/");
	}

	// Create ID directory if it does not exist
	if(!fs.existsSync(finalPath))
		fs.mkdirSync(finalPath);

	//console.log(attachments.length);

	// Write files if the message contains files
	if(msgHasFiles)
	{
		if(fs.existsSync(finalPath))
		{
			// Write each file
			for(var i = 0; i < attachments.length; i++)
			{
				var filename = attachments[i].name;
				var postfix = attachments[i].name.split(".");
				var base64 = '';

				// Image-File (jpg, jpeg, png)
				if (postfix[postfix.length - 1] == "jpg"	||
					postfix[postfix.length - 1] == "jpeg"	||
					postfix[postfix.length - 1] == "png")
				{
					base64 = attachments[i].fileData.replace(/^data:image\/\w+;base64,/, '');
				}

				// PDF-File
				if(postfix[postfix.length - 1] == "pdf")
				{
					base64 = attachments[i].fileData.replace(/^data:application\/\w+;base64,/, '');
				}

				// TXT-File
				if(postfix[postfix.length - 1] == "txt")
				{
					base64 = attachments[i].fileData.replace(/^data:text\/\w+;base64,/, '');
				}

				// Write file
				fs.writeFile(finalPath + filename, base64, {encoding: 'base64'}, function(err){
					if(err) {
						console.log(err);
					}
					else {
						//Finished
						console.log('File ' + filename + ' has been saved!');
					}
				});
			}
		}
	}

	// Intern - Date
	var d = new Date();
	var month = d.getMonth();
	month++;

	var formattedDate = d.getFullYear() + "-" + month			+ "-" + d.getDate();
	var formattedTime = d.getHours()	+ ":" + d.getMinutes()	+ ":" + d.getSeconds();
	console.log(formattedDate + " " + formattedTime);
	var formattedDateTime = formattedDate + " " + formattedTime;
	var string = finalPath + filename;
	var attachString = '';

	if(msgHasFiles)
	{
		for(var i = 0; i < attachments.length; i++){
			if(i < attachments.length - 1)
				attachString += attachments[i].name + ",";
			else
				attachString += attachments[i].name;
		}
		console.log(attachString);
	}


	console.log("-------------------------------------------");
	// 1: Frage UserID anhand der Email an
	var getReceiverIDQuery = "SELECT id FROM user WHERE email = '" + receiverNick + "'";
	con.query(getReceiverIDQuery, function (err, result) {
		if (err) {
			console.log(err);
			res.json({send:"false"});
		} else {
			// 2: Überprüfe, ob bereits eine KontaktID zwischen beiden UserIds existiert
			//console.log(result);
			if(result.length === 0) {
				console.log("No user with this id");
				res.json({send:"false"});
			}
			else {
				var receiverID = result[0].id;
				var checkContactExistsQuery = "SELECT id FROM kontakt WHERE local_id = '" + senderID + "' AND remote_id = '" + receiverID + "'";
					con.query(checkContactExistsQuery, function (err, result) {
					if (err) {
						console.log(err);
						res.json({send:"false"});
					} else {
						// 3 - 4: Lege neuen Kontakt an falls nicht vorhanden und handle messaging
						console.log(result);
						if(result.length === 0){
							console.log("No kontakt with this id, creating new one!");
							// 3: Kontakt anlegen
							var createContactQuery = "INSERT INTO kontakt (beschreibung, date, kontakt_status_id, local_id, remote_id)"
							+ " VALUES ('Auto_Created_Message', '" + formattedDateTime + "', 1, " + senderID + ", " + receiverID + ")";

							con.query(createContactQuery, function (err, result) {
								if (err) {
									console.log(err);
									res.json({send:"false"});
								} else {
									console.log("Kontakt angelegt");
									// 4: Hanlde messaging
									console.log("Handle messaging");
									var createMessageQuery = "INSERT INTO nachricht (absender_id, empfanger_id, absender_email, empfanger_email, date, nachricht, nachricht_status_id, kontakt_id, nachricht_beschreibung, attachfile, Titel)"
									+ " VALUES (" + senderID + ", " + receiverID + ", '" + senderNick + "', '" + receiverNick + "', '" + formattedDateTime + "', '" + message + "', 1, 1, '" + subjectType + "', '" + attachString + "', '" + topic + "')";

									con.query(createMessageQuery, function (err, result) {
										if (err) {
											console.log(err);
											res.json({send:"false"});
										} else {
											res.json({send:"true"});
										}
									});
								}
							});
						}
						else {
							// 4: Handle messaging
							console.log("Handle messaging");
							var createMessageQuery = "INSERT INTO nachricht (absender_id, empfanger_id, absender_email, empfanger_email, date, nachricht, nachricht_status_id, kontakt_id, nachricht_beschreibung, attachfile, Titel)"
							+ " VALUES (" + senderID + ", " + receiverID + ", '" + senderNick + "', '" + receiverNick + "', '" + formattedDateTime + "', '" + message + "', 1, 1, '" + subjectType + "', '" + attachString + "', '" + topic + "')";

							con.query(createMessageQuery, function (err, result) {
								if (err) {
									console.log(err);
									res.json({send:"false"});
								} else {
									res.json({send:"true"});
								}
							});
						}
					}
				});
			}
			//res.send("Successfully");
		}
	});
});

/*
    Liefert alle Nachrichten FÜR einem User und VON einem User zurück.
	Filtert (nach Datum, Titel, Empfaenger) und sortiert (aufsteigend, absteigend) zudem Nachrichten .
	Ebenfalls können Nachrichten nach einem speziellem Suchbegriff (im Titel der Nachricht) durchsucht
	werden, oder es können alle Nachrichten von nur einem Empfänger angezeigt werden.

	Anteile:
	100% by Andreas Dietze
*/
router.post('/messaging/render', function(req, res){
	console.log("Entered /messaging/render!");

	// Body-Parameter
	console.log(req.body);
	var userId = req.body.UserId;
	var filterType = req.body.FilterType;
	var singleFilter = req.body.SingleFilter;
	var filterDate = req.body.FilterDate;
	console.log(userId);
	console.log(filterType);
	console.log(singleFilter);
	console.log(filterDate);

	// Intern
	var msgForUser	= [];	// Nachrichten FUER User
	var msgFromUser	= [];	// Nachrichten VON User

	// Alle Nachrichten FUER diese UserId aus Datenbank auslesen - filtern nach Datum
	if(filterType === 'date') {
		if(singleFilter !== '') {
			var tmpDate = singleFilter.split('/').join('-');
			//console.log(tmpDate);

			tmpDate = tmpDate.split('-');

			// Format year, day, month (for db)
			var tmpDateFinal = tmpDate[2] + '-' + tmpDate[0] + '-' + tmpDate[1];
			//console.log(tmpDateFinal);

			// z.B: %or% - Finde alle Zeichenketten, die "or" an irgend einer Stelle enthalten
			var filter = "'%" + tmpDateFinal + "%'";

			// Query mit spezifiziertem Datum
			var getMessagesFORQueryFilterDate = "SELECT * FROM nachricht WHERE empfanger_id = '" + userId + "' AND date LIKE " + filter;

			con.query(getMessagesFORQueryFilterDate, function (err, result) {
				if (err) {
					console.log(err);
					res.send("Error: " + err);
				} else {
					console.log("Nachrichten FUER User: " + userId);
					console.log("Anzahl der Nachrichten: " + result.length);
					msgForUser = result;
					//console.log(msgForUser);
					console.log("--------------------------");

					// Alle Nachrichten VON dieser UserId aus der Datenbank auslsen - filtern nach speziellem Datum
					var getMessagesFROMQueryFilterDate = "SELECT * FROM nachricht WHERE absender_id = '" + userId + "' AND date LIKE " + filter;

					con.query(getMessagesFROMQueryFilterDate, function (err, result) {
						if (err) {
							console.log(err);
							res.send("Error: " + err);
						} else {
							console.log("Nachrichten VON User: " + userId);
							console.log("Anzahl der Nachrichten: " + result.length);
							msgFromUser = result;
							//console.log(msgFromUser);

							// Alles in JSON verpacken und senden
							var data = {
								"FORUser"	: msgForUser,
								"FROMUser"	: msgFromUser
							};

							// Send data
							res.setHeader('Content-Type', 'application/json');
							res.send(data);
						}
					});
				}
			});
		}
		else {
			if(filterDate === 'ASC')
				var getMessagesFORQuery = "SELECT * FROM nachricht WHERE empfanger_id = '" + userId + "' ORDER BY date ASC";
			else
				var getMessagesFORQuery = "SELECT * FROM nachricht WHERE empfanger_id = '" + userId + "' ORDER BY date DESC";

			con.query(getMessagesFORQuery, function (err, result) {
				if (err) {
					console.log(err);
					res.send("Error: " + err);
				} else {
					console.log("Nachrichten FUER User: " + userId);
					console.log("Anzahl der Nachrichten: " + result.length);
					msgForUser = result;
					//console.log(msgForUser);
					console.log("--------------------------");
					// Alle Nachrichten VON dieser UserId aus der Datenbank auslsen - filtern nach Datum
					if(filterDate === 'ASC')
						var getMessagesFROMQuery = "SELECT * FROM nachricht WHERE absender_id = '" + userId + "' ORDER BY date ASC";
					else
						var getMessagesFROMQuery = "SELECT * FROM nachricht WHERE absender_id = '" + userId + "' ORDER BY date DESC";

					con.query(getMessagesFROMQuery, function (err, result) {
						if (err) {
							console.log(err);
							res.send("Error: " + err);
						} else {
							console.log("Nachrichten VON User: " + userId);
							console.log("Anzahl der Nachrichten: " + result.length);
							msgFromUser = result;
							//console.log(msgFromUser);

							// Alles in JSON verpacken und senden
							var data = {
								"FORUser"	: msgForUser,
								"FROMUser"	: msgFromUser
							};

							// Send data
							res.setHeader('Content-Type', 'application/json');
							res.send(data);
						}
					});
				}
			});
		}
	}

	// Alle Nachrichten FUER diese UserId aus Datenbank auslesen - filtern nach Titel
	if(filterType === 'title') {
		if(singleFilter !== '') {
			var filter = "'%" + singleFilter + "%'";
			var getMessagesFORQueryFilterTitel = "SELECT * FROM nachricht WHERE empfanger_id = '" + userId + "' AND Titel LIKE " + filter;
			con.query(getMessagesFORQueryFilterTitel, function (err, result) {
				if (err) {
					console.log(err);
					res.send("Error: " + err);
				} else {
					console.log("Nachrichten FUER User: " + userId);
					console.log("Anzahl der Nachrichten: " + result.length);
					msgForUser = result;
					//console.log(msgForUser);
					console.log("--------------------------");
					// Alle Nachrichten VON dieser UserId aus der Datenbank auslsen - filtern nach Titel
					var getMessagesFROMQueryFilterTitel = "SELECT * FROM nachricht WHERE absender_id = '" + userId + "' AND Titel LIKE " + filter;
					con.query(getMessagesFROMQueryFilterTitel, function (err, result) {
						if (err) {
							console.log(err);
							res.send("Error: " + err);
						} else {
							console.log("Nachrichten VON User: " + userId);
							console.log("Anzahl der Nachrichten: " + result.length);
							msgFromUser = result;
							//console.log(msgFromUser);

							// Alles in JSON verpacken und senden
							var data = {
								"FORUser"	: msgForUser,
								"FROMUser"	: msgFromUser
							};

							// Send data
							res.setHeader('Content-Type', 'application/json');
							res.send(data);
						}
					});
				}
			});
		}
		else {
			if(filterDate === 'ASC')
				var getMessagesFORQuery = "SELECT * FROM nachricht WHERE empfanger_id = '" + userId + "' ORDER BY Titel ASC";
			else
				var getMessagesFORQuery = "SELECT * FROM nachricht WHERE empfanger_id = '" + userId + "' ORDER BY Titel DESC";
			con.query(getMessagesFORQuery, function (err, result) {
				if (err) {
					console.log(err);
					res.send("Error: " + err);
				} else {
					console.log("Nachrichten FUER User: " + userId);
					msgForUser = result;
					console.log(msgForUser);
					console.log("Anzahl der Nachrichten: " + result.length);
					console.log("--------------------------");
					// Alle Nachrichten VON dieser UserId aus der Datenbank auslsen - filtern nach Titel
					if(filterDate === 'ASC')
						var getMessagesFROMQuery = "SELECT * FROM nachricht WHERE absender_id = '" + userId + "' ORDER BY Titel ASC";
					else
						var getMessagesFROMQuery = "SELECT * FROM nachricht WHERE absender_id = '" + userId + "' ORDER BY Titel DESC";
					con.query(getMessagesFROMQuery, function (err, result) {
						if (err) {
							console.log(err);
							res.send("Error: " + err);
						} else {
							console.log("Nachrichten VON User: " + userId);
							console.log("Anzahl der Nachrichten: " + result.length);
							msgFromUser = result;
							//console.log(msgFromUser);

							// Alles in JSON verpacken und senden
							var data = {
								"FORUser"	: msgForUser,
								"FROMUser"	: msgFromUser
							};

							// Send data
							res.setHeader('Content-Type', 'application/json');
							res.send(data);
						}
					});
				}
			});
		}
	}

	// Alle Nachrichten FUER diese UserId aus Datenbank auslesen - filtern nach Absender
	if(filterType === 'receiver') {
		if(singleFilter !== '') {
			var filter = "'%" + singleFilter + "%'";
			var getMessagesFORQueryFilterReceiver = "SELECT * FROM nachricht WHERE empfanger_id = '" + userId + "' AND absender_email LIKE " + filter;
			con.query(getMessagesFORQueryFilterReceiver, function (err, result) {
				if (err) {
					console.log(err);
					res.send("Error: " + err);
				} else {
					console.log("Nachrichten FUER User: " + userId);
					console.log("Anzahl der Nachrichten: " + result.length);
					msgForUser = result;
					//console.log(msgForUser);
					console.log("--------------------------");
					// Alle Nachrichten VON dieser UserId aus der Datenbank auslsen - filtern nach Titel
					var getMessagesFROMQueryFilterReceiver = "SELECT * FROM nachricht WHERE absender_id = '" + userId + "' AND empfanger_email LIKE " + filter;
					con.query(getMessagesFROMQueryFilterReceiver, function (err, result) {
						if (err) {
							console.log(err);
							res.send("Error: " + err);
						} else {
							console.log("Nachrichten VON User: " + userId);
							console.log("Anzahl der Nachrichten: " + result.length);
							msgFromUser = result;
							//console.log(msgFromUser);

							// Alles in JSON verpacken und senden
							var data = {
								"FORUser"	: msgForUser,
								"FROMUser"	: msgFromUser
							};

							// Send data
							res.setHeader('Content-Type', 'application/json');
							res.send(data);
						}
					});
				}
			});
		}
		else {
			if(filterDate === 'ASC')
				var getMessagesFORQuery = "SELECT * FROM nachricht WHERE empfanger_id = '" + userId + "' ORDER BY absender_email ASC";
			else
				var getMessagesFORQuery = "SELECT * FROM nachricht WHERE empfanger_id = '" + userId + "' ORDER BY absender_email DESC";
			con.query(getMessagesFORQuery, function (err, result) {
				if (err) {
					console.log(err);
					res.send("Error: " + err);
				} else {
					console.log("Nachrichten FUER User: " + userId);
					console.log("Anzahl der Nachrichten: " + result.length);
					msgForUser = result;
					//console.log(msgForUser);
					console.log("--------------------------");
					// Alle Nachrichten VON dieser UserId aus der Datenbank auslsen - filtern nach Empfaenger
					if(filterDate === 'ASC')
						var getMessagesFROMQuery = "SELECT * FROM nachricht WHERE absender_id = '" + userId + "' ORDER BY empfanger_email DESC";
					else
						var getMessagesFROMQuery = "SELECT * FROM nachricht WHERE absender_id = '" + userId + "' ORDER BY empfanger_email DESC";
					con.query(getMessagesFROMQuery, function (err, result) {
						if (err) {
							console.log(err);
							res.send("Error: " + err);
						} else {
							console.log("Nachrichten VON User: " + userId);
							console.log("Anzahl der Nachrichten: " + result.length);
							msgFromUser = result;
							//console.log(msgFromUser);

							// Alles in JSON verpacken und senden
							var data = {
								"FORUser"	: msgForUser,
								"FROMUser"	: msgFromUser
							};

							// Send data
							res.setHeader('Content-Type', 'application/json');
							res.send(data);
						}
					});
				}
			});
		}
	}
});

/*
	Loescht eine bestimmte Nachricht zwischen zwei Nutzern aus der Datenbank anhand ihrer ID.

	Anteile:
	100% by Andreas Dietze
*/
router.post('/messaging/delete', function(req, res){
	console.log("Entered messaging/delete!");

	// Body-Parameter
	console.log(req.body);
	var msgId 			= req.body.MSGId;
	var senderNick		= "";
	var receiverNick	= "";

	//console.log(msgId);
	//console.log(senderNick);
	//console.log(receiverNick);

	var deleteMessageQuery = "DELETE FROM nachricht WHERE id = '" + msgId + "'";
	con.query(deleteMessageQuery, function (err, result) {
		if (err) {
			console.log(err);
			res.json({deleted:"false"});
		} else {
			console.log("Nachricht geloescht");
			res.json({deleted:"true"});
		}
	});
});

/********************************************
		API - Immobilienverwaltung
*********************************************/

/*
	Erstellt eine neue Immobilie. Diese kann sowohl durch einen normalen Nutzer
	als auch durch einen Makler angelegt werden. Bei Anlage durch einen normalen
	Nutzer muss ein Makler ausgewählt werden, welcher das Immobilienprofil auf
	der Webseite veröffentlichen soll. Legt ein Makler eine Webseite an, so kann
	diese sofort über die Suche gefunden werden.

	Anteile:
	50% by Andreas Dietze
	50% by David Karimi
*/
router.post('/estatehandling/create', function(req, res){
    // Erstellt ein neues Profil einer Immobilie
	var ownerID = req.body.ownerID;
	var agentID = req.body.agentID;
	//2 - Wenn User normaler Käufer ist und Anfrage stellt (active 0)
	//3 - Wenn User Makler ist und Immobilie einstellen will (active 1)
	var request = req.body.request;
	var title = req.body.title;
	var description = req.body.desc;
	var condition = req.body.condition;
	var estateType = req.body.estateType;
	var heatingType = req.body.heatingType;
	var baujahr = req.body.baujahr;
	//String Array
	var features = req.body.features;
	var address = req.body.address;
	var postalcode = req.body.postal;
	var city = req.body.city;
	var floors = req.body.floors;
	var rooms = req.body.rooms;
	//Quadratmeter
	var size = req.body.size;
	var offerType = req.body.offerType;
	var offerPurpose = req.body.offerPurpose;
	var price = req.body.price;
	//Kaution
	var bail = req.body.bail;
	var provision = req.body.provision;
	//Nebenkosten
	var utilities = req.body.utilities;
	var startdate = req.body.startdate;
	var enddate = req.body.enddate;
	//Dateien
	var hasFiles 		= req.body.HasFiles;
	var isLocal			= req.body.IsLocal;
	var attachments		= req.body.Attachments;
	var fileStrings		= [];

	// Dateihandhabung
	var actualPath 	= '';
	var finalPath	= '';

	if(isLocal)
	{
		actualPath = __dirname;
		console.log("RootDir: " + actualPath);
		finalPath = actualPath + "\\DL\\Estates\\" + ownerID + "\\";
		console.log("FinPathDL: " + finalPath);
	}
	else
	{
		actualPath = __dirname;
		console.log("RootDir: " + actualPath);
		finalPath = actualPath + "/DL/Estates/" + ownerID + "/";
		console.log("FinPathDL: " + finalPath);
	}

	if(isLocal)
	{
		// Create DL directory if it does not exist
		if(!fs.existsSync(actualPath + "\\DL\\"))
			fs.mkdirSync(actualPath + "\\DL\\");
	}
	else
	{
		// Create DL directory if it does not exist
		if(!fs.existsSync(actualPath + "/DL/"))
			fs.mkdirSync(actualPath + "/DL/");
	}

	if(isLocal)
	{
		// Create DL/Estates directory if it does not exist
		if(!fs.existsSync(actualPath + "\\DL\\Estates\\"))
			fs.mkdirSync(actualPath + "\\DL\\Estates\\");
	}
	else
	{
		// Create DL/Estates directory if it does not exist
		if(!fs.existsSync(actualPath + "/DL/Estates/"))
			fs.mkdirSync(actualPath + "/DL/Estates/");
	}

	// Create ID directory if it does not exist
	if(!fs.existsSync(finalPath))
		fs.mkdirSync(finalPath);

	console.log(attachments.length);

	// Write files
	if(hasFiles)
	{
		if(fs.existsSync(finalPath))
		{
			for(var i = 0; i < attachments.length; i++)
			{
				var filename = attachments[i].name;
				var postfix = attachments[i].name.split(".");
				var base64 = '';

				// Image-File (jpg, jpeg, png)
				if (postfix[postfix.length - 1] == "jpg"	||
					postfix[postfix.length - 1] == "jpeg"	||
					postfix[postfix.length - 1] == "png")
				{
					base64 = attachments[i].fileData.replace(/^data:image\/\w+;base64,/, '');
				}

				// Write file - support only image files
				fs.writeFile(finalPath + filename, base64, {encoding: 'base64'}, function(err){
					if(err) {
						console.log(err);
					}
					else {
						//Finished
						console.log('File ' + filename + ' has been saved!');
					}
				});
			}
		}
	}

	// Intern - Date
	var d = new Date();
	var formattedDate = d.getFullYear() + "-" + d.getMonth()	+ "-" + d.getDate();
	var formattedTime = d.getHours()	+ ":" + d.getMinutes()	+ ":" + d.getSeconds();
	console.log(formattedDate + " " + formattedTime);
	var formattedDateTime = formattedDate + " " + formattedTime;
	var string = finalPath + filename;
	var attachString = '';

	if(hasFiles)
	{
		//attachString = string.replace(/\\/g, "\\\\"); //fileStrings[0]; //finalPath + filename;
		// console.log(attachString);

		for(var i = 0; i < attachments.length; i++){
			if(i < attachments.length - 1)
				attachString += attachments[i].name + ",";
			else
				attachString += attachments[i].name;
		}
		console.log(attachString);
	}

	//Prüfe zuallererst, ob der Ort (PLZ, ORT) bereits vorhanden ist
	var checkCityQuery = "Select id from ort where plz ='" + postalcode + "' and ortname='" + city + "'";
	var insertCityQuery = "INSERT INTO ort (ortname, beschreibung, plz) VALUES ('" + city + "','---','" + postalcode + "')";
	var cityID = -1;
	var insertID = -1;

	con.query(checkCityQuery, function(err, result) {
		if (err){
			console.log(err);
			res.json({created:"false", message:err});
		} else {
			if (result.length == 1){
				//Es existiert ein Eintrag
				cityID = result[0].id;
			} else {
				//Neuer Ort muss angelegt werden
				con.query(insertCityQuery, function(err, result2) {
					if (err){
						console.log(err);
						res.json({created:"false", message:err});
					} else {
						cityID = result2.insertId;
					}
				});
			}

			var active = 0;
			if(request == 3) {
				active = 1;
			} else {
				active = 0;
			}
			var insertImmoQuery = "insert into immobilien (immobilien_art, immobilien_adress, immobilien_ort, zimmeranzahl, qm, etage_anzahl, bauzustand, features, nutzungszweck, beschreibung, verkaufer_id, besitzer_id, active, heizungs_art, baujahr, media)"
														+ "values ('" + estateType + "','" + address + "', " + cityID + ", " + rooms + ", " + size + ", " + floors + ", '"
														+ condition + "', '" + features + "', '" + offerPurpose + "', '" + description + "', " + agentID + ", " + ownerID
														+ ", " + active + ", '" + heatingType + "', " + baujahr + ", '" + attachString + "')";
			if (cityID != -1){
				con.query(insertImmoQuery, function(err, result3) {
					if (err) {
						console.log(err);
						res.json({created:false, message:err});
					} else {
						//console.log(result3);
						insertID = result3.insertId;
						var insertOfferQuery = "insert into angebot (verkaufer_id, immobilien_id, angebots_art, kaution, nebenkosten, mietenpreis, kaufpreis, provision, startdate, enddate, angebot_titel) "
																		+ " values (" + agentID + ", " + insertID + ", '" + offerType + "', " + bail + ", " + utilities + ", " + price + ", " + price + ", " + provision + ", '" + startdate + "', '" + enddate + "', '" + title + "')";
						if (insertID != -1){
							con.query(insertOfferQuery, function(err, result4) {
								if (err) {
									console.log(err);
									res.json({created:"false", message:err});
								} else {
									//console.log(result4);
									res.json({created:"true"});
								}
							});
						}
					}
				});
			}
		}
	});
});

/*
	Updated Informationen zu einem Immobilienprofil

	Anteile:
	100% by David Karimi
*/
router.post('/estatehandling/update', function(req, res){
    // Aktualisiert ein Profil einer Immobilie
		// Erstellt ein neues Profil einer Immobilie
		var immoID = req.body.immoID;
		var title = req.body.title;
		var description = req.body.desc;
		var condition = req.body.condition;
		var estateType = req.body.estateType;
		var heatingType = req.body.heatingType;
		var baujahr = req.body.baujahr;
		//String Array
		var features = req.body.features;
		var address = req.body.address;
		var postalcode = req.body.postal;
		var city = req.body.city;
		var floors = req.body.floors;
		var rooms = req.body.rooms;
		//Quadratmeter
		var size = req.body.size;
		var offerType = req.body.offerType;
		var offerPurpose = req.body.offerPurpose;
		var valid = 1;
		var price = req.body.price;
		//Kaution
		var bail = req.body.bail;
		var provision = req.body.provision;
		//Nebenkosten
		var utilities = req.body.utilities;

		if(isNaN(price) || isNaN(bail) || isNaN(provision) || isNaN(utilities)){
			valid = 0;
		}

		var startdate = req.body.startdate;
		var enddate = req.body.enddate;

		var checkCityQuery = "Select id from ort where plz ='" + postalcode + "' and ortname='" + city + "'";
		var insertCityQuery = "INSERT INTO ort (ortname, beschreibung, plz) VALUES ('" + city + "','---','" + postalcode + "')";

		//Prüfe, ob Ort bereits existiert. Falls ja, tue nichts, da kein Update notwendig
		if(valid == 1) {
			con.query(checkCityQuery, function(err,result) {
				var cityID = -1;
				if (err){
					console.log("CheckCityQuery: " + err);
					res.json({updated:"false"});
				} else {
					if(result.length == 1){
						cityID = result[0].id;
					} else {
						con.query(insertCityQuery, function(err, result2) {
							if (err) {
								console.log("InsertCityQuery: " + err);
								res.json({updated:"false"});
							} else {
								cityID = result2.insertId;
							}
						});
					}

					var updateEstateQuery = "update immobilien set immobilien_art='" + estateType + "', immobilien_adress='" + address + "', immobilien_ort=" + cityID + ", zimmeranzahl=" + rooms + ", qm=" + size + ", etage_anzahl=" + floors + ", bauzustand='" + condition + "', features='" + features + "', nutzungszweck='" + offerPurpose + "', beschreibung='" + description + "', heizungs_art='" + heatingType + "', baujahr=" + baujahr + " where id=" + immoID;
					var updateOfferQuery = "update angebot set angebots_art='" + offerType + "', kaution=" + bail + ", nebenkosten=" + utilities + ", mietenpreis=" + price + ", kaufpreis=" + price + ", provision=" + provision + ", startdate='" + startdate + "', enddate='" + enddate + "' where immobilien_id=" + immoID;
					//Update Immobilie und anschließend Angebot zur Immobilie
					if (cityID != -1) {
						con.query(updateEstateQuery, function(err, result3) {
							if (err) {
								console.log(err);
								res.json({updated:"false"});
							} else {
								con.query(updateOfferQuery, function(err, result4) {
									if (err) {
										console.log(err);
										res.json({updated:"false"});
									} else {
										//Alle Daten erfolgreich geupdated!!!
										res.json({updated:"true"});
									}
								});
							}
						});
					} else {
						console.log("Cannot get cityID at EstateUpdate!!!");
						res.json({updated:"false"});
					}
				}
			});
		} else {
			res.json({updated:"false", message:"You have passed an incorrect value"});
		}
});

/*
	Löscht ein Immobilienprofil aus der Datenbank. Durch das Löschen einer Immobilie
	wird auch automatisch das dazugehörige Angebot gelöscht, da hier ein Foreign Key
	Verweis existiert mit der Eigenschaft: on delete cascade.

	Anteile:
	100% by David Karimi
*/
router.post('/estatehandling/delete', function(req, res){
    //Löscht eine Immobilie
		//Es dürfen nur solche Nutzer eine Immobilie löschen, die auch als Verkäufer eingetragen sind!!!
		var userID = req.body.user;
		var immoID = req.body.immoID;

		var immoSelectQuery = "select verkaufer_id from immobilien where id=" + immoID;
		var deleteOfferQuery = "delete from angebot where immobilien_id=" + immoID;
		console.log(deleteOfferQuery);
		var deleteImmoQuery = "delete from immobilien where id=" + immoID;
		console.log(deleteImmoQuery);
		con.query(immoSelectQuery, function(err, result) {
			if (err) {
				console.log(err);
				res.json({deleted:"false"});
			} else {
				if (result.length == 1) {
					if (userID = result[0].verkaufer_id){
						con.query(deleteOfferQuery, function(err, result2) {
							if (err) {
								console.log(err);
								res.json({deleted:"false"});
							} else {
								con.query(deleteImmoQuery, function(err, result3) {
									if (err) {
										console.log(err);
										res.json({deleted:"false"});
									} else {
										res.json({deleted:"true"});
									}
								});
							}
						});
					} else {
						res.json({deleted:"false"});
					}
				} else {
					res.json({deleted:"false"});
				}
			}
		});
});

/*
	Anteile:
	100% by Andreas Dietze
*/
router.post('/estatehandling/render/offers', function (req, res) {
	// Gibt alle offers für eine id zurueck
	var userID = req.body.userID;
	// Intern
	var offers	= [];

	//var getOffersQuery = "SELECT * FROM angebot WHERE verkaufer_id = '" + userId + "'"; // ORDER BY date DESC";
	var getOffersQuery = "select a.angebot_titel, a.immobilien_id, a.kaufpreis, i.media, i.active, i.besitzer_id, i.verkaufer_id, i.qm, i.features, i.beschreibung, u.firstname, u.lastname, i.id, o.ortname, i.immobilien_adress, o.plz from immobilien i inner join angebot a on a.immobilien_id = i.id inner join ort o on i.immobilien_ort = o.id inner join user u on u.id = i.verkaufer_id where i.verkaufer_id=" + userID + " or i.besitzer_id=" + userID;
	con.query(getOffersQuery, function (err, result) {
		if (err) {
			console.log(err);
			res.json({selected:"false"});
		} else {
			offers = result;
			//console.log(offers);

			// Alles in JSON verpacken und senden
			var data = {
				"Offers"	: offers
			};

			// Send data
			res.setHeader('Content-Type', 'application/json');
			res.json({selected:"true", data});
		}
	});
});

/*
	Logik für Verwaltung von Agent Requests und deren Einbettung in das Immobilienverzeichnis

 	Anteile:
 	60% by David Karimi
 	40% by Max Finsterbusch
*/
router.post('/estatehandling/request/activate', function(req,res) {
	var immoID = req.body.immoID;
	var ownerID = req.body.ownerID;
	var agentID = req.body.agentID;

	var checkImmoOwnerQuery = "select id from immobilien where id=" + immoID + " and besitzer_id=" + ownerID + " and verkaufer_id=" + agentID;
	var updateImmoStateQuery = "update immobilien set active=" + 1 + " where id=" + immoID;
	con.query(checkImmoOwnerQuery, function(err, result) {
		if (err) {
			console.log(err);
			res.json({updated:"false", message:err});
		} else {
			if(result.length == 1) {
				con.query(updateImmoStateQuery, function(err, result2) {
					if (err) {
						console.log(err);
						res.json({updated:"false", message:err});
					} else {
						res.json({updated:"true"});
					}
				});
			} else {
				res.json({updated:"false", message:result.length});
			}
		}
	})
});
/********************************************
		API - Bewertung
*********************************************/

/*
	Anzeigen die Bewertung und die Komentar des Maklers auf die Maklerprofil-seite
	Prüfen, ob Role des UserIDs ein Makler ist
	wenn True, dann abrufen die Komentardaten und die Bewertungdaten des Maklers in Datenbank

	Anteile:
	100% by Tuan Anh Phan
*/
router.post('/showrating/agent', function(req, res){

	var sql = "select role from fa17g17.user where id = '" + req.body.id + "';";
	var data = {
			"agent" : "true",
			"comment" : null,
			"rating" : null
		}

	// Check Role of Agent (must 3 as Agent)
	con.query(sql, function (err, result) {
		if (err) throw err;
		if (result[0].role != 3) // if user is not a agent
			{
				data.agent = "false";
				data.comment = "No Rating";
				data.rating = "Not an Agent";
				res.send(JSON.stringify(data));
			}
			else // user is a agent
			{
				sql = "select b.beschreibung, b.date, w.wert from fa17g17.bewertung b inner join fa17g17.wertung w on b.wertung_id = w.id"
				+ " where b.user_id = '" + req.body.id + "';";
				// Get data comment for agent
				con.query(sql, function (err, result) {
					if (err) throw err;
					data.agent = "true";
					data.comment = result;

					sql = "SELECT user_id, count(id) as numberofcomment, sum(wertung_id) as rating FROM fa17g17.bewertung"
					+ " group by user_id having user_id = '" + req.body.id + "';";

					// Get rating for agent
					con.query(sql, function (err, result) {
						if (err) throw err;
						data.rating = result;
						res.send(JSON.stringify(data));
					});
				});
			}
		});
});

/*
	Daten sind eine Rating-Stufe (1 - 5) sowie ein Kommentar in Datenbank speichern

	Anteile:
	100% by Tuan Anh Phan
*/
router.post('/rating/agent', function(req, res){

	var sql = "INSERT INTO fa17g17.bewertung (user_id, wertung_id, date, beschreibung)"
		+ " VALUES ('" + req.body.userID + "', '" + req.body.wertung_id + "', '" + req.body.date + "', '" + req.body.beschreibung + "');";
	// add new Rating estate agents

	con.query(sql, function (err, result) {
		if (err) throw err;
		res.send("Thank you for your Rating!");
	});
});

/*
	Anzeigen die Bewertung und die Komentar des Immobilien auf die Immobilienprofil-seite

	Anteile:
	100% by Tuan Anh Phan
*/
router.post('/rating/estate', function(req, res){

	var immoID = parseInt(req.body.immoID);
	var data = {
		"comment" : null,
		"rating" : null,
	};
	var sql = "SELECT k.*, u.nickname"
			+ " FROM fa17g17.kommentar k inner join fa17g17.user u on k.user_id = u.id right join fa17g17.angebot a on k.angebot_id = a.id"
			+ " where a.immobilien_id = '" + immoID +"';";
	// Get comment Information
	con.query(sql, function (err, result) {
		if (err) throw err;
		data.comment=result;
		sql = "SELECT a.immobilien_id, count(k.id) as numberofcomment, sum(wert_id) as rating"
			+ " FROM fa17g17.kommentar k inner join fa17g17.user u on k.user_id = u.id right join fa17g17.angebot a on k.angebot_id = a.id"
			+ " group by a.immobilien_id"
			+ " having a.immobilien_id = '" + immoID + "';";
		// Get Number of Comment and Rating
		con.query(sql, function (err, result) {
		  if (err) throw err;
		  data.rating=result;
		  res.send(JSON.stringify(data));
		  });
	  });
});

/*
	Erstellt ein neues Kommentar
	Legt ein Kommentar für eine Immobilie als Bewertung an
	Als Daten werden ausschließlich Kommentare angegeben

	abruft die angebot_id und verkaufer_id in die Tabelle angebot
	verglicht die verkaufer_id mit UserID, der den Kommentar gegeben hat
	wenn nicht gleich ist, dann speichert in die Datenbank

	Anteile:
	100% by Tuan Anh Phan
*/
router.post('/rating/addComment', function(req, res){

	var sql = "SELECT a.id, a.verkaufer_id FROM fa17g17.immobilien i inner join fa17g17.angebot a on i.id = a.immobilien_id"
			+ " where i.id='"+ req.body.immoID +"';";
	// Get Offerid and sellerid from EstateID
	con.query(sql, function (err, result) {
		if (err) throw err;
		var offerID = parseInt(result[0].id); // get offerID
		var sellerID = parseInt(result[0].verkaufer_id); // get sellerID
		if (sellerID != req.body.UserID) // if the seller doesn't comment on his own estate
		{
			var sql = "INSERT INTO fa17g17.kommentar (angebot_id, user_id, kommentar, date, wert_id)"
					+ " VALUES ('" + offerID + "', '" + req.body.UserID + "', '" + req.body.kommentar + "', '"
					+ req.body.date + "', '" + req.body.wert_id + "');";
			// add new Comment
			con.query(sql, function (err, result) {
				if (err) throw err;
				res.send("Thank you for your comment !");
			});
		}
		else // if the seller comment on his own estate
		{
			res.send("You can't comment on your own estate!");
		}
	});
});

//Zuweisung von Routen zur Anwendung
app.use("/fa17g17",router);

/********************************************
		API - Kontaktverwaltung
*********************************************/

/*
	Anzeigen die Kontakt auf die Kontaktseite
	Abruf die Datenbenutzer auf die Datenbank für die Contacter-Combobox
	Abruf die Contacter-Status auf die Datenbank für die Status-Combobox

	Anteile:
	100% by Tuan Anh Phan
*/
router.post('/contact/render', function(req, res){


	var UserID = parseInt(req.body.userID);
	var data = {
		"username" : null,
		"status" : null,
		"kontakt" : null
	};

	var sql = "SELECT id, nickname FROM fa17g17.user where id !='" + UserID + "';";
	//Get data user for Contacter-Combobox, when these ContacterID is not the UserID
	con.query(sql, function (err, result) {
	  if (err) throw err;

	  data.username=result;

	  sql = "SELECT id, beschreibung FROM fa17g17.kontakt_status;";
		//Get data status for Status-Combobox
	  con.query(sql, function (err, result) {
		if (err) throw err;

		data.status=result;

		sql = "SELECT k.id, k.beschreibung, k.date, k.kontakt_status_id, ks.beschreibung as kontaktstatus, k.local_id, k.remote_id, u.nickname, count(n.id) as M_anzahl"
		+ " FROM fa17g17.kontakt k left join fa17g17.nachricht n on k.id = n.kontakt_id inner join fa17g17.kontakt_status ks on k.kontakt_status_id = ks.id"
		+ " inner join fa17g17.user u on k.remote_id = u.id where k.local_id='"+ UserID +"' group by k.id;";

		// Get data contact to show on Website for this userID
		con.query(sql, function (err, result) {
		  if (err) throw err;
		  data.kontakt=result;
		  res.send(JSON.stringify(data));
		  });
		});
	});
});

/*
	Erstellt ein neues Kontakt

	Anteile:
	100% by Tuan Anh Phan
*/
router.post('/contact/create', function(req, res){
	var sql = "INSERT INTO fa17g17.kontakt (beschreibung, date, kontakt_status_id, local_id, remote_id)"
	+ "VALUES ('" + req.body.beschreibung + "', '" + req.body.date + "', '" + req.body.status + "', '"
	+ req.body.local_id + "', '" + req.body.remote_id + "');";

	con.query(sql, function (err, result) {
		if (err) {
			res.send("Error: " + err);
		} else {
			res.send("Create Successfully");
		}
	});
});

/*
	Bearbeiten ein Kontakt

	Anteile:
	100% by Tuan Anh Phan
*/
router.post('/contact/edit', function(req, res){

	 var sql = "UPDATE fa17g17.kontakt SET beschreibung='" + req.body.beschreibung + "', kontakt_status_id='" + req.body.status + "', remote_id='"
		 + req.body.remote_id + "' WHERE id='" + req.body.kontact_id + "';";


	 con.query(sql, function (err, result) {
		 if (err) {
			 console.log(err);
			 res.send("This Contact can't not update!");
		 } else {
			 res.send("Update successfully the contact!");
		 }
	 });
 });

/*
	Löschen ein Kontakt

	Anteile:
	100% by Tuan Anh Phan
*/
 router.post('/contact/delete', function(req, res){

	 var sql = "DELETE FROM fa17g17.kontakt WHERE id='"+ req.body.kontaktID +"'";

	 con.query(sql, function (err, result) {
		 if (err) {
			 console.log(err);
			 res.send("This Contact hat some Messages, Can't not delete!");
		 } else {
			 res.send("Delete successfully the contact!");
		 }
	 });
 });

 /********************************************
 			Zugriffssicherung für Requests
 *********************************************/

 //Routine zum Check, ob Nutzer bereits authentifiziert ist (REST).
 /*
	Anteile:
	100% by David Karimi
 */
 function ensureAuthenticatedREST(req, res, next) {

   if (req.isAuthenticated()) {
 		return next();
 	} else {
 	  res.json({accessed:"false", message:"You cannot access the REST call without authentication!!!"});
 	}
 }

 //Routine zum Check, ob Nutzer bereits authentifiziert ist (Sites).
 /*
	Anteile:
	100% by David Karimi
 */
 function ensureAuthenticatedSITE(req, res, next) {

   if (req.isAuthenticated()) {
 		return next();
 	} else {
		req.session.lastURL = req.url;
 	  res.redirect('/fa17g17/Login');
 	}
 }

/********************************************
		Zugriff auf statische Dateien
*********************************************/


//Zugriff auf Bild-Dateien
app.use('/fa17g17/img', express.static(path + '/img'));

//Zugriff auf CSS-Dateien
app.use('/fa17g17/css', express.static(path + '/css'));

//Zugriff auf Script-Dateien
app.use('/fa17g17/js', express.static(path + '/js'));

//Zugriff Revealjs-Dependencies
app.use('/fa17g17/lib', express.static(path + '/lib'));
app.use('/fa17g17/plugin', express.static(path + '/plugin'));

//Zugriff auf Dateiuploads
app.use('/fa17g17/DL', express.static(dlPath));

app.use("*",function(req,res){
  res.sendFile(path + "/404.html");
});

/********************************************
			Server Konfiguration
			Autor: Max Finsterbusch 100%
*********************************************/

var server = app.listen(17017, '127.0.0.1', function(){
	var host = server.address().address
	var port = server.address().port

	console.log("Server is listening at http://%s:%s", host, port)
});
