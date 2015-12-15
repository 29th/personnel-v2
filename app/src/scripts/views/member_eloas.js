var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member_eloas.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function(options) {
          options = options || {};
          this.eloas = options.collection || false;
      },
      serializeData: function () {
          var items = [];
          var rec_count = 0;
          var today = new Date();
          return _.extend({
              eloas: this.eloas.toJSON(),
              rec_count: this.eloas.length
          });
      }
  });
