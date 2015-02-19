var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/enlistments.html"),
  ItemTemplate = require("../templates/enlistments_item.html");
var Marionette = require("backbone.marionette");

  
  var ItemView = Marionette.ItemView.extend({
      template: ItemTemplate,
      tagName: "tr"
  });

  module.exports = Marionette.CompositeView.extend({
      template: Template,
      title: "Enlistments",
      itemView: ItemView,
      itemViewContainer: "#rows",
      initialize: function () {
          _.bindAll(this, "onClickMore", "onClickBtnGroup");
      },
      events: {
          "click .more": "onClickMore",
          "click .btn-group .btn": "onClickBtnGroup"
      },
      onRender: function () {
          this.checkMoreButton();
      },
      onClickMore: function (e) {
          e.preventDefault();
          var self = this,
              button = $(e.currentTarget);
          button.button("loading");
          this.collection.nextPage().fetch({
              remove: false,
              success: function () {
                  button.button("reset");
                  self.checkMoreButton();
              },
              error: function () {
                  button.button("error");
              }
          });
      },
      checkMoreButton: function () {
          this.$(".more").toggle(this.collection.more);
      },
      onClickBtnGroup: function (e) {
          var btn = $(e.currentTarget),
              self = this,
              status = btn.data("status");
          $(".btn-group .btn").removeClass("active");
          btn.addClass("active");
          this.collection.resetPage();
          this.collection.setFilter("status", status).fetch({
              success: function () {
                  self.checkMoreButton();
              }
              // TODO: Add error handling, loading indicator?
          });
      }
  });
