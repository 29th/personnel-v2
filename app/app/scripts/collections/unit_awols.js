define([
    "jquery",
    "underscore",
    "backbone",
    "config"
], function ($, _, Backbone, config) {

    return Backbone.Collection.extend({
        initialize: function (models, options) {
            options = options || {};
            this.filter = options.filter || false;
            this.days = options.days || false;
        },
        url: function () {
            return config.apiHost + "/units/" + this.filter + "/awols" + (this.days ? "?days=" + this.days : "");
        },
        parse: function (response, options) {
            return response.awols || [];
        },
        setFilter: function (key, val) {
            this[key] = val; // unsecure
            return this;
        },
    });
});