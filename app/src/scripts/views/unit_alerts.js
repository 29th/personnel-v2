var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/unit_alerts.html");
var Marionette = require("backbone.marionette");


  module.exports = Marionette.ItemView.extend({
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
          return {days: this.collection.count, items: this.collection.toJSON()};
      }
  });
