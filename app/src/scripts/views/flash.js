var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/flash.html");
var Marionette = require("backbone.marionette");

  var alertClasses = {
      success: "alert-success",
      info: "alert-info",
      warning: "alert-warning",
      error: "alert-danger"
  };

  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function (options) {
          options = options || {};
          this.msg = options.msg || "Unknown";
          this.type = alertClasses[options.type] || alertClasses.info;
      },
      serializeData: function () {
          return {
              msg: this.msg,
              type: this.type
          };
      }
  });
