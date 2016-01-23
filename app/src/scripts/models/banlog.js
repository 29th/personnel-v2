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
      }
      //Here add verify when adding add/edit of banlogs
  });
