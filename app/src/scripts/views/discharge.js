var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/discharge.html");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Discharge",
      onRender: function () {
          if (this.model.get("member").short_name) this.title = "Discharge - " + this.model.get("member").short_name;
      },
  });
