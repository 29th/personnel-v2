define([
<<<<<<< HEAD
    "jquery"
    , "underscore"
    , "backbone"
    , "config"
    , "models/promotion"
    ], function ($, _, Backbone, config, Promotion) {
    "use strict";

    var Promotions = Backbone.Collection.extend({
        model: Promotion,
=======
    "jquery",
    "underscore",
    "backbone",
    "config"
], function ($, _, Backbone, config) {
    "use strict";

    return Backbone.Collection.extend({
>>>>>>> ccf7a4ff6b1c7b47a5d453b3091500d21c0a30b5
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
});