define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/discharge",
    "marionette"
], function ($, _, Backbone, Template) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        title: "Discharge",
        onRender: function () {
            if (this.model.get("member").short_name) this.title = "Discharge - " + this.model.get("member").short_name;
        },
    });
});