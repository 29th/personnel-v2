var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/enlistment_process.html");
var Marionette = require("backbone.marionette");
require("bootstrap-select");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Process Enlistment",
      events: {
          "submit form": "onSubmitForm"
      },
      initialize: function (options) {
          options = options || {};
          this.tps = options.tps || {};
          this.lh = options.lh || {};
          this.units = options.units || {};

          this.permissions = options.permissions || {};
          this.permissions.on("reset", this.render, this);

          _.bindAll(this, "onSubmitForm");
          Backbone.Validation.bind(this);
      },
      serializeData: function () {
          var permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
              allowedTo = {
                  assignLiaison: permissions.indexOf("enlistment_assign_any") !== -1
              };
          return $.extend({
              tps: this.tps.length ? this.tps.at(0).get("children").toJSON() : {},
//              tps: this.tps.length ? this.tps.toJSON() : {},
              units: this.units.length ? this.units.toJSON() : {},
              lh: this.lh.length ? this.lh.toJSON() : {},
              allowedTo: allowedTo
          }, this.model.toJSON());
      },
      onRender: function() {
          this.$(".selectpicker").selectpicker();
      },
      onSubmitForm: function (e) {
          e.preventDefault();
          var data = $(e.currentTarget).serializeObject(),
              enlistmentId = this.model.get("id");
          this.model.save(data, {
              method: "POST",
              patch: true,
              data: data,
              processData: true,
              url: this.model.url() + "/process",
              success: function () {
                  Backbone.history.navigate("enlistments/" + enlistmentId, {
                      trigger: true
                  });
              }
              //,error: function() {console.log("ERROR!!!")}
          });
      }
  });
