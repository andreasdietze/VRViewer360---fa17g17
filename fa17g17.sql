-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: fa17g17
-- ------------------------------------------------------
-- Server version	5.7.20-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `angebot`
--

DROP TABLE IF EXISTS `angebot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `angebot` (
  `id` smallint(16) NOT NULL AUTO_INCREMENT,
  `verkaufer_id` smallint(16) NOT NULL,
  `immobilien_id` smallint(16) NOT NULL,
  `angebots_art` varchar(100) NOT NULL,
  `kaution` float NOT NULL DEFAULT '0',
  `nebenkosten` float(10) NOT NULL DEFAULT '0',
  `mietenpreis` float(10) NOT NULL DEFAULT '0',
  `kaufpreis` float(10) NOT NULL DEFAULT '0',
  `provision` float NOT NULL DEFAULT '0',
  `beschreibung` varchar(600) DEFAULT NULL,
  `angebot_wert` float DEFAULT '0',
  `startdate` date DEFAULT NULL,
  `enddate` date DEFAULT NULL,
  `kontakt_info` varchar(120) DEFAULT NULL,
  `active` tinyint(4) DEFAULT NULL,
  `sonstiges` varchar(300) DEFAULT NULL,
  `angebot_titel` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `angebot_user_fk_idx` (`verkaufer_id`),
  KEY `angebot_immobilien_fk_idx` (`immobilien_id`),
  CONSTRAINT `angebot_immobilien_fk` FOREIGN KEY (`immobilien_id`) REFERENCES `immobilien` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `angebot_user_fk` FOREIGN KEY (`verkaufer_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `angebot`
--

