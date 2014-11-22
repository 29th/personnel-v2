define([
    "jquery",
    "underscore",
    "backbone",
    "config"
], function ($, _, Backbone, config) {
    "use strict";

    return Backbone.Model.extend({
        initialize: function() {
            var mandatory = this.get("mandatory");
        },
        url: function () {
            return config.apiHost + "/events/" + this.id;
        },
        parse: function (response, options) {
            if(response.event) response.event.mandatory = parseInt(response.event.mandatory, 10);
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