define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/member_profile",
    "marionette"
], function ($, _, Backbone, Template) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template
    });
});