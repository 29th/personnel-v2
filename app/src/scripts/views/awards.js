var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/awards.html");
var Marionette = require("backbone.marionette");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Awards",
      serializeData: function () {
          return {
              awards: this.collection.toJSON()[0].awards
          };
      },
      onRender: function () {
          this.title = "Awards";
      }
  });
