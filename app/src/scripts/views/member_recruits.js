var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member_recruits.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function(options) {
          options = options || {};
          this.recruits = options.collection || false;
      },
      serializeData: function () {
          var items = [];
          var rec_count = 0;
          _.each( this.recruits.toJSON(), function( recruit ) {
              if (!recruit.member.rank)
              {
                recruit.member.rank = 'Rec.';
              }
              if (! recruit.tp.id ) {recruit.tp.id = 99999;recruit.tp.tp = 'ID'};
              if (! items[recruit.tp.id] ) items[recruit.tp.id] = {tp:recruit.tp.tp,recruits:[]};
              items[recruit.tp.id].recruits.push({
                member: recruit.member,
                enlistment: recruit.enl
              });
              rec_count++
          });
          items.sort(function (a, b) {
              if (a.tp < b.tp) return 1;
              if (b.tp < a.tp) return -1;
              return 0;
          }); 
          return _.extend({
              recruits: items,
              rec_count: rec_count
          });
      }
  });
