var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/unit_recruits.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function(options) {
          options = options || {};
          this.recruits = options.collection || false;
      },
      serializeData: function () {
          return _.extend({
              items: this.recruits.toJSON()
          });
      }
  });
