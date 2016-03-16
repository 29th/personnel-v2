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
                  addELOA: memberPermissions.indexOf("eloa_add") !== -1 || permissions.indexOf("eloa_add_any") !== -1,
                  modifyProfile: memberPermissions.indexOf("profile_edit") !== -1 || permissions.indexOf("profile_edit_any") !== -1,
                  assign: permissions.indexOf("assignment_add") !== -1 || permissions.indexOf("assignment_add_any") !== -1,
                  discharge: memberPermissions.indexOf("discharge_add") !== -1 || permissions.indexOf("discharge_add_any") !== -1,
                  demerit: memberPermissions.indexOf("demerit_add") !== -1 || permissions.indexOf("demerit_add_any") !== -1,
                  addNote: ( permissions.indexOf("note_view_all") !== -1 || permissions.indexOf("note_view_mp") !== -1 || permissions.indexOf("note_view_lh") !== -1 || permissions.indexOf("note_view_co") !== -1 || permissions.indexOf("note_view_pl") !== -1 || permissions.indexOf("note_view_sq") !== -1 )
              };
          allowedTo.admin = allowedTo.modifyProfile || allowedTo.assign || allowedTo.discharge || allowedTo.addELOA || allowedTo.addNote;
          
          return {
              member_id: this.memberPermissions.member_id,
              allowedTo: allowedTo
          };
      }
  });
