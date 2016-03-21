var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");

  "use strict";

  module.exports = Backbone.Collection.extend({
      initialize: function (models, options) {
          options = options || {};
          this.member_id = options.member_id || false;
          this.unit_id = options.unit_id || null;
          this.skip = 0;
          this.from = options.from || null;
          this.to = options.to || null;
          this.current = options.current || false;
      },
      url: function () {
          var url = config.apiHost; 
          //+ (this.member_id ? "/members/" + this.member_id : "/user/") + 
          if(this.member_id) {
              url += "/members/" + this.member_id;
          }
          else if(this.unit_id) {
              url += "/units/" + this.unit_id;
          }
          else
              url += "/user";
          url += "/assignments";
          var params = [];
          if (this.current) params.push("current=true");
          if(this.skip) params.push("skip=" + this.skip);
          if(this.from) params.push("from=" + this.from);
          if(this.to) params.push("to=" + this.to);
          if(params.length) url += "?" + params.join("&");
//          if (this.current) url += "?current=true";
          return url;
      },
      parse: function (response, options) {
          this.duration = response.duration || null;
          this.discharge_date = response.discharge_date || null;
          this.member_status = response.member_status || null;
          return response.assignments || [];
      }
  });
