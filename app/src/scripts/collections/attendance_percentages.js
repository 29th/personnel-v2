var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");

  module.exports = Backbone.Collection.extend({
      initialize: function (models, options) {
          options = options || {};
          this.member_id = options.member_id || null;
          this.unit_id = options.unit_id || null;
      },
      url: function () {
          var url = config.apiHost;
          if( $.isNumeric( this.member_id ) ) {
              url += "/members/";
          }
          else  {
              url += "/units/";
          }
          url += this.member_id + "/percentage";

          return url;
      },
      nextPage: function () {
          this.skip += this.settings.limit;
          return this;
      },
      parse: function (response, options) {
          return response.percentages || [];
      }
  });
