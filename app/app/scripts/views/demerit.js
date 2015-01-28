define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/demerit",
    "marionette"
], function ($, _, Backbone, Template) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        title: "Demerit",
        onRender: function () {
            if (this.model.get("member").short_name) this.title = "Demerit - " + this.model.get("member").short_name;
        },
    });
});