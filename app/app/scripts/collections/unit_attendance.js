define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"config"
    ,"models/event_attendee"
], function($, _, Backbone, config, EventAttendee) {
    
    return Backbone.Collection.extend({
        settings: {
            limit: 15
        }
        ,model: EventAttendee
        ,initialize: function(models, options) {
            options = options || {};
            this.filter = options.filter || false;
            this.skip = 0;
        }
        ,url: function() {
            var url = config.apiHost + "/units/" + this.filter + "/attendance";
            if(this.skip) url += "?skip=" + this.skip;
            return url;
        }
        ,nextPage: function() {
            this.skip += this.settings.limit;
            return this;
        }
        ,parse: function(response, options) {
            this.more = response.count > response.skip + response.attendance.length;
            return response.attendance || [];
        }
    });
});