var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config.dev");

  "use strict";

  module.exports = Backbone.Model.extend({
      url: function () {
          return config.apiHost + "/assignments" + (this.id ? "/" + this.id : "");
      },
      parse: function (response, options) {
          return response.assignment || {};
      },
      validation: {
          unit_id: {
              required: true,
              pattern: "number"
          },
          position_id: {
              required: true,
              pattern: "number"
          },
          start_date: {
              required: true
          }
      }
  });
