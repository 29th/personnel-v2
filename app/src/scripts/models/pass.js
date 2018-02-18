var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");

  "use strict";

  module.exports = Backbone.Model.extend({
      url: function () {
          var url = config.apiHost + "/passes";
          if(this.id) url += "/" + this.id;
          return url;
      },
      validation: {
          start_date: {
              required: true
          },
          end_date: {
              required: true,
              fn: 'geStartDate'
          },
          geStartDate: function(val, attr, computed) {return 'xxx';},
          reason: {
              required: true,
          },
          availability: {
              required: false,
          }
      }
  });
