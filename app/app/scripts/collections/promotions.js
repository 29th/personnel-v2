define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"config"
], function($, _, Backbone, config) {
    "use strict";
    
    var Promotions = Backbone.Collection.extend({
        initialize: function(models, options) {
            options = options || {};
            this.member_id = options.member_id || false;
        }
        ,url: function() {
            return config.apiHost + "/members/" + this.member_id + "/promotions";
        }
        ,parse: function(response, options) {
            return response.promotions || [];
        }
    });
    
    return Promotions;
});