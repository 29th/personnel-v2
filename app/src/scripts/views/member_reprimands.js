var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member_reprimands.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function(options) {
          options = options || {};
          this.awols = options.awols || false;
          this.demerits = options.demerits || false;
      },
      serializeData: function () {
          var items = [];
          var rec_count = 0;
          var today = new Date();
          _.each( this.awols.toJSON(), function( awol ) {
            var dd = new Date( awol.date );
            var isActive = (Math.round(Math.abs((today.getTime() - dd.getTime())/(24*60*60*1000))) < 30);
            if (! items[awol.date] ) items[awol.date] = {date:awol.date,active:isActive,reprimands:[]};
            items[awol.date].reprimands.push({
                event_id: awol.id,
                date: awol.date,
                type: 'Attendance',
                label: awol.type
              });
              rec_count++;
          });
          _.each( this.demerits.toJSON(), function( demerit ) {
            var dd = new Date( demerit.date );
            var isActive =  (Math.round(Math.abs((today.getTime() - dd.getTime())/(24*60*60*1000))) <30);
            if (! items[demerit.date] ) items[demerit.date] = {date:demerit.date,active:isActive,reprimands:[]};
            items[demerit.date].reprimands.push({
                event_id: demerit.id,
                date: demerit.date,
                type: demerit.demerit_type,
                author: demerit.author,
                reason: demerit.reason,
                label: demerit.type
              });
              rec_count++;
          });
          items = _.values(items).sort(function (a, b) {
              if (a.date < b.date) return 1;
              if (b.date < a.date) return -1;
              return 0;
          });
          return _.extend({
              reprimands: items,
              rec_count: rec_count
          });
      }
  });
