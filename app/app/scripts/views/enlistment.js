define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/enlistment"
    ,"marionette"
], function($, _, Backbone, Template) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template
        ,initialize: function(options) {
            options = options || {};
            this.permissions = options.permissions || {};
        }
        ,serializeData: function() {
            return $.extend({permissions: this.permissions.pluck("abbr")}, this.model.toJSON());
        }
    });
});