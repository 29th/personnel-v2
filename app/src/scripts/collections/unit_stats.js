var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");


  module.exports = Backbone.Collection.extend({
      initialize: function (models, options) {
          options = options || {};
          this.filter = options.filter || false;
          this.days = options.days || false;
      },
      url: function () {
          return config.apiHost + "/units/" + this.filter + "/stats" + (this.days ? "?days=" + this.days : "");
      },
      parse: function (response, options) {
          return response || [];
      },
      setFilter: function (key, val) {
          this[key] = val; // unsecure
          return this;
      },
  });
