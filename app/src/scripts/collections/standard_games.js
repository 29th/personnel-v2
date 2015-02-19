var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config");

  "use strict";
  
  var groupToCollection = function(group, collectionObject) {
      var data = [];
      _.each(group, function(val, key) {
          data.push({title: key, children: new collectionObject(val)});
      });
      return data;
  };
  
  var StandardBadges = Backbone.Collection.extend({
      initialize: function(models) {
          this.reset(groupToCollection(_.groupBy(models, "badge"), Backbone.Collection));
          console.log("Badges", this.toJSON());
      }
  });
  
  var StandardWeapons = Backbone.Collection.extend({
      initialize: function() {
          this.on("reset", "onReset");
          this.models = [];//groupToCollection(_.groupBy(models, "weapon"), Backbone.Collection);
          this.foo = "bar";
          //console.log("Weapons", this.toJSON());
      },
      onReset: function(collection) {
          
      }
  });

  // StandardGames
  module.exports = Backbone.Collection.extend({
      url: function () {
          return config.apiHost + "/standards";
      },
      parse: function (response, options) {
          //return response.standards || [];
          if(response.standards.length) {
              var data = [],
                  groups = _.groupBy(response.standards, "game");
              
              _.each(groups, function(val, key) {
                  data.push({title: key, children: new StandardWeapons(val)});
              });
              
              console.log(data);
              
              return data;
          }
      }
  });
