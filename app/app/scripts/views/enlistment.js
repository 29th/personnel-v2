define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/enlistment",
    "config",
    "require",
    //"vanilla-comments",
    "marionette"
], function ($, _, Backbone, Template, config, require) {

    return Backbone.Marionette.ItemView.extend({
        template: Template,
        title: "Enlistment",
        initialize: function (options) {
            options = options || {};
            this.permissions = options.permissions || {};
            this.memberPermissions = options.memberPermissions || {};
        },
        serializeData: function () {
            return $.extend({
                permissions: this.permissions.length ? this.permissions.pluck("abbr") : [],
                memberPermissions: this.memberPermissions.length ? this.memberPermissions.pluck("abbr") : [],
                
                vanilla_forum_url: config.forumUrl,
                vanilla_identifier: "enlistment-" + this.model.get('id'),
                vanilla_url: config.baseUrl + "/%23" + Backbone.history.fragment,
                vanilla_category_id: config.vanillaCategoryEnlistments,
                vanilla_title: encodeURIComponent("Enlistment - " + this.model.get("member").short_name)
            }, this.model.toJSON());
        },
        onRender: function () {
            if (this.model.get("member").short_name) this.title = "Enlistment - " + this.model.get("member").short_name;
            //require("vanilla-comments");
            //this.$("#vanilla-comments").append("<script src=\"http://29th.org/vanilla2/js/embed.js\"></script>");
        },
    });
});