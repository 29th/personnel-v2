var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/demerit.html");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Demerit",
      initialize: function(options) {
          options = options || {};

          this.permissions = options.permissions || {};
          this.permissions.on("reset", this.render, this);

          this.memberPermissions = options.memberPermissions || {};
          this.memberPermissions.on("reset", this.render, this);
      },
      serializeData: function () {
          var permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
              memberPermissions = this.memberPermissions.length ? this.memberPermissions.pluck("abbr") : [],
              allowedTo = {
                  editDemerit: (permissions.indexOf("demerit_add_any") !== -1 || memberPermissions.indexOf("demerit_add") !== -1 )
              };
          return $.extend({
              allowedTo: allowedTo
          }, this.model.toJSON());
      },
      onRender: function () {
          if (this.model.get("member") && this.model.get("member").short_name) this.title = "Demerit - " + this.model.get("member").short_name;
      },
  });
