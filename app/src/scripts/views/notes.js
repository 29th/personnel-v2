var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/notes.html"),
  ItemTemplate = require("../templates/notes_item.html"),
  config = require("../config");
  var Marionette = require("backbone.marionette");

  var ItemView = Marionette.ItemView.extend({
      template: ItemTemplate,
      tagName: "tr"
  });

  
  module.exports = Marionette.CompositeView.extend({
      template: Template,
      title: "Notes",
      itemView: ItemView,
      itemViewContainer: "#rows",
      _initialEvents: function () {
          this.once("render", function () {
              if (this.collection) {
                  this.listenTo(this.collection, "add", this.addChildView, this);
                  this.listenTo(this.collection, "remove", this.removeItemView, this);
                  this.listenTo(this.collection, "reset", this._renderChildren, this);
              }
          }, this);
      },
      initialize: function(options) {
          options = options || {};
          this.notes = options.collection || false;
          this.permissions = options.permissions || {};
          this.permissions.on("reset", this.render, this);
          _.bindAll(this, "onClickMore");
      },
      serializeData: function () {
          var items = [],
              permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
              allowedTo = {
                  editNote: (permissions.indexOf("note_view_all") !== -1 || permissions.indexOf("note_view_mp") !== -1 || permissions.indexOf("note_view_co") !== -1 || permissions.indexOf("note_view_pl") !== -1 || permissions.indexOf("note_view_sq") !== -1 || permissions.indexOf("note_view_lh") !== -1 )
              };
          return _.extend({
              notes: this.notes.toJSON(),
              allowedTo: allowedTo,
              count: this.notes.length
          });
      },
      events: {
          "click .more": "onClickMore"
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
      }
  });
