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
            var permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
                memberPermissions = this.memberPermissions.length ? this.memberPermissions.pluck("abbr") : [],
                allowedTo = {
                    processEnlistment: permissions.indexOf("enlistment_process_any") !== -1,
                    modifyEnlistment: permissions.indexOf("enlistment_edit_any") !== -1,
                    modifyProfile: memberPermissions.indexOf("profile_edit") !== -1 || permissions.indexOf("profile_edit_any") !== -1
                };
            allowedTo.admin = allowedTo.processEnlistment || allowedTo.modifyEnlistment || allowedTo.modifyProfile;
                
            return $.extend({
                allowedTo: allowedTo,
                
                vanilla_forum_url: config.forum.Vanilla.baseUrl,
                vanilla_identifier: "enlistment-" + this.model.get('id'),
                vanilla_url: config.baseUrl + "/%23" + Backbone.history.fragment,
                vanilla_category_id: config.vanillaCategoryEnlistments,
                vanilla_title: encodeURIComponent("Enlistment - " + this.model.get("member").short_name)
            }, this.model.toJSON());
        },
        onRender: function () {
            if (this.model.get("member").short_name) this.title = "Enlistment - " + this.model.get("member").short_name;
            this.$("#vanilla-comments iframe").on("load", _.bind(this.onLoadIframe, this));
        },
        onLoadIframe: function() {
            $(".iframe-loading").hide();
        }
    });
});