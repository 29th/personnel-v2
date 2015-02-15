var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config.dev");

  "use strict";

  module.exports = Backbone.Model.extend({
      initialize: function() {
          var mandatory = this.get("mandatory");
      },
      url: function () {
          var url = config.apiHost + "/events";
          if(this.id) url += "/" + this.id;
          return url;
      },
      parse: function (response, options) {
          if(response.event) response.event.mandatory = parseInt(response.event.mandatory, 10);
          return response.event || {};
      },
      validation: {
          date: {
              required: true
          },
          time: {
              required: true
          },
          unit_id: {
              required: true
          },
          server_id: {
              required: true
          },
          type: {
              required: true
          }
      }
      /*,excuse: function(excused) {
          $.ajax({
              url: this.url() + "/excuse"
              ,type: "POST"
              ,data: {excused: excused}
          });
      }*/
  });
