define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/comments",
    "marionette"
], function ($, _, Backbone, Template) {

    return Backbone.Marionette.ItemView.extend({
        template: Template
    });
});