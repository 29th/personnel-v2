define([
    "jquery",
    "underscore",
    "backbone",
    "config"
], function ($, _, Backbone, config) {
    "use strict";

    return Backbone.Model.extend({
        url: function () {
            var url = config.apiHost + "/demerits";
            if(this.id) url += "/" + this.id;
            return url;
        },
        parse: function (response, options) {
            return response.demerit || {};
        },
        validation: {
            type: {
                required: true
            },
            reason: {
                required: true
            },
            topic_id: {
                required: true,
                pattern: "number",
                msg: "If there is no topic ID, enter 0"
            }
        }
    });
});