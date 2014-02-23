define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/enlistment_edit"
    ,"json!countries.json"
    ,"marionette"
], function($, _, Backbone, Template, Countries) {
    
    return Backbone.Marionette.ItemView.extend({
        template: Template
        ,title: "Enlistment"
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
            return $.extend({ages: this.ages, countries: Countries, tps: this.tps.length ? this.tps.at(0).get("children").toJSON() : {}}, this.model.toJSON());
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