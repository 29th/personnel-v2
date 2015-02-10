define([
    "jquery",
    "underscore",
    "backbone",
    "config",
    "models/event_attendee"
], function ($, _, Backbone, config, EventAttendee) {

    return Backbone.Collection.extend({
        settings: {
            limit: 15
        },
        model: EventAttendee,
        initialize: function (models, options) {
            options = options || {};
            this.member_id = options.member_id || null;
            this.unit_id = options.unit_id || null;
            this.skip = 0;
            this.from = options.from || null;
            this.to = options.to || null;
        },
        url: function () {
            var url = config.apiHost;
            if(this.member_id) {
                url += "/members/" + this.member_id;
            }
            else if(this.unit_id) {
                url += "/units/" + this.unit_id;
            }
            url += "/attendance";

            var params = [];
            if(this.skip) params.push("skip=" + this.skip);
            if(this.from) params.push("from=" + this.from);
            if(this.to) params.push("to=" + this.to);
            if(params.length) url += "?" + params.join("&");
            
            return url;
        },
        nextPage: function () {
            this.skip += this.settings.limit;
            return this;
        },
        parse: function (response, options) {
            this.more = parseInt(response.count, 10) > parseInt(response.skip, 10) + (response.attendance !== undefined ? response.attendance.length : 0);
            return response.attendance || [];
        }
    });
});