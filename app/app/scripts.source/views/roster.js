define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"marionette"
    ,"handlebars"
    ,"hbs!templates/roster"
    ,"hbs!templates/roster_attendance"
    ,"marionette"
], function($, _, Backbone, Marionette, Handlebars, RosterTemplate, RosterAttendanceTemplate) {
    var RosterView = Backbone.Marionette.CompositeView.extend({
        template: RosterTemplate
        ,tagName: "div"
        ,initialize: function(options) {
            options = options || {};
            this.itemViewOptions = this.itemViewOptions || {};
            if(options.eventAttendance) {
                this.eventAttendance =  options.eventAttendance;
                this.itemViewOptions.eventAttendance = options.eventAttendance;
            }
            // If attendance is true, use the attendance template
            if(options.attendance) {
                this.template = RosterAttendanceTemplate;
                this.itemViewOptions.attendance = true;
            }
            this.collection = this.model.get("children");
            this.$el.addClass("unit").addClass("depth-" + this.model.get("depth"));
        }
        ,appendHtml: function(collectionView, itemView) {
            this.$el.append(itemView.el);
        }
        ,onBeforeRender: function() {
            // If eventAttendance is set, add attended and excused values to each member
            if( ! _.isEmpty(this.eventAttendance)) {
                eventAttendance = this.eventAttendance;
                _.each(this.model.get("members"), function(member) {
                    var record = eventAttendance.find(function(model) {
                        return model.get("member").id === member.id;
                    });
                    if(record) {
                        member.attended = record.get("attended");
                        member.excused = record.get("excused");
                    }
                });
            }
        }
    });
    
    var RosterRoot = Backbone.Marionette.CollectionView.extend({
        itemView: RosterView
        ,title: "Roster"
        ,className: "roster"
        ,initialize: function(options) {
            options = options || {};
            this.itemViewOptions = this.itemViewOptions || {};
            if(options.attendance) this.itemViewOptions.attendance = true;
            if(options.eventAttendance) this.itemViewOptions.eventAttendance = options.eventAttendance;
        }
    });
    
    return RosterRoot;
});