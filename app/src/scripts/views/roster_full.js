var $ = require("jquery"),
  _ = require("underscore"),
  Backbone = require("backbone"),
  Marionette = require("backbone.marionette"),
  Template = require("../templates/roster_nestable_full.html"),
  TemplateContainer = require("../templates/roster_nestable_full_container.html");
var Marionette = require("backbone.marionette");
require("jquery-nestable");

  
  var ItemView = Marionette.CompositeView.extend({
      template: Template,
      itemViewContainer: "ol",
      initialize: function (options) {
          options = options || {};
          this.itemViewOptions = this.itemViewOptions || {};
          if (options.attendance) {
              this.attendance = options.attendance;
              this.itemViewOptions.attendance = options.attendance;
          }
          if (options.view_mode) {
               this.view_mode = options.view_mode || '';
               this.itemViewOptions.view_mode = options.view_mode || '';
          }
          
          if(this.model.get("children").length) {
              this.collection = this.model.get("children");
          }
          this.$el.attr("data-id", this.model.get("id"));
      },
      serializeData: function() {
          // If attendance is set, add attended and excused values to each member
          if (!_.isEmpty(this.attendance)) {
              var attendance = this.attendance
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
          
          var positions = [];
          if ( this.model.toJSON().abbr == 'Rsrv S1' ) 
          {
            positions[0] = this.model.toJSON().members;
          }
          else
          {
              positions = _.groupBy(this.model.get("members"), function (item) {
                  return 1000-item.position.order;
              });
        
          }
          return $.extend({
              attendance: this.itemViewOptions.attendance,
              positions: positions
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
          if (options.view_mode) this.itemViewOptions.view_mode = options.view_mode;
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

