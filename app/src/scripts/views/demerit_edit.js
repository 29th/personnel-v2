var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Demerit = require("../models/demerit"),
  Template = require("../templates/demerit_edit.html");
var Marionette = require("backbone.marionette");
require("bootstrap-datepicker");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Modify Demerit",
      events: {
          "submit form": "onSubmitForm"
      },
      initialize: function (options) {
          options = options || {};
          this.units = options.units || {};
          this.permissions = options.permissions || {};
          this.permissions.on("reset", this.render, this);
          _.bindAll(this, "onSubmitForm");
          Backbone.Validation.bind(this);
      },
      serializeData: function () {
          return $.extend({
              demerit_id:this.model.id,
              units: this.units.length ? this.units.toJSON() : {},
//              subject_member: this.subject_member.length ? this.subject_member.toJSON() : {},
              demerits: this.demerits !== undefined && this.demerits.length ? this.demerits.toJSON() : null
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
                  Backbone.history.navigate( "demerits/" + model.get("id"), {
                      trigger: true
                  });
              }
              ,error: function(model, response, options) {
                  alert(response.responseJSON.error);
                  console.log("ERROR!!!");
              }
          });
      }
  });
