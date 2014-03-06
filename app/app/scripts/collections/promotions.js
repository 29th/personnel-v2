define([
    "jquery"
    , "underscore"
    , "backbone"
    , "config"
    , "models/promotion"
    ], function ($, _, Backbone, config, Promotion) {
    "use strict";

    var Promotions = Backbone.Collection.extend({
        model: Promotion,
        initialize: function (models, options) {
            options = options || {};
            this.member_id = options.member_id || false;
        },
        url: function () {
            return config.apiHost + "/members/" + this.member_id + "/promotions";
        },
        parse: function (response, options) {
            return response.promotions || [];
        }
    });

    return Promotions;
});