LOCK TABLES `angebot` WRITE;
/*!40000 ALTER TABLE `angebot` DISABLE KEYS */;
INSERT INTO `angebot` VALUES 
(1	,1	,1	,'Buy'	,0	,0	,32000		,32000	,5.95	,'---'	,0	,'2017-12-05 00:00:00'		,'2019-12-31 00:00:00'	,NULL	,1	,NULL	,'Building site with panoramic views in a beautiful location'),
(2	,2	,2	,'Buy'	,0	,0	,69000		,69000	,2.31	,'---'	,0	,'2017-12-05 00:00:00'		,'2019-12-31 00:00:00'	,NULL	,1	,NULL	,'Fully developed building site!'),
(3	,3	,3	,'Buy'	,0	,0	,59640		,59640	,3.34	,'---'	,0	,'2017-12-05 00:00:00'		,'2019-12-31 00:00:00'	,NULL	,1	,NULL	,'Ground floor building land in the city centre'),
(4	,1	,4	,'Buy'	,0	,0	,49900		,49900	,5.95	,'---'	,0	,'2017-12-05 00:00:00'		,'2019-12-31 00:00:00'	,NULL	,1	,NULL	,'Fully developed, quiet and sunny building site with brilliant views from afar'),
(5	,1	,5	,'Buy'	,0	,0	,25311		,25311	,3.34	,'---'	,0	,'2017-12-05 00:00:00'		,'2019-12-31 00:00:00'	,NULL	,1	,NULL	,'Fully developed, quiet and sunny building site with brilliant views from afar'),
(6	,2	,6	,'Rent'	,1200	,250	,650	,650		,0		,'---'	,0	,'2017-12-05 00:00:00'	,'2018-11-23 00:00:00'	,NULL	,1	,NULL	,'Viewpoint. 2-3 residential units - level plot - good infrastructure'),
(7	,3	,7	,'Rent'	,2000	,500	,900	,900		,0		,'---'	,0	,'2017-12-05 00:00:00'	,'2018-11-23 00:00:00'	,NULL	,1	,NULL	,'Living in a beautiful peripheral location'),
(8	,1	,8	,'Buy'	,0		,760	,340000	,340000		,2.78	,'---'	,0	,'2017-12-05 00:00:00'	,'2018-11-23 00:00:00'	,NULL	,1	,NULL	,'Art Nouveau villa with large living and property area'),
(9	,2	,9	,'Rent'	,1300	,900	,1200	,1200		,0		,'---'	,0	,'2017-12-05 00:00:00'	,'2018-11-23 00:00:00'	,NULL	,1	,NULL	,'Renovation property in desirable location'),
(10	,3	,10	,'Buy'	,0		,830	,560000	,560000		,3.34	,'---'	,0	,'2017-12-05 00:00:00'	,'2018-11-23 00:00:00'	,NULL	,1	,NULL	,'Your own house in the district of Fulda'),
(11	,2	,11	,'Rent'	,1000	,250	,397	,397	,0	,'---'	,0	,'2017-12-05 00:00:00'	,'2018-05-05 00:00:00'	,NULL	,1	,NULL	,'Beautiful apartment with terrace. FOR STUDENTS!!!'),
(12	,3	,12	,'Rent'	,2000	,500	,397	,397	,0	,'---'	,0	,'2017-12-05 00:00:00'	,'2018-05-05 00:00:00'	,NULL	,1	,NULL	,'Stylish apartment directly in the city centre. FOR STUDENTS!!!'),
(13	,1	,13	,'Rent'	,2300	,760	,809	,809	,0	,'---'	,0	,'2017-12-05 00:00:00'	,'2018-05-05 00:00:00'	,NULL	,1	,NULL	,'Elegant and spacious apartment'),
(14	,1	,14	,'Rent'	,1600	,900	,990	,990	,0	,'---'	,0	,'2017-12-05 00:00:00'	,'2018-05-05 00:00:00'	,NULL	,1	,NULL	,'Large apartment for families'),
(15	,3	,15	,'Rent'	,800	,250	,560	,560	,0	,'---'	,0	,'2017-12-05 00:00:00'	,'2018-05-05 00:00:00'	,NULL	,1	,NULL	,'Large apartment outside Fulda with fantastic views'),
(16	,2	,16	,'Buy'	,0	,450	,580000	,580000	,3.34	,'---'	,0	,'2017-12-05 00:00:00'	,'2019-01-01 00:00:00'	,NULL	,1	,NULL	,'Bauhaus style with swimming pool and double garage'),
(17	,1	,17	,'Buy'	,0	,900	,240500	,240500	,0		,'---'	,0	,'2017-12-05 00:00:00'	,'2019-01-01 00:00:00'	,NULL	,1	,NULL	,'Modern urban villa'),
(18	,2	,18	,'Buy'	,0	,698	,248000	,248000	,2.78	,'---'	,0	,'2017-12-05 00:00:00'	,'2019-01-01 00:00:00'	,NULL	,1	,NULL	,'Planned house in development area'),
(19	,3	,19	,'Buy'	,0	,536	,374900	,374900	,0		,'---'	,0	,'2017-12-05 00:00:00'	,'2019-01-01 00:00:00'	,NULL	,1	,NULL	,'Planned house in development area'),
(20	,1	,20	,'Buy'	,0	,900	,619900	,619900	,0		,'---'	,0	,'2017-12-05 00:00:00'	,'2019-01-01 00:00:00'	,NULL	,1	,NULL	,'Mediterranean City Villa');
/*!40000 ALTER TABLE `angebot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bewertung`
--

DROP TABLE IF EXISTS `bewertung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bewertung` (
  `id` smallint(16) NOT NULL AUTO_INCREMENT,
  `user_id` smallint(16) NOT NULL,
  `wertung_id` smallint(16) NOT NULL,
  `date` date DEFAULT NULL,
  `beschreibung` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bewertung_verkaufer_fk_idx` (`user_id`),
  KEY `bewertung_wertung_fk_idx` (`wertung_id`),
  CONSTRAINT `bewertung_verkaufer_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bewertung_wertung_fk` FOREIGN KEY (`wertung_id`) REFERENCES `wertung` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bewertung`
--

LOCK TABLES `bewertung` WRITE;
/*!40000 ALTER TABLE `bewertung` DISABLE KEYS */;
INSERT INTO `bewertung` VALUES (1,7,4,'2017-11-20',NULL),(2,7,3,'2018-03-11',NULL),(3,7,5,'2017-11-29',NULL),(4,8,5,'2017-11-28',NULL),(5,8,5,'2017-12-04',NULL),(6,8,5,'2018-01-12',NULL);
/*!40000 ALTER TABLE `bewertung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `default_image`
--

DROP TABLE IF EXISTS `default_image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `default_image` (
  `id` int(16) NOT NULL,
  `beschreibung` varchar(100) DEFAULT NULL,
  `path` tinytext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `default_image`
--

LOCK TABLES `default_image` WRITE;
/*!40000 ALTER TABLE `default_image` DISABLE KEYS */;
/*!40000 ALTER TABLE `default_image` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorit`
--

DROP TABLE IF EXISTS `favorit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favorit` (
  `user_id` smallint(16) NOT NULL,
  `angebot_id` smallint(16) NOT NULL,
  `notizen` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`angebot_id`),
  KEY `user_id_UNIQUE` (`user_id`),
  KEY `favorit_angebot_fk_idx` (`angebot_id`),
  CONSTRAINT `favorit_angebot_fk` FOREIGN KEY (`angebot_id`) REFERENCES `angebot` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `favorit_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorit`
--

LOCK TABLES `favorit` WRITE;
/*!40000 ALTER TABLE `favorit` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `immobilien`
--

DROP TABLE IF EXISTS `immobilien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `immobilien` (
  `id` smallint(16) NOT NULL AUTO_INCREMENT,
  `immobilien_art` varchar(60) NOT NULL,
  `immobilien_adress` varchar(45) NOT NULL,
  `immobilien_ort` smallint(16) NOT NULL,
  `zimmeranzahl` int(11) NOT NULL DEFAULT '1',
  `qm` int(10) NOT NULL,
  `etage` int(11) DEFAULT '1',
  `etage_anzahl` int(11) DEFAULT '1',
  `bauzustand` varchar(45) DEFAULT NULL,
  `features` varchar(100) NOT NULL,
  `nutzungszweck` varchar(100) NOT NULL,
  `beschreibung` varchar(600) DEFAULT NULL,
  `bewertung_wert` float NOT NULL DEFAULT '0',
  `active` tinyint(4) DEFAULT NULL,
  `verkaufer_id` smallint(16) NOT NULL,
  `map_info` varchar(300) DEFAULT NULL,
  `energieausweis` varchar(45) DEFAULT NULL,
  `besitzer_id` smallint(16) NOT NULL,
  `baujahr` smallint(10) NOT NULL,
  `heizungs_art` varchar(45) NOT NULL,
  `media` varchar(600) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `immobilien_user_fk_idx` (`verkaufer_id`),
  KEY `immobilien_ort_fk_idx` (`immobilien_ort`),
  KEY `immobilien_besitzer_fk_idx` (`besitzer_id`),
  CONSTRAINT `immobilien_besitzer_fk` FOREIGN KEY (`besitzer_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `immobilien_ort_fk` FOREIGN KEY (`immobilien_ort`) REFERENCES `ort` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `immobilien_user_fk` FOREIGN KEY (`verkaufer_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `immobilien`
--

LOCK TABLES `immobilien` WRITE;
/*!40000 ALTER TABLE `immobilien` DISABLE KEYS */;
INSERT INTO `immobilien` VALUES 
(1,'Estate','Alte Ziegelei 18'		,2	,1	,800	,0	,0	,'Unoccupied property'	,'Single-Family House,Semi-Detached House ,Broad outlook,Sunshine Slope'		,'Private'		,'A large building plot with panoramic views in a beautiful landscape. The building plot on a sunny slope is fully developed and can be built on immediately. The development of the property depends on the surrounding buildings.'		,0	,1	,1	,NULL	,NULL	,1	, 2017	, 'Centralized (Gas)'	, 'haus1.jpg,haus2.jpg,haus3.jpg'),
(2,'Estate','Dipperzer Str. 1'		,2	,1	,1344	,0	,0	,'Unoccupied property'	,'Gap in slope position,Tranquil'												,'Private'		,'This fully developed building plot is located in Petersberg, on the main road. This is a construction gap on a slope with direct access to the A7 motorway.'																				,0	,1	,2	,NULL	,NULL	,2	, 2017	, 'Centralized (Gas)'	, 'haus2.jpg,haus3.jpg,haus1.jpg'),
(3,'Estate','Löherstraße 41'		,1	,1	,994	,0	,0	,'Unoccupied property'	,'Almost ground floor plot,At connecting road'									,'Private'		,'More than 990 m² of building land in the centre of Fulda. Almost ground level plot for immediate or later development.'																													,0	,1	,3	,NULL	,NULL	,4	, 2017	, 'Centralized (Gas)'	, 'haus3.jpg,haus1.jpg,haus2.jpg'),
(4,'Estate','Leipziger Str. 123'	,1	,1	,827	,0	,0	,'Unoccupied property'	,'South Exposure,Quiet Plot,Good transport connections'							,'Commercial'	,'Fully developed, quiet building site with south exposure directly at Leipziger Straße. Direct connection to the A7 motorway, close to the city centre with direct connection to public transport.'										,0	,1	,1	,NULL	,NULL	,5	, 2017	, 'Centralized (Oil)'	, 'haus1.jpg,haus2.jpg,haus3.jpg'),
(5,'Estate','Dalbergstraße 29'		,6	,1	,767	,0	,0	,'Unoccupied property'	,'Building site with south exposure,Good transport connections,Quiet Plot'		,'Commercial'	,'Fully developed, quiet building site with south exposure and great views. Directly adjacent to the city centre. Connection to public transport.'																							,0	,1	,1	,NULL	,NULL	,6	, 2017	, 'Centralized (Oil)'	, 'haus2.jpg,haus3.jpg,haus1.jpg'),
(6,'House'	,'Heinrich-von-Bibra-Platz 5'	,1	,9	,210	,0	,2	,'Maintained'				,'Guest toilet,Basement,Granny flat'					,'Private'	,'Today we can offer you a versatile, massive and detached house. The situation can be described as good. City bus stop only a few minutes away. All things of daily life within easy reach. Due to its flexible layout, the residential building offers a wide range of possible uses.'	,0	,1	,2	,NULL	,NULL	,5	,1997, 'Centralized (Gas)', 'haus1.jpg,haus2.jpg,haus3.jpg'),
(7,'House'	,'Bonifatiuspl. 2'				,1	,6	,270	,0	,3	,'Modernized'				,'Granny flat,4 Bedrooms,3 Bathrooms,Garage'			,'Private'	,'Comfortable apartment house in a dream location on the outskirts of Fulda, in one of the most beautiful residential areas in Fulda and the surrounding area.'	,0 ,1 ,3 ,NULL ,NULL ,6 , 2002, 'Wood Stove (Floor)', 'haus2.jpg,haus3.jpg,haus1.jpg'),
(8,'House'	,'Am Bahnhof'					,1	,15	,400	,0	,3	,'House completed'			,'Guest toilet,Underground garage,Basement,15 Rooms'	,'Private'	,'Rare opportunity! Beautiful property dating from the Art Nouveau period in 1890, the listed building was renovated in 1995 with great effort and observance of historical preservation regulations. In the course of the renovation, the property was extended by an underground car park with 8 parking spaces offering direct access to the property. The area above the newly built underground car park was partly covered with vegetation and provided with a footpath. There are three more parking spaces in front of the underground car park.'	,0 ,1 ,1 ,NULL ,NULL ,1 ,1980 ,'Centralized (Oil)', 'haus3.jpg,haus1.jpg,haus2.jpg'),
(9,'House'	,'Petersberger Str. 36'			,1	,15	,245	,0	,2	,'In need of renovation'	,'15 Rooms,Garage'										,'Private'	,'This apartment building, built in 1930, is located in a popular location of Petersberg on a plot of land of approx. 634 m² for sale. The multi-family house has a living area of approx. 245 m² with a total of eleven rooms, which are divided into three residential units. These apartments also have a kitchen-living room, bathroom and a practical storeroom.'	,0 ,1 ,2 ,NULL ,NULL ,2 ,2000, 'Centralized (Gas)', 'haus1.jpg,haus2.jpg,haus3.jpg'),
(10,'House'	,'Reesbergstraße 1'				,5	,4	,152	,0	,2	,'House in planning'		,'Guest toilet,3 Bedrooms,1 Bathroom,4 Rooms'			,'Private'	,'On the ground floor is the living/dining area with adjoining kitchen. The ground floor also houses a toilet and the technical room. In the attic there are 3 bedrooms and the main bathroom. The house is in the planning phase and can be individually adapted to your wishes. The photos do not include optional extras.' ,0	,1	,3	,NULL	,NULL	,7	,2002, 'Wood Stove (Floor)', 'haus2.jpg,haus3.jpg,haus1.jpg'),
(11	,'Apartment'	,'Paulustor 4'				,1	,1	,28		,0	,1	,'Furnished apartment'	,'Balcony,Fitted Kitchen'					,'Private'	,'Spacious apartment with terrace between train station and university, modern furnishings on request.'	,0	,1	,2	,NULL	,NULL	,2	, 2008, 'Centralized (Oil)', 'haus3.jpg,haus1.jpg,haus2.jpg'),
(12	,'Apartment'	,'Eduard-Schick-Platz 2'	,1	,1	,24		,0	,1	,'Furnished apartment'	,'Fitted Kitchen'							,'Private'	,'Stylish apartment directly in the city centre, modernly furnished upon request. Direct connection to public transport. Particularly suitable for students.'	,0	,1	,3	,NULL	,NULL	,5	, 2000, 'Centralized (Gas)', 'haus1.jpg,haus2.jpg,haus3.jpg'),
(13	,'Apartment'	,'Am Rosengarten 7'			,1	,3	,91		,0	,1	,'New/Upscale'			,'Balcony,Elevator,Fitted Kitchen,Carport'	,'Private'	,'This ultra-modern 3 room apartment is located on the 2nd floor of a newly built multiple dwelling and has about 91 m². The open plan kitchen is integrated into the living room and has a high-quality fitted kitchen with two bedrooms.'	,0	,1	,1	,NULL	,NULL	,1	,2015, 'Centralized (Oil)', 'haus2.jpg,haus3.jpg,haus1.jpg'),
(14	,'Apartment'	,'Am Emaillierwerk 1'		,6	,5	,142	,0	,2	,'New'					,'Balcony,Basement,Guest toilet,Carport'	,'Private'	,'This spacious 5 room apartment is located in the attic storey of a multiple dwelling and has approx. 142 m². The kitchen is large enough to set up a fitted kitchen, optionally a fitted kitchen can be installed by the landlord. '		,0	,1 	,1 	,NULL 	,NULL 	,6 	,2014, 'Centralized (Gas)', 'haus3.jpg,haus1.jpg,haus2.jpg'),
(15	,'Apartment'	,'Pacelliallee 4'			,6	,3	,83		,0	,1	,'Newly renovated'		,'Balcony,Fitted Kitchen,'					,'Private'	,'This sunny 3 room apartment is located in the attic storey of a well-kept two family house and has about 83 m². The apartment has a bedroom and a study or guest room.'	,0 ,1 ,3 ,NULL ,NULL ,3 ,2002 ,'Wood Stove (Floor)', 'haus1.jpg,haus2.jpg,haus3.jpg'),
(16	,'Villa/Townhouse'	,'Reesbergstraße 1'			,5	,6	,260	,0	,1	,'Maintained'			,'Pool,Garage'											,'Private'	,'Well cut single-family house in the Bauhaus style with large and flexible ground floor level. The basement was partly extended in 1996 for residential purposes / office.'	,0	,1	,2	,NULL	,NULL	,2	,1973, 'Wood Stove (Floor)', 'haus2.jpg,haus3.jpg,haus1.jpg'),
(17	,'Villa/Townhouse'	,'Löherstraße 41'			,1	,5	,130	,0	,2	,'House in planning'	,'Garage,Stepless access,Free of commission'			,'Private'	,'This house belongs to one of many planned projects in the development area near Fulda. We offer you exclusive equipment at a fair price.'	,0	,1	,1	,NULL	,NULL	,1	,2018	, 'Centralized (Gas)', 'haus3.jpg,haus1.jpg,haus2.jpg'),
(18	,'Villa/Townhouse'	,'Rhönhof 3'				,4	,5	,130	,0	,2	,'House in planning'	,'3 Bedroms,Garage,Stepless access,Heat pump'			,'Private'	,'This house belongs to one of many planned projects in the development area near Fulda. We offer you exclusive equipment at a fair price.'	,0	,1	,2	,NULL	,NULL	,2	,2018	, 'Centralized (Gas)', 'haus1.jpg,haus2.jpg,haus3.jpg'),
(19	,'Villa/Townhouse'	,'Eduard-Schick-Platz 2'	,1	,5	,130	,0	,2	,'House in planning'	,'Stepless access,Free of commission,Garage,Upscale'	,'Private'	,'This house belongs to one of many planned projects in the development area near Fulda. We offer you exclusive equipment at a fair price.'	,0	,1	,3	,NULL	,NULL	,3	,2018	, 'Centralized (Gas)', 'haus2.jpg,haus3.jpg,haus1.jpg'),
(20	,'Villa/Townhouse'	,'Leipziger Straße 123'		,1	,5	,155	,0	,2	,'House in planning'	,'Free of commission,Pool,Garage,Upscale,Mediterranean'	,'Private'	,'Living in perfection! The well-thought-out architecture inspires with many refined details, which, in addition to an attractive appearance, offers many advantages for life in your "evolution".'	,0	,1	,1	,NULL	,NULL	,1	, 2018, 'Centralized (Gas)', 'haus3.jpg,haus1.jpg,haus2.jpg');
/*!40000 ALTER TABLE `immobilien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `immobilien_foto`
--

DROP TABLE IF EXISTS `immobilien_foto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `immobilien_foto` (
  `foto_id` smallint(16) NOT NULL AUTO_INCREMENT,
  `immobilien_id` smallint(16) NOT NULL,
  `beschreibung` varchar(100) DEFAULT NULL,
  `foto` longtext,
  PRIMARY KEY (`foto_id`),
  KEY `immobilienfoto_immobilien_fk_idx` (`immobilien_id`),
  CONSTRAINT `immobilienfoto_immobilien_fk` FOREIGN KEY (`immobilien_id`) REFERENCES `immobilien` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `immobilien_foto`
--

LOCK TABLES `immobilien_foto` WRITE;
/*!40000 ALTER TABLE `immobilien_foto` DISABLE KEYS */;
INSERT INTO `immobilien_foto` VALUES (1,8,NULL,'haus1.jpg'),(2,8,NULL,'haus2.jpg'),(3,8,NULL,'haus3.jpg'),(4,9,NULL,'haus1.jpg'),(5,9,NULL,'haus2.jpg'),(6,9,NULL,'haus3.jpg'),(7,10,NULL,'haus1.jpg'),(8,10,NULL,'haus2.jpg'),(9,10,NULL,'haus3.jpg'),(10,11,NULL,'haus1.jpg'),(11,11,NULL,'haus2.jpg'),(12,11,NULL,'haus3.jpg'),(13,12,NULL,'haus1.jpg'),(14,12,NULL,'haus2.jpg'),(15,12,NULL,'haus3.jpg'),(16,13,NULL,'haus1.jpg'),(17,13,NULL,'haus2.jpg'),(18,13,NULL,'haus3.jpg'),(19,14,NULL,'haus1.jpg'),(20,14,NULL,'haus2.jpg'),(21,14,NULL,'haus3.jpg');
/*!40000 ALTER TABLE `immobilien_foto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kommentar`
--

DROP TABLE IF EXISTS `kommentar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kommentar` (
  `id` smallint(16) NOT NULL AUTO_INCREMENT,
  `angebot_id` smallint(16) NOT NULL,
  `user_id` smallint(16) NOT NULL,
  `kommentar` varchar(300) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `wert_id` smallint(16) NOT NULL DEFAULT '3',
  PRIMARY KEY (`id`),
  KEY `kommentar_user_fk_idx` (`user_id`),
  KEY `kommentar_angebot_fk_idx` (`angebot_id`),
  KEY `kommentar_wertung_fk_idx` (`wert_id`),
  CONSTRAINT `kommentar_angebot_fk` FOREIGN KEY (`angebot_id`) REFERENCES `angebot` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `kommentar_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `kommentar_wertung_fk` FOREIGN KEY (`wert_id`) REFERENCES `wertung` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kommentar`
--

LOCK TABLES `kommentar` WRITE;
/*!40000 ALTER TABLE `kommentar` DISABLE KEYS */;
INSERT INTO `kommentar` VALUES (1,8,8,'Too old House. Barebones (needs insulation, drywall, flooring, etc.)','2017-11-30',3),(2,9,7,'Good Place but the price is too hight','2017-12-03',4),(3,10,8,'Beautiful view and everything is good','2017-12-04',5),(4,11,7,'Wonderful Bungablow, I want always come back','2017-12-09',5),(5,12,7,'No Pets is difficult for me','2017-11-29',3);
/*!40000 ALTER TABLE `kommentar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kontakt`
--

DROP TABLE IF EXISTS `kontakt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kontakt` (
  `id` smallint(16) NOT NULL AUTO_INCREMENT,
  `beschreibung` varchar(160) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `kontakt_status_id` smallint(16) NOT NULL,
  `local_id` smallint(16) NOT NULL,
  `remote_id` smallint(16) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `kontakt_localuser_fk_idx` (`local_id`),
  KEY `kontakt_remoteuser_fk_idx` (`remote_id`),
  KEY `kontakt_kontaktstatus_fk_idx` (`kontakt_status_id`),
  CONSTRAINT `kontakt_kontaktstatus_fk` FOREIGN KEY (`kontakt_status_id`) REFERENCES `kontakt_status` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `kontakt_localuser_fk` FOREIGN KEY (`local_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `kontakt_remoteuser_fk` FOREIGN KEY (`remote_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kontakt`
--

LOCK TABLES `kontakt` WRITE;
/*!40000 ALTER TABLE `kontakt` DISABLE KEYS */;
INSERT INTO `kontakt` VALUES (1,'Kontakt for Estate 1','2017-11-15 22:33:44',1,7,8),
(2,'Kontakt for Estate 2','2017-11-20 10:15:27',2,8,7),
(3,'Question for Estate 3','2017-11-22 23:11:10',1,7,8),
(4,'Rent Estate 4','2017-11-16 17:23:00',2,8,7),
(5,'Description Estate 3','2017-11-16 09:48:00',1,7,9);/*!40000 ALTER TABLE `kontakt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `kontakt_status`
--

DROP TABLE IF EXISTS `kontakt_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `kontakt_status` (
  `id` smallint(16) NOT NULL,
  `status` varchar(45) NOT NULL,
  `beschreibung` varchar(60) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `kontakt_status`
--

LOCK TABLES `kontakt_status` WRITE;
/*!40000 ALTER TABLE `kontakt_status` DISABLE KEYS */;
INSERT INTO `kontakt_status` VALUES (1,'1','new'),(2,'2','in progress'),(3,'3','closed'),(4,'4','successfull');
/*!40000 ALTER TABLE `kontakt_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nachricht`
--

DROP TABLE IF EXISTS `nachricht`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nachricht` (
  `id` smallint(16) NOT NULL AUTO_INCREMENT,
  `absender_id` smallint(16) NOT NULL,
  `empfanger_id` smallint(16) NOT NULL,
   `absender_email` varchar(100) NOT NULL,
  `empfanger_email` varchar(100) NOT NULL,
  `date` datetime DEFAULT NULL,
  `nachricht` varchar(300) DEFAULT NULL,
  `nachricht_status_id` smallint(16) NOT NULL,
  `kontakt_id` smallint(16) NOT NULL,
  `nachricht_beschreibung` varchar(45) NOT NULL,
  `attachfile` tinytext,
  `Titel` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `nachricht_absender_fk_idx` (`absender_id`),
  KEY `nachricht_empfanger_fk_idx` (`empfanger_id`),
  KEY `nachricht_kontakt_fk_idx` (`kontakt_id`),
  KEY `nachricht_nachrichtstatus_fk_idx` (`nachricht_status_id`),
  CONSTRAINT `nachricht_absender_fk` FOREIGN KEY (`absender_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `nachricht_empfanger_fk` FOREIGN KEY (`empfanger_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `nachricht_kontakt_fk` FOREIGN KEY (`kontakt_id`) REFERENCES `kontakt` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `nachricht_nachrichtstatus_fk` FOREIGN KEY (`nachricht_status_id`) REFERENCES `nachricht_status` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nachricht`
--

LOCK TABLES `nachricht` WRITE;
/*!40000 ALTER TABLE `nachricht` DISABLE KEYS */;
INSERT INTO `nachricht` VALUES 
(1,2,3,'admin@admin2.de','admin@admin3.de','2017-11-21 12:12:14','Hi, I would like to join the meeting on monday.',2,1,'Besichtigung',NULL,'Question about House in Art Nouveau'),
(2,3,2,'admin@admin3.de','admin@admin2.de','2017-11-22 21:14:18','Hello my friend, unfortunately we have to change time for out meeting. It is now at 5pm!',3,1,'Besichtigung',NULL,'Re: Question about House in Art Nouveau'),
(3,3,2,'admin@admin3.de','admin@admin2.de','2017-11-22 08:10:27','All right, see you on frieday, 3pm should be a good time.',1,2,'Besichtigung',NULL,'House in Art Nouveau'),
(4,2,3,'admin@admin2.de','admin@admin3.de','2017-11-18 15:38:45','I saw your offer on the side and want to request a inspection of the house. ',2,3,'Besichtigung',NULL,'House in Art Nouveau'),
(5,2,3,'admin@admin2.de','admin@admin3.de','2017-11-23 11:22:44','I would like to complete the business about House in Art Nouveau.',1,5,'KaufenMieten',NULL,'House in Art Nouveau'),
(6,3,2,'admin@admin3.de','admin@admin2.de','2017-11-18 20:28:26','Purchase interest in property house noted.',1,5,'KaufenMieten',NULL,'Want to buy the house'),
(7,3,2,'admin@admin3.de','admin@admin2.de','2017-11-18 16:08:05','Inspection on saturday, 3pm, is it ok ?',2,5,'Besichtigung',NULL,'House inspection'),
(8,2,3,'admin@admin2.de','admin@admin3.de','2017-11-18 17:21:38','Ok, 3pm on saturday, see you there.',2,5,'Besichtigung',NULL,'RE: Besichtigungstermin Immobilie XYZ'),
(9,1,2,'admin@admin.de','admin@admin2.de','2017-11-18 10:17:17','Searching for a ghost house for my mother-in-law.',2,5,'Besichtigung',NULL,'Request Ghosthouse inspection'),
(10,1,2,'admin@admin.de','admin@admin2.de','2017-11-18 22:10:30','Found ghost house for mother in law.',2,5,'Information',NULL,'Request Ghosthouse');
/*!40000 ALTER TABLE `nachricht` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nachricht_status`
--

DROP TABLE IF EXISTS `nachricht_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `nachricht_status` (
  `id` smallint(16) NOT NULL,
  `nachricht_status` varchar(45) NOT NULL,
  `beschreibung` varchar(100) DEFAULT NULL,
  `img` mediumtext,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nachricht_status`
--

LOCK TABLES `nachricht_status` WRITE;
/*!40000 ALTER TABLE `nachricht_status` DISABLE KEYS */;
INSERT INTO `nachricht_status` VALUES (1,'1','noch nicht gelesen',NULL),(2,'2','gelesen',NULL),(3,'3','wichtig',NULL),(4,'4','ignoriert',NULL);
/*!40000 ALTER TABLE `nachricht_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ort`
--

DROP TABLE IF EXISTS `ort`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ort` (
  `id` smallint(16) NOT NULL AUTO_INCREMENT,
  `ortname` varchar(45) NOT NULL,
  `beschreibung` varchar(120) DEFAULT NULL,
  `plz` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ort`
--

LOCK TABLES `ort` WRITE;
/*!40000 ALTER TABLE `ort` DISABLE KEYS */;
INSERT INTO `ort` VALUES (1,'Fulda','Fulda','36037'),
(2,'Petersberg','Fulda Landkreis','36100'),
(3,'Marbach','Fulda Landkreis','36100'),
(4,'Eichenzell','Fulda Landkreis','36124'),
(5,'Fulda','Fulda','36039'),
(6,'Fulda','Fulda','36034');
/*!40000 ALTER TABLE `ort` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` smallint(16) NOT NULL AUTO_INCREMENT,
  `nickname` varchar(45) NOT NULL,
  `password` varchar(120) NOT NULL DEFAULT 'password',
  `firstname` varchar(45) NOT NULL,
  `lastname` varchar(45) NOT NULL,
  `telephone` varchar(45) DEFAULT NULL,
  `email` varchar(45) NOT NULL,
  `address` varchar(45) DEFAULT NULL,
  `ort_id` smallint(16) NOT NULL,
  `activedate` datetime DEFAULT NULL,
  `lastlogin` datetime DEFAULT NULL,
  `img` mediumtext,
  `role` int(11) NOT NULL DEFAULT '2',
  `agency` varchar(45) DEFAULT NULL,
  `agent_id` varchar(45) DEFAULT NULL,
  `active` tinyint(4) DEFAULT '0',
  `bewertungswert` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nickname_UNIQUE` (`nickname`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `user_ort_fk_idx` (`ort_id`),
  CONSTRAINT `user_ort_fk` FOREIGN KEY (`ort_id`) REFERENCES `ort` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'admin@admin.de'		,'$2a$10$MCUiUvU3eVVC1gIKAT5IUuUTIB6RWc/Weep0ZQMY2sKQIYFJ47Rh6'	,'Lukas','Eggers'			,NULL,'admin@admin.de'	,'Dipperzer Str. 1'			,2,NULL,NULL,NULL,3,'CSURealEstate'	,'49-97769-00001',0,NULL),
(2,'admin@admin2.de'	,'$2a$10$MCUiUvU3eVVC1gIKAT5IUuUTIB6RWc/Weep0ZQMY2sKQIYFJ47Rh6'	,'Sebastian','Drechsler'	,NULL,'admin@admin2.de'	,'Petersberger Str. 36'		,1,NULL,NULL,NULL,3,'SFStateHomes'	,'49-97769-00002',0,NULL),
(3,'admin@admin3.de'	,'$2a$10$MCUiUvU3eVVC1gIKAT5IUuUTIB6RWc/Weep0ZQMY2sKQIYFJ47Rh6'	,'Lucas','Maurer'			,NULL,'admin@admin3.de'	,'Reesbergstraße 1'			,5,NULL,NULL,NULL,3,'SJStateRealtors'	,'49-97769-00003',0,NULL),
(4,'admin@admin4.de'	,'$2a$10$MCUiUvU3eVVC1gIKAT5IUuUTIB6RWc/Weep0ZQMY2sKQIYFJ47Rh6'	,'Felix','Zimmermann'		,NULL,'admin@admin4.de'	,'Löherstraße 41'			,1,NULL,NULL,NULL,2,NULL,NULL,0,NULL),
(5,'admin@admin5.de'	,'$2a$10$MCUiUvU3eVVC1gIKAT5IUuUTIB6RWc/Weep0ZQMY2sKQIYFJ47Rh6'	,'Andreas','Osterhagen'		,NULL,'admin@admin5.de'	,'Dalbergstraße 29'			,6,NULL,NULL,NULL,2,NULL,NULL,0,NULL),
(6,'admin@admin6.de'	,'$2a$10$MCUiUvU3eVVC1gIKAT5IUuUTIB6RWc/Weep0ZQMY2sKQIYFJ47Rh6'	,'Marcel','Wexler'			,NULL,'admin@admin6.de'	,'Eduard-Schick-Platz 2'	,1,NULL,NULL,NULL,2,NULL,NULL,0,NULL),
(7,'admin@admin7.de'	,'$2a$10$MCUiUvU3eVVC1gIKAT5IUuUTIB6RWc/Weep0ZQMY2sKQIYFJ47Rh6'	,'Jürgen','Reiniger'		,NULL,'admin@admin7.de'	,'Marquardstraße 25'		,5,NULL,NULL,NULL,2,NULL,NULL,0,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wertung`
--

DROP TABLE IF EXISTS `wertung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wertung` (
  `id` smallint(16) NOT NULL,
  `wert` int(11) NOT NULL,
  `image` blob,
  `beschreibung` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wertung`
--

LOCK TABLES `wertung` WRITE;
/*!40000 ALTER TABLE `wertung` DISABLE KEYS */;
INSERT INTO `wertung` VALUES (1,1,NULL,NULL),(2,2,NULL,NULL),(3,3,NULL,NULL),(4,4,NULL,NULL),(5,5,NULL,NULL);
/*!40000 ALTER TABLE `wertung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'fa17g17'
--

--
-- Dumping routines for database 'fa17g17'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-11-24 13:54:12
