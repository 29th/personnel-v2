var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config"),
  Promotion = require("../models/promotion");

  "use strict";

  module.exports = Backbone.Collection.extend({
      model: Promotion,
      initialize: function (models, options) {
          options = options || {};
          this.member_id = options.member_id || null;
          this.unit_id = options.unit_id || null;
          this.skip = 0;
          this.from = options.from || null;
          this.to = options.to || null;
      },
      url: function () {
          var url = config.apiHost;
          if(this.member_id) {
              url += "/members/" + this.member_id;
          }
          else if(this.unit_id) {
              url += "/units/" + this.unit_id;
          }
          url += "/promotions";

          var params = [];
          if(this.skip) params.push("skip=" + this.skip);
          if(this.from) params.push("from=" + this.from);
          if(this.to) params.push("to=" + this.to);
          if(params.length) url += "?" + params.join("&");
          
          return url;
      },
      parse: function (response, options) {
          this.more = response.count ? (parseInt(response.count, 10) > parseInt(response.skip, 10) + response.promotions.length) : false;
          return response.promotions || [];
      }
  });
