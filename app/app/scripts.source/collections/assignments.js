define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"config"
], function($, _, Backbone, config) {
    "use strict";
    
    var Assignments = Backbone.Collection.extend({
        initialize: function(models, options) {
            options = options || {};
            this.member_id = options.member_id || false;
            this.current = options.current || false;
        }
        ,url: function() {
            var url = config.apiHost + (this.member_id ? "/members/" + this.member_id : "/user/") + "/assignments";
            if(this.current) url += "?current=true";
            return url;
        }
        ,parse: function(response, options) {
            return response.assignments || [];
        }
    });
    
    return Assignments;
});