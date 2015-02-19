var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/comments.html");
var Marionette = require("backbone.marionette");


  module.exports = Marionette.ItemView.extend({
      template: Template
  });
