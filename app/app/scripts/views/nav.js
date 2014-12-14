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
        events: {
            "change #search": "onSearch"
        },
        initialize: function (options) {
            options = options || {};
            
            this.units = options.units || {};
            this.units.on("reset", this.render, this);
            
            this.permissions = options.permissions || {};
            this.permissions.on("reset", this.render, this);
            
            _.bindAll(this, "onSearch");
        },
        onRender: function() {
            this.$(".selectpicker").selectpicker();
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
                permissions: this.permissions.length ? this.permissions.pluck("abbr") : [],
                units: this.units.length ? this.units.toJSON() : []
            }, this.model.toJSON());
        },
        onSearch: function(e) {
            var hash = e.currentTarget.value;
            if(hash) {
                Backbone.history.navigate(hash, {
                    trigger: true
                });
            }
        }
    });
});