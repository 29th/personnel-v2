define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/nav",
    "config",
    "marionette"
], function ($, _, Backbone, Template, config) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        highlight: "home",
        modelEvents: {
            "change": "render"
        },
        initialize: function (options) {
            options = options || {};

            this.permissions = options.permissions || {};
            this.permissions.on("reset", this.render, this);
        },
        setHighlight: function (highlight) {
            this.highlight = highlight;
            this.$(".nav li").removeClass("active");
            if (highlight) this.$(".nav li[data-highlight=\"" + highlight + "\"]").addClass("active");
        },
        serializeData: function () {
            return _.extend({
                highlight: this.highlight,
                forumUrl: config.forumUrl,
                permissions: this.permissions.length ? this.permissions.pluck("abbr") : []
            }, this.model.toJSON());
        }
    });
});