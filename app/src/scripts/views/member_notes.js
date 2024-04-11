var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member_notes.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function(options) {
          options = options || {};
          this.notes = options.collection || false;
          this.permissions = options.permissions || {};
          this.permissions.on("reset", this.render, this);
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
      }
  });
