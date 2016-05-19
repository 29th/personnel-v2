var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");

  "use strict";

  module.exports = Backbone.Model.extend({
      initialize: function (options) {
          this.members = options.members || null;
      },
      url: function () {
          var url = config.apiHost + "/awards/" + this.id,
            params = [];
          if(this.members) params.push("members=" + this.members);
          if(params.length) url += "?" + params.join("&");
          return url;
      },
      parse: function (response, options) {
          return response.award || {};
      }
  });
