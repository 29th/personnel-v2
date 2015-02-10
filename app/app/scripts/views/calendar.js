define([
    "jquery",
    "underscore",
    "backbone",
    "util",
    "hbs!templates/calendar",
    "moment",
    "marionette",
    "fullcalendar"
], function ($, _, Backbone, util, Template, moment) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        className: "calendar",
        title: "Calendar",
        settings: {
            calendar: {
                header: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'month,basicWeek,basicDay',
                    ignoreTimezone: false
                },
                buttonText: {
                    prev: "<i class=\"fa fa-caret-left\"></i>",
                    next: "<i class=\"fa fa-caret-right\"></i>"
                }
                //,year: 2011
                //,month: 5
                ,
                eventClick: function (event, obj, view) {
                    Backbone.history.navigate("#events/" + event.id, {
                        trigger: true
                    });
                },
                eventDataTransform: function (event) {
                    return {
                        id: event.id,
                        title: moment(event.datetime).format("HH:mm") + " " + (event.unit.key ? event.unit.key : event.type),
                        start: event.datetime,
                        backgroundColor: event.user_expected ? "#5cb85c" : "#3a87ad"
                    };
                },
                loading: function (isLoading, view) {
                    util.loading(isLoading);
                }
            }
        },
        initialize: function (options) {
            _.bindAll(this, "getEvents");
            this.settings.calendar.events = this.getEvents;
            this.permissions = options.permissions || {};
            this.permissions.on("reset", this.render, this);
        },
        serializeData: function () {
            var permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
                allowedTo = {
                    addEvent: (permissions.indexOf("event_add_any") !== -1 || permissions.indexOf("event_add") !== -1)
                };
                
            return $.extend({
                allowedTo: allowedTo
            }, this.collection.toJSON());
        },
        onShow: function () {
            this.$("#calendar").fullCalendar(this.settings.calendar);
        },
        getEvents: function (start, end, callback) {
            var self = this;
            this.collection.from = moment(start.getTime()).format("YYYY-MM-DD");
            this.collection.to = moment(end.getTime()).format("YYYY-MM-DD");
            $.when(this.collection.fetch()).done(function () {
                // Set whether the user is expected
                var collection = self.collection.toJSON().map(function (event) {
                    event.user_expected = self.isExpected(event);
                    return event;
                });
                callback(collection);
            });
        },
        isExpected: function (event) {
            var expected = false;
            if (this.options.userAssignments.length && event.unit.id) {
                this.options.userAssignments.any(function (assignment) {
/*
                    if (!assignment.get("path_array")) {
                        assignment.set("path_array", assignment.get("unit").path.split("/").map(function (i) {
                            if (i) return parseInt(i, 10);
                        }));
                    }
*/
                    if (assignment.get("unit").id === event.unit.id || assignment.get("unit").path.indexOf('/'+event.unit.id+'/') > -1) {
                        expected = true;
                        return true;
                    }
                });
            }
            return expected;
        }
    });
});