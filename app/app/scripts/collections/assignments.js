var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config.dev");

  "use strict";

  module.exports = Backbone.Collection.extend({
      initialize: function (models, options) {
          options = options || {};
          this.member_id = options.member_id || false;
          this.current = options.current || false;
      },
      url: function () {
          var url = config.apiHost + (this.member_id ? "/members/" + this.member_id : "/user/") + "/assignments";
          if (this.current) url += "?current=true";
          return url;
      },
      parse: function (response, options) {
          this.duration = response.duration || null;
          this.discharge_date = response.discharge_date || null;
          return response.assignments || [];
      }
  });
