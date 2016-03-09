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
      },
      serializeData: function () {
          var items = []
          return _.extend({
              notes: this.notes.toJSON(),
              count: this.notes.length
          });
      }
  });
