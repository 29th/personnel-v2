var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/note_edit.html");
var Marionette = require("backbone.marionette");
require("bootstrap-datepicker");
require("backbone.validation");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Add/Edit Note",
      events: {
          "submit form": "onSubmitForm"
      },
      initialize: function (options) {
          options = options || {};
          this.permissions = options.permissions || {};
          this.permissions.on("reset", this.render, this);
          this.units = options.units || {};
          Backbone.Validation.bind(this);
          _.bindAll(this, "onSubmitForm");
      },
      serializeData: function () {
          var permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
              levelList = [];
              if ( permissions.indexOf("note_view_all") !== -1 ) 
              {
                levelList = ['Public','Members Only','Squad Level','Platoon Level','Company Level','Battalion HQ','Officers Only','Military Police','Lighthouse'];
              }
              else if ( permissions.indexOf("note_view_mp") !== -1 ) 
              {
                levelList = ['Public','Members Only','Squad Level','Platoon Level','Company Level','Officers Only','Military Police','Lighthouse'];
              }
              else if ( permissions.indexOf("note_view_co") !== -1 ) 
              {
                levelList = ['Public','Members Only','Squad Level','Platoon Level','Company Level'];
              }
              else if ( permissions.indexOf("note_view_pl") !== -1 ) 
              {
                levelList = ['Public','Members Only','Squad Level','Platoon Level'];
              }
              else if ( permissions.indexOf("note_view_sq") !== -1 ) 
              {
                levelList = ['Public','Members Only','Squad Level'];
              }
              if ( permissions.indexOf("note_view_lh") !== -1 ) 
              {
                levelList.push('Lighthouse');
              }
          return $.extend({
              units: this.units.length ? this.units.toJSON() : {},
              member_id: this.model.member_id,
              levelList:levelList
          }, this.model.toJSON());
      },
      onRender: function() {
          this.$(".selectpicker").selectpicker();
      },
      onSubmitForm: function (e) {
          e.preventDefault();
          var data = $(e.currentTarget).serializeObject();

          this.model.save(data, {
              method: "POST",
              patch: true,
              data: data,
              processData: true,
              success: function (model, response, options) {
                  Backbone.history.navigate( "notes/" + model.get("id"), {
                      trigger: true
                  });
              }
              ,error: function() {console.log("ERROR!!!")}
          });
      }
  });
