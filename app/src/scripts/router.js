var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Marionette = require("backbone.marionette"),
  Handlebars = require("hbsfy/runtime"),
  Q = require("q"),
  util = require("./util"),
  Assignment = require("./models/assignment"),
  Banlog = require("./models/banlog"),
  Demerit = require("./models/demerit"),
  Discharge = require("./models/discharge"),
  ELOA = require("./models/eloa"),
  Enlistment = require("./models/enlistment"),
  Event = require("./models/event"),
  Member = require("./models/member"),
  Note = require("./models/note"),
  Pass = require("./models/pass"),
  TP = require("./models/tp"),
  User = require("./models/user"),
  Assignments = require("./collections/assignments"),
  Attendance = require("./collections/attendance"),
  AttendancePercentages = require("./collections/attendance_percentages"),
  Awardings = require("./collections/awardings"),
  Banlogs = require("./collections/banlogs"),
  Demerits = require("./collections/demerits"),
  Discharges = require("./collections/discharges"),
  ELOAs = require("./collections/eloas"),
  MemberSearch = require("./collections/membersearch"),
  Enlistments = require("./collections/enlistments"),
  Events = require("./collections/events"),
  Finances = require("./collections/finances"),
  FinancesBalance = require("./collections/finances_balance"),
  MemberAwols = require("./collections/member_awols"),
  MemberEnlistments = require("./collections/member_enlistments"),
  Notes = require("./collections/notes"),
  Permissions = require("./collections/permissions"),
  Positions = require("./collections/positions"),
  Promotions = require("./collections/promotions"),
  Qualifications = require("./collections/qualifications"),
  Passes = require("./collections/passes"),
  TPs = require("./collections/tps"),
  Recruits = require("./collections/recruits"),
  Servers = require("./collections/servers"),
  Standards = require("./collections/standards"),
  UnitAwols = require("./collections/unit_awols"),
  UnitAlerts = require("./collections/unit_alerts"),
  UnitStats = require("./collections/unit_stats"),
  Units = require("./collections/units"),
  AARView = require("./views/aar"),
  AssignmentEditView = require("./views/assignment_edit"),
  AssociateView = require("./views/associate"),
  BanlogsView = require("./views/banlogs"),
  BanlogView = require("./views/banlog"),
  BanlogEditView = require("./views/banlog_edit"),
  CalendarView = require("./views/calendar"),
  DemeritView = require("./views/demerit"),
  DischargeView = require("./views/discharge"),
  ELOAsView = require("./views/eloas"),
  MemberSearchView = require("./views/membersearch"),
  EnlistmentEditView = require("./views/enlistment_edit"),
  EnlistmentProcessView = require("./views/enlistment_process"),
  EnlistmentsView = require("./views/enlistments"),
  EnlistmentView = require("./views/enlistment"),
  EventView = require("./views/event"),
  EventEditView = require("./views/event_edit"),
  FinancesView = require("./views/finances"),
  FlashView = require("./views/flash"),
  MemberAdminView = require("./views/member_admin"),
  MemberAttendanceView = require("./views/member_attendance"),
  MemberDischargeView = require("./views/member_discharge"),
  MemberEditView = require("./views/member_edit"),
  MemberELOAsView = require("./views/member_eloas"),
  MemberELOAView = require("./views/member_eloa"),
  MemberNotesView = require("./views/member_notes"),
  MemberPassesView = require("./views/member_passes"),
  MemberProfileView = require("./views/member_profile"),
  MemberQualificationsView = require("./views/member_qualifications"),
  MemberRecruitsView = require("./views/member_recruits"),
  MemberReprimandsView = require("./views/member_reprimands"),
  MemberView = require("./views/member"),
  NavView = require("./views/nav"),
  NoteView = require("./views/note"),
  NoteEditView = require("./views/note_edit"),
  PassesView = require("./views/passes"),
  TPView = require("./views/tp"),
  TPsView = require("./views/tps"),
  RosterView = require("./views/roster"),
  ServiceRecordView = require("./views/service_record"),
  UnitActivityView = require("./views/unit_activity"),
  UnitAlertsView = require("./views/unit_alerts"),
  UnitStatsView = require("./views/unit_stats"),
  UnitAttendanceView = require("./views/unit_attendance"),
  UnitAwolsView = require("./views/unit_awols"),
  UnitRecruitsView = require("./views/unit_recruits"),
  UnitView = require("./views/unit");
