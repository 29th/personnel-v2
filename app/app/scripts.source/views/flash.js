define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/flash"
    ,"marionette"
], function($, _, Backbone, Template) {
    var alertClasses = {
        success: "alert-success"
        ,info: "alert-info"
        ,warning: "alert-warning"
        ,error: "alert-danger"
    };
    
    return Backbone.Marionette.ItemView.extend({
        template: Template
        ,initialize: function(options) {
            options = options || {};
            this.msg = options.msg || "Unknown";
            this.type = alertClasses[options.type] || alertClasses.info;
        }
        ,serializeData: function() {
            return {
                msg: this.msg
                ,type: this.type
            };
        }
    });
});