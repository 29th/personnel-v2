var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");

  "use strict";

  module.exports = Backbone.Model.extend({
      url: function () {
          var url = config.apiHost + "/notes";
          if(this.id) url += "/" + this.id;
          return url;
      },
      parse: function (response, options) {
          return response.note || {};
      },
      validation: {
          member_id: {
              required: true
          },
          date_add: {
              maxLength: 40,
              required: true,
              msg: "A date is required"
          },
          access: {
              required: true,
              msg: "Choose access level"
          },
          subject: {
              maxLength: 60,
              minLength: 5
          },
          content: {
              required: true
          }
      }
  });
