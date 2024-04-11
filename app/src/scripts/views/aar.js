var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/aar.html");
var Marionette = require("backbone.marionette");


  module.exports = Marionette.Layout.extend({
      template: Template,
      title: "Post AAR",
      regions: {
          "attendanceRegion": "#attendance"
      },
      events: {
          "submit form": "onSubmitForm"
      },
      initialize: function () {
          _.bindAll(this, "onSubmitForm");
      },
      onRender: function () {
          if (this.model.get("unit").key) this.title = "Post AAR - " + this.model.get("unit").key + " " + this.model.get("type");
      },
      onSubmitForm: function (e) {
          e.preventDefault();
          var eventId = this.model.get("id"),
              data = {
                  report: e.currentTarget.report.value,
                  attended: $("[name=\"attendance\"]:checked", e.currentTarget).map(function () {
                      return $(this).val();
                  }).get(),
                  absent: $("[name=\"attendance\"]:not(:checked)", e.currentTarget).map(function () {
                      return $(this).val();
                  }).get()
              };
          this.model.save(data, {
              method: "POST",
              patch: true,
              data: data,
              processData: true,
              url: this.model.url() + "/aar",
              success: function () {
                  Backbone.history.navigate("events/" + eventId, {
                      trigger: true
                  });
              }
              // TODO: Error handling, loading indicator
          });
      }
  });
