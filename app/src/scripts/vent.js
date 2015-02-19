var $ = require("jquery"),
  _ = require("underscore"),
  Wreqr = require("./backbone.wreqr"),
  util = require("./util");

  "use strict";
  
  var vent = new Wreqr.EventAggregator()
      ,promises = [];
  
  vent.on("fetch", function(promise) {
      var wasEmpty = promises.length === 0;
      
      promise instanceof Array ? promises.concat(promise) : promises.push(promise);
      console.log("Added promise");
      
      if(wasEmpty) {
          util.loading(true);
          console.log("Loading on");
      
          $.when.apply($, promises).done(function() {
              util.loading(false);
              console.log("Loading off");
          });
      }
  });
  
  module.exports = vent;
