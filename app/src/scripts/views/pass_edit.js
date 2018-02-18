var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/pass_edit.html"),
  Countries = require("../countries.json");
var Marionette = require("backbone.marionette");
require("backbone.validation");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Add/Edit Weapon Pass",
      events: {
          "submit form": "onSubmitForm"
      },
      initialize: function (options) {
          options = options || {};
          this.units = options.units || {};
          this.recruits = options.recruits || {};
          this.permissions = options.permissions || {};
          this.permissions.on("reset", this.render, this);
          Backbone.Validation.bind(this);
          _.bindAll(this, "onSubmitForm");
      },
      serializeData: function () {
          return $.extend({
             pass_id:this.model.id,
             units: this.units.length ? this.units.toJSON() : {},
             recruits: this.recruits.length ? this.recruits.toJSON() : {},
             member_id: this.passes.member_id
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
                  Backbone.history.navigate("members/" + model.get("member_id") + "/passes", {
                      trigger: true
                  });
              }
              ,error: function() {console.log("ERROR!!!")}
          });
      }
  });
