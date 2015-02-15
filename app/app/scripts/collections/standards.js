var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config.dev");

  "use strict";
  
  // This should probably be a shared resource. Pretty handy. Used by units collection I think.
  var RecursiveModel = Backbone.Model.extend({
      initialize: function () {
          if (this.get("children")) {
              this.set("children", new Backbone.Collection(this.get("children"), {
                  model: RecursiveModel
              }));
          }
      }
  });

  module.exports = Backbone.Collection.extend({
      model: RecursiveModel,
      initialize: function(models, options) {
          options = options || {};
          this.hierarchy = options.hierarchy || false;
      },
      url: function () {
          var url = config.apiHost + "/standards";
          if(this.hierarchy) url += "?hierarchy=true";
          return url;
      },
      parse: function (response, options) {
          return response.standards || [];
      }
  });
