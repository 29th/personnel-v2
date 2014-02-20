define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"marionette"
    ,"handlebars"
    ,"util"
    // Models
    ,"models/member"
    ,"models/user"
    ,"models/event"
    ,"models/enlistment"
    // Collections
    ,"collections/units"
    ,"collections/assignments"
    ,"collections/permissions"
    ,"collections/promotions"
    ,"collections/awardings"
    ,"collections/enlistments"
    ,"collections/member_attendance" // Member attendance
    ,"collections/event_attendance" // Attendees of an event
    ,"collections/unit_attendance" // Unit attendance
    ,"collections/qualifications"
    ,"collections/events"
    // Views
    ,"views/member"
    ,"views/unit"
    ,"views/roster"
    ,"views/nav"
    ,"views/member_admin"
    ,"views/member_profile"
    ,"views/member_modify"
    ,"views/service_record"
    ,"views/member_attendance"
    ,"views/unit_attendance"
    ,"views/qualifications"
    ,"views/calendar"
    ,"views/event"
    ,"views/aar"
    ,"views/flash"
    ,"views/enlistment"
    ,"views/edit_enlistment"
    // Extras
    ,"custom.helpers"
    ,"jquery-bootstrap"
    ,"moment"
    ,"fullcalendar"
], function(
    $, _, Backbone, Marionette, Handlebars, util
    ,Member, User, Event, Enlistment
    ,Units, Assignments, Permissions, Promotions, Awardings, Enlistments, MemberAttendance, EventAttendance, UnitAttendance, Qualifications, Events
    ,MemberView, UnitView, RosterView, NavView, MemberAdminView, MemberProfileView, MemberModifyView, ServiceRecordView, MemberAttendanceView
    ,UnitAttendanceView, QualificationsView, CalendarView, EventView, AARView, FlashView, EnlistmentView, EditEnlistmentView
) {
    "use strict";
    
    return Backbone.Router.extend({
        routes: {
            "": "roster"
            ,"units/:filter/*path": "unit"
            ,"units/:filter": "unit"
            ,"members/:id/*path": "member"
            ,"members/:id": "member"
            ,"calendar": "calendar"
            ,"events/:id": "event"
            ,"events/:id/aar": "aar"
            ,"enlistments/:id/edit": "enlistment_edit"
            ,"enlistments/:id": "enlistment"
            ,"enlist": "enlistment_edit"
        }
        ,initialize: function(options) {
            options = options || {};
            this.app = options.app || new Backbone.Marionette.Application();
            this.user = new User();
            var navView = new NavView({model: this.user});
            this.app.navRegion.show(navView);
            this.user.fetch();
        }
        ,showView: function(view) {
            this.app.mainRegion.show(view);
            document.title = view.title !== undefined && view.title ? view.title : $("title").text();
            util.scrollToTop();
        }
        ,flash: function(msg, type) {
            console.log("Error", msg, type);
            var flashView = new FlashView({msg: msg, type: type});
            this.app.flashRegion.show(flashView);
        }
        ,roster: function(filter) {
            var self = this
                ,promises = []
                ,units = new Units(null, {filter: filter || "Bn", children: true, members: true})
                ,rosterView = new RosterView({collection: units});
                
            this.app.navRegion.currentView.setHighlight("roster");
            promises.push(units.fetch());
            
            util.loading(true);
            $.when.apply($, promises).done(function() {
                util.loading(false);
                self.showView(rosterView);
            });
        }
        ,unit: function(filter, path) {
            var self = this
                ,promises = []
                // Models & Collections
                ,units = new Units(null, {filter: filter || "Bn"})
                
                // Layouts & Views
                ,unitLayout = new UnitView({collection: units});
                
            this.app.navRegion.currentView.setHighlight("roster");
            
            var pageView;
            path = path ? path.replace(/\//g, "") : "";
            
            // Attendance
            if(path == "attendance") {
                unitLayout.setHighlight("attendance");
                
                var unitAttendance = new UnitAttendance(null, {filter: filter || "Bn"});
                promises.push(unitAttendance.fetch());
                
                pageView = new UnitAttendanceView({collection: unitAttendance});
            }
            // Roster
            else {
                unitLayout.setHighlight("roster");
                
                units.children = true;
                units.members = true;
                pageView = new RosterView({collection: units});
            }
                
            // Fetches
            promises.push(units.fetch());
            
            // Rendering
            util.loading(true);
            $.when.apply($, promises).done(function() {
                util.loading(false);
                self.showView(unitLayout);
                if(pageView) unitLayout.pageRegion.show(pageView);
            });
        }
        ,member: function(id, path) {
            var self = this
                ,promises = []
                // Models & Collections
                ,member = new Member({id: id})
                ,assignments = new Assignments(null, {member_id: id})
                ,memberPermissions = new Permissions(null, {member_id: id}) // User permissions on member being viewed
                
                // Layout & Views
                ,memberLayout = new MemberView({model: member, assignments: assignments})
                ,memberAdminView = new MemberAdminView({collection: memberPermissions});
                
            this.app.navRegion.currentView.setHighlight("roster");
            
            // Fetches
            promises.push(member.fetch(), assignments.fetch(), memberPermissions.fetch());
            
            var pageView;
            path = path ? path.replace(/\//g, "") : "";
            
            // Service Record
            if(path == "servicerecord") {
                memberLayout.setHighlight("servicerecord");
                
                // Promotions
                var promotions = new Promotions(null, {member_id: id});
                promises.push(promotions.fetch());
                
                // Awards
                var awardings = new Awardings(null, {member_id: id});
                promises.push(awardings.fetch());
                
                // Enlistments
                var enlistments = new Enlistments(null, {member_id: id});
                promises.push(enlistments.fetch());
                
                // (Assignments already fetched)
                
                pageView = new ServiceRecordView({assignments: assignments, promotions: promotions, awardings: awardings, enlistments: enlistments});
            }
            // Attendance
            else if(path == "attendance") {
                memberLayout.setHighlight("attendance");
                
                var memberAttendance = new MemberAttendance(null, {member_id: id});
                promises.push(memberAttendance.fetch());
                
                pageView = new MemberAttendanceView({collection: memberAttendance});
            }
            // Qualifications
            else if(path == "qualifications") {
                memberLayout.setHighlight("qualifications");
                
                var qualifications = new Qualifications(null, {member_id: id});
                promises.push(qualifications.fetch());
                
                pageView = new QualificationsView({collection: qualifications});
            }
            else if(path == "modify") {
                memberLayout.setHighlight("profile");
                pageView = new MemberModifyView({model: member});
            }
            // Profile
            else {
                memberLayout.setHighlight("profile");
                pageView = new MemberProfileView({model: member});
            }
            
            // Rendering
            util.loading(true);
            $.when.apply($, promises).done(function() {
                util.loading(false);
                self.showView(memberLayout);
                memberLayout.adminRegion.show(memberAdminView);
                if(pageView) memberLayout.pageRegion.show(pageView);
            });
        }
        ,calendar: function() {
            var self = this
                ,promises = []
                ,events = new Events()
                ,userAssignments = new Assignments(null, {current: true}) // Omit member_id to get user's assignments
                ,calendarView = new CalendarView({collection: events, userAssignments: userAssignments});
            
            this.app.navRegion.currentView.setHighlight("calendar");
            promises.push(userAssignments.fetch());
            
            util.loading(true);
            $.when.apply($, promises).done(function() {
                util.loading(false);
                self.showView(calendarView);
            });
        }
        ,event: function(id) {
            var self = this
                ,promises = []
                ,userAssignments = new Assignments(null, {current: true}) // Omit member_id to get user's assignments
                ,event = new Event({id: id})
                ,eventAttendance = new EventAttendance(null, {id: id})
                ,unitPermissions = new Permissions() // User permissions on member being viewed
                ,eventView = new EventView({model: event, collection: eventAttendance, user: this.user, userAssignments: userAssignments, unitPermissions: unitPermissions});
                
            // Watch fetch event to show loading indicator (LOA)
            eventAttendance.on("request", function() { util.loading(true); })
                .on("sync", function() { util.loading(false); })
                .on("error", function(model, xhr) { self.flash(xhr.responseJSON.error || "", "error"); util.loading(false); });
            
            this.app.navRegion.currentView.setHighlight("calendar");
            promises.push(event.fetch(), userAssignments.fetch());
            
            util.loading(true);
            $.when.apply($, promises).done(function() {
                if(event.get("attendance").length) eventAttendance.add(event.get("attendance"));
                unitPermissions.unit_id = event.get("unit").id;
                promises = [];
                promises.push(unitPermissions.fetch());
                $.when.apply($, promises).done(function() {
                    util.loading(false);
                    self.showView(eventView);
                });
            });
        }
        ,aar: function(id) {
            var self = this
                ,promises = []
                ,event = new Event({id: id})
                ,expectedUnits = new Units(null, {children: true, members: true})
                ,eventAttendance = new EventAttendance(null, {id: id})
                ,aarView = new AARView({model: event})
                ,rosterView = new RosterView({collection: expectedUnits, eventAttendance: eventAttendance, attendance: true});
                
            // Watch fetch event to show loading indicator (AAR)
            event.on("request", function() { util.loading(true); })
                .on("sync", function() { util.loading(false); })
                .on("error", function(model, xhr) { self.flash(xhr.responseJSON.error || "", "error"); util.loading(false); });
            
            this.app.navRegion.currentView.setHighlight("calendar");
            promises.push(event.fetch());
            
            //util.loading(true);
            $.when.apply($, promises).done(function() {
                // Need the event fetch to complete before we know the unit. Now get the expected attendees
                expectedUnits.filter = event.get("unit").id;
                if(event.get("attendance").length) eventAttendance.add(event.get("attendance"));
                promises = [];
                promises.push(expectedUnits.fetch());
                $.when.apply($, promises).done(function() {
                    //util.loading(false);
                    self.showView(aarView);
                    aarView.attendanceRegion.show(rosterView);
                });
            });
        }
        ,enlistment: function(id) {
            var self = this
                ,promises = []
                ,enlistment = new Enlistment({id: id})
                ,permissions = new Permissions()
                ,enlistmentView = new EnlistmentView({model: enlistment, permissions: permissions});
            
            this.app.navRegion.currentView.setHighlight("enlist");
            promises.push(enlistment.fetch(), permissions.fetch());
            
            util.loading(true);
            $.when.apply($, promises).done(function() {
                util.loading(false);
                self.showView(enlistmentView);
            });
        }
        ,enlistment_edit: function(id) {
            var self = this
                ,promises = []
                ,enlistment = new Enlistment()
                ,editEnlistmentView = new EditEnlistmentView({model: enlistment});
            
            this.app.navRegion.currentView.setHighlight("enlist");
            
            if(id) {
                enlistment.id = id;
                promises.push(enlistment.fetch());
            
                util.loading(true);
                $.when.apply($, promises).done(function() {
                    util.loading(false);
                    self.showView(editEnlistmentView);
                });
            } else {
                self.showView(editEnlistmentView);
            }
        }
    });
});