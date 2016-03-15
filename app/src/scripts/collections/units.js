var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");

  "use strict";

  /**
   * Model
   * Needs to be here to avoid circular dependencies. Units requires Unit, and Unit requires Units
   */
  var Unit = Backbone.Model.extend({
      initialize: function () {
          if (this.get("children")) {
              this.set("children", new Units(this.get("children")));
          }
      } // Need to add children stuff here too for recursive
      /*,url: function() {
          var params = {}
              ,url = this.settings.apiHost + "/units";
          if(this.get("filter")) url += "/" + encodeURIComponent(this.get("filter"));
          if(this.get("children")) params.children = this.get("children");
          if(this.get("members")) params.members = this.get("members");
          if( ! _.isEmpty(params)) url += "?" + $.param(params);
          return url;
      }
      ,parse: function(response, options) {
          console.log("here");
          if(response.unit.children !== undefined) {
              response.unit.children = new Units(response.unit.children);
          }
          return response.unit || {};
      }*/
  });

  /**
   * Collection
   */
  var Units = Backbone.Collection.extend({
      model: Unit,
      initialize: function (models, options) {
          options = options || {};
          this.filter = options.filter || false;
          this.children = options.children || false;
          this.members = options.members || false;
          this.inactive = options.inactive || false;
          this.order = options.order || false;
          this.historic = options.historic || false;
          this.flat = options.flat || false;
          this.distinct = options.distinct || false;
          this.position = options.position || false;
      },
      url: function () {
          var params = {},
              url = config.apiHost + "/units";
          if (this.filter) url += "/" + encodeURIComponent(this.filter);
          if (this.children) params.children = this.children;
          if (this.members) params.members = this.members;
          if (this.inactive) params.inactive = this.inactive;
          if (this.order) params.order = this.order;
          if (this.historic) params.historic = this.historic;
          if (this.flat) params.flat = this.flat;
          if (this.distinct) params.distinct = this.distinct;
          if (this.position) params.position = this.position;
          if (!_.isEmpty(params)) url += "?" + $.param(params);
          return url;
      },
      parse: function (response, options) {
          if (this.flat) {
              return this.flatten(response.units || [response.unit]);
          } else {
              return response.units || [response.unit] || []; // Return as array since it's a collection
          }
      },
      flatten: function (units) {
          var flattened = [],
              self = this;
          _.each(units, function (val, key) {
              flattened.push(val);
              if (val.children) {
                  if (val.children.length) {
                      flattened = flattened.concat(self.flatten(_.isFunction(val.children.toJSON) ? val.children.toJSON() : val.children));
                  }
                  delete val.children;
              }
          });
          return flattened;
      }
  });
  
  module.exports = Units;
