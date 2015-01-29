define([
    "jquery",
    "underscore",
    "backbone",
    "config"
], function ($, _, Backbone, config) {

    return Backbone.Collection.extend({
        url: function () {
            return config.apiHost + "/servers";
        },
        parse: function (response, options) {
            return response.servers || [];
        }
    });
});