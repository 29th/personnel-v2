-- MySQL dump 10.13  Distrib 5.5.40, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: personnel_v2_sample
-- ------------------------------------------------------
-- Server version	5.5.40-0ubuntu0.14.04.1

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
-- Table structure for table `abilities`
--

DROP TABLE IF EXISTS `abilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `abilities` (
  `id` mediumint(9) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Ability''s ID',
  `name` varchar(40) NOT NULL COMMENT 'Ability''s Name',
  `abbr` varchar(24) NOT NULL COMMENT 'Ability''s Abbreviation',
  `description` text NOT NULL COMMENT 'Detailed description of Ability',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8 COMMENT='List of abilities';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `abilities`
--

LOCK TABLES `abilities` WRITE;
/*!40000 ALTER TABLE `abilities` DISABLE KEYS */;
INSERT INTO `abilities` VALUES (1,'Edit Profile','profile_edit','<p>Edit a member\'s profile</p>'),(2,'Promote','promotion_add','Add a promotion to a member\'s record and change the member\'s rank to it if applicable'),(3,'Award','award_add','Give a member an award'),(4,'View Any Profile','profile_view_any','View any member\'s profile'),(5,'Delete Promotion','promotion_delete','Delete a member\'s promotion and demote them if applicable'),(6,'Give Award','awarding_add','Give a member an award'),(7,'Delete Awarding','awarding_delete','Remove an award from a member\'s record'),(8,'Give Qualification','qualification_add','Give qualification to a member'),(9,'Delete Qualification','qualification_delete','Delete a qualification from a member\'s service record'),(10,'Promote Any Member','promotion_add_any',''),(11,'Delete Any Promotion','promotion_delete_any',''),(12,'Give Award to Any Member','awarding_add_any',''),(13,'Delete Any Awarding','awarding_delete_any',''),(14,'Give Qualification to Any Member','qualification_add_any',''),(15,'Delete Any Qualification','qualification_delete_any',''),(16,'Assign Member','assignment_add',''),(17,'Assign Any Member','assignment_add_any',''),(18,'Delete Assignment','assignment_delete',''),(19,'Delete Any Assignment','assignment_delete_any',''),(20,'Add Unit','unit_add',''),(21,'Discharge','discharge',''),(22,'Admin','admin','<p>Full access, including admin panel</p>'),(23,'Post Event AAR','event_aar',''),(24,'Process Any Enlistment','enlistment_process_any',''),(25,'Edit Any Profile','profile_edit_any','Edit any member\'s profile'),(26,'Modify Any Enlistment','enlistment_edit_any','Modify any member\'s enlistment'),(27,'View Any Event','event_view_any',''),(28,'Post Any Event AAR','event_aar_any',''),(29,'View Any Unit Statistics','unit_stats_any',''),(30,'Admin: Events','admin-events','');
/*!40000 ALTER TABLE `abilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assignments` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `member_id` mediumint(8) unsigned NOT NULL COMMENT 'User ID',
  `unit_id` mediumint(8) unsigned NOT NULL,
  `position` varchar(64) NOT NULL,
  `position_id` mediumint(8) unsigned DEFAULT '35',
  `_access_level` tinyint(1) NOT NULL DEFAULT '0',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ttt` (`member_id`,`unit_id`,`position_id`,`start_date`),
  KEY `Unit ID` (`unit_id`),
  KEY `position_id` (`position_id`),
  KEY `Member ID` (`member_id`),
  CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `assignments_ibfk_4` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `assignments_ibfk_5` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16370 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
INSERT INTO `assignments` VALUES (16367,1,596,'',196,0,'2014-11-30',NULL);
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendance` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Attendance log ID',
  `event_id` mediumint(8) unsigned NOT NULL COMMENT 'Event ID',
  `member_id` mediumint(8) unsigned NOT NULL COMMENT 'Member ID',
  `attended` tinyint(1) DEFAULT NULL COMMENT 'Has member attended',
  `excused` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Has member posted absence',
  PRIMARY KEY (`id`),
  UNIQUE KEY `event and member` (`event_id`,`member_id`),
  KEY `Event ID` (`event_id`),
  KEY `User ID` (`member_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=205851 DEFAULT CHARSET=utf8 COMMENT='Log of attendance';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `awardings`
--

DROP TABLE IF EXISTS `awardings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `awardings` (
  `id` mediumint(8) NOT NULL AUTO_INCREMENT,
  `member_id` mediumint(8) unsigned NOT NULL,
  `date` date NOT NULL,
  `award_id` mediumint(8) unsigned NOT NULL,
  `forum_id` enum('1','2','3') DEFAULT NULL COMMENT 'Which forums',
  `topic_id` mediumint(8) NOT NULL COMMENT 'Negative means old forums',
  PRIMARY KEY (`id`),
  KEY `User ID` (`member_id`),
  KEY `Award ID` (`award_id`),
  CONSTRAINT `awardings_ibfk_2` FOREIGN KEY (`award_id`) REFERENCES `awards` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `awardings_ibfk_3` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11093 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `awardings`
--

LOCK TABLES `awardings` WRITE;
/*!40000 ALTER TABLE `awardings` DISABLE KEYS */;
/*!40000 ALTER TABLE `awardings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `awards`
--

