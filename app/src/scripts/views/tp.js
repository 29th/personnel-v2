var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/tp.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Training Platoon",
      initialize: function (options) {
          options = options || {};
          this.permissions = options.permissions || {};
          this.memberPermissions = options.memberPermissions || {};
      },
      serializeData: function () {
          
          return $.extend({
          }, this.model.toJSON());
      },
      onRender: function () {
          this.title = "Training Platoon";
      }
  });
