define([
    "jquery",
    "underscore",
    "backbone",
    "marionette",
    "handlebars",
    "util",
    // Models
    "models/assignment",
    "models/demerit",
    "models/discharge",
    "models/enlistment",
    "models/event",
    "models/member",
    "models/user",
    // Collections
    "collections/assignments",
    "collections/attendance",
    "collections/awardings",
    "collections/demerits",
    "collections/discharges",
    "collections/eloas",
    "collections/enlistments",
    //"collections/event_attendance", // Attendees of an event
    "collections/events",
    "collections/finances",
    //"collections/member_attendance", // Member attendance
    "collections/member_awols",
    "collections/member_enlistments",
    "collections/permissions",
    "collections/positions",
    "collections/promotions",
    "collections/qualifications",
    "collections/servers",
    "collections/standards",
    //"collections/unit_attendance", // Unit attendance
    "collections/unit_awols",
    "collections/units",
    // Views
    "views/aar",
    "views/assignment_edit",
    "views/associate",
    "views/calendar",
    "views/demerit",
    "views/discharge",
    "views/eloas",
    "views/enlistment_edit",
    "views/enlistment_process",
    "views/enlistments",
    "views/enlistment",
    "views/event",
    "views/event_edit",
    "views/finances",
    "views/flash",
    "views/member_admin",
    "views/member_attendance",
    "views/member_discharge",
    "views/member_edit",
    "views/member_profile",
    "views/member_qualifications",
    "views/member",
    "views/nav",
    "views/roster",
    "views/service_record",
    "views/unit_activity",
    "views/unit_attendance",
    "views/unit_awols",
    "views/unit",
    // Extras
    "handlebars-helpers",
    "helpers/custom",
    "jquery-bootstrap",
    "moment",
    "backbone.validation",
    "enquire",
    "jquery-nestable",
    //"theme",
    "validation.config"
], function (
$, _, Backbone, Marionette, Handlebars, util,
// Models
Assignment, Demerit, Discharge, Enlistment, Event, Member, User,
// Collections
Assignments, Attendance, Awardings, Demerits, Discharges, ELOAs, Enlistments, Events, Finances, MemberAwols, MemberEnlistments, Permissions, Positions, Promotions, Qualifications, Servers, Standards, UnitAwols, Units,
// Views
AARView, AssignmentEditView, AssociateView, CalendarView, DemeritView, DischargeView, ELOAsView, EnlistmentEditView, EnlistmentProcessView, EnlistmentsView, EnlistmentView, EventView, EventEditView, FinancesView, FlashView, MemberAdminView, MemberAttendanceView, MemberDischargeView,
MemberEditView, MemberProfileView, MemberQualificationsView, MemberView, NavView, RosterView, ServiceRecordView, UnitActivityView, UnitAttendanceView, UnitAwolsView, UnitView) {
    "use strict";

    return Backbone.Router.extend({
        routes: {
            "": "roster",
            //"assignments"
            "assignments/:id/edit": "assignment_edit",
            "associate": "associate",
            "calendar": "calendar",
            "demerits/:id": "demerit",
            "discharges/:id": "discharge",
            "eloas": "eloas",
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
            "units/:filter/*path": "unit",
            "units/:filter": "unit",
        },
        promises: {},
        initialize: function (options) {
            options = options || {};
            this.app = options.app || new Backbone.Marionette.Application();
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
                    members: true,
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
        calendar: function () {
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
                // Units contains the members for recruiter selection
                units = new Units(null, {
                    children: true,
                    members: true,
                    flat: true
                }),
                enlistmentProcessView = new EnlistmentProcessView({
                    model: enlistment,
                    tps: tps,
                    units: units,
                    permissions: this.permissions
                });

            this.app.navRegion.currentView.setHighlight("enlistments");
            promises.push(enlistment.fetch(), tps.fetch(), units.fetch());

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
                finances = new Finances();

            var financesView = new FinancesView({
                collection: finances
            });

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
                    member_id: id
                });
                promises.push(promotions.fetch());

                // Awards
                var awardings = new Awardings(null, {
                    member_id: id
                });
                promises.push(awardings.fetch());

                // Discharges
                var discharges = new Discharges(null, {
                    member_id: id
                });
                promises.push(discharges.fetch());

                // Enlistments
                var enlistments = new MemberEnlistments(null, {
                    member_id: id
                });
                promises.push(enlistments.fetch());

                // Finances
                var finances = new Finances(null, {
                    member_id: id
                });
                promises.push(finances.fetch());

                // Demerits
                var demerits = new Demerits(null, {
                    member_id: id
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

                pageView = new MemberAttendanceView({
                    collection: attendance
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
                pageView = new MemberProfileView({
                    model: member
                });
            }

            // Rendering
            //util.loading(true);
            $.when.apply($, promises).done(function () {
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

                columnViews.push(new UnitAttendanceView({
                    collection: attendance
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
            // Roster
            else {
                unitLayout.setHighlight("roster");

                units.children = true;
                units.members = true;


                // Promotions
                var promotions = new Promotions(null, {
                    unit_id: filter || "Bn",
                    from: "30 days ago",
                    to: "today"
                });
                promises.push(promotions.fetch());

                // Awardings
                var awardings = new Awardings(null, {
                    unit_id: filter || "Bn",
                    from: "30 days ago",
                    to: "today"
                });
                promises.push(awardings.fetch());

                // Finances
                var finances = new Finances(null, {
                    unit_id: filter || "Bn",
                    from: "30 days ago",
                    to: "today"
                });
                promises.push(finances.fetch());

                // Demerits
                var demerits = new Demerits(null, {
                    unit_id: filter || "Bn",
                    from: "30 days ago",
                    to: "today"
                });
                promises.push(demerits.fetch());

                // Extended LOAs
                var eloas = new ELOAs(null, {
                    unit_id: filter || "Bn",
                    from: "30 days ago",
                    to: "today"
                });
                promises.push(eloas.fetch());

                // Discharges
                var discharges = new Discharges(null, {
                    unit_id: filter || "Bn",
                    from: "30 days ago",
                    to: "today"
                });
                promises.push(discharges.fetch());

                // Attendance
                var attendance = new Attendance(null, {
                    unit_id: filter || "Bn",
                    from: "30 days ago",
                    to: "today"
                });
                promises.push(attendance.fetch());

                columnViews.push(new RosterView({
                    collection: units
                }), new UnitActivityView({
                    promotions: promotions,
                    awardings: awardings,
                    finances: finances,
                    demerits: demerits,
                    eloas: eloas,
                    discharges: discharges,
                    attendance: attendance
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
});