DROP TABLE IF EXISTS `awards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `awards` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(16) NOT NULL DEFAULT '',
  `title` varchar(255) NOT NULL DEFAULT '',
  `description` text NOT NULL,
  `game` enum('N/A','DH','DOD','Arma 3','RS') NOT NULL,
  `image` varchar(255) NOT NULL DEFAULT '',
  `thumbnail` varchar(255) NOT NULL DEFAULT '',
  `bar` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=117 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `awards`
--

LOCK TABLES `awards` WRITE;
/*!40000 ALTER TABLE `awards` DISABLE KEYS */;
/*!40000 ALTER TABLE `awards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banlog`
--

DROP TABLE IF EXISTS `banlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `banlog` (
  `id` mediumint(8) NOT NULL AUTO_INCREMENT,
  `roid` varchar(24) NOT NULL,
  `handle` varchar(32) DEFAULT NULL,
  `ip` int(10) DEFAULT NULL,
  `date` date NOT NULL,
  `id_admin` mediumint(8) unsigned NOT NULL,
  `id_poster` mediumint(8) unsigned NOT NULL,
  `reason` text,
  `comments` text,
  `unbanned` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_admin` (`id_admin`),
  KEY `id_poster` (`id_poster`)
) ENGINE=InnoDB AUTO_INCREMENT=1671 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banlog`
--

LOCK TABLES `banlog` WRITE;
/*!40000 ALTER TABLE `banlog` DISABLE KEYS */;
/*!40000 ALTER TABLE `banlog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_permissions`
--

DROP TABLE IF EXISTS `class_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_permissions` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `class` enum('Combat','Staff','Training') DEFAULT NULL COMMENT 'Units table class',
  `ability_id` mediumint(8) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ability_id` (`ability_id`),
  CONSTRAINT `class_permissions_ibfk_1` FOREIGN KEY (`ability_id`) REFERENCES `abilities` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_permissions`
--

LOCK TABLES `class_permissions` WRITE;
/*!40000 ALTER TABLE `class_permissions` DISABLE KEYS */;
INSERT INTO `class_permissions` VALUES (4,NULL,4);
/*!40000 ALTER TABLE `class_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_roles`
--

DROP TABLE IF EXISTS `class_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `class_roles` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `class` enum('Combat','Staff','Training') CHARACTER SET utf8 DEFAULT NULL,
  `role_id` mediumint(8) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_roles`
--

LOCK TABLES `class_roles` WRITE;
/*!40000 ALTER TABLE `class_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `class_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `countries` (
  `id` smallint(4) NOT NULL AUTO_INCREMENT COMMENT 'Country ID',
  `abbr` char(2) NOT NULL,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=240 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'AD','Andorra'),(2,'AE','United Arab Emirates'),(3,'AF','Afghanistan'),(4,'AG','Antigua and Barbuda'),(5,'AI','Anguilla'),(6,'AL','Albania'),(7,'AM','Armenia'),(8,'AN','Netherlands Antilles'),(9,'AO','Angola'),(10,'AQ','Antarctica'),(11,'AR','Argentina'),(12,'AS','American Samoa'),(13,'AT','Austria'),(14,'AU','Australia'),(15,'AW','Aruba'),(16,'AZ','Azerbaijan'),(17,'BA','Bosnia and Herzegovina'),(18,'BB','Barbados'),(19,'BD','Bangladesh'),(20,'BE','Belgium'),(21,'BF','Burkina Faso'),(22,'BG','Bulgaria'),(23,'BH','Bahrain'),(24,'BI','Burundi'),(25,'BJ','Benin'),(26,'BM','Bermuda'),(27,'BN','Brunei Darussalam'),(28,'BO','Bolivia'),(29,'BR','Brazil'),(30,'BS','Bahamas'),(31,'BT','Bhutan'),(32,'BV','Bouvet Island'),(33,'BW','Botswana'),(34,'BY','Belarus'),(35,'BZ','Belize'),(36,'CA','Canada'),(37,'CC','Cocos (Keeling) Islands'),(38,'CD','Congo, The Democratic Republic of the'),(39,'CF','Central African Republic'),(40,'CG','Congo'),(41,'CH','Switzerland'),(42,'CI','Cote d\'Ivoire'),(43,'CK','Cook Islands'),(44,'CL','Chile'),(45,'CM','Cameroon'),(46,'CN','China'),(47,'CO','Colombia'),(48,'CR','Costa Rica'),(49,'CS','Serbia and Montenegro'),(50,'CU','Cuba'),(51,'CV','Cape Verde'),(52,'CX','Christmas Island'),(53,'CY','Cyprus'),(54,'CZ','Czech Republic'),(55,'DE','Germany'),(56,'DJ','Djibouti'),(57,'DK','Denmark'),(58,'DM','Dominica'),(59,'DO','Dominican Republic'),(60,'DZ','Algeria'),(61,'EC','Ecuador'),(62,'EE','Estonia'),(63,'EG','Egypt'),(64,'EH','Western Sahara'),(65,'ER','Eritrea'),(66,'ES','Spain'),(67,'ET','Ethiopia'),(68,'FI','Finland'),(69,'FJ','Fiji'),(70,'FK','Falkland Islands (Malvinas)'),(71,'FM','Micronesia, Federated States of'),(72,'FO','Faroe Islands'),(73,'FR','France'),(74,'GA','Gabon'),(75,'GB','United Kingdom'),(76,'GD','Grenada'),(77,'GE','Georgia'),(78,'GF','French Guiana'),(79,'GH','Ghana'),(80,'GI','Gibraltar'),(81,'GL','Greenland'),(82,'GM','Gambia'),(83,'GN','Guinea'),(84,'GP','Guadeloupe'),(85,'GQ','Equatorial Guinea'),(86,'GR','Greece'),(87,'GS','South Georgia and the South Sandwich Islands'),(88,'GT','Guatemala'),(89,'GU','Guam'),(90,'GW','Guinea-bissau'),(91,'GY','Guyana'),(92,'HK','Hong Kong'),(93,'HM','Heard Island and McDonald Islands'),(94,'HN','Honduras'),(95,'HR','Croatia'),(96,'HT','Haiti'),(97,'HU','Hungary'),(98,'ID','Indonesia'),(99,'IE','Ireland'),(100,'IL','Israel'),(101,'IN','India'),(102,'IO','British Indian Ocean Territory'),(103,'IQ','Iraq'),(104,'IR','Iran, Islamic Republic of'),(105,'IS','Iceland'),(106,'IT','Italy'),(107,'JM','Jamaica'),(108,'JO','Jordan'),(109,'JP','Japan'),(110,'KE','Kenya'),(111,'KG','Kyrgyzstan'),(112,'KH','Cambodia'),(113,'KI','Kiribati'),(114,'KM','Comoros'),(115,'KN','Saint Kitts and Nevis'),(116,'KP','Korea, Democratic People\'s Republic of'),(117,'KR','Korea, Republic of'),(118,'KW','Kuwait'),(119,'KY','Cayman Islands'),(120,'KZ','Kazakhstan'),(121,'LA','Lao People\'s Democratic Republic'),(122,'LB','Lebanon'),(123,'LC','Saint Lucia'),(124,'LI','Liechtenstein'),(125,'LK','Sri Lanka'),(126,'LR','Liberia'),(127,'LS','Lesotho'),(128,'LT','Lithuania'),(129,'LU','Luxembourg'),(130,'LV','Latvia'),(131,'LY','Libyan Arab Jamahiriya'),(132,'MA','Morocco'),(133,'MC','Monaco'),(134,'MD','Moldova, Republic of'),(135,'MG','Madagascar'),(136,'MH','Marshall Islands'),(137,'MK','Macedonia, the Former Yugoslav Republic of'),(138,'ML','Mali'),(139,'MM','Myanmar'),(140,'MN','Mongolia'),(141,'MO','Macao'),(142,'MP','Northern Mariana Islands'),(143,'MQ','Martinique'),(144,'MR','Mauritania'),(145,'MS','Montserrat'),(146,'MT','Malta'),(147,'MU','Mauritius'),(148,'MV','Maldives'),(149,'MW','Malawi'),(150,'MX','Mexico'),(151,'MY','Malaysia'),(152,'MZ','Mozambique'),(153,'NA','Namibia'),(154,'NC','New Caledonia'),(155,'NE','Niger'),(156,'NF','Norfolk Island'),(157,'NG','Nigeria'),(158,'NI','Nicaragua'),(159,'NL','Netherlands'),(160,'NO','Norway'),(161,'NP','Nepal'),(162,'NR','Nauru'),(163,'NU','Niue'),(164,'NZ','New Zealand'),(165,'OM','Oman'),(166,'PA','Panama'),(167,'PE','Peru'),(168,'PF','French Polynesia'),(169,'PG','Papua New Guinea'),(170,'PH','Philippines'),(171,'PK','Pakistan'),(172,'PL','Poland'),(173,'PM','Saint Pierre and Miquelon'),(174,'PN','Pitcairn'),(175,'PR','Puerto Rico'),(176,'PS','Palestinian Territory, Occupied'),(177,'PT','Portugal'),(178,'PW','Palau'),(179,'PY','Paraguay'),(180,'QA','Qatar'),(181,'RE','Reunion'),(182,'RO','Romania'),(183,'RU','Russian Federation'),(184,'RW','Rwanda'),(185,'SA','Saudi Arabia'),(186,'SB','Solomon Islands'),(187,'SC','Seychelles'),(188,'SD','Sudan'),(189,'SE','Sweden'),(190,'SG','Singapore'),(191,'SH','Saint Helena'),(192,'SI','Slovenia'),(193,'SJ','Svalbard and Jan Mayen'),(194,'SK','Slovakia'),(195,'SL','Sierra Leone'),(196,'SM','San Marino'),(197,'SN','Senegal'),(198,'SO','Somalia'),(199,'SR','Suriname'),(200,'ST','Sao Tome and Principe'),(201,'SV','El Salvador'),(202,'SY','Syrian Arab Republic'),(203,'SZ','Swaziland'),(204,'TC','Turks and Caicos Islands'),(205,'TD','Chad'),(206,'TF','French Southern Territories'),(207,'TG','Togo'),(208,'TH','Thailand'),(209,'TJ','Tajikistan'),(210,'TK','Tokelau'),(211,'TL','Timor-leste'),(212,'TM','Turkmenistan'),(213,'TN','Tunisia'),(214,'TO','Tonga'),(215,'TR','Turkey'),(216,'TT','Trinidad and Tobago'),(217,'TV','Tuvalu'),(218,'TW','Taiwan'),(219,'TZ','Tanzania, United Republic of'),(220,'UA','Ukraine'),(221,'UG','Uganda'),(222,'UM','United States Minor Outlying Islands'),(223,'US','United States'),(224,'UY','Uruguay'),(225,'UZ','Uzbekistan'),(226,'VA','Vatican City State'),(227,'VC','Saint Vincent and the Grenadines'),(228,'VE','Venezuela'),(229,'VG','Virgin Islands, British'),(230,'VI','Virgin Islands, U.S.'),(231,'VN','Vietnam'),(232,'VU','Vanuatu'),(233,'WF','Wallis and Futuna'),(234,'WS','Samoa'),(235,'YE','Yemen'),(236,'YT','Mayotte'),(237,'ZA','South Africa'),(238,'ZM','Zambia'),(239,'ZW','Zimbabwe');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demerits`
--

DROP TABLE IF EXISTS `demerits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `demerits` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `member_id` mediumint(8) unsigned NOT NULL,
  `author_member_id` mediumint(8) unsigned DEFAULT NULL,
  `forum_id` enum('1','2','3') DEFAULT NULL COMMENT 'Which forums',
  `topic_id` mediumint(8) NOT NULL,
  `date` date NOT NULL,
  `reason` text,
  PRIMARY KEY (`id`),
  KEY `User ID` (`member_id`),
  KEY `Author ID` (`author_member_id`),
  CONSTRAINT `demerits_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `demerits_ibfk_2` FOREIGN KEY (`author_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demerits`
--

LOCK TABLES `demerits` WRITE;
/*!40000 ALTER TABLE `demerits` DISABLE KEYS */;
/*!40000 ALTER TABLE `demerits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discharges`
--

DROP TABLE IF EXISTS `discharges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `discharges` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Discharge''s ID',
  `member_id` mediumint(8) unsigned NOT NULL COMMENT 'ID of discharged member ',
  `date` date NOT NULL COMMENT 'Date of discharge',
  `type` enum('Honorable','General','Dishonorable') NOT NULL DEFAULT 'General' COMMENT 'Type of discharge',
  `reason` text NOT NULL COMMENT 'Description of discharging reason',
  `was_reversed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Was the discharge reversed?',
  `forum_id` enum('1','2','3') DEFAULT NULL COMMENT 'Which forums',
  `topic_id` varchar(20) NOT NULL COMMENT 'ID of forum''s topic',
  PRIMARY KEY (`id`),
  KEY `Member ID` (`member_id`),
  CONSTRAINT `discharges_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1411 DEFAULT CHARSET=utf8 COMMENT='List of members'' discharges';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discharges`
--

LOCK TABLES `discharges` WRITE;
/*!40000 ALTER TABLE `discharges` DISABLE KEYS */;
/*!40000 ALTER TABLE `discharges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enlistments`
--

DROP TABLE IF EXISTS `enlistments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enlistments` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Enlistment ID',
  `member_id` mediumint(8) unsigned NOT NULL COMMENT 'Enlistee''s ID',
  `date` date NOT NULL COMMENT 'Enlistment Date',
  `liaison_member_id` mediumint(8) unsigned DEFAULT NULL COMMENT 'Member ID of Enlistment Liaison',
  `forum_id` enum('1','2','3') DEFAULT NULL COMMENT 'Which forums',
  `topic_id` mediumint(8) NOT NULL COMMENT 'ID of forums topic ',
  `unit_id` mediumint(8) unsigned DEFAULT NULL COMMENT 'Unit ID of Training Platoon',
  `status` enum('Pending','Accepted','Denied','Withdrawn') NOT NULL DEFAULT 'Pending' COMMENT 'Status of enlistment',
  `first_name` varchar(30) NOT NULL COMMENT 'Recruit''s First Name',
  `middle_name` varchar(1) NOT NULL COMMENT 'Recruit''s Middle Initial',
  `last_name` varchar(40) NOT NULL COMMENT 'Recruit''s Last Name',
  `age` varchar(8) NOT NULL COMMENT 'Recruit''s Age',
  `country_id` smallint(4) DEFAULT NULL COMMENT 'Country ID',
  `timezone` enum('EST','GMT','Either','Neither') DEFAULT NULL COMMENT 'Prefered time zone',
  `game` enum('DH','RS','Arma 3') DEFAULT 'DH' COMMENT 'Chosen game',
  `ingame_name` varchar(60) NOT NULL COMMENT 'In-game Name',
  `steam_name` varchar(60) NOT NULL COMMENT 'Steamfriends Name',
  `steam_id` tinytext NOT NULL,
  `email` varchar(60) NOT NULL COMMENT 'Working e-mail',
  `experience` text NOT NULL,
  `recruiter` varchar(128) NOT NULL,
  `recruiter_member_id` mediumint(8) unsigned DEFAULT NULL COMMENT 'Recruiter''s MemberID',
  `comments` text NOT NULL COMMENT 'Comments from Recruit',
  `body` text NOT NULL COMMENT 'The enlistment papers',
  PRIMARY KEY (`id`),
  KEY `Member ID` (`member_id`),
  KEY `Liaison ID` (`liaison_member_id`),
  KEY `Country` (`country_id`),
  KEY `Recruiter` (`recruiter_member_id`),
  KEY `Unit ID` (`unit_id`),
  CONSTRAINT `enlistments_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `enlistments_ibfk_2` FOREIGN KEY (`liaison_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `enlistments_ibfk_5` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `enlistments_ibfk_6` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `enlistments_ibfk_7` FOREIGN KEY (`recruiter_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4320 DEFAULT CHARSET=utf8 COMMENT='Enlistments into 29th ID';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enlistments`
--

LOCK TABLES `enlistments` WRITE;
/*!40000 ALTER TABLE `enlistments` DISABLE KEYS */;
/*!40000 ALTER TABLE `enlistments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `events` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `datetime` datetime NOT NULL,
  `unit_id` mediumint(8) unsigned DEFAULT NULL,
  `title` varchar(64) NOT NULL,
  `type` varchar(32) NOT NULL,
  `mandatory` tinyint(1) NOT NULL DEFAULT '1',
  `server` varchar(32) NOT NULL,
  `server_id` mediumint(8) unsigned DEFAULT NULL,
  `report` text NOT NULL,
  `reporter_member_id` mediumint(8) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Unit ID` (`unit_id`),
  KEY `Reporter's ID` (`reporter_member_id`),
  KEY `Server ID` (`server_id`),
  CONSTRAINT `events_ibfk_3` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `events_ibfk_4` FOREIGN KEY (`server_id`) REFERENCES `servers` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `events_ibfk_5` FOREIGN KEY (`reporter_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15003 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finances`
--

DROP TABLE IF EXISTS `finances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `finances` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Finance ID',
  `date` date NOT NULL COMMENT 'Date of entry',
  `member_id` mediumint(8) unsigned DEFAULT NULL COMMENT 'Member ID',
  `vendor` enum('N/A','Game Servers','Branzone','Dreamhost','Nuclear Fallout','Other') NOT NULL COMMENT 'Vendor of services',
  `amount_received` float DEFAULT NULL COMMENT 'Amount received',
  `amount_paid` float DEFAULT NULL COMMENT 'Amount paid',
  `fee` float DEFAULT NULL COMMENT 'Fee',
  `forum_id` enum('1','2','3') DEFAULT NULL COMMENT 'Which forums',
  `topic_id` varchar(20) DEFAULT NULL COMMENT 'ID of forums'' topic',
  `notes` text NOT NULL COMMENT 'Additional notes',
  PRIMARY KEY (`id`),
  KEY `Member ID` (`member_id`),
  CONSTRAINT `finances_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1980 DEFAULT CHARSET=utf8 COMMENT='Finances Ledger';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finances`
--

LOCK TABLES `finances` WRITE;
/*!40000 ALTER TABLE `finances` DISABLE KEYS */;
/*!40000 ALTER TABLE `finances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eloas`
--

DROP TABLE IF EXISTS `eloas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eloas` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'LOA''s ID',
  `member_id` mediumint(8) unsigned NOT NULL COMMENT 'Member''s ID',
  `posting_date` datetime NOT NULL COMMENT 'Date of posting',
  `start_date` date NOT NULL COMMENT 'Planned start date',
  `end_date` date NOT NULL COMMENT 'Planned end date',
  `return_date` date DEFAULT NULL COMMENT 'Date of returning',
  `reason` text NOT NULL COMMENT 'Reason for LOA',
  `is_available` text COMMENT 'Is member availaible during LOA',
  PRIMARY KEY (`id`),
  KEY `Member ID` (`member_id`),
  CONSTRAINT `loa_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2524 DEFAULT CHARSET=utf8 COMMENT='Leaves of Absence';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eloas`
--

LOCK TABLES `eloas` WRITE;
/*!40000 ALTER TABLE `eloas` DISABLE KEYS */;
/*!40000 ALTER TABLE `eloas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `log`
--

DROP TABLE IF EXISTS `log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Log record ID',
  `table` varchar(20) NOT NULL COMMENT 'Name of table',
  `table_record_id` mediumint(8) unsigned NOT NULL COMMENT 'ID of table''s record',
  `action` enum('Add','Edit','Delete') NOT NULL DEFAULT 'Add' COMMENT 'Action taken',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time of action',
  `member_id` mediumint(8) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Log of actions';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `log`
--

LOCK TABLES `log` WRITE;
/*!40000 ALTER TABLE `log` DISABLE KEYS */;
/*!40000 ALTER TABLE `log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `members` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `status` enum('N/A','Cadet','Active Duty','Reservist','Retired','Discharged') NOT NULL,
  `last_name` varchar(32) NOT NULL DEFAULT '',
  `first_name` varchar(32) NOT NULL DEFAULT '',
  `middle_name` varchar(32) NOT NULL DEFAULT '',
  `name_prefix` varchar(8) DEFAULT NULL,
  `country_id` smallint(4) DEFAULT NULL COMMENT 'Country ID',
  `city` varchar(32) DEFAULT NULL,
  `rank_id` mediumint(8) unsigned NOT NULL DEFAULT '1',
  `primary_assignment_id` mediumint(8) unsigned DEFAULT NULL,
  `steam_id` tinytext NOT NULL,
  `email` varchar(255) NOT NULL DEFAULT '',
  `im_type` enum('AIM','''MSN','''ICQ','''YIM','''Skype') DEFAULT NULL COMMENT 'Instant Messenger Type',
  `im_handle` varchar(100) DEFAULT NULL COMMENT 'Instant Messenger Handle',
  `forum_member_id` mediumint(8) unsigned NOT NULL COMMENT 'Member ID on forums',
  PRIMARY KEY (`id`),
  KEY `Assignment` (`primary_assignment_id`),
  KEY `Rank` (`rank_id`),
  KEY `CountryID` (`country_id`),
  CONSTRAINT `members_ibfk_2` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `members_ibfk_3` FOREIGN KEY (`rank_id`) REFERENCES `ranks` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=84557 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `members`
--

LOCK TABLES `members` WRITE;
/*!40000 ALTER TABLE `members` DISABLE KEYS */;
INSERT INTO `members` VALUES (1,'N/A','Tester','Test','E',NULL,223,NULL,2,NULL,'','',NULL,NULL,1);
/*!40000 ALTER TABLE `members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notes` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Note''s ID',
  `subject_member_id` mediumint(8) unsigned NOT NULL COMMENT 'Member ID of note''s subject',
  `author_member_id` mediumint(8) unsigned NOT NULL COMMENT 'Member ID of note''s author',
  `date_add` datetime NOT NULL COMMENT 'Date & Time of adding',
  `date_mod` datetime DEFAULT NULL COMMENT 'Date & Time of last modification',
  `access` enum('Public','Members Only','Personal','Squad Level','Platoon Level','Company Level','Battalion HQ','Officers Only','Military Police') NOT NULL COMMENT 'Access level',
  `subject` varchar(120) NOT NULL COMMENT 'Note''s subject',
  `content` text NOT NULL COMMENT 'Note''s text',
  PRIMARY KEY (`id`),
  KEY `Author ID` (`author_member_id`),
  KEY `Member ID` (`subject_member_id`),
  CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`subject_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `notes_ibfk_2` FOREIGN KEY (`author_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1874 DEFAULT CHARSET=utf8 COMMENT='Notes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `positions`
--

DROP TABLE IF EXISTS `positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `positions` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(250) NOT NULL COMMENT 'Name of position',
  `active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Is position active',
  `order` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `description` text NOT NULL,
  `access_level` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=197 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `positions`
--

LOCK TABLES `positions` WRITE;
/*!40000 ALTER TABLE `positions` DISABLE KEYS */;
INSERT INTO `positions` VALUES (196,'Rifleman',1,0,'',0);
/*!40000 ALTER TABLE `positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promotions` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Promotion ID',
  `member_id` mediumint(8) unsigned NOT NULL COMMENT 'ID of promoted member',
  `date` date NOT NULL COMMENT 'Date of promotion',
  `old_rank_id` mediumint(8) unsigned DEFAULT NULL,
  `new_rank_id` mediumint(8) unsigned NOT NULL COMMENT 'Rank after promotion',
  `forum_id` enum('1','2','3') DEFAULT NULL COMMENT 'ID of forum where promotion was posted',
  `topic_id` mediumint(8) NOT NULL COMMENT 'ID of forums topic ',
  PRIMARY KEY (`id`),
  KEY `User ID` (`member_id`),
  KEY `New Rank` (`new_rank_id`),
  KEY `Old Rank` (`old_rank_id`),
  CONSTRAINT `promotions_ibfk_5` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `promotions_ibfk_6` FOREIGN KEY (`old_rank_id`) REFERENCES `ranks` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `promotions_ibfk_7` FOREIGN KEY (`new_rank_id`) REFERENCES `ranks` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2821 DEFAULT CHARSET=utf8 COMMENT='V: Users <-> Rank';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qualifications`
--

DROP TABLE IF EXISTS `qualifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `qualifications` (
  `id` mediumint(8) NOT NULL AUTO_INCREMENT,
  `member_id` mediumint(8) unsigned NOT NULL,
  `standard_id` mediumint(8) unsigned NOT NULL,
  `date` date DEFAULT NULL,
  `author_member_id` mediumint(8) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `MemberStandard` (`member_id`,`standard_id`),
  KEY `User ID` (`member_id`),
  KEY `AIT Standard ID` (`standard_id`),
  KEY `Author` (`author_member_id`),
  CONSTRAINT `qualifications_ibfk_4` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `qualifications_ibfk_5` FOREIGN KEY (`standard_id`) REFERENCES `standards` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `qualifications_ibfk_6` FOREIGN KEY (`author_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=266513 DEFAULT CHARSET=utf8 COMMENT='V: Users <-> Standards';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qualifications`
--

LOCK TABLES `qualifications` WRITE;
/*!40000 ALTER TABLE `qualifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `qualifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ranks`
--

DROP TABLE IF EXISTS `ranks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ranks` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL DEFAULT '',
  `abbr` varchar(8) NOT NULL DEFAULT '',
  `grade` varchar(4) DEFAULT NULL,
  `filename` varchar(32) NOT NULL DEFAULT '',
  `order` smallint(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ranks`
--

LOCK TABLES `ranks` WRITE;
/*!40000 ALTER TABLE `ranks` DISABLE KEYS */;
INSERT INTO `ranks` VALUES (1,'Cadet','Rec.',NULL,'',1),(2,'Private','Pvt.','E-7','pvt',2),(3,'Private, First Class','PFC','E-6','pfc',3),(4,'Technician, 5th Grade','T/5','E-5','t5',4),(5,'Corporal','Cpl.','E-5','cpl',5),(6,'Technician, 4th Grade','T/4','E-4','t4',6),(7,'Sergeant','Sgt.','E-4','sgt',7),(8,'Technician, 3rd Grade','T/3','E-3','t3',8),(9,'Staff Sergeant','SSgt.','E-3','ssgt',9),(10,'Technical Sergeant','TSgt.','E-2','tsgt',10),(11,'First Sergeant','FSgt.','E-1','fsgt',11),(12,'Master Sergeant','MSgt.','E-1','msgt',12),(13,'Warrant Officer','W/O','W-1','wo',13),(14,'Chief Warrant Officer','CWO','W-2','cwo',14),(15,'Second Lieutenant','2Lt.','O-1','2lt',15),(16,'First Lieutenant','1Lt.','O-2','1lt',16),(17,'Captain','Cpt.','O-3','cpt',17),(18,'Major','Maj.','O-4','maj',18),(19,'Lieutenant Colonel','Lt. Col.','O-5','ltcol',19),(20,'Colonel','Col.','O-6','col',20);
/*!40000 ALTER TABLE `ranks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schedules` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Schedule ID',
  `unit_id` mediumint(8) unsigned NOT NULL COMMENT 'Unit ID',
  `type` varchar(40) NOT NULL COMMENT 'Type of event',
  `server_id` mediumint(8) unsigned NOT NULL COMMENT 'Server ID',
  `mandatory` tinyint(1) NOT NULL COMMENT 'Is mandatory?',
  `day_of_week` enum('0','1','2','3','4','5','6') NOT NULL COMMENT 'Day of week',
  `hour_of_day` time NOT NULL COMMENT 'Time of drill (UTC)',
  PRIMARY KEY (`id`),
  KEY `Unit ID` (`unit_id`),
  KEY `Server ID` (`server_id`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`server_id`) REFERENCES `servers` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8 COMMENT='Schedule of regular events';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servers`
--

DROP TABLE IF EXISTS `servers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `servers` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Server ID',
  `name` varchar(40) NOT NULL COMMENT 'Server Name',
  `abbr` varchar(4) NOT NULL COMMENT 'Abbreviation of Server Name',
  `address` varchar(15) NOT NULL COMMENT 'IP address of server',
  `port` mediumint(6) NOT NULL COMMENT 'Port of Server',
  `game` enum('DH','Arma 3','RS') NOT NULL DEFAULT 'DH' COMMENT 'Type of game ',
  `active` tinyint(1) NOT NULL COMMENT 'Is server active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COMMENT='List of 29th servers';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servers`
--

LOCK TABLES `servers` WRITE;
/*!40000 ALTER TABLE `servers` DISABLE KEYS */;
/*!40000 ALTER TABLE `servers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `standards`
--

DROP TABLE IF EXISTS `standards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `standards` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `weapon` enum('EIB','Rifle','Automatic Rifle','Machine Gun','Bazooka','SMG','Armor','Sniper','Mortar','SLT','RifleRS','SMGRS','AutoRifleRS','MachineGunRS','CombatEngineerRS','RifleARMA','AutoRifleARMA','CombatEngineerARMA','PilotARMA','ArmorARMA') NOT NULL DEFAULT 'Rifle',
  `game` enum('DH','RS','Arma 3','') NOT NULL DEFAULT 'DH',
  `badge` enum('N/A','Marksman','Sharpshooter','Expert') NOT NULL DEFAULT 'Sharpshooter',
  `description` text NOT NULL,
  `details` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=478 DEFAULT CHARSET=utf8 COMMENT='Standards required to achieve a badge for AIT';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `standards`
--

LOCK TABLES `standards` WRITE;
/*!40000 ALTER TABLE `standards` DISABLE KEYS */;
/*!40000 ALTER TABLE `standards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_permissions`
--

DROP TABLE IF EXISTS `unit_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit_permissions` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` mediumint(8) unsigned NOT NULL,
  `access_level` tinyint(1) NOT NULL DEFAULT '1',
  `ability_id` mediumint(9) unsigned NOT NULL COMMENT 'ID of ability',
  PRIMARY KEY (`id`),
  UNIQUE KEY `combo` (`unit_id`,`access_level`,`ability_id`),
  KEY `Unit ID` (`unit_id`),
  KEY `Ability ID` (`ability_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_permissions`
--

LOCK TABLES `unit_permissions` WRITE;
/*!40000 ALTER TABLE `unit_permissions` DISABLE KEYS */;
INSERT INTO `unit_permissions` VALUES (30,596,0,22);
/*!40000 ALTER TABLE `unit_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit_roles`
--

DROP TABLE IF EXISTS `unit_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unit_roles` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` mediumint(8) unsigned DEFAULT NULL,
  `access_level` tinyint(1) NOT NULL DEFAULT '0',
  `role_id` mediumint(8) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_id` (`unit_id`,`role_id`),
  CONSTRAINT `unit_roles_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit_roles`
--

LOCK TABLES `unit_roles` WRITE;
/*!40000 ALTER TABLE `unit_roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `unit_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `units` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `abbr` varchar(32) NOT NULL,
  `old_path` varchar(32) NOT NULL,
  `path` varchar(32) NOT NULL,
  `order` tinyint(4) NOT NULL DEFAULT '0',
  `game` enum('DH','RS','Arma 3','') DEFAULT NULL COMMENT 'Game ',
  `timezone` varchar(3) NOT NULL,
  `class` enum('Combat','Staff','Training') NOT NULL DEFAULT 'Training' COMMENT 'Type of unit',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=597 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units`
--

LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;
INSERT INTO `units` VALUES (596,'Battalion Headquarters','Bn HQ','','',1,NULL,'','Combat',1);
/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usertracking`
--

DROP TABLE IF EXISTS `usertracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usertracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(100) NOT NULL,
  `user_identifier` varchar(255) NOT NULL,
  `request_uri` text NOT NULL,
  `request_method` varchar(16) NOT NULL,
  `datetime` datetime NOT NULL,
  `client_ip` varchar(50) NOT NULL,
  `client_user_agent` text NOT NULL,
  `referer_page` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usertracking`
--

LOCK TABLES `usertracking` WRITE;
/*!40000 ALTER TABLE `usertracking` DISABLE KEYS */;
INSERT INTO `usertracking` VALUES (121,'1c3567237e08606330619d3c4d57f78e','1','/personnel-api/index.php/admin/units/insert','POST','2014-11-30 18:29:43','73.188.53.21','Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36','http://dev.timwis.com/personnel-api/index.php/admin/units/add'),(122,'1c3567237e08606330619d3c4d57f78e','1','/personnel-api/index.php/admin/positions/insert','POST','2014-11-30 18:30:14','73.188.53.21','Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36','http://dev.timwis.com/personnel-api/index.php/admin/positions/add'),(123,'1c3567237e08606330619d3c4d57f78e','1','/personnel-api/index.php/admin/unit_permissions/insert','POST','2014-11-30 18:30:46','73.188.53.21','Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36','http://dev.timwis.com/personnel-api/index.php/admin/unit_permissions/add'),(124,'1c3567237e08606330619d3c4d57f78e','1','/personnel-api/index.php/admin/class_permissions/update/4','POST','2014-11-30 18:30:57','73.188.53.21','Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36','http://dev.timwis.com/personnel-api/index.php/admin/class_permissions/edit/4');
/*!40000 ALTER TABLE `usertracking` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-11-30 20:30:09
