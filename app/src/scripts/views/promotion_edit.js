var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  config = require("../config"),
  Template = require("../templates/promotion_edit.html"),
  Countries = require("../countries.json");
  util = require("../util");
var Marionette = require("backbone.marionette");
require("backbone.validation");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "New Promotion",
      events: {
          "submit form": "onSubmitForm"
      },
      initialize: function (options) {
          options = options || {};
          this.member = options.member || {};
          this.ranks = options.ranks || {};
          _.bindAll(this, "onSubmitForm");
          Backbone.Validation.bind(this);
      },
      serializeData: function () {
          return $.extend({
              member: this.member.toJSON(),
              ranks: this.ranks.toJSON(),
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
                  Backbone.history.navigate("members/" + model.get("member_id"), {
                      trigger: true
                  });
              },
              error: function() {console.log("ERROR!!!")}
          });
      }
  });
