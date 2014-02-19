define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/edit_enlistment"
    ,"json!countries.json"
    ,"marionette"
], function($, _, Backbone, Template, Countries) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template
        ,events: {
            "submit form": "onSubmitForm"
        }
        ,initialize: function() {
            _.bindAll(this, "onSubmitForm");
            this.ages = [];
            var i;
            for(i = 13; i <= 99; i++) { this.ages.push(i); }
        }
        ,serializeData: function() {
            return {ages: this.ages, countries: Countries};
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