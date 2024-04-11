var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Assignment = require("../models/assignment"),
  Template = require("../templates/assignment_edit.html");
var Marionette = require("backbone.marionette");
require("bootstrap-datepicker");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Modify Assignment",
      events: {
          "submit form": "onSubmitForm"
      },
      initialize: function (options) {
          options = options || {};
          this.units = options.units || {};
          this.subject = options.subject || {};
          this.positions = options.positions || {};
          _.bindAll(this, "onSubmitForm");
          Backbone.Validation.bind(this);
      },
      serializeData: function () {
          return $.extend({
              units: this.units.length ? this.units.toJSON() : {},
              positions: this.positions.length ? this.positions.toJSON() : {},
              subject: this.subject.toJSON(),
              assignments: this.assignments !== undefined && this.assignments.length ? this.assignments.toJSON() : null
          }, this.model.toJSON());
      },
      onRender: function() {
          this.$(".selectpicker").selectpicker();
      },
      onSubmitForm: function (e) {
          e.preventDefault();
          var data = $(e.currentTarget).serializeObject();
          data.member_id = this.model.get("member").id;
          this.model.save(data, {
              method: "POST",
              patch: true,
              data: data,
              processData: true,
              success: function () {
                  // End previous assignment if applicable
                  if(data.former_assignment_id) {
                      var formerAssignment = new Assignment({id: data.former_assignment_id});
                      formerAssignment.save(null, {
                          method: "POST",
                          data: {end_date: data.start_date},
                          processData: true,
                          success: function() {
                              Backbone.history.navigate("members/" + data.member_id + "/servicerecord", {
                                  trigger: true
                              });
                          }
                      });
                  } else {
                      Backbone.history.navigate("members/" + data.member_id + "/servicerecord", {
                          trigger: true
                      });
                  }
              }
              //,error: function() {console.log("ERROR!!!")}
          });
      }
  });
