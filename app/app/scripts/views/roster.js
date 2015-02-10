define([
    "jquery",
    "underscore",
    "backbone",
    "marionette",
    "handlebars",
    "hbs!templates/roster_nestable",
    "hbs!templates/roster_nestable_container",
    "marionette"
], function ($, _, Backbone, Marionette, Handlebars, Template, TemplateContainer) {
    
    var ItemView = Backbone.Marionette.CompositeView.extend({
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
            
            return $.extend({
                attendance: this.itemViewOptions.attendance
            }, this.model.toJSON());
        },
        /*onBeforeRender: function () {
            // If attendance is set, add attended and excused values to each member
            if (!_.isEmpty(this.attendance)) {
                attendance = this.attendance;
                _.each(this.model.get("members"), function (member) {
                    var record = attendance.find(function (model) {
                        return model.get("member").id === member.id;
                    });
                    if (record) {
                        member.attended = record.get("attended");
                        member.excused = record.get("excused");
                    }
                });
            }
        }*/
    });

    return Backbone.Marionette.CompositeView.extend({
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
});
