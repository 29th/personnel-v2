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
        events: {
            "click button": "onClickAssociate"
        },
        initialize: function() {
            _.bindAll(this, "onClickAssociate");
            this.response = {};
        },
        serializeData: function () {
            return _.extend({
                forum: config.forum,
                response: this.response
            }, this.model.toJSON());
        },
        onClickAssociate: function(e) {
            e.preventDefault();
            
            var button = $(e.currentTarget),
                self = this;
                
            button.button("loading");
            $.getJSON(config.apiHost + "/user/associate", function(response) {
                button.button("reset");
                self.response = response;
                self.render();
            });
        }
    });
});