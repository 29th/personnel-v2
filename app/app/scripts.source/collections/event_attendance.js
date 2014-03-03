/**
 * Attendees of an event
 */
define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"config"
    ,"models/event_attendee"
], function($, _, Backbone, config, EventAttendee) {
    "use strict";
    
    return Backbone.Collection.extend({
        model: EventAttendee
        ,initialize: function(models, options) {
            options = options || {};
            this.id = options.id || null;
        }
        ,url: function() {
            return config.apiHost + "/events/" + this.id + "/excuse";
        }
    });
});