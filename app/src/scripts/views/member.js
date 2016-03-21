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
          var activeAssignments = this.assignments.toJSON().filter(function (assignment) {
              return (assignment.end_date === null || Date.parse(assignment.end_date) >= new Date());
          });
          return _.extend({
              assignments: activeAssignments,
              member_status: this.assignments.member_status,
              highlight: this.highlight
          }, this.model.toJSON());
      }
  });
