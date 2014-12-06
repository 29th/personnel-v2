define([
    "jquery",
    "underscore",
    "backbone",
    "marionette",
    "handlebars",
    "hbs!templates/roster_collapsible",
    "hbs!templates/roster_attendance",
    "marionette"
], function ($, _, Backbone, Marionette, Handlebars, Template, AttendanceTemplate) {
    
    var ItemView = Backbone.Marionette.CompositeView.extend({
        template: Template,
        tagName: "div",
        initialize: function (options) {
            options = options || {};
            this.itemViewOptions = this.itemViewOptions || {};
            if (options.eventAttendance) {
                this.eventAttendance = options.eventAttendance;
                this.itemViewOptions.eventAttendance = options.eventAttendance;
            }
            // If attendance is true, use the attendance template
            if (options.attendance) {
                this.template = AttendanceTemplate;
                this.itemViewOptions.attendance = true;
            }
            this.collection = this.model.get("children");
            this.$el.addClass("unit").addClass("depth-" + this.model.get("depth"));
        },
        /*events: {
            "click .header:first": "onClickHeader"
        },*/
        appendHtml: function (collectionView, itemView) {
            // Different append method for attendance roster
            if(this.itemViewOptions.attendance) {
                this.$el.append(itemView.el);
            } else {
                collectionView.$(".children:first").append(itemView.el);
            }
        },
        onBeforeRender: function () {
            // If eventAttendance is set, add attended and excused values to each member
            if (!_.isEmpty(this.eventAttendance)) {
                eventAttendance = this.eventAttendance;
                _.each(this.model.get("members"), function (member) {
                    var record = eventAttendance.find(function (model) {
                        return model.get("member").id === member.id;
                    });
                    if (record) {
                        member.attended = record.get("attended");
                        member.excused = record.get("excused");
                    }
                });
            }
        }
        /*onClickHeader: function(e) {
            $(e.currentTarget).parent().siblings().toggle(300);
            $(e.currentTarget).parent().parent().toggleClass("collapsed");
        }*/
    });

    return Backbone.Marionette.CollectionView.extend({
        itemView: ItemView,
        title: "Roster",
        className: "roster",
        initialize: function (options) {
            options = options || {};
            this.itemViewOptions = this.itemViewOptions || {};
            if (options.attendance) this.itemViewOptions.attendance = true;
            if (options.eventAttendance) this.itemViewOptions.eventAttendance = options.eventAttendance;
        }
    });
});
