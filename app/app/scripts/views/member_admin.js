define([
    "jquery"
    , "underscore"
    , "backbone"
    , "hbs!templates/member_admin"
    , "marionette"
    ], function ($, _, Backbone, MemberAdminTemplate) {
    var MemberAdminView = Backbone.Marionette.ItemView.extend({
        template: MemberAdminTemplate,
        initialize: function (options) {
            options = options || {};

            this.permissions = options.permissions || {};
            this.permissions.on("reset", this.render, this);

            this.memberPermissions = options.memberPermissions || {};
            this.memberPermissions.on("reset", this.render, this);
        },
        serializeData: function () {
            return {
                member_id: this.memberPermissions.member_id,
                permissions: this.permissions.length ? this.permissions.pluck("abbr") : [],
                memberPermissions: this.memberPermissions.length ? this.memberPermissions.pluck("abbr") : []
            };
        }
    });

    return MemberAdminView;
});