define([
    "jquery",
    "underscore",
    "backbone",
    "config"
], function ($, _, Backbone, config) {
    "use strict";

    return Backbone.Collection.extend({
        initialize: function (models, options) {
            options = options || {};
            this.member_id = options.member_id || false;
            this.unit_filter = options.unit_filter || false;
        },
        url: function () {
            var url = config.apiHost;
            if(this.member_id) url += "/members/" + this.member_id + "/discharges";
            else if(this.unit_filter) url += "/units/" + this.unit_filter + "/discharges";
            return url;
        },
        parse: function (response, options) {
            return response.discharges || [];
        }
    });
});