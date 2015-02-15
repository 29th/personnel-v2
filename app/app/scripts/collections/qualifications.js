var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Qualification = require("../models/qualification"),
  config = require("../config.dev");

  "use strict";

  module.exports = Backbone.Collection.extend({
      model: Qualification,
      initialize: function (models, options) {
          options = options || {};
          this.member_id = options.member_id || false;
      },
      url: function () {
          return config.apiHost + "/members/" + this.member_id + "/qualifications";
      },
      parse: function (response, options) {
          return response.qualifications || [];
      }
  });
