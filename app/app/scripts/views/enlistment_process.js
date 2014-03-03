define([
    "jquery"
    , "underscore"
    , "backbone"
    , "hbs!templates/enlistment_process"
    , "marionette"
    ], function ($, _, Backbone, Template) {

    return Backbone.Marionette.ItemView.extend({
        template: Template,
        title: "Process Enlistment",
        events: {
            "submit form": "onSubmitForm"
        },
        initialize: function (options) {
            options = options || {};
            this.tps = options.tps || {};
            _.bindAll(this, "onSubmitForm");
        },
        serializeData: function () {
            return $.extend({
                tps: this.tps.length ? this.tps.at(0).get("children").toJSON() : {}
            }, this.model.toJSON());
        },
        onSubmitForm: function (e) {
            e.preventDefault();
            var enlistmentId = this.model.get("id");
            this.model.save($(e.currentTarget).serializeObject(), {
                method: "POST",
                patch: true,
                url: this.model.url() + "/process",
                success: function () {
                    Backbone.history.navigate("enlistments/" + enlistmentId, {
                        trigger: true
                    });
                }
                //,error: function() {console.log("ERROR!!!")}
            });
        }
    });
});