define([
    "jquery"
    , "underscore"
    , "backbone"
    , "hbs!templates/member_edit"
    , "json!countries.json"
    , "marionette"
    ], function ($, _, Backbone, Template, Countries) {
    return Backbone.Marionette.ItemView.extend({
        template: Template,
        initialize: function () {
            _.bindAll(this, "onSubmitForm");
        },
        events: {
            "submit form": "onSubmitForm"
        },
        serializeData: function () {
            return $.extend({
                countries: Countries
            }, this.model.toJSON());
        },
        onSubmitForm: function (e) {
            e.preventDefault();
            var data = $(e.currentTarget).serializeObject(),
                memberId = this.model.get("id");
            this.model.save(data, {
                method: "POST",
                patch: true,
                data: data,
                processData: true,
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