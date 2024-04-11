var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member_passes.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function(options) {
          options = options || {};
          this.notes = options.collection || false;
      },
      serializeData: function () {
          var items = [];
          return _.extend({
              passes: this.notes.toJSON(),
              count: this.notes.length
          });
      }
  });
