define([
    "jquery"
    , "underscore"
    , "backbone"
    , "config"
    ], function ($, _, Backbone, config) {
    "use strict";

    var Member = Backbone.Model.extend({
        url: function () {
            return config.apiHost + "/members/" + this.id;
        },
        parse: function (response, options) {
            return response.member || {};
        }
    });

    return Member;
});