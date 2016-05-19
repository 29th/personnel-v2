var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");

  "use strict";

  module.exports = Backbone.Collection.extend({
      initialize: function (models, options) {
          this.game = models.game || null;
          this.members = models.members || null;
      },
      url: function () {
          var url = config.apiHost;
          url += "/awards";

          var params = [];
          if(this.game) params.push("game=" + this.game);
         // if(this.members) params.push("members=" + this.members);
          if(params.length) url += "?" + params.join("&");
          
          return url;
      },
      parse: function (response, options) {
          return response || [];
      }
  });
