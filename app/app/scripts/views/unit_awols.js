define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/unit_awols",
    "marionette"
], function ($, _, Backbone, Template) {

    return Backbone.Marionette.ItemView.extend({
        template: Template,
        events: {
            "click .btn-group .btn": "onClickBtnGroup"
        },
        collectionEvents: {
            "reset": "render"
        },
        onClickBtnGroup: function (e) {
            var btn = $(e.currentTarget),
                self = this,
                days = btn.data("days");
            $(".btn-group .btn").removeClass("active");
            btn.addClass("active");
            this.collection.setFilter("days", days).fetch({reset: true}); // TODO: Add error handling, loading indicator?
        },
        serializeData: function() {
            return {days: this.collection.days, items: this.collection.toJSON()};
        }
    });
});