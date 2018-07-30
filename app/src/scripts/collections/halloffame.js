var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");

  "use strict";

  module.exports = Backbone.Collection.extend({
      initialize: function (models, options) {
      },
      url: function () {
          var url = config.apiHost;
          url += "/halloffame";

          var params = [];
          return url;
      },
      parse: function (response, options) {
          return response.halloffame || [];
      }
  });
