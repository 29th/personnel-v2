var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member_edit.html"),
  Countries = require("../countries.json");
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
          return $.extend({
              countries: Countries
          }, this.model.toJSON());
      },
      onSubmitForm: function (e) {
          e.preventDefault();
          var data = $(e.currentTarget).serializeObject(),
              memberId = this.model.get("id");
          this.model.save(data, {
              method: "POST",
              patch: true,
              data: data,
              processData: true,
              success: function () {
                  Backbone.history.navigate("members/" + memberId, {
                      trigger: true
                  });
              }
              //,error: function() {console.log("ERROR!!!")}
          });
      }
  });
