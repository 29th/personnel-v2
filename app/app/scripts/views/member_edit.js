define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/member_edit"
    ,"json!countries.json"
    ,"marionette"
], function($, _, Backbone, Template, Countries) {
    return Backbone.Marionette.ItemView.extend({
        template: Template
        ,initialize: function() {
            _.bindAll(this, "onFormSubmit");
        }
        ,events: {
            "submit form": "onFormSubmit"
        }
        ,serializeData: function() {
            return $.extend({countries: Countries}, this.model.toJSON());
        }
        ,onFormSubmit: function(e) {
            e.preventDefault();
            console.log($(e.currentTarget).serializeObject());
            //this.model.save($(e.currentTarget).serializeObject(), {type: "POST", patch: true, error: function() {console.log("ERROR!!!")}});
        }
    });
});