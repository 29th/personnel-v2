define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/assignment_edit"
    ,"marionette"
], function($, _, Backbone, Template) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template
        ,title: "Modify Enlistment"
        ,events: {
            "submit form": "onSubmitForm"
        }
        ,initialize: function(options) {
            options = options || {};
            this.tps = options.tps || {};
            _.bindAll(this, "onSubmitForm");
            this.ages = [];
            var i;
            for(i = 13; i <= 99; i++) { this.ages.push(i); }
        }
        ,serializeData: function() {
            return $.extend({ages: this.ages, tps: this.units.length ? this.units.at(0).get("children").toJSON() : {}}, this.model.toJSON());
        }
        ,onSubmitForm: function(e) {
            e.preventDefault();
            var enlistmentId = this.model.get("id");
            this.model.save($(e.currentTarget).serializeObject(), {
                method: "POST"
                ,patch: true
                ,success: function() {
                    Backbone.history.navigate("enlistments/" + enlistmentId, {trigger: true});
                }
                //,error: function() {console.log("ERROR!!!")}
            });
        }
    });
});