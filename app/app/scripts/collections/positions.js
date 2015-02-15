var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config.dev");

  "use strict";

  module.exports = Backbone.Collection.extend({
      initialize: function (models, options) {
          options = options || {};
          this.order = options.order || null;
      },
      url: function () {
          return config.apiHost + "/positions" + (this.order ? "?order=" + this.order : "");
      },
      parse: function (response, options) {
          return response.positions || [];
      }
  });
