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
        initialize: function (models, options) {
            options = options || {};
            this.filter = options.filter || false;
            this.member_id = options.member_id || null;
            this.unit_id = options.unit_id || null;
            this.skip = 0;
        },
        url: function () {
            var url = config.apiHost;
            if(this.member_id) {
                url += "/members/" + this.member_id;
            }
            else if(this.unit_id) {
                url += "/units/" + this.unit_id;
            }
            url += "/eloas";
            if(this.skip) url += "?skip=" + this.skip;
            return url;
        },
        nextPage: function () {
            this.skip += this.settings.limit;
            return this;
        },
        parse: function (response, options) {
            this.more = parseInt(response.count, 10) > parseInt(response.skip, 10) + response.eloas.length;
            return response.eloas || [];
        }
    });
});