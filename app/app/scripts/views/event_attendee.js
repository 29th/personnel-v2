define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/event_attendee"
    ,"marionette"
], function($, _, Backbone, Template) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template
    });
    
});