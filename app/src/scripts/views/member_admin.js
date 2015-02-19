var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member_admin.html");
var Marionette = require("backbone.marionette");

  
  module.exports = Marionette.ItemView.extend({
      template: Template,
      initialize: function (options) {
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
                  modifyProfile: memberPermissions.indexOf("profile_edit") !== -1 || permissions.indexOf("profile_edit_any") !== -1,
                  assign: permissions.indexOf("assignment_add") !== -1 || permissions.indexOf("assignment_add_any") !== -1,
                  discharge: memberPermissions.indexOf("discharge_add") !== -1 || permissions.indexOf("discharge_add_any") !== -1
              };
          allowedTo.admin = allowedTo.modifyProfile || allowedTo.assign || allowedTo.discharge;
          
          return {
              member_id: this.memberPermissions.member_id,
              allowedTo: allowedTo
          };
      }
  });
