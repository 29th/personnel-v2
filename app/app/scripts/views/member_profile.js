define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/member_profile",
    "config",
    "marionette"
], function ($, _, Backbone, Template, config) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        serializeData: function () {
            return _.extend({
                forumUrl: config.forumUrl
            }, this.model.toJSON());
        }
    });
});