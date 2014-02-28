define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/member"
    ,"marionette"
], function($, _, Backbone, MemberTemplate) {
    return Backbone.Marionette.Layout.extend({
        template: MemberTemplate
        ,className: "member"
        ,initialize: function(options) {
            options = options || {};
            this.assignments = options.assignments || {};
        }
        ,modelEvents: {
            //"change": "render" // Isn't this redundant?
        }
        ,regions: {
            adminRegion: "#admin"
            ,pageRegion: "#page"
        }
        ,onRender: function() {
            if(this.model.get("short_name")) this.title = this.model.get("short_name");
        }
        ,setHighlight: function(highlight) {
            this.highlight = highlight;
            this.$(".nav li").removeClass("active");
            if(highlight) this.$(".nav li[data-highlight=\"" + highlight + "\"]").addClass("active");
        }
        ,serializeData: function() {
            // Remove primary_assignment and inactive assignments
            var activeAssignments = this.assignments.toJSON().filter(function(assignment) {
                    return (assignment.end_date === null || Date.parse(assignment.end_date) >= new Date());
                });
            return _.extend({assignments: activeAssignments, highlight: this.highlight}, this.model.toJSON());
        }
    });
});