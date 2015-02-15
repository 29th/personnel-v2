define([
    "jquery",
    "underscore",
    "backbone",
    "models/qualification",
    "config"
], function ($, _, Backbone, Qualification, config) {
    "use strict";

    return Backbone.Collection.extend({
        model: Qualification,
        initialize: function (models, options) {
            options = options || {};
            this.member_id = options.member_id || false;
        },
        url: function () {
            return config.apiHost + "/members/" + this.member_id + "/qualifications";
        },
        parse: function (response, options) {
            return response.qualifications || [];
        }
    });
});