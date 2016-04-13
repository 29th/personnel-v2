var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Template = require("../templates/member.html");
var Marionette = require("backbone.marionette");

  module.exports = Marionette.Layout.extend({
      template: Template,
      className: "member",
      initialize: function (options) {
          options = options || {};
          this.assignments = options.assignments || {};

          this.permissions = options.permissions || {};
          this.permissions.on("reset", this.render, this);
      },
      modelEvents: {
          //"change": "render" // Isn't this redundant?
      },
      regions: {
          adminRegion: "#admin",
          pageRegion: "#page"
      },
      onRender: function () {
          if (this.model.get("short_name")) this.title = this.model.get("short_name");
      },
      setHighlight: function (highlight) {
          this.highlight = highlight;
          this.$(".nav li").removeClass("active");
          if (highlight) this.$(".nav li[data-highlight=\"" + highlight + "\"]").addClass("active");
      },
      serializeData: function () {
          // Remove primary_assignment and inactive assignments
          var permissions = this.permissions.length ? this.permissions.pluck("abbr") : [],
              activeAssignments = this.assignments.toJSON().filter(function (assignment) {
                  return (assignment.end_date === null || Date.parse(assignment.end_date) >= new Date());
              }),
              allowedTo = {
                  viewProfile: permissions.indexOf("profile_view_any") !== -1,
                  viewQualifications: permissions.indexOf("qualification_view_any") !== -1,
                  viewNotes: permissions.indexOf("note_view_any") !== -1,
                  viewEvents: permissions.indexOf("event_view_any") !== -1
              };
          return _.extend({
              assignments: activeAssignments,
              member_status: this.assignments.member_status,
              highlight: this.highlight,
              allowedTo: allowedTo
          }, this.model.toJSON());
      }
  });
