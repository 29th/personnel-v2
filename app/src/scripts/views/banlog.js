var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/banlog.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Banlog",
      initialize: function (options) {
          options = options || {};
          this.permissions = options.permissions || {};
          this.memberPermissions = options.memberPermissions || {};
      },
      serializeData: function () {
          
          return $.extend({
            forum: config.forum
          }, this.model.toJSON());
      },
      onRender: function () {
          this.title = "Ban Log";
      }
  });
