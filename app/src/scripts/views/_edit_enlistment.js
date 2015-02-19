var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/edit_enlistment.html"),
  Countries = require("../json!countries.json");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template
      ,events: {
          "submit form": "onSubmitForm"
      }
      ,initialize: function() {
          _.bindAll(this, "onSubmitForm");
          this.ages = [];
          var i;
          for(i = 13; i <= 99; i++) { this.ages.push(i); }
      }
      ,serializeData: function() {
          return $.extend({ages: this.ages, countries: Countries}, this.model.toJSON());
      }
      ,onSubmitForm: function(e) {
          e.preventDefault();
          var eventId = this.model.get("id")
              ,data = {
                  report: e.currentTarget.report.value
                  ,attended: $("[name=\"attendance\"]:checked", e.currentTarget).map(function() { return $(this).val(); }).get()
                  ,absent: $("[name=\"attendance\"]:not(:checked)", e.currentTarget).map(function() { return $(this).val(); }).get()
              };
          this.model.save(data, {
              method: "POST"
              ,success: function() {
                  Backbone.history.navigate("events/" + eventId, {trigger: true});
              }
              // TODO: Error handling, loading indicator
          });
      }
  });
