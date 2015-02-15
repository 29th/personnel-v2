define([
    "jquery"
    ,"underscore"
    ,"backbone"
    ,"hbs!templates/member_modify"
    ,"marionette"
], function($, _, Backbone, MemberModifyTemplate) {
    var MemberModifyView = Backbone.Marionette.ItemView.extend({
        template: MemberModifyTemplate
        ,initialize: function() {
            _.bindAll(this, "onFormSubmit");
        }
        ,events: {
            "submit form": "onFormSubmit"
        }
        ,onFormSubmit: function(e) {
            e.preventDefault();
            console.log($(e.currentTarget).serializeObject());
            this.model.save($(e.currentTarget).serializeObject(), {type: "POST", patch: true, error: function() {console.log("ERROR!!!")}});
        }
    });
    
    return MemberModifyView;
});