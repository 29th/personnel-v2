var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/banlog_edit.html"),
  Countries = require("../countries.json");
var Marionette = require("backbone.marionette");
require("backbone.validation");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Add Banlog",
      events: {
          "submit form": "onSubmitForm"
      },
      initialize: function (options) {
          options = options || {};
          this.units = options.units || {};
          _.bindAll(this, "onSubmitForm");
          Backbone.Validation.bind(this);
      },
      serializeData: function () {
          return $.extend({
              countries: Countries,
              units: this.units.length ? this.units.toJSON() : {}
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
                  Backbone.history.navigate("banlogs/" + model.get("id"), {
                      trigger: true
                  });
              },
              error: function() {console.log("ERROR!!!")}
          });
      }
  });
