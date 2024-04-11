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
      },
      url: function () {
          var params = {},
              url = config.apiHost;
          url += "/members/search";
          if (this.pattern) 
              url += "/" + this.pattern;

          return url;
      },
      setFilter: function (key, val) {
          this[key] = val; // unsecure
          return this;
      },
      parse: function (response, options) {
          this.more = parseInt(response.count, 10) > parseInt(response.skip, 10) + response.members.length;
          return response.members || [];
      }
  });
