var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/eloas.html"),
  ItemTemplate = require("../templates/eloas_item.html");
var Marionette = require("backbone.marionette");

  
  var ItemView = Marionette.ItemView.extend({
      template: ItemTemplate,
      tagName: "tr"
  });

  module.exports = Marionette.CompositeView.extend({
      template: Template,
      itemView: ItemView,
      title: "Extended LOAs",
      itemViewContainer: "#rows"
      /**
       * Necessary because our collection will finish fetching before this view is rendered,
       * so itemViewContainer doesn't exist. See https://github.com/marionettejs/backbone.marionette/issues/377
       */
      ,
      _initialEvents: function () {
          this.once("render", function () {
              if (this.collection) {
                  this.listenTo(this.collection, "add", this.addChildView, this);
                  this.listenTo(this.collection, "remove", this.removeItemView, this);
                  this.listenTo(this.collection, "reset", this._renderChildren, this);
              }
          }, this);
      },
      initialize: function () {
          _.bindAll(this, "onClickMore");
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
              status = btn.data("status")
          if (status) $(".btn-group .btn-status").removeClass("active");
          btn.addClass("active");
          this.collection.resetPage();
          this.collection
            .setFilter( "status", status || $(".btn-group .btn-status.active").data('status') )
            .fetch({
              success: function () {
                  self.checkMoreButton();
              }
              // TODO: Add error handling, loading indicator?
          })
      }
  });
