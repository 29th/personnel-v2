define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/aar"
    ,"marionette"
], function($, _, Backbone, Template) {
    
    return Backbone.Marionette.Layout.extend({
        template: Template
        ,regions: {
            "attendanceRegion": "#attendance"
        }
        ,events: {
            "submit form": "onSubmitForm"
        }
        ,initialize: function() {
            _.bindAll(this, "onSubmitForm");
        }
        ,onSubmitForm: function(e) {
            e.preventDefault();
            var eventId = this.model.get("id")
                ,data = {
                    report: e.currentTarget.report.value
                    ,attended: $("[name=\"attendance\"]:checked", e.currentTarget).map(function() { return $(this).val(); }).get()
                    ,absent: $("[name=\"attendance\"]:not(:checked)", e.currentTarget).map(function() { return $(this).val(); }).get()
                };
            this.model.save(data, {
                method: "POST"
                ,success: function() {
                    Backbone.history.navigate("events/" + eventId, {trigger: true});
                }
                // TODO: Error handling, loading indicator
            });
        }
    });
});