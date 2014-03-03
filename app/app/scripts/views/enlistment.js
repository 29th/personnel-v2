define([
    "jquery"
    , "underscore"
    , "backbone"
    , "hbs!templates/enlistment"
    , "marionette"
    ], function ($, _, Backbone, Template) {

    return Backbone.Marionette.ItemView.extend({
        template: Template,
        initialize: function (options) {
            options = options || {};
            this.permissions = options.permissions || {};
            this.memberPermissions = options.memberPermissions || {};
        },
        serializeData: function () {
            return $.extend({
                permissions: this.permissions.length ? this.permissions.pluck("abbr") : [],
                memberPermissions: this.memberPermissions.length ? this.memberPermissions.pluck("abbr") : []
            }, this.model.toJSON());
        }
    });
});