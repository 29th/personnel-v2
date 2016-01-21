var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/note.html");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Note",
      onRender: function () {
          if (this.model.get("member").short_name) this.title = "Note - " + this.model.get("member").short_name;
      },
  });
