var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");


  module.exports = Backbone.Model.extend({
      url: function () {
          var url = config.apiHost;
          url += "/finances/balance";
          return url;
      }
  });
