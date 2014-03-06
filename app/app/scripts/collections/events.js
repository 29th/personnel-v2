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
            this.from = options.from || false;
            this.to = options.to || false;
        },
        url: function () {
            var url = config.apiHost + "/events";
            if (this.from && this.to) url += "?" + $.param({
                from: this.from,
                to: this.to
            });
            return url;
        },
        parse: function (response, options) {
            return response.events || [];
        }
    });
});