var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/demerit.html");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Demerit",
      onRender: function () {
          if (this.model.get("member").short_name) this.title = "Demerit - " + this.model.get("member").short_name;
      },
  });
