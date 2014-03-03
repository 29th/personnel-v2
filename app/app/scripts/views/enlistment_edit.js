define([
    "jquery",
    "underscore",
    "backbone",
    "hbs!templates/enlistment_edit",
    "json!countries.json",
    "marionette",
    "backbone.validation"
    ], function ($, _, Backbone, Template, Countries) {

    return Backbone.Marionette.ItemView.extend({
        template: Template,
        title: "Modify Enlistment",
        events: {
            "submit form": "onSubmitForm"
        },
        initialize: function (options) {
            options = options || {};
            this.tps = options.tps || {};
            _.bindAll(this, "onSubmitForm");
            this.ages = [];
            var i;
            for (i = 13; i <= 99; i++) {
                this.ages.push(i);
            }
            Backbone.Validation.bind(this);
        },
        serializeData: function () {
            return $.extend({
                ages: this.ages,
                countries: Countries,
                tps: this.tps.length ? this.tps.at(0).get("children").toJSON() : {}
            }, this.model.toJSON());
        },
        onSubmitForm: function (e) {
            e.preventDefault();
            var data = $(e.currentTarget).serializeObject(),
                enlistmentId = this.model.get("id");
            this.model.save(data, {
                method: "POST",
                patch: true,
                data: data,
                processData: true,
                validate: true,
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