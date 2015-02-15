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
                forum: config.forum,
                short_name_url: this.model.get("short_name").replace("/", "")
            }, this.model.toJSON());
        }
    });
});