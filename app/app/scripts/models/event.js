define([
    "jquery",
    "underscore",
    "backbone",
    "config"
], function ($, _, Backbone, config) {
    "use strict";

    return Backbone.Model.extend({
        url: function () {
            return config.apiHost + "/events/" + this.id;
        },
        parse: function (response, options) {
            return response.event || {};
        }
        /*,excuse: function(excused) {
            $.ajax({
                url: this.url() + "/excuse"
                ,type: "POST"
                ,data: {excused: excused}
            });
        }*/
    });
});