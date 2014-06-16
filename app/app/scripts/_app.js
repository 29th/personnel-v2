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
    // Collections
    ,"collections/units"
    ,"collections/assignments"
    ,"collections/permissions"
    ,"collections/promotions"
    ,"collections/awardings"
    ,"collections/member_attendance" // Member attendance
    ,"collections/event_attendance" // Attendees of an event
    ,"collections/qualifications"
    ,"collections/events"
    // Views
    ,"views/member"
    ,"views/roster"
    ,"views/nav"
    ,"views/member_admin"
    ,"views/member_profile"
    ,"views/member_modify"
    ,"views/service_record"
    ,"views/member_attendance"
    ,"views/qualifications"
    ,"views/calendar"
    ,"views/event"
    ,"views/aar"
    // Extras
    ,"handlebars.helpers"
    ,"jquery-bootstrap"
    ,"moment"
    ,"fullcalendar"
], function(
    $, _, Backbone, Marionette, Handlebars, util
    ,Member, User, Event
    ,Units, Assignments, Permissions, Promotions, Awardings, MemberAttendance, EventAttendance, Qualifications, Events
    ,MemberView, RosterView, NavView, MemberAdminView, MemberProfileView, MemberModifyView, ServiceRecordView, MemberAttendanceView, QualificationsView, CalendarView, EventView, AARView
) {
    "use strict";
    
    window.DEBUG = false; // Global
    $.ajaxSetup({cache: true, xhrFields: { withCredentials: true }}); // Cache ajax requests & send cookies
    
    var App = new Backbone.Marionette.Application();
    
    App.addRegions({
        mainRegion: "#main"
        ,navRegion: "#nav"
    });
    
    var AppRouter = Backbone.Router.extend({
        routes: {
            "": "roster"
            ,"units/:filter": "roster"
            ,"members/:id/*path": "member"
            ,"members/:id": "member"
            ,"calendar": "calendar"
            ,"events/:id": "event"
            ,"events/:id/aar": "aar"
        }
        ,initialize: function() {
            this.user = new User();
            var navView = new NavView({model: this.user});
            App.navRegion.show(navView);
            this.user.fetch();
        }
        ,showView: function(view) {
            App.mainRegion.show(view);
            document.title = view.title !== undefined && view.title ? view.title : $("title").text();
            util.scrollToTop();
        }
        ,roster: function(filter) {
            var self = this
                ,promises = []
                ,units = new Units(null, {filter: filter || "Bn", children: true, members: true})
                ,rosterView = new RosterView({collection: units});
                
            App.navRegion.currentView.setHighlight("roster");
            promises.push(units.fetch());
            
            util.loading(true);
            $.when.apply($, promises).done(function() {
                util.loading(false);
                self.showView(rosterView);
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
                
            App.navRegion.currentView.setHighlight("roster");
            
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
                
                // (Assignments already fetched)
                
                pageView = new ServiceRecordView({assignments: assignments, promotions: promotions, awardings: awardings});
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
            
            App.navRegion.currentView.setHighlight("calendar");
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
            
            App.navRegion.currentView.setHighlight("calendar");
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
            
            App.navRegion.currentView.setHighlight("calendar");
            promises.push(event.fetch());
            
            util.loading(true);
            $.when.apply($, promises).done(function() {
                // Need the event fetch to complete before we know the unit. Now get the expected attendees
                expectedUnits.filter = event.get("unit").id;
                if(event.get("attendance").length) eventAttendance.add(event.get("attendance"));
                promises = [];
                promises.push(expectedUnits.fetch());
                $.when.apply($, promises).done(function() {
                    util.loading(false);
                    self.showView(aarView);
                    aarView.attendanceRegion.show(rosterView);
                });
            });
        }
    });
    
    /**
     * Initialize app
     */
    App.addInitializer(function(options) {
        new AppRouter();
        Backbone.history.start();
    });
    
    return App;
});