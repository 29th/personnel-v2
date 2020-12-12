var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/associate.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      modelEvents: {
          "change": "render"
      },
      events: {
          "click button": "onClickAssociate"
      },
      initialize: function() {
          _.bindAll(this, "onClickAssociate");
          this.response = {};
      },
      serializeData: function () {
          return _.extend({
              forum: config.forum,
              response: this.response
          }, this.model.toJSON());
      },
      onClickAssociate: function(e) {
          e.preventDefault();
          
          var button = $(e.currentTarget),
              self = this;
              
          button.button("loading");
          $.post(config.apiHost + "/user/associate", function(response) {
              button.button("reset");
              self.response = response;
              self.render();
          }).fail(function(xhr, status, error) {
              button.button("reset");
              self.response = xhr.responseJSON;
              self.render();
          });
      }
  });
