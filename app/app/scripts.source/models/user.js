define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"config"
], function($, _, Backbone, config) {
    "use strict";

    var User = Backbone.Model.extend({
        url: config.apiHost + "/user"
        ,parse: function(response, options) {
            return response.user || {};
        }
    });
    
    return User;
});