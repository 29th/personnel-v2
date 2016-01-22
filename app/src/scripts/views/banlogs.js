var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/banlogs.html"),
  ItemTemplate = require("../templates/banlogs_item.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  var ItemView = Marionette.ItemView.extend({
      template: ItemTemplate,
      tagName: "tr"
  });

  module.exports = Marionette.CompositeView.extend({
      template: Template,
      title: "Banlogs",
      itemView: ItemView,
      itemViewContainer: "#rows",
      initialize: function () {
          _.bindAll(this, "onClickMore", "onClickBtnGroup");
      },
      serializeData: function () {
          return $.extend({
              vanilla_forum_url: config.forum.Vanilla.baseUrl,
          });
      },
      events: {
          "click .more": "onClickMore",
          "click .searcher": "onClickBtnGroup"
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
              search_pattern = $( "#search_pattern" ).val();
//              status = btn.data("status");
//          $(".btn-group .btn").removeClass("active");
//          btn.addClass("active");
          this.collection.resetPage();
          this.collection.setFilter("status", search_pattern).fetch({
              success: function () {
//                  self.checkMoreButton();
              }
              // TODO: Add error handling, loading indicator?
          });
      }
  });
