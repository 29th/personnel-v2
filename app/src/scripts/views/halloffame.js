var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/halloffame.html");
var Marionette = require("backbone.marionette");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Hall of Fame",
      serializeData: function () {
          return {
              list: this.collection.toJSON()
          };
      },
      onRender: function () {
          this.title = "Hall of Fame";
      }
  });
