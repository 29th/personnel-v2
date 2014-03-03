define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"config"
], function($, _, Backbone, config) {
    "use strict";
    
    return Backbone.Collection.extend({
        initialize: function(models, options) {
            options = options || {};
            this.order = options.order || null;
        }
        ,url: function() {
            return config.apiHost + "/positions" + (this.order ? "?order=" + this.order : "");
        }
        ,parse: function(response, options) {
            return response.positions || [];
        }
    });
});