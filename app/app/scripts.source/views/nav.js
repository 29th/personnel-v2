define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/nav"
    ,"marionette"
], function($, _, Backbone, NavTemplate) {
    return Backbone.Marionette.ItemView.extend({
        template: NavTemplate
        ,highlight: "home"
        ,modelEvents: {
            "change": "render"
        }
        ,setHighlight: function(highlight) {
            this.highlight = highlight;
            this.$(".nav li").removeClass("active");
            if(highlight) this.$(".nav li[data-highlight=\"" + highlight + "\"]").addClass("active");
        }
        ,serializeData: function() {
            return _.extend({highlight: this.highlight}, this.model.toJSON());
        }
    });
});