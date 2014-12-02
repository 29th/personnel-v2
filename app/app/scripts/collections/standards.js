define([
    "jquery",
    "underscore",
    "backbone",
    "config"
], function ($, _, Backbone, config) {
    "use strict";

    return Backbone.Collection.extend({
        url: function () {
            return config.apiHost + "/standards";
        },
        parse: function (response, options) {
            return response.standards || [];
        }
    });
});