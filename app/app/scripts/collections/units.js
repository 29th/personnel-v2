define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"config"
], function($, _, Backbone, config) {
    "use strict";
    
    /**
     * Model
     */
    var Unit = Backbone.Model.extend({
        initialize: function() {
            if(this.get("children")) {
                this.set("children", new Units(this.get("children")));
            }
        } // Need to add children stuff here too for recursive
        /*,url: function() {
            var params = {}
                ,url = this.settings.apiHost + "/units";
            if(this.get("filter")) url += "/" + encodeURIComponent(this.get("filter"));
            if(this.get("children")) params.children = this.get("children");
            if(this.get("members")) params.members = this.get("members");
            if( ! _.isEmpty(params)) url += "?" + $.param(params);
            return url;
        }
        ,parse: function(response, options) {
            console.log("here");
            if(response.unit.children !== undefined) {
                response.unit.children = new Units(response.unit.children);
            }
            return response.unit || {};
        }*/
    });

    /**
     * Collection
     */
    var Units = Backbone.Collection.extend({
        model: Unit
        ,initialize: function(models, options) {
            options = options || {};
            this.filter = options.filter || false;
            this.children = options.children || false;
            this.members = options.members || false;
            this.active = options.active || false;
        }
        ,url: function() {
            var params = {}
                ,url = config.apiHost + "/units";
            if(this.filter) url += "/" + encodeURIComponent(this.filter);
            if(this.children) params.children = this.children;
            if(this.members) params.members = this.members;
            if(this.active) params.active = this.active;
            if( ! _.isEmpty(params)) url += "?" + $.param(params);
            return url;
        }
        ,parse: function(response, options) {
            return [response.unit] || []; // Return as array since it's a collection
        }
    });
    return Units;
});