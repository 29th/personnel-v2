var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");

  "use strict";

  module.exports = Backbone.Model.extend({
      url: function () {
          return config.apiHost + "/banlogs" + (this.id ? "/" + this.id : "");
      },
      parse: function (response, options) {
          return response.banlogs || {};
      },
      //Here add verify when adding add/edit of banlogs
      validation: {
          date: {
              maxLength: 40,
              required: true,
              msg: "A date is required"
          },
          handle: {
              required: true,
              maxLength: 30
          },
          roid: {
              required: true,
              length: 17,
              pattern: "number"
          },
          reason: {
              required: true,
              msg: "A response to this question is required"
          },
          recruiter: {
              required: false,
              maxLength: 128
          }/*,
          unit_id: {
              required: true
          },
          status: {
              required: true
          }*/
      }
  });
