define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/associate",
    "config",
    "marionette"
], function ($, _, Backbone, Template, config) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        modelEvents: {
            "change": "render"
        },
        serializeData: function () {
            return _.extend({
                forumUrl: config.forumUrl
            }, this.model.toJSON());
        }
    });
});