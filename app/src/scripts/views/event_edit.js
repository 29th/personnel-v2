var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/event_edit.html");
var Marionette = require("backbone.marionette");
require("bootstrap-datepicker");
require("backbone.validation");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Modify Event",
      events: {
          "submit form": "onSubmitForm"
      },
      initialize: function (options) {
          options = options || {};
          this.units = options.units || {};
          this.servers = options.servers || {};
          Backbone.Validation.bind(this);
          _.bindAll(this, "onSubmitForm");
      },
      serializeData: function () {
          return $.extend({
              units: this.units.length ? this.units.toJSON() : {},
              servers: this.servers.length ? this.servers.toJSON() : {}
          }, this.model.toJSON());
      },
      onRender: function() {
          this.$(".selectpicker").selectpicker();
      },
      onSubmitForm: function (e) {
          e.preventDefault();
          var data = $(e.currentTarget).serializeObject();

          // Format date(s) and time
          data["datetime"] = data["date"].split(",");
          for(var i in data["datetime"]) {
              data["datetime"][i] += " " + data["time"];
          }

          this.model.save(data, {
              method: "POST",
              patch: true,
              data: data,
              processData: true,
              success: function (model, response, options) {
                  Backbone.history.navigate(response.events.length === 1 ? "events/" + response.events[0].id : "calendar", {
                      trigger: true
                  });
              }
              //,error: function() {console.log("ERROR!!!")}
          });
      }
  });
