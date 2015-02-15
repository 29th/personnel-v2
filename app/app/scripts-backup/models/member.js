define([
    "jquery",
    "underscore",
    "backbone",
    "config"
], function ($, _, Backbone, config) {
    "use strict";

    return Backbone.Model.extend({
        url: function () {
            return config.apiHost + "/members/" + this.id;
        },
        parse: function (response, options) {
            return response.member || {};
        },
        validation: {
            last_name: {
                required: true,
                maxLength: 40
            },
            first_name: {
                required: true,
                maxLength: 30
            },
            steam_id: {
                required: false,
                pattern: "number"
            }
        }
    });
});