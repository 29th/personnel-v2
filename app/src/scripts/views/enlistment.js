var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/enlistment.html"),
  config = require("../config");
var Marionette = require("backbone.marionette");


  module.exports = Marionette.ItemView.extend({
      template: Template,
      title: "Enlistment",
      initialize: function (options) {
          options = options || {};
          this.permissions = options.permissions || {};
          this.memberPermissions = options.memberPermissions || {};
      },
      serializeData: function () {
          var permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
              memberPermissions = this.memberPermissions.length ? this.memberPermissions.pluck("abbr") : [],
              allowedTo = {
                  processEnlistment: permissions.indexOf("enlistment_process_any") !== -1,
                  modifyEnlistment: permissions.indexOf("enlistment_edit_any") !== -1,
                  modifyProfile: memberPermissions.indexOf("profile_edit") !== -1 || permissions.indexOf("profile_edit_any") !== -1
              };
          allowedTo.admin = allowedTo.processEnlistment || allowedTo.modifyEnlistment || allowedTo.modifyProfile;
 
          return $.extend({
              allowedTo: allowedTo,
              forum: config.forum,              
              isForumIdVanilla: (this.model.get('forum_id') === 'Vanilla' || !this.model.get('forum_id'))
          }, this.model.toJSON());
      },
      onRender: function () {
          if (this.model.get("member").short_name) this.title = "Enlistment - " + this.model.get("member").short_name;
          this.$("#vanilla-comments iframe").on("load", _.bind(this.onLoadIframe, this));
      },
      onLoadIframe: function() {
          $(".iframe-loading").hide();
      }
  });
