var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");


  module.exports = Backbone.Collection.extend({
      settings: {
          limit: 15
      },
      initialize: function (models, options) {
          options = options || {};
          this.filter = options.filter || false;
          this.member_id = options.member_id || null;
          this.unit_id = options.unit_id || null;
          this.skip = 0;
          this.status = options.status || null;
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
          url += "/eloas";

          var params = [];
          if(this.status) params.push("status=" + this.status);
          if(this.skip) params.push("skip=" + this.skip);
          if(this.from) params.push("from=" + this.from);
          if(this.to) params.push("to=" + this.to);
          if(params.length) url += "?" + params.join("&");
          
          return url;
      },
      setFilter: function (key, val) {
          this[key] = val; // unsecure
          return this;
      },
      nextPage: function () {
          this.skip += this.settings.limit;
          return this;
      },
      resetPage: function() {
          var model;
          this.skip = 0;
          while (model = this.first()) {
            model.destroy();
          }
          return this;
      },
      parse: function (response, options) {
          this.more = parseInt(response.count, 10) > parseInt(response.skip, 10) + response.eloas.length;
          return response.eloas || [];
      }
  });
