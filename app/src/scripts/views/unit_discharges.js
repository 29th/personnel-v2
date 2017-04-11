var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/unit_discharges.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function(options) {
          options = options || {};
          this.discharges = options.collection || false;
      },
      serializeData: function () {
          var rec_count = 0;
          return _.extend({
              discharges: this.discharges.toJSON()
          });
      }
  });
