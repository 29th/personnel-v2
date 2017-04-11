var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/unit_edit.html");
var Marionette = require("backbone.marionette");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function () {
          _.bindAll(this, "onSubmitForm");
          Backbone.Validation.bind(this);
      },
      events: {
          "submit form": "onSubmitForm"
      },
      serializeData: function () {
          return $.extend({}, this.model.toJSON()[0]);
      },
      onSubmitForm: function (e) {
          e.preventDefault();
          var data = $(e.currentTarget).serializeObject(),
              unitId = this.collection.get("id");
          this.collection.save(data, {
              method: "POST",
              patch: true,
              data: data,
              processData: true,
              success: function () {
                  Backbone.history.navigate("units/" + unitId, {
                      trigger: true
                  });
              }
              //,error: function() {console.log("ERROR!!!")}
          });
      }
  });