require("./helpers/custom");
require("bootstrap");
require("moment");
require("backbone.validation");
require("./validation.config");

  "use strict";

  module.exports = Backbone.Router.extend({
      routes: {
          "": "roster",
          //"assignments"
          "assignments/:id/edit": "assignment_edit",
          "associate": "associate",
          "banlogs/add": "banlog_add",
          "banlogs/:id": "banlog",
          "banlogs": "banlogs",
          "calendar": "calendar",
          "demerits/:id": "demerit",
          "discharges/:id": "discharge",
          "eloas": "eloas",
          "membersearch": "membersearch",
          "enlistments/:id/edit": "enlistment_edit",
          "enlistments/:id/process": "enlistment_process",
          "enlistments/:id": "enlistment",
          "enlistments": "enlistments",
          "enlist": "enlistment_add",
          "events/add": "event_edit",
          "events/:id": "event",
          "events/:id/aar": "aar",
          "finances": "finances",
          "members/:id/assign": "assignment_add",
          "members/:id/*path": "member",
          "members/:id": "member",
          "notes/add": "note_add",
          "notes/:id/edit": "note_edit",
          "notes/:id": "note",
          "passes": "passes",
          "tps/:id": "tp",
          "tps": "tps",
          "recruits": "recruits",
          "units/:filter/*path": "unit",
          "units/:filter": "unit",
      },
      promises: {},
      initialize: function (options) {
          options = options || {};
          this.app = options.app || new Marionette.Application();
          var self = this;
          
          // Fetch user if it doesn't exist
          if( ! this.user) {
              this.user = new User();
              this.promises.user = this.user.fetch(); // Allow this promise to delay logic elsewhere
          }
          
          // Fetch permissions if they haven't been fetched yet
          if( ! this.permissions) {
              this.permissions = new Permissions();
              this.permissions.fetch({reset: true});
          }
          
          // Fetch units if they haven't been fetched yet
          if( ! this.units) {
              this.units = new Units(null, {
                  children: true,
//                  members: true,
                  flat: true
              });
              this.units.fetch({reset: true});
          }
          
          var navView = new NavView({
              model: this.user,
              permissions: this.permissions,
              units: this.units
          });
          this.app.navRegion.show(navView);
          //vent.trigger("fetch", userFetch);
      },
      showView: function (view) {
          this.app.mainRegion.show(view);
          document.title = view.title !== undefined && view.title ? view.title : $("title").text();
          util.scrollToTop();
      },

      aar: function (id) {
          var self = this,
              promises = [],
              event = new Event({
                  id: id
              }),
              expectedUnits = new Units(null, {
                  children: true,
                  members: true,
                  active: true,
                  distinct: true
              }),
              attendance = new Attendance(null, {
                  id: id
              }),
              aarView = new AARView({
                  model: event
              }),
              rosterView = new RosterView({
                  collection: expectedUnits,
                  attendance: attendance
              });

          // Watch fetch event to show loading indicator (AAR)
          event
/*.on("request", function() { util.loading(true); })
              .on("sync", function() { util.loading(false); })*/
          .on("error", function (model, xhr) {
              self.flash(xhr.responseJSON.error || "", "error"); /* util.loading(false);*/
          });

          this.app.navRegion.currentView.setHighlight("calendar");
          promises.push(event.fetch());

          //util.loading(true);
          $.when.apply($, promises).done(function () {
              // Need the event fetch to complete before we know the unit. Now get the expected attendees
              expectedUnits.filter = event.get("unit").id;
              if (event.get("attendance").length) attendance.add(event.get("attendance"));
              promises = [];
              promises.push(expectedUnits.fetch());
              $.when.apply($, promises).done(function () {
                  //util.loading(false);
                  self.showView(aarView);
                  aarView.attendanceRegion.show(rosterView);
              });
          });
      },
      assignment_add: function (member_id) {
          this.assignment_edit(null, member_id);
      },
      assignment_edit: function (id, member_id) {
          var self = this,
              promises = [],
              assignment = new Assignment(),
              units = new Units(null, {
                  children: true,
                  members: true,
                  flat: true
              }),
              positions = new Positions(null, {
                  order: "name"
              }),
              view = new AssignmentEditView({
                  model: assignment,
                  units: units,
                  positions: positions
              });

          this.app.navRegion.currentView.setHighlight("roster");
          promises.push(units.fetch(), positions.fetch());
          
          if(id) {
              assignment.id = id;
              promises.push(assignment.fetch());
          }
          else {
              view.assignments = new Assignments(null, {
                  member_id: member_id,
                  current: true
              });
              promises.push(view.assignments.fetch());
          }
          if(member_id) {
              assignment.set("member", {id: member_id});
          }

          $.when.apply($, promises).done(function () {
              self.showView(view);
          });
      },
      associate: function() {
          var associateView = new AssociateView({model: this.user});
          this.showView(associateView);
      },
      banlog: function (id) {
          var self = this,
              promises = [],
              banlog = new Banlog({
                  id: id
              })
              
          var banlogView = new BanlogView({
              model: banlog
          });

          this.app.navRegion.currentView.setHighlight("banlogs");
          promises.push(banlog.fetch());

          //util.loading(true);
          $.when.apply($, promises).done(function () {
              self.showView(banlogView);
          });
      },
      banlog_add: function() {
          var self = this,
              promises = [],
              banlog = new Banlog({
                  isnew:true
              }),
              units = new Units(null, {
                  children: true,
                  members: true,
                  flat: true,
                  distinct: true
              }),
              banlogEditView = new BanlogEditView({
                  units: units,
                  model: banlog
              });

          this.app.navRegion.currentView.setHighlight("banlogs");
          
          promises.push(banlog.fetch(),units.fetch());

          $.when.apply($, promises).done(function(user) {
              // Must be logged in
              if(self.user.get("forum_member_id") === undefined) {
                  // not logged in
                  self.showView(new FlashView({msg: "You must be logged in to view this page", type: "error"}));
              } else {
                  // Success - logged in and not already a member
                  self.showView(banlogEditView);
              }
          });
      },
      banlogs: function () {
          var self = this,
              promises = [],
              banlogs = new Banlogs(),
              banlogsView = new BanlogsView({
                  permissions: this.permissions,
                  collection: banlogs
              });

          this.app.navRegion.currentView.setHighlight("banlogs");
          promises.push(banlogs.fetch());

          //util.loading(true);
          $.when.apply($, promises).done(function () {
              //util.loading(false);
              self.showView(banlogsView);
          });
      },
      calendar: function (id, member_id) {
          var self = this,
              promises = [],
              events = new Events(),
              userAssignments = new Assignments(null, {
                  current: true
              }) // Omit member_id to get user's assignments
              ,
              calendarView = new CalendarView({
                  collection: events,
                  permissions: this.permissions,
                  userAssignments: userAssignments
              });

          this.app.navRegion.currentView.setHighlight("calendar");
          promises.push(userAssignments.fetch());

          //util.loading(true);
          $.when.apply($, promises).done(function () {
              //util.loading(false);
              self.showView(calendarView);
          });
      },
      demerit: function(id) {
          var self = this,
              promises = [],
              demerit = new Demerit({
                  id: id
              }),
              demeritView = new DemeritView({
                  model: demerit
              });
              this.app.navRegion.currentView.setHighlight("roster");
              promises.push(demerit.fetch());
              
              $.when.apply($, promises).done(function() {
                  self.showView(demeritView);
              });
      },
      discharge: function(id) {
          var self = this,
              promises = [],
              discharge = new Discharge({
                  id: id
              }),
              dischargeView = new DischargeView({
                  model: discharge
              });
              
              this.app.navRegion.currentView.setHighlight("roster");
              promises.push(discharge.fetch());
              
              $.when.apply($, promises).done(function() {
                  self.showView(dischargeView);
              });
      },
      eloas: function() {
          var self = this,
              promises = [],
              eloas = new ELOAs();

          var eloasView = new ELOAsView({
              collection: eloas
          });

          promises.push(eloas.fetch());

          $.when.apply($, promises).done(function () {
              self.showView(eloasView);
          });
      },
      membersearch: function() {
          var self = this,
              promises = [],
              membersearch = new MemberSearch();

          var membersearchView = new MemberSearchView({
              collection: membersearch
          });

          promises.push(membersearch.fetch());

          $.when.apply($, promises).done(function () {
              self.showView(membersearchView);
          });
      },
      tp: function (id) {
          var self = this,
              promises = [],
              tp = new TP({
                  id: id
              })
              
          var tpView = new TPView({
              model: tp
          });

          this.app.navRegion.currentView.setHighlight("tps");
          promises.push(tp.fetch());

          //util.loading(true);
          $.when.apply($, promises).done(function () {
              self.showView(tpView);
          });
      },
      tps: function() {
          var self = this,
              promises = [],
              tps = new TPs();

          var tpsView = new TPsView({
              collection: tps
          });

          promises.push(tps.fetch());

          $.when.apply($, promises).done(function () {
              self.showView(tpsView);
          });
      },
      passes: function() {
          var self = this,
              promises = [],
              passes = new Passes();

          var passesView = new PassesView({
              collection: passes
          });

          promises.push(passes.fetch());

          $.when.apply($, promises).done(function () {
              self.showView(passesView);
          });
      },
      enlistment: function (id) {
          var self = this,
              promises = [],
              enlistment = new Enlistment({
                  id: id
              }),
              memberPermissions = new Permissions(); // User permissions on member being viewed
              
          // Fetch permissions if they haven't been fetched yet
          /*if (!this.permissions) {
              this.permissions = new Permissions();
              promises.push(this.permissions.fetch());
          }*/

          var enlistmentView = new EnlistmentView({
              model: enlistment,
              permissions: this.permissions,
              memberPermissions: memberPermissions
          });

          this.app.navRegion.currentView.setHighlight("enlistments");
          promises.push(enlistment.fetch());

          //util.loading(true);
          $.when.apply($, promises).done(function () {
              memberPermissions.member_id = enlistment.get("member").id;
              promises = [];
              promises.push(memberPermissions.fetch());
              $.when.apply($, promises).done(function () {
                  //util.loading(false);
                  self.showView(enlistmentView);
              });
          });
      },
      enlistments: function () {
          var self = this,
              promises = [],
              enlistments = new Enlistments(),
              enlistmentsView = new EnlistmentsView({
                  permissions: this.permissions,
                  collection: enlistments
              });

          this.app.navRegion.currentView.setHighlight("enlistments");
          promises.push(enlistments.fetch());

          //util.loading(true);
          $.when.apply($, promises).done(function () {
              //util.loading(false);
              self.showView(enlistmentsView);
          });
      },
      enlistment_add: function() {
          var self = this,
              promises = [],
              enlistment = new Enlistment(),
              enlistmentEditView = new EnlistmentEditView({
                  model: enlistment
              });

          this.app.navRegion.currentView.setHighlight("enlistments");
          
          // User must be logged in and not already a member
          $.when(this.promises.user).done(function(user) {
              // Must be logged in
              if(self.user.get("forum_member_id") === undefined) {
                  // not logged in
                  self.showView(new FlashView({msg: "You must be logged in to view this page", type: "error"}));
              } else if(self.user.get("classes").length) {
                  // already a member
                  self.showView(new FlashView({msg: "You are already a member", type: "error"}));
              } else {
                  // Success - logged in and not already a member
                  self.showView(enlistmentEditView);
              }
          });
      },
      enlistment_edit: function (id) {
          var self = this,
              promises = [],
              enlistment = new Enlistment({id: id}),
              enlistmentEditView = new EnlistmentEditView({
                  model: enlistment
              });

          this.app.navRegion.currentView.setHighlight("enlistments");
          promises.push(enlistment.fetch());

          //util.loading(true);
          $.when.apply($, promises).done(function () {
              //util.loading(false);
              self.showView(enlistmentEditView);
          });
      },
      enlistment_process: function (id) {
          var self = this,
              promises = [],
              enlistment = new Enlistment({
                  id: id
              }),
              tps = new Units(null, { 
                  filter: "TPs",
                  children: true,
                  inactive: false // This was set to true prior to 2014-11-27, not sure why
              }),
/*
              tps = new TPs(null, { 
                  future: true // This was set to true prior to 2014-11-27, not sure why
              }),
*/
              // Units contains the members for recruiter selection
              units = new Units(null, {
                  children: true,
                  members: true,
                  flat: true,
                  order: 'name',
                  distinct: true
              }),
              lh = new Units(null, {
                  children: false,
                  members: true,
                  filter: "LH",
                  order: 'name',
                  flat: true,
                  position: 'liaison',
                  distinct: true
              }),
              enlistmentProcessView = new EnlistmentProcessView({
                  model: enlistment,
                  tps: tps,
                  lh: lh,
                  units: units,
                  permissions: this.permissions
              });

          this.app.navRegion.currentView.setHighlight("enlistments");
          promises.push(enlistment.fetch(), tps.fetch(), lh.fetch(), units.fetch());

          $.when.apply($, promises).done(function () {
              self.showView(enlistmentProcessView);
          });
      },
      event: function (id) {
          var self = this,
              promises = [],
              userAssignments = new Assignments(null, {
                  current: true
              }) // Omit member_id to get user's assignments
              ,
              event = new Event({
                  id: id
              }),
              attendance = new Attendance(null, {
                  id: id
              }),
              unitPermissions = new Permissions(); // User permissions on member being viewed
          // Fetch permissions if they haven't been fetched yet
          /*if (!this.permissions) {
              this.permissions = new Permissions();
              promises.push(this.permissions.fetch());
          }*/

          // Views
          var eventView = new EventView({
              model: event,
              collection: attendance,
              user: this.user,
              userAssignments: userAssignments,
              permissions: this.permissions,
              unitPermissions: unitPermissions
          });

          // Watch fetch event to show loading indicator (LOA)
/*eventAttendance.on("request", function() { util.loading(true); })
              .on("sync", function() { util.loading(false); })
              .on("error", function(model, xhr) { self.flash(xhr.responseJSON.error || "", "error"); util.loading(false); });*/

          this.app.navRegion.currentView.setHighlight("calendar");
          promises.push(event.fetch(), userAssignments.fetch());

          //util.loading(true);
          $.when.apply($, promises).done(function () {
              if (event.get("attendance").length) attendance.add(event.get("attendance"));
              unitPermissions.unit_id = event.get("unit").id;
              promises = [];
              promises.push(unitPermissions.fetch());
              $.when.apply($, promises).done(function () {
                  //util.loading(false);
                  self.showView(eventView);
              });
          });
      },
      event_edit: function() {
          var self = this,
              promises = [],
              event = new Event(),
              servers = new Servers(),
              units = new Units(null, {
                  children: true,
                  members: true,
                  flat: true
              }),
              eventEditView = new EventEditView({
                  model: event,
                  servers: servers,
                  units: units
              });
          promises.push(servers.fetch(), units.fetch());
              
          $.when.apply($, promises).done(function() {
              self.showView(eventEditView);
          });
      },
      finances: function() {
          var self = this,
              promises = [],
              finances = new Finances(),
              balance  = new FinancesBalance();

          var financesView = new FinancesView({
              collection: finances,
              balance:    balance
          });

          promises.push(balance.fetch());
          //this.app.navRegion.currentView.setHighlight("finances");
          promises.push(finances.fetch());

          $.when.apply($, promises).done(function () {
              self.showView(financesView);
          });
      },
      flash: function (msg, type) {
          //console.log("Error", msg, type);
          var flashView = new FlashView({
              msg: msg,
              type: type
          });
          this.app.flashRegion.show(flashView);
      },
      note: function(id) {
          var self = this,
              promises = [],
              note = new Note({
                  id: id
              }),
              noteView = new NoteView({
                  permissions: this.permissions,
                  model: note
              });
              this.app.navRegion.currentView.setHighlight("roster");
              promises.push(note.fetch());
              
              $.when.apply($, promises).done(function() {
                  self.showView(noteView);
              });
      },
      note_add: function(id) {
          this.note_edit( null );  
      },
      note_edit: function(id) {
          var self = this,
              promises = [],
              note = new Note(),
              units = new Units(null, {
                  children: true,
                  members: true,
                  flat: true,
                  order: 'name',
                  distinct: true
              }),
              noteEditView = new NoteEditView({
                  permissions: this.permissions,
                  model: note,
                  units: units
              });
          promises.push(units.fetch());

          if(id) {
              note.id = id;
              promises.push(note.fetch());
          }

          $.when.apply($, promises).done(function(user) {
              // Must be logged in
              if(self.user.get("forum_member_id") === undefined) {
                  // not logged in
                  self.showView(new FlashView({msg: "You must be logged in to view this page", type: "error"}));
              } else {
                  // Success - logged in and not already a member
                  self.showView(noteEditView);
              }
          });

/*              
          $.when.apply($, promises).done(function() {
              self.showView(noteEditView);
          });
*/          
      },
      member: function (id, path) {
          var self = this,
              promises = []
              // Models & Collections
              ,
              member = new Member({
                  id: id
              }),
              assignments = new Assignments(null, {
                  member_id: id
              }),
              memberPermissions = new Permissions(null, {
                  member_id: id
              }); // User permissions on member being viewed
          // Fetch permissions if they haven't been fetched yet
          /*if (!this.permissions) {
              this.permissions = new Permissions();
              promises.push(this.permissions.fetch());
          }*/

          // Layout & Views
          var memberLayout = new MemberView({
              model: member,
              assignments: assignments
          }),
              memberAdminView = new MemberAdminView({
                  permissions: this.permissions,
                  memberPermissions: memberPermissions
              });

          this.app.navRegion.currentView.setHighlight("roster");

          // Fetches
          promises.push(member.fetch(), assignments.fetch(), memberPermissions.fetch());

          var pageView;
          path = path ? path.replace(/\//g, "") : "";

          // Service Record
          if (path == "servicerecord") {
              memberLayout.setHighlight("servicerecord");

              // Promotions
              var promotions = new Promotions(null, {
                  member_id: id,
                  from: "2000",
                  to: "today"
              });
              promises.push(promotions.fetch());

              // Awards
              var awardings = new Awardings(null, {
                  member_id: id,
                  from: "2000",
                  to: "today"
              });
              promises.push(awardings.fetch());

              // Discharges
              var discharges = new Discharges(null, {
                  member_id: id,
                  from: "2000",
                  to: "today"
              });
              promises.push(discharges.fetch());

              // Enlistments
              var enlistments = new MemberEnlistments(null, {
                  member_id: id,
                  from: "2000",
                  to: "today"
              });
              promises.push(enlistments.fetch());

              // Finances
              var finances = new Finances(null, {
                  member_id: id,
                  from: "2000",
                  to: "today"
              });
              promises.push(finances.fetch());

              // Demerits
              var demerits = new Demerits(null, {
                  member_id: id,
                  from: "2000",
                  to: "today"
              });
              promises.push(demerits.fetch());

              // (Assignments already fetched)
              pageView = new ServiceRecordView({
                  model: member,
                  permissions: this.permissions,
                  memberPermissions: memberPermissions,
                  assignments: assignments,
                  promotions: promotions,
                  awardings: awardings,
                  discharges: discharges,
                  enlistments: enlistments,
                  finances: finances,
                  demerits: demerits
              });
          }
          // Attendance
          else if (path == "attendance") {
              memberLayout.setHighlight("attendance");

              var attendance = new Attendance(null, {
                  member_id: id
              });
              promises.push(attendance.fetch());

              // Percentages
              var percentages = new AttendancePercentages(null, {
                  member_id: id,
              });
              promises.push(percentages.fetch());

              pageView = new MemberAttendanceView({
                  collection: attendance,
                  perc: percentages
              });
          }
          // Recruits
          else if (path == "recruits") {
              memberLayout.setHighlight("recruits");

              var recruits = new Recruits(null, {
                  member_id: id,
                  from: "2000",
                  to: "today"
              });
              promises.push(recruits.fetch());

              pageView = new MemberRecruitsView({
                  collection: recruits
              });
          }

          // Notes
          else if (path == "notes") {
              memberLayout.setHighlight("notes");

              var notes = new Notes(null, {
                  member_id: id,
                  no_content: "true"
              });
              promises.push(notes.fetch());

              pageView = new MemberNotesView({
                  permissions: this.permissions,
                  collection: notes
              });
          }

           // Weapon Passes
          else if (path == "passes") {
              memberLayout.setHighlight("passes");

              var passes = new Passes(null, {
                  member_id: id
              });
              promises.push(passes.fetch());

              pageView = new MemberPassesView({
                  collection: passes
              });
          }

          // ELOAs
          else if (path == "eloas") {
              memberLayout.setHighlight("eloas");

              var eloas = new ELOAs(null, {
                  member_id: id,
                  from: "2000",
                  to: "today"
              });
              promises.push(eloas.fetch());

              pageView = new MemberELOAsView({
                  model: member,
                  collection: eloas
              });
          }

          // Reprimands
          else if (path == "reprimands") {
              memberLayout.setHighlight("reprimands");

              // Demerits
              var demerits = new Demerits(null, {
                  member_id: id,
                  from: "2000",
                  to: "today"
              });
              promises.push(demerits.fetch());

              var awols = new MemberAwols(null, {
                  member_id: id,
                  days: 9999
              });
              promises.push(awols.fetch());

              pageView = new MemberReprimandsView({
                  model: member,
                  demerits: demerits,
                  awols: awols
              });
          }

          // Qualifications
          else if (path == "qualifications") {
              memberLayout.setHighlight("qualifications");
              
              // Standards
              var standards = new Standards(null, {
                  hierarchy: true
              });
              promises.push(standards.fetch());

              // Qualification tics
              var qualifications = new Qualifications(null, {
                  member_id: id
              });
              promises.push(qualifications.fetch());

              // Awards
              /*var awards = new Awardings(null, {
                  member_id: id
              });
              promises.push(awards.fetch());*/

              pageView = new MemberQualificationsView({
                  collection: standards,
                  member_id: id,
                  qualifications: qualifications,
                  //awards: awards,
                  permissions: this.permissions,
                  memberPermissions: memberPermissions,
              });
          }
          else if (path == "edit") {
              memberLayout.setHighlight("profile");
              pageView = new MemberEditView({
                  model: member
              });
          }
          else if (path == "eloa") {
              memberLayout.setHighlight("profile");
              var eloa = new ELOA();
              pageView = new MemberELOAView({
                  model: eloa,
                  member: member
              });
          }
          else if (path == "discharge") {
              memberLayout.setHighlight("profile");
              var discharge = new Discharge();
              pageView = new MemberDischargeView({
                  model: discharge,
                  member: member
              });
          }
          // Profile
          else {
              memberLayout.setHighlight("profile");

              // Finances
              var finances = new Finances(null, {
                  member_id: id,
                  from: "2000",
                  to: "today"
              });
              promises.push(finances.fetch());

              pageView = new MemberProfileView({
                  model: member,
                  finances: finances
              });
          }

          // Rendering
          //util.loading(true);
          Q.allSettled(promises).then(function() {
              //util.loading(false);
              self.showView(memberLayout);
              memberLayout.adminRegion.show(memberAdminView);
              if (pageView) memberLayout.pageRegion.show(pageView);
          });
      },
      roster: function (filter) {
          var self = this,
              promises = [],
              units = new Units(null, {
                  filter: filter || "Bn",
                  children: true,
                  members: true
              }),
              rosterView = new RosterView({
                  collection: units
              });

          this.app.navRegion.currentView.setHighlight("roster");
          promises.push(units.fetch());

          //util.loading(true);
          //vent.trigger("fetch", promises);
          $.when.apply($, promises).done(function () {
              //util.loading(false);
              self.showView(rosterView);
          });
      },
      unit: function (filter, path) {
          var self = this,
              promises = []
              // Models & Collections
              ,
              units = new Units(null, {
                  filter: filter || "Bn"
              })

              // Layouts & Views
              ,
              unitLayout = new UnitView({
                  collection: units
              });

          this.app.navRegion.currentView.setHighlight("roster");

          var columnViews = [];
          path = path ? path.replace(/\//g, "") : "";

          // Attendance
          if (path == "attendance") {
              unitLayout.setHighlight("attendance");

              var attendance = new Attendance(null, {
                  unit_id: filter || "Bn"
              });
              promises.push(attendance.fetch());

              // Percentages
              var percentages = new AttendancePercentages(null, {
                  member_id: filter || "Bn"
              });
              promises.push(percentages.fetch());

              columnViews.push(new UnitAttendanceView({
                  collection: attendance,
                  perc: percentages
              }));
          }
          // AWOLs
          else if (path == "awols") {
              unitLayout.setHighlight("awols");
              
              var unitAwols = new UnitAwols(null, {
                  filter: filter || "Bn"
              });
              promises.push(unitAwols.fetch());

              columnViews.push(new UnitAwolsView({
                  collection: unitAwols
              }));
          }
          // AOCCs
          else if (path == "alerts") {
              unitLayout.setHighlight("alerts");
              
              var unitAlerts = new UnitAlerts(null, {
                  filter: filter || "Bn"
              });
              promises.push(unitAlerts.fetch());

              columnViews.push(new UnitAlertsView({
                  collection: unitAlerts
              }));
          }
          // Statistics
          else if (path == "stats") {
              unitLayout.setHighlight("stats");
              
              var unitStats = new UnitStats(null, {
                  filter: filter || "Bn"
              });
              promises.push(unitStats.fetch());

              columnViews.push(new UnitStatsView({
                  collection: unitStats
              }));
          }
          // Recruits
          else if (path == "recruits") {
              unitLayout.setHighlight("recruits");
              
              var unitRecruits = new Recruits(null, {
                  from:"2014-12-01",
                  to: "today",
                  unit_id: filter || "Bn"
              });
              promises.push(unitRecruits.fetch());

              columnViews = new UnitRecruitsView({
                  collection: unitRecruits
              });
          }
          // Roster
          else {
              unitLayout.setHighlight("roster");

              units.children = true;
              units.members = true;


              // Assignments
              var assignments = new Assignments(null, {
                  unit_id: filter || "Bn",
                  from: "30 days ago",
                  to: "tomorrow"
              });
              promises.push(assignments.fetch());

              // Promotions
              var promotions = new Promotions(null, {
                  unit_id: filter || "Bn",
                  from: "30 days ago",
                  to: "tomorrow"
              });
              promises.push(promotions.fetch());

              // Awardings
              var awardings = new Awardings(null, {
                  unit_id: filter || "Bn",
                  from: "30 days ago",
                  to: "tomorrow"
              });
              promises.push(awardings.fetch());

              // Finances
              var finances = new Finances(null, {
                  unit_id: filter || "Bn",
                  from: "30 days ago",
                  to: "tomorrow"
              });
              promises.push(finances.fetch());

              // Demerits
              var demerits = new Demerits(null, {
                  unit_id: filter || "Bn",
                  from: "30 days ago",
                  to: "tomorrow"
              });
              promises.push(demerits.fetch());

              // Extended LOAs
              var eloas = new ELOAs(null, {
                  unit_id: filter || "Bn",
                  from: "30 days ago",
                  to: "tomorrow"
              });
              promises.push(eloas.fetch());

              // Discharges
              var discharges = new Discharges(null, {
                  unit_id: filter || "Bn",
                  from: "30 days ago",
                  to: "tomorrow"
              });
              promises.push(discharges.fetch());

              // Qualifications
              var qualifications = new Qualifications(null, {
                  unit_id: filter || "Bn",
                  from: "30 days ago",
                  to: "tomorrow"
              });
              promises.push(qualifications.fetch());

              // Attendance
              var attendance = new Attendance(null, {
                  unit_id: filter || "Bn",
                  from: "30 days ago",
                  to: "tomorrow"
              });
              promises.push(attendance.fetch());

              var membs = new Units(null, {
                  filter: filter,
                  children: true,
                  members: true,
                  distinct: true,
                  flat: true
              });
              promises.push(membs.fetch());

              columnViews.push(new RosterView({
                  collection: units
              }), new UnitActivityView({
                  assignments: assignments,
                  promotions: promotions,
                  awardings: awardings,
                  finances: finances,
                  demerits: demerits,
                  eloas: eloas,
                  discharges: discharges,
                  qualifications: qualifications,
                  attendance: attendance,
                  members: membs
              }));
          }

          // Fetches
          promises.push(units.fetch());

          // Rendering
          //util.loading(true);
          $.when.apply($, promises).done(function () {
              //util.loading(false);
              unitLayout.numColumns = columnViews.length;
              self.showView(unitLayout);
              //if (pageView) unitLayout.pageRegion.show(pageView);
              if(columnViews.length) {
                  _.each(columnViews, function(columnView, index) {
                      unitLayout.addRegion("col" + index, "#col" + index);
                      unitLayout["col" + index].show(columnView);
                  });
              }
          });
      },
  });
