var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member_profile.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function(options) {
          options = options || {};
          this.finances = options.finances || false;
      },
      serializeData: function () {
          var fin_sum = _.reduce(this.finances.pluck("amount_received"), function(m, x) { return +m + +x; }, 0),
              sig = '',
              steam_id = this.model.toJSON().steam_id;
          
//          var a = this.sigExists( config.sigUrl + '/' + steam_id + '.png' );
          $.ajax({
            url:  config.sigUrl + '/' + steam_id + '.png',
            type: "GET",
            async:false,
            dataType: "json",
            success: function() {
              sig = this.url;
            }
          })
          return _.extend({
              forum: config.forum,
              fin_sum: fin_sum,
              sig: config.sigUrl + '/' + steam_id + '.png',
              short_name_url: this.model.get("short_name").replace("/", "")
          }, this.model.toJSON());
      },
      sigExists(src) {
        var img = new Image();
        img.onload = function() {return src;};
        img.onerror = function() { return '';};
        img.src = src;
      }
  });
