define([
    "jquery",
    "underscore",
    "backbone",
    "config",
    "models/promotion"
], function ($, _, Backbone, config, Promotion ) {
    "use strict";

    return Backbone.Collection.extend({
        model: Promotion,
        initialize: function (models, options) {
            options = options || {};
            this.member_id = options.member_id || null;
            this.unit_id = options.unit_id || null;
            this.skip = 0;
        },
        url: function () {
            var url = config.apiHost;
            if(this.member_id) {
                url += "/members/" + this.member_id;
            }
            else if(this.unit_id) {
                url += "/units/" + this.unit_id;
            }
            url += "/promotions";
            if(this.skip) url += "?skip=" + this.skip;
            return url;
        },
        parse: function (response, options) {
            this.more = response.count ? (parseInt(response.count, 10) > parseInt(response.skip, 10) + response.promotions.length) : false;
            return response.promotions || [];
        }
    });
});