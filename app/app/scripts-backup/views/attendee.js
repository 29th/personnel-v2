define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/attendee"
    ,"marionette"
], function($, _, Backbone, Template) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template
    });
    
});