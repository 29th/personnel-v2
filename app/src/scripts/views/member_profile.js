var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member_profile.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      serializeData: function () {
          return _.extend({
              forum: config.forum,
              short_name_url: this.model.get("short_name").replace("/", "")
          }, this.model.toJSON());
      }
  });
