define([
    "jquery",
    "underscore",
    "backbone",
    "config"
], function ($, _, Backbone, config) {
    "use strict";

    return Backbone.Model.extend({
        url: function () {
            return config.apiHost + "/enlistments" + (this.id ? "/" + this.id : "");
        },
        parse: function (response, options) {
            return response.enlistment || {};
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
            age: {
                required: true,
            },
            country_id: {
                required: true
            },
            timezone: {
                required: true
            },
            game: {
                required: true
            },
            ingame_name: {
                required: false,
                maxLength: 60
            },
            steam_id: {
                required: true,
                pattern: "number"
            },
            experience: {
                required: true,
                msg: "A response to this question is required"
            },
            recruiter: {
                required: false,
                maxLength: 128
            }/*,
            unit_id: {
                required: true
            },
            status: {
                required: true
            }*/
        }
    });
});