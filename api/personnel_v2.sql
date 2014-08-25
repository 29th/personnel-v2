-- phpMyAdmin SQL Dump
-- version 3.5.8.1deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Aug 25, 2014 at 01:36 AM
-- Server version: 5.5.32-0ubuntu0.13.04.1
-- PHP Version: 5.4.9-4ubuntu2.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `personnel_v2`
--

-- --------------------------------------------------------

--
-- Table structure for table `abilities`
--

CREATE TABLE IF NOT EXISTS `abilities` (
  `id` mediumint(9) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Ability''s ID',
  `name` varchar(40) NOT NULL COMMENT 'Ability''s Name',
  `abbr` varchar(24) NOT NULL COMMENT 'Ability''s Abbreviation',
  `description` text NOT NULL COMMENT 'Detailed description of Ability',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='List of abilities' AUTO_INCREMENT=31 ;

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE IF NOT EXISTS `assignments` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `member_id` mediumint(8) unsigned NOT NULL COMMENT 'User ID',
  `unit_id` mediumint(8) unsigned NOT NULL,
  `position` varchar(64) NOT NULL,
  `position_id` mediumint(8) unsigned DEFAULT '35',
  `access_level` tinyint(1) NOT NULL DEFAULT '0',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Unit ID` (`unit_id`),
  KEY `position_id` (`position_id`),
  KEY `Member ID` (`member_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=10339 ;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE IF NOT EXISTS `attendance` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Attendance log ID',
  `event_id` mediumint(8) unsigned NOT NULL COMMENT 'Event ID',
  `member_id` mediumint(8) unsigned NOT NULL COMMENT 'Member ID',
  `attended` tinyint(1) DEFAULT NULL COMMENT 'Has member attended',
  `excused` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Has member posted absence',
  PRIMARY KEY (`id`),
  UNIQUE KEY `event and member` (`event_id`,`member_id`),
  KEY `Event ID` (`event_id`),
  KEY `User ID` (`member_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Log of attendance' AUTO_INCREMENT=180624 ;

-- --------------------------------------------------------

--
-- Table structure for table `awardings`
--

CREATE TABLE IF NOT EXISTS `awardings` (
  `id` mediumint(8) NOT NULL AUTO_INCREMENT,
  `member_id` mediumint(8) unsigned NOT NULL,
  `date` date NOT NULL,
  `award_id` mediumint(8) unsigned NOT NULL,
  `forum_id` enum('1','2','3') DEFAULT NULL COMMENT 'Which forums',
  `topic_id` mediumint(8) NOT NULL COMMENT 'Negative means old forums',
  PRIMARY KEY (`id`),
  KEY `User ID` (`member_id`),
  KEY `Award ID` (`award_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=9672 ;

-- --------------------------------------------------------

--
-- Table structure for table `awards`
--

CREATE TABLE IF NOT EXISTS `awards` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(16) NOT NULL DEFAULT '',
  `title` varchar(255) NOT NULL DEFAULT '',
  `description` text NOT NULL,
  `game` enum('N/A','DH','DOD','I44','RS') NOT NULL,
  `image` varchar(255) NOT NULL DEFAULT '',
  `thumbnail` varchar(255) NOT NULL DEFAULT '',
  `bar` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=75 ;

-- --------------------------------------------------------

--
-- Table structure for table `class_permissions`
--

CREATE TABLE IF NOT EXISTS `class_permissions` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `class` enum('Combat','Staff','Training') DEFAULT NULL COMMENT 'Units table class',
  `ability_id` mediumint(8) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ability_id` (`ability_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- Table structure for table `class_roles`
--

CREATE TABLE IF NOT EXISTS `class_roles` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `class` enum('Combat','Staff','Training') CHARACTER SET utf8 DEFAULT NULL,
  `role_id` mediumint(8) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE IF NOT EXISTS `countries` (
  `id` smallint(4) NOT NULL AUTO_INCREMENT COMMENT 'Country ID',
  `abbr` char(2) NOT NULL,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=240 ;

-- --------------------------------------------------------

--
-- Table structure for table `demerits`
--

CREATE TABLE IF NOT EXISTS `demerits` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `member_id` mediumint(8) unsigned NOT NULL,
  `author_member_id` mediumint(8) unsigned DEFAULT NULL,
  `forum_id` enum('1','2','3') DEFAULT NULL COMMENT 'Which forums',
  `topic_id` mediumint(8) NOT NULL,
  `date` date NOT NULL,
  `reason` text,
  PRIMARY KEY (`id`),
  KEY `User ID` (`member_id`),
  KEY `Author ID` (`author_member_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=134 ;

-- --------------------------------------------------------

--
-- Table structure for table `discharges`
--

CREATE TABLE IF NOT EXISTS `discharges` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Discharge''s ID',
  `member_id` mediumint(8) unsigned NOT NULL COMMENT 'ID of discharged member ',
  `date` date NOT NULL COMMENT 'Date of discharge',
  `type` enum('Honorable','General','Dishonorable') NOT NULL DEFAULT 'General' COMMENT 'Type of discharge',
  `reason` text NOT NULL COMMENT 'Description of discharging reason',
  `was_reversed` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Was the discharge reversed?',
  `forum_id` enum('1','2','3') DEFAULT NULL COMMENT 'Which forums',
  `topic_id` varchar(20) NOT NULL COMMENT 'ID of forum''s topic',
  PRIMARY KEY (`id`),
  KEY `Member ID` (`member_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='List of members'' discharges' AUTO_INCREMENT=1191 ;

-- --------------------------------------------------------

--
-- Table structure for table `enlistments`
--

CREATE TABLE IF NOT EXISTS `enlistments` (
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
  `age` smallint(6) NOT NULL COMMENT 'Recruit''s Age',
  `country_id` smallint(4) DEFAULT NULL COMMENT 'Country ID',
  `timezone` enum('EST','GMT','Either','Neither') DEFAULT NULL COMMENT 'Prefered time zone',
  `game` enum('DH','RS','Arma 3') DEFAULT NULL COMMENT 'Chosen game',
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
  KEY `Unit ID` (`unit_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Enlistments into 29th ID' AUTO_INCREMENT=3722 ;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE IF NOT EXISTS `events` (
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
  KEY `Server ID` (`server_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=13500 ;

-- --------------------------------------------------------

--
-- Table structure for table `finances`
--

CREATE TABLE IF NOT EXISTS `finances` (
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
  KEY `Member ID` (`member_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Finances Ledger' AUTO_INCREMENT=1608 ;

-- --------------------------------------------------------

--
-- Table structure for table `loa`
--

CREATE TABLE IF NOT EXISTS `loa` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'LOA''s ID',
  `member_id` mediumint(8) unsigned NOT NULL COMMENT 'Member''s ID',
  `posting_date` datetime NOT NULL COMMENT 'Date of posting',
  `start_date` date NOT NULL COMMENT 'Planned start date',
  `end_date` date NOT NULL COMMENT 'Planned end date',
  `return_date` date DEFAULT NULL COMMENT 'Date of returning',
  `reason` text NOT NULL COMMENT 'Reason for LOA',
  `is_available` text COMMENT 'Is member availaible during LOA',
  PRIMARY KEY (`id`),
  KEY `Member ID` (`member_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Leaves of Absence' AUTO_INCREMENT=2189 ;

-- --------------------------------------------------------

--
-- Table structure for table `log`
--

CREATE TABLE IF NOT EXISTS `log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Log record ID',
  `table` varchar(20) NOT NULL COMMENT 'Name of table',
  `table_record_id` mediumint(8) unsigned NOT NULL COMMENT 'ID of table''s record',
  `action` enum('Add','Edit','Delete') NOT NULL DEFAULT 'Add' COMMENT 'Action taken',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Time of action',
  `member_id` mediumint(8) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `member_id` (`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Log of actions' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE IF NOT EXISTS `members` (
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
  `forum_member_id` mediumint(8) unsigned DEFAULT NULL COMMENT 'Member ID on forums',
  `oldforum_member_id` mediumint(8) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Assignment` (`primary_assignment_id`),
  KEY `Rank` (`rank_id`),
  KEY `CountryID` (`country_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=83801 ;

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE IF NOT EXISTS `notes` (
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
  KEY `Member ID` (`subject_member_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Notes' AUTO_INCREMENT=1656 ;

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE IF NOT EXISTS `positions` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `name` varchar(250) NOT NULL COMMENT 'Name of position',
  `active` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Is position active',
  `order` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `description` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=170 ;

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE IF NOT EXISTS `promotions` (
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
  KEY `Old Rank` (`old_rank_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='V: Users <-> Rank' AUTO_INCREMENT=2510 ;

-- --------------------------------------------------------

--
-- Table structure for table `qualifications`
--

CREATE TABLE IF NOT EXISTS `qualifications` (
  `id` mediumint(8) NOT NULL AUTO_INCREMENT,
  `member_id` mediumint(8) unsigned NOT NULL,
  `standard_id` mediumint(8) unsigned NOT NULL,
  `date` date DEFAULT NULL,
  `author_member_id` mediumint(8) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `MemberStandard` (`member_id`,`standard_id`),
  KEY `User ID` (`member_id`),
  KEY `AIT Standard ID` (`standard_id`),
  KEY `Author` (`author_member_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='V: Users <-> Standards' AUTO_INCREMENT=24405 ;

-- --------------------------------------------------------

--
-- Table structure for table `ranks`
--

CREATE TABLE IF NOT EXISTS `ranks` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(32) NOT NULL DEFAULT '',
  `abbr` varchar(8) NOT NULL DEFAULT '',
  `grade` varchar(4) DEFAULT NULL,
  `filename` varchar(32) NOT NULL DEFAULT '',
  `order` smallint(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=21 ;

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE IF NOT EXISTS `schedules` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Schedule ID',
  `unit_id` mediumint(8) unsigned NOT NULL COMMENT 'Unit ID',
  `type` varchar(40) NOT NULL COMMENT 'Type of event',
  `server_id` mediumint(8) unsigned NOT NULL COMMENT 'Server ID',
  `mandatory` tinyint(1) NOT NULL COMMENT 'Is mandatory?',
  `day_of_week` enum('0','1','2','3','4','5','6') NOT NULL COMMENT 'Day of week',
  `hour_of_day` time NOT NULL COMMENT 'Time of drill (UTC)',
  PRIMARY KEY (`id`),
  KEY `Unit ID` (`unit_id`),
  KEY `Server ID` (`server_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Schedule of regular events' AUTO_INCREMENT=31 ;

-- --------------------------------------------------------

--
-- Table structure for table `servers`
--

CREATE TABLE IF NOT EXISTS `servers` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Server ID',
  `name` varchar(40) NOT NULL COMMENT 'Server Name',
  `abbr` varchar(4) NOT NULL COMMENT 'Abbreviation of Server Name',
  `address` varchar(15) NOT NULL COMMENT 'IP address of server',
  `port` mediumint(6) NOT NULL COMMENT 'Port of Server',
  `game` enum('DH','I44','RS') NOT NULL DEFAULT 'DH' COMMENT 'Type of game ',
  `active` tinyint(1) NOT NULL COMMENT 'Is server active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='List of 29th servers' AUTO_INCREMENT=7 ;

-- --------------------------------------------------------

--
-- Table structure for table `standards`
--

CREATE TABLE IF NOT EXISTS `standards` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `weapon` enum('EIB','Rifle','Automatic Rifle','Machine Gun','Bazooka','SMG','Armor','Sniper','Mortar','SLT') NOT NULL DEFAULT 'Rifle',
  `badge` enum('N/A','Marksman','Sharpshooter','Expert') NOT NULL DEFAULT 'Sharpshooter',
  `description` text NOT NULL,
  `details` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='Standards required to achieve a badge for AIT' AUTO_INCREMENT=236 ;

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE IF NOT EXISTS `units` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL,
  `abbr` varchar(32) NOT NULL,
  `old_path` varchar(32) NOT NULL,
  `path` varchar(32) NOT NULL,
  `order` tinyint(4) NOT NULL DEFAULT '0',
  `timezone` varchar(3) NOT NULL,
  `class` enum('Combat','Staff','Training') NOT NULL DEFAULT 'Training' COMMENT 'Type of unit',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=541 ;

-- --------------------------------------------------------

--
-- Table structure for table `unit_permissions`
--

CREATE TABLE IF NOT EXISTS `unit_permissions` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` mediumint(8) unsigned NOT NULL,
  `access_level` tinyint(1) NOT NULL DEFAULT '1',
  `ability_id` mediumint(9) unsigned NOT NULL COMMENT 'ID of ability',
  PRIMARY KEY (`id`),
  UNIQUE KEY `combo` (`unit_id`,`access_level`,`ability_id`),
  KEY `Unit ID` (`unit_id`),
  KEY `Ability ID` (`ability_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=28 ;

-- --------------------------------------------------------

--
-- Table structure for table `unit_roles`
--

CREATE TABLE IF NOT EXISTS `unit_roles` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `unit_id` mediumint(8) unsigned DEFAULT NULL,
  `access_level` tinyint(1) NOT NULL DEFAULT '0',
  `role_id` mediumint(8) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_id` (`unit_id`,`role_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=95 ;

-- --------------------------------------------------------

--
-- Table structure for table `usertracking`
--

CREATE TABLE IF NOT EXISTS `usertracking` (
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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=62 ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_3` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `assignments_ibfk_4` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `awardings`
--
ALTER TABLE `awardings`
  ADD CONSTRAINT `awardings_ibfk_2` FOREIGN KEY (`award_id`) REFERENCES `awards` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `awardings_ibfk_3` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `class_permissions`
--
ALTER TABLE `class_permissions`
  ADD CONSTRAINT `class_permissions_ibfk_1` FOREIGN KEY (`ability_id`) REFERENCES `abilities` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `demerits`
--
ALTER TABLE `demerits`
  ADD CONSTRAINT `demerits_ibfk_3` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `demerits_ibfk_4` FOREIGN KEY (`author_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `discharges`
--
ALTER TABLE `discharges`
  ADD CONSTRAINT `discharges_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `enlistments`
--
ALTER TABLE `enlistments`
  ADD CONSTRAINT `enlistments_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `enlistments_ibfk_2` FOREIGN KEY (`liaison_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `enlistments_ibfk_5` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `enlistments_ibfk_6` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `enlistments_ibfk_7` FOREIGN KEY (`recruiter_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_3` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `events_ibfk_4` FOREIGN KEY (`server_id`) REFERENCES `servers` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `events_ibfk_5` FOREIGN KEY (`reporter_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `finances`
--
ALTER TABLE `finances`
  ADD CONSTRAINT `finances_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `loa`
--
ALTER TABLE `loa`
  ADD CONSTRAINT `loa_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `log`
--
ALTER TABLE `log`
  ADD CONSTRAINT `log_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `members_ibfk_2` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `members_ibfk_3` FOREIGN KEY (`rank_id`) REFERENCES `ranks` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`subject_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `notes_ibfk_2` FOREIGN KEY (`author_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `promotions`
--
ALTER TABLE `promotions`
  ADD CONSTRAINT `promotions_ibfk_5` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `promotions_ibfk_6` FOREIGN KEY (`old_rank_id`) REFERENCES `ranks` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `promotions_ibfk_7` FOREIGN KEY (`new_rank_id`) REFERENCES `ranks` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `qualifications`
--
ALTER TABLE `qualifications`
  ADD CONSTRAINT `qualifications_ibfk_4` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `qualifications_ibfk_5` FOREIGN KEY (`standard_id`) REFERENCES `standards` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `qualifications_ibfk_6` FOREIGN KEY (`author_member_id`) REFERENCES `members` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`server_id`) REFERENCES `servers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `unit_roles`
--
ALTER TABLE `unit_roles`
  ADD CONSTRAINT `unit_roles_ibfk_1` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
