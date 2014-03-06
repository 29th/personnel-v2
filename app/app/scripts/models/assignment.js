define([
    "jquery",
    "underscore",
    "backbone",
    "config"
], function ($, _, Backbone, config) {
    "use strict";

    return Backbone.Model.extend({
        url: function () {
            return config.apiHost + "/assignments" + (this.id ? "/" + this.id : "");
        },
        parse: function (response, options) {
            return response.assignment || {};
        }
    });
});