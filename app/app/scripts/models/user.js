var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config.dev");

  "use strict";

  module.exports = Backbone.Model.extend({
      url: config.apiHost + "/user",
      parse: function (response, options) {
          return response.user || {};
      }
  });
