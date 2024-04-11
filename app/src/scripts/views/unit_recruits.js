var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/unit_recruits.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function(options) {
          options = options || {};
          this.recruits = options.collection || false;
      },
      serializeData: function () {
          var items = [], 
              items2 = [],
              rec_count = 0;
          _.each( this.recruits.toJSON(), function( recruit ) {
            //formatting data  
              if (!recruit.member.rank) recruit.member.rank = 'Rec.';
              if (!recruit.tp.id || recruit.tp.tp.indexOf('TP') < 0 ) { recruit.tp.id = 99999; recruit.tp.tp = 'ID'; }
              
            //plucking by TP
              if (!items[recruit.tp.id] )
                items[recruit.tp.id] = {tp:recruit.tp.tp,recruiters:[],count:0};
              if (!items[recruit.tp.id].recruiters[recruit.recruiter.recruiter_id] )
                items[recruit.tp.id].recruiters[recruit.recruiter.recruiter_id] = {recruiter_id:recruit.recruiter.recruiter_id, recruiter_name: (recruit.recruiter.rank||'Rec. ')+' '+recruit.recruiter.last_name,recruits:[], count:0};
              items[recruit.tp.id].recruiters[recruit.recruiter.recruiter_id].recruits.push({
                member: recruit.member,
                enlistment: recruit.enl,
                recruiter: recruit.recruiter
              });
              items[recruit.tp.id].count++;
              items[recruit.tp.id].recruiters[recruit.recruiter.recruiter_id].count++;
              
            //plucking by recruiter
              if (!items2[recruit.recruiter.recruiter_id] )
                items2[recruit.recruiter.recruiter_id] = {recruiter_id:recruit.recruiter.recruiter_id, recruiter_name: (recruit.recruiter.rank||'Rec. ')+' '+recruit.recruiter.last_name,recruits:[], count:0};
              items2[recruit.recruiter.recruiter_id].count++;
            //increase counter
              rec_count++;
          });
          items.sort(function (a, b) {
              if (a.tp < b.tp) return 1;
              if (b.tp < a.tp) return -1;
              return 0;
          });
          _.each( items, function( recruiter, key ) {
            if (recruiter) {  
              items[key].recruiters.sort(function (a, b) {
                  if (a.count < b.count) return 1;
                  if (b.count < a.count) return -1;
                  return 0;
              });
              items[key].recruiters.length =  items[key].count; 
            }
          });
          items2.sort(function (a, b) {
              if (a.count < b.count) return 1;
              if (b.count < a.count) return -1;
              return 0;
          }); 
          return _.extend({
              recruits_by_tp: items,
              recruits_by_recruiter: items2,
              rec_count: rec_count
          });
      }
  });
