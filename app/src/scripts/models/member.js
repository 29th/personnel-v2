var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");

  "use strict";

  module.exports = Backbone.Model.extend({
      url: function () {
          return config.apiHost + "/members/" + this.id;
      },
      parse: function (response, options) {
          return response.member || {};
      },
      validation: {
          last_name: {
              required: true,
              maxLength: 40
          },
          first_name: {
              required: true,
              maxLength: 30
          },
          steam_id: {
              required: false,
              pattern: "number"
          }
      }
  });
