var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/event_attendee.html");
var Marionette = require("backbone.marionette");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      modelEvents: {
          "change": "render"
      }
  });

