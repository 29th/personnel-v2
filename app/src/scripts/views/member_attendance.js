var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member_attendance.html"),
  ItemTemplate = require("../templates/member_attendance_item.html");
var Marionette = require("backbone.marionette");

  
  var ItemView = Marionette.ItemView.extend({
      template: ItemTemplate,
      tagName: "tr"
  });

  module.exports = Marionette.CompositeView.extend({
      template: Template,
      itemView: ItemView,
      itemViewContainer: "#rows"
      /**
       * Necessary because our collection will finish fetching before this view is rendered,
       * so itemViewContainer doesn't exist. See https://github.com/marionettejs/backbone.marionette/issues/377
       */
      ,
      _initialEvents: function () {
          this.once("render", function () {
              if (this.collection) {
                  this.listenTo(this.collection, "add", this.addChildView, this);
                  this.listenTo(this.collection, "remove", this.removeItemView, this);
                  this.listenTo(this.collection, "reset", this._renderChildren, this);
              }
          }, this);
      },
      initialize: function () {
          _.bindAll(this, "onClickMore");
      },
      events: {
          "click .more": "onClickMore"
      },
      onRender: function () {
          this.checkMoreButton();
      },
      onClickMore: function (e) {
          e.preventDefault();
          var self = this,
              button = $(e.currentTarget);
          button.button("loading");
          this.collection.nextPage().fetch({
              remove: false,
              success: function () {
                  button.button("reset");
                  self.checkMoreButton();
              },
              error: function () {
                  button.button("error");
              }
          });
      },
      checkMoreButton: function () {
          this.$(".more").toggle(this.collection.more);
      },
      serializeData: function () {
          var percentages = [[0,0],[0,0],[0,0],[0,0]];
          var perc30, perc60, perc90, percAll;
          var mod = this.collection.models;
          var d30 = new Date(); 
          var d60 = new Date(); 
          var d90 = new Date();
          d30.setDate(d30.getDate()-30).format;
          d30 = d30.getTime();
          d60.setDate(d60.getDate()-60);
          d60 = d60.getTime();
          d90.setDate(d90.getDate()-90);
          d90 = d90.getTime();
          var att_date;
          for(j=0;j<mod.length;j++) {
            if ( mod[j].attributes.event.mandatory ) {
                att_date = Date.parse( mod[j].attributes.event.datetime );
                if( att_date > d30 ) {percentages[0][0]+=mod[j].attributes.attended;percentages[0][1]+=1; };
                if( att_date > d60 ) {percentages[1][0]+=mod[j].attributes.attended;percentages[1][1]+=1; };
                if( att_date > d90 ) {percentages[2][0]+=mod[j].attributes.attended;percentages[2][1]+=1; };
                percentages[3][0]+=mod[j].attributes.attended;percentages[3][1]+=1;
            }
          }
          if ( percentages[0][1] ) perc30 = (percentages[0][0]/percentages[0][1])*100; else perc30 = "100";
          if ( percentages[1][1] ) perc60 = (percentages[1][0]/percentages[1][1])*100; else perc60 = "100";
          if ( percentages[2][1] ) perc90 = (percentages[2][0]/percentages[2][1])*100; else perc90 = "100";
          if ( percentages[3][1] ) percAll = (percentages[3][0]/percentages[3][1])*100; else percAll = "100";
          return _.extend({
              perc30: parseInt(perc30),
              perc60: parseInt(perc60),
              perc90: parseInt(perc90),
              percAll: parseInt(percAll)
          });
      }
  });
