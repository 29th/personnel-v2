var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Marionette = require("backbone.marionette"),
  Template = require("../templates/roster_nestable.html"),
  TemplateContainer = require("../templates/roster_nestable_container.html");
var Marionette = require("backbone.marionette");
require("jquery-nestable");

  
  var ItemView = Marionette.CompositeView.extend({
      template: Template,
      tagName: "li",
      className: "dd-item",
      itemViewContainer: "ol",
      initialize: function (options) {
          options = options || {};
          this.itemViewOptions = this.itemViewOptions || {};
          if (options.attendance) {
              this.attendance = options.attendance;
              this.itemViewOptions.attendance = options.attendance;
          }
          if(this.model.get("children").length) {
              this.collection = this.model.get("children");
          }
          this.$el.attr("data-id", this.model.get("id"));
      },
      serializeData: function() {
          // If attendance is set, add attended and excused values to each member
          if (!_.isEmpty(this.attendance)) {
              var attendance = this.attendance;
              _.each(this.model.get("members"), function (member) {
                  var record = attendance.find(function (model) {
                      return model.get("member").id === member.member.id;
                  });
                  if (record) {
                      member.attended = record.get("attended");
                      member.excused = record.get("excused");
                  }
              });
          }
          //View for staff units
          if ( this.model.toJSON().classification == 'Staff' )
          {
            var items=[],
            positions = _.groupBy( this.model.get("members") , function (member) {
                  return member.position.name;
              });
            _.each(positions, function (members, position) {
              items.push({
                  position: position,
                  order: members[0].position.order,
                  members: members
              });
            });
/*
            _.each(this.model.get("members"), function (member) 
            {
              if ( !positions[member.position.name] )
                positions[member.position.name] = [];
              positions[member.position.name].push(member);
            });
*/
          }
          
          return $.extend({
              attendance: this.itemViewOptions.attendance,
              staff_positions: items,
          }, this.model.toJSON());
      },
  });

  module.exports = Marionette.CompositeView.extend({
      itemView: ItemView,
      title: "Roster",
      className: "roster dd",
      template: TemplateContainer,
      itemViewContainer: "ol",
      initialize: function (options) {
          options = options || {};
          this.itemViewOptions = this.itemViewOptions || {};
          if (options.attendance) this.itemViewOptions.attendance = options.attendance;
          _.bindAll(this, "onClickControls");
      },
      onRender: function() {
          this.$el.nestable();
      },
      events: {
          "click .panel-ctrls a": "onClickControls"
      },
      onClickControls: function(e) {
          var action = $(e.currentTarget).attr('data-action');
          if(action === "expand") {
              this.$el.nestable("expandAll");
          } else {
              this.$el.nestable("collapseAll");
          }
          e.preventDefault();
      }
  });

