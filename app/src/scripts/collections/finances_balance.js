var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");


  module.exports = Backbone.Collection.extend({
      initialize: function (models, options) {
          options = options || {};
      },
      url: function () {
          var url = config.apiHost;
          url += "/finances/balance";
          return url;
      },
      parse: function (response, options) {
          return response.balance || [];
      }
  });
