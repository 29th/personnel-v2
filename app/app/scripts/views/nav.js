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
        setHighlight: function (highlight) {
            this.highlight = highlight;
            this.$(".nav li").removeClass("active");
            if (highlight) this.$(".nav li[data-highlight=\"" + highlight + "\"]").addClass("active");
        },
        serializeData: function () {
            return _.extend({
                highlight: this.highlight,
                forumUrl: config.forumUrl
            }, this.model.toJSON());
        }
    });
});