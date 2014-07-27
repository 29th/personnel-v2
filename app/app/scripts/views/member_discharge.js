define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/member_discharge",
    "marionette"
], function ($, _, Backbone, Template) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        events: {
            "click #discharge": "executeDischarge"
        },
        executeDischarge: function(e) {
            e.preventDefault();
            var memberId = this.model.get("id");
            $.ajax({
                method: "POST",
                url: this.model.url() + "/discharge",
                success: function () {
                    Backbone.history.navigate("members/" + memberId, {
                        trigger: true
                    });
                }
                //,error: function() {console.log("ERROR!!!")}
            });
        }
    });
});