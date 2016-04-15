var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/enlistment_edit.html"),
  Countries = require("../countries.json");
var Marionette = require("backbone.marionette");
require("backbone.validation");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Modify Enlistment",
      events: {
          "submit form": "onSubmitForm"
      },
      initialize: function (options) {
          options = options || {};
          this.tps = options.tps || {};
          this.userdata = options.user || {};
          _.bindAll(this, "onSubmitForm");
          this.ages = [];
          var i;
          for (i = 13; i <= 99; i++) {
              this.ages.push(i);
          }
          Backbone.Validation.bind(this);
      },
      serializeData: function () {
          return $.extend({
              ages: this.ages,
              countries: Countries,
              userdata: _.isEmpty(this.userdata) ? [] : this.userdata.toJSON(),
              tps: this.tps.length ? this.tps.at(0).get("children").toJSON() : {}
          }, this.model.toJSON());
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
                  Backbone.history.navigate("enlistments/" + model.get("id"), {
                      trigger: true
                  });
              },
              error: function() {console.log("ERROR!!!")}
          });
      }
  });
