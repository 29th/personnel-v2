var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");


  module.exports = Backbone.Collection.extend({
      url: function () {
          return config.apiHost + "/ranks";
      },
      parse: function (response, options) {
          return response.ranks || [];
      }
  });
