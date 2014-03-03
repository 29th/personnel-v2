define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"util"
    ,"hbs!templates/calendar"
    ,"marionette"
    ,"fullcalendar"
], function($, _, Backbone, util, CalendarTemplate) {
    var CalendarView = Backbone.Marionette.ItemView.extend({
        template: CalendarTemplate
        ,className: "calendar"
        ,title: "Calendar"
        ,settings: {
            calendar: {
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,basicWeek,basicDay',
                    ignoreTimezone: false
                }
                ,buttonText: {
                    prev: "<i class=\"glyphicon glyphicon-arrow-left\"></i>"
                    ,next: "<i class=\"glyphicon glyphicon-arrow-right\"></i>"
                }
                //,year: 2011
                //,month: 5
                ,eventClick: function(event, obj, view) {
                    Backbone.history.navigate("#events/" + event.id, {trigger: true});
                }
                ,eventDataTransform: function(event) {
                    return {
                        id: event.id
                        ,title: window.moment(event.datetime).format("HH:mm") + " " + (event.unit.key ? event.unit.key : event.type)
                        ,start: event.datetime
                        ,backgroundColor: event.user_expected ? "#5cb85c" : "#3a87ad"
                    };
                }
                ,loading: function(isLoading, view) {
                    util.loading(isLoading);
                }
            }
        }
        ,initialize: function() {
            _.bindAll(this, "getEvents");
            this.settings.calendar.events = this.getEvents;
        }
        ,onShow: function() {
            this.$("#calendar").fullCalendar(this.settings.calendar);
        }
        ,getEvents: function(start, end, callback) {
            var self = this;
            this.collection.from = Math.round(start.getTime() / 1000);
            this.collection.to = Math.round(end.getTime() / 1000);
            $.when(this.collection.fetch()).done(function() {
                // Set whether the user is expected
                var collection = self.collection.toJSON().map(function(event) {
                    event.user_expected = self.isExpected(event);
                    return event;
                });
                callback(collection);
            });
        }
        ,isExpected: function(event) {
            var expected = false;
            if(this.options.userAssignments.length && event.unit.id) {
                this.options.userAssignments.any(function(assignment) {
                    if( ! assignment.get("path_array")) {
                        assignment.set("path_array", assignment.get("unit").path.split("/").map(function(i) { if(i) return parseInt(i, 10); }));
                    }
                    if(assignment.get("unit").id === event.unit.id || assignment.get("path_array").indexOf(event.unit.id) > -1) {
                        expected = true;
                        return true;
                    }
                });
            }
            return expected;
        }
    });
    
    return CalendarView;
});