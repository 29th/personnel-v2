var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  MemberModifyTemplate = require("../templates/member_modify.html");
var Marionette = require("backbone.marionette");

  var MemberModifyView = Marionette.ItemView.extend({
      template: MemberModifyTemplate
      ,initialize: function() {
          _.bindAll(this, "onFormSubmit");
      }
      ,events: {
          "submit form": "onFormSubmit"
      }
      ,onFormSubmit: function(e) {
          e.preventDefault();
          console.log($(e.currentTarget).serializeObject());
          this.model.save($(e.currentTarget).serializeObject(), {type: "POST", patch: true, error: function() {console.log("ERROR!!!")}});
      }
  });
  
  module.exports = MemberModifyView;
