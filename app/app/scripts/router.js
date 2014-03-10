define([
    "jquery",
    "underscore",
    "backbone",
    "marionette",
    "handlebars",
    "util",
    // Models
    "models/assignment",
    "models/discharge",
    "models/enlistment",
    "models/event",
    "models/member",
    "models/user",
    // Collections
    "collections/assignments",
    "collections/awardings",
    "collections/discharges",
    "collections/enlistments",
    "collections/event_attendance", // Attendees of an event
    "collections/events",
    "collections/member_attendance", // Member attendance
    "collections/member_enlistments",
    "collections/permissions",
    "collections/positions",
    "collections/promotions",
    "collections/qualifications",
    "collections/unit_attendance", // Unit attendance
    "collections/units",
    // Views
    "views/aar",
    "views/assignment_edit",
    "views/calendar",
    "views/discharge",
    "views/enlistment_edit",
    "views/enlistment_process",
    "views/enlistments",
    "views/enlistment",
    "views/event",
    "views/flash",
    "views/member_admin",
    "views/member_attendance",
    "views/member_edit",
    "views/member_profile",
    "views/member",
    "views/nav",
    "views/qualifications",
    "views/roster",
    "views/service_record",
    "views/unit_attendance",
    "views/unit",
    // Extras
    "handlebars.helpers",
    "jquery-bootstrap",
    "moment",
    "backbone.validation",
    "validation.config"
], function (
$, _, Backbone, Marionette, Handlebars, util,
// Models
Assignment, Discharge, Enlistment, Event, Member, User,
// Collections
Assignments, Awardings, Discharges, Enlistments, EventAttendance, Events, MemberAttendance, MemberEnlistments, Permissions, Positions, Promotions, Qualifications, UnitAttendance, Units,
// Views
AARView, AssignmentEditView, CalendarView, DischargeView, EnlistmentEditView, EnlistmentProcessView, EnlistmentsView, EnlistmentView, EventView, FlashView, MemberAdminView, MemberAttendanceView,
MemberEditView, MemberProfileView, MemberView, NavView, QualificationsView, RosterView, ServiceRecordView, UnitAttendanceView, UnitView) {
    "use strict";

    return Backbone.Router.extend({
        routes: {
            "": "roster",
            //"assignments"
            "assignments/:id/edit": "assignment_edit",
            "calendar": "calendar",
            "discharges/:id": "discharge",
            "events/:id": "event",
            "events/:id/aar": "aar",
            "enlistments/:id/edit": "enlistment_edit",
            "enlistments/:id/process": "enlistment_process",
            "enlistments/:id": "enlistment",
            "enlistments": "enlistments",
            "enlist": "enlistment_edit",
            "members/:id/*path": "member",
            "members/:id": "member",
            "units/:filter/*path": "unit",
            "units/:filter": "unit",
        },
        initialize: function (options) {
            options = options || {};
            this.app = options.app || new Backbone.Marionette.Application();
            this.user = new User();
            var navView = new NavView({
                model: this.user
            });
            this.app.navRegion.show(navView);
            var userFetch = this.user.fetch();
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
                    active: true
                }),
                eventAttendance = new EventAttendance(null, {
                    id: id
                }),
                aarView = new AARView({
                    model: event
                }),
                rosterView = new RosterView({
                    collection: expectedUnits,
                    eventAttendance: eventAttendance,
                    attendance: true
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
                if (event.get("attendance").length) eventAttendance.add(event.get("attendance"));
                promises = [];
                promises.push(expectedUnits.fetch());
                $.when.apply($, promises).done(function () {
                    //util.loading(false);
                    self.showView(aarView);
                    aarView.attendanceRegion.show(rosterView);
                });
            });
        },
        assignment_edit: function (id) {
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

            $.when.apply($, promises).done(function () {
                self.showView(view);
            });
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
        enlistment: function (id) {
            var self = this,
                promises = [],
                enlistment = new Enlistment({
                    id: id
                }),
                memberPermissions = new Permissions(); // User permissions on member being viewed
                
            // Fetch permissions if they haven't been fetched yet
            if (!this.permissions) {
                this.permissions = new Permissions();
                promises.push(this.permissions.fetch());
            }

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
        enlistment_edit: function (id) {
            var self = this,
                promises = [],
                enlistment = new Enlistment(),
                enlistmentEditView = new EnlistmentEditView({
                    model: enlistment
                });

            this.app.navRegion.currentView.setHighlight("enlistments");

            if (id) {
                enlistment.id = id;
                promises.push(enlistment.fetch());

                //util.loading(true);
                $.when.apply($, promises).done(function () {
                    //util.loading(false);
                    self.showView(enlistmentEditView);
                });
            } else {
                self.showView(enlistmentEditView);
            }
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
                    inactive: true
                }),
                units = new Units(null, {
                    children: true,
                    members: true,
                    flat: true
                }),
                enlistmentProcessView = new EnlistmentProcessView({
                    model: enlistment,
                    tps: tps,
                    units: units
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
                eventAttendance = new EventAttendance(null, {
                    id: id
                }),
                unitPermissions = new Permissions(); // User permissions on member being viewed
            // Fetch permissions if they haven't been fetched yet
            if (!this.permissions) {
                this.permissions = new Permissions();
                promises.push(this.permissions.fetch());
            }

            // Views
            var eventView = new EventView({
                model: event,
                collection: eventAttendance,
                user: this.user,
                userAssignments: userAssignments,
                permissions: this.permissions,
                unitPermissions: unitPermissions
            })

            // Watch fetch event to show loading indicator (LOA)
/*eventAttendance.on("request", function() { util.loading(true); })
                .on("sync", function() { util.loading(false); })
                .on("error", function(model, xhr) { self.flash(xhr.responseJSON.error || "", "error"); util.loading(false); });*/

            this.app.navRegion.currentView.setHighlight("calendar");
            promises.push(event.fetch(), userAssignments.fetch());

            //util.loading(true);
            $.when.apply($, promises).done(function () {
                if (event.get("attendance").length) eventAttendance.add(event.get("attendance"));
                unitPermissions.unit_id = event.get("unit").id;
                promises = [];
                promises.push(unitPermissions.fetch());
                $.when.apply($, promises).done(function () {
                    //util.loading(false);
                    self.showView(eventView);
                });
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
            if (!this.permissions) {
                this.permissions = new Permissions();
                promises.push(this.permissions.fetch());
            }

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

                // (Assignments already fetched)
                pageView = new ServiceRecordView({
                    model: member,
                    assignments: assignments,
                    promotions: promotions,
                    awardings: awardings,
                    discharges: discharges,
                    enlistments: enlistments
                });
            }
            // Attendance
            else if (path == "attendance") {
                memberLayout.setHighlight("attendance");

                var memberAttendance = new MemberAttendance(null, {
                    member_id: id
                });
                promises.push(memberAttendance.fetch());

                pageView = new MemberAttendanceView({
                    collection: memberAttendance
                });
            }
            // Qualifications
            else if (path == "qualifications") {
                memberLayout.setHighlight("qualifications");

                var qualifications = new Qualifications(null, {
                    member_id: id
                });
                promises.push(qualifications.fetch());

                pageView = new QualificationsView({
                    collection: qualifications
                });
            }
            else if (path == "edit") {
                memberLayout.setHighlight("profile");
                pageView = new MemberEditView({
                    model: member
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

            var pageView;
            path = path ? path.replace(/\//g, "") : "";

            // Attendance
            if (path == "attendance") {
                unitLayout.setHighlight("attendance");

                var unitAttendance = new UnitAttendance(null, {
                    filter: filter || "Bn"
                });
                promises.push(unitAttendance.fetch());

                pageView = new UnitAttendanceView({
                    collection: unitAttendance
                });
            }
            // Roster
            else {
                unitLayout.setHighlight("roster");

                units.children = true;
                units.members = true;
                pageView = new RosterView({
                    collection: units
                });
            }

            // Fetches
            promises.push(units.fetch());

            // Rendering
            //util.loading(true);
            $.when.apply($, promises).done(function () {
                //util.loading(false);
                self.showView(unitLayout);
                if (pageView) unitLayout.pageRegion.show(pageView);
            });
        },
    });